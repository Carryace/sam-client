import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, NavigationEnd, Params } from '@angular/router';
import { Location } from '@angular/common';
import { OpportunityService, FHService } from 'api-kit';
import { ReplaySubject, Observable } from 'rxjs';
import { FilterMultiArrayObjectPipe } from '../app-pipes/filter-multi-array-object.pipe';
import { OpportunityFields } from "./opportunity.fields";
import { trigger, state, style, transition, animate } from '@angular/core';

@Component({
  moduleId: __filename,
  templateUrl: 'opportunity.page.html',
  providers: [
    OpportunityService,
    FilterMultiArrayObjectPipe
  ],
  animations: [
    trigger('accordion', [
      state('collapsed', style({
        height: '0px',
      })),
      state('expanded', style({
        height: '*',
      })),
      transition('collapsed => expanded', animate('100ms ease-in')),
      transition('expanded => collapsed', animate('100ms ease-out'))
    ]),
    trigger('intro', [
      state('fade', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(-30%)'
        }),
        animate('.5s .5s cubic-bezier(0.175, 0.885, 0.320, 1.275)')
      ]),
      transition('* => void', [
        animate('.5s .5s cubic-bezier(0.175, 0.885, 0.320, 1.275)', style({
          opacity: 0,
          transform: 'translateY(-30%)'
        }))
      ])
    ])
  ]
})
export class OpportunityPage implements OnInit {
  /**
   * Steps to add a new field:
   * 1. Add the field to OpportunityFields enum (opportunity.fields.ts)
   * 2. Add an element for the field in html template (opportunity.page.html)
   *  2a. (optional) Give the element an ID by calling generateID(...)
   *  2b. Add an *ngIf condition to the element that checks shouldBeShown(...), as well as any null checks required
   * 3. In setDisplayFields(...), set this.displayField[newField] = false for any conditions where it should be hidden
   * 4. Update unit tests (opportunity.spec.ts) as appropriate
   *
   * Steps to add a new opportunity type:
   * 1. Add the type to type labels pipe (opportunity-type-label.pipe.ts)
   * 2. In setDisplayFields(...), set this.displayField[someField] = false for any fields this type does not show
   * 3. Update unit tests (opportunity.spec.ts) as appropriate
   */
  public opportunityFields = OpportunityFields; // expose the OpportunityFields enum for use in html template
  public displayField = {}; // object containing boolean flags for whether fields should be displayed

  originalOpportunity: any;
  opportunityLocation: any;
  opportunity: any;
  organization: any;
  currentUrl: string;
  dictionary: any;
  attachment: any;
  relatedOpportunities:any;
  relatedOpportunitiesMetadata:any;
  logoUrl: string;
  opportunityAPI: any;
  currentTab: string = 'Opportunity';
  awardSort: string = "awardDate"; //default
  awardSortOptions = [
    { label: "Award Date", value: "awardDate" },
    { label: "Dollar Amount", value: "dollarAmount" },
    { label: "Company (Awardee) Name", value: "awardeeName" },
  ];
  attachmentError:boolean;
  private pageNum = 0;
  private totalPages: number;
  private showPerPage = 20;

  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private opportunityService:OpportunityService,
    private fhService:FHService,
    private location: Location) {
    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.getElementById(tree.fragment);
          if (element) { element.scrollIntoView(); }
        }
      }
    });
    route.queryParams.subscribe(data => {
      this.pageNum = typeof data['page'] === "string" && parseInt(data['page'])-1 >= 0 ? parseInt(data['page'])-1 : this.pageNum;
    });
  }

  ngOnInit() {
    this.currentUrl = this.location.path();
    this.loadDictionary();
    let opportunityAPI = this.loadOpportunity();
    this.opportunityAPI = opportunityAPI;
    let parentOpportunityAPI = this.loadParentOpportunity(opportunityAPI);
    this.loadOrganization(opportunityAPI);
    this.loadOpportunityLocation(opportunityAPI);
    this.loadAttachments(opportunityAPI);
    // Construct a new observable that emits both opportunity and its parent as a tuple
    // Combined observable will not trigger until both APIs have emitted at least one value
    let combinedOpportunityAPI = opportunityAPI.zip(parentOpportunityAPI);
    this.loadRelatedOpportunitiesByIdAndType(opportunityAPI);
    this.setDisplayFields(combinedOpportunityAPI);
  }

  private loadOpportunity() {
    let opportunitySubject = new ReplaySubject(1); // broadcasts the opportunity to multiple subscribers

    this.route.params.subscribe((params: Params) => { // construct a stream of opportunity data
      this.opportunityService.getOpportunityById(params['id']).subscribe(opportunitySubject); // attach subject to stream
    });

    opportunitySubject.subscribe(api => { // do something with the opportunity api
      this.opportunity = api;
    }, err => {
      console.log('Error loading opportunity: ', err);
    });

    return opportunitySubject;
  }

  private loadParentOpportunity(opportunityAPI: Observable<any>){
    let parentOpportunitySubject = new ReplaySubject(1); // broadcasts the parent opportunity to multiple subscribers

    opportunityAPI.subscribe(api => {
      if (api.parent != null) { // if this opportunity has a parent
        // then call the opportunity api again for parent and attach the subject to the result
        this.opportunityService.getOpportunityById(api.parent.opportunityId).subscribe(parentOpportunitySubject);
      } else {
        return Observable.of(null).subscribe(parentOpportunitySubject); // if there is no parent, just return a single null
      }
    });

    parentOpportunitySubject.subscribe(parent => { // do something with the parent opportunity api
      this.originalOpportunity = parent;
    }, err => {
      console.log('Error loading parent opportunity: ', err);
    });

    return parentOpportunitySubject;
  }

  private loadRelatedOpportunitiesByIdAndType(opportunityAPI: Observable<any>){
    let relatedOpportunitiesSubject = new ReplaySubject(1);
    opportunityAPI.subscribe((opportunity => {
      this.opportunityService.getRelatedOpportunitiesByIdAndType(opportunity.opportunityId, "a", this.pageNum, this.awardSort).subscribe(relatedOpportunitiesSubject);
    }));
    relatedOpportunitiesSubject.subscribe(data => { // do something with the related opportunity api
      this.relatedOpportunities = data['relatedOpportunities'][0];
      this.relatedOpportunitiesMetadata = {
        'count': data['count'],
        'recipientCount': data['recipientCount'],
        'totalAwardAmt': data['totalAwardAmt'],
        'unparsableCount': data['unparsableCount']
      };
      this.totalPages = Math.ceil(parseInt(data['count']) / this.showPerPage);
    }, err => {
      console.log('Error loading related opportunities: ', err);
    });
  }

  private reloadRelatedOpportunities() {
    this.pageNum = 0;
    this.loadRelatedOpportunitiesByIdAndType(this.opportunityAPI);
  }

  private loadOrganization(opportunityAPI: Observable<any>) {
    let organizationSubject = new ReplaySubject(1); // broadcasts the organization to multiple subscribers

    opportunityAPI.subscribe(api => {
      //organizationId length >= 30 -> call opportunity org End Point
      if(api.data.organizationId.length >= 30) {
        this.opportunityService.getOpportunityOrganizationById(api.data.organizationId).subscribe(organizationSubject);
      }
      //organizationId less than 30 character then call Octo's FH End point
      else {
        this.fhService.getOrganizationById(api.data.organizationId).subscribe(organizationSubject);
        this.loadLogo(organizationSubject);
      }
    });

    organizationSubject.subscribe(organization => { // do something with the organization api
      this.organization = organization['_embedded'][0]['org'];
    }, err => {
      console.log('Error loading organization: ', err);
    });

    return organizationSubject;
  }

  private loadLogo(organizationAPI: Observable<any>) {
    organizationAPI.subscribe(org => {
      // Do some basic null checks
      if(org == null || org['_embedded'] == null || org['_embedded'][0] == null) {
        return;
      }

      // Base case: If logo exists, save it to a variable and exit
      if(org['_embedded'][0]['_link'] != null && org['_embedded'][0]['_link']['logo'] != null && org['_embedded'][0]['_link']['logo']['href'] != null) {
        this.logoUrl = org['_embedded'][0]['_link']['logo']['href'];
        return;
      }

      // Recursive case: If parent orgranization exists, recursively try to load its logo
      if(org['_embedded'][0]['org'] != null && org['_embedded'][0]['org']['parentOrgKey'] != null) {
        this.loadLogo(this.fhService.getOrganizationById(org['_embedded'][0]['org']['parentOrgKey']));
      }
    }, err => {
      console.log('Error loading logo: ', err);
    });
  }

  private loadOpportunityLocation(opportunityApiStream: Observable<any>) {
    opportunityApiStream.subscribe(opAPI => {
      if(opAPI.data.organizationLocationId != '' && typeof opAPI.data.organizationLocationId !== 'undefined') {
        this.opportunityService.getOpportunityLocationById(opAPI.data.organizationLocationId).subscribe(data => {
          this.opportunityLocation = data;
        });
      }
    });
  }

  private loadAttachments(opportunityAPI: Observable<any>){
    let attachmentSubject = new ReplaySubject(1); // broadcasts the attachments to multiple subscribers
    opportunityAPI.subscribe(api => {
      this.opportunityService.getAttachmentById(api.opportunityId).subscribe(attachmentSubject);
    });

    attachmentSubject.subscribe(attachment => { // do something with the organization api
      this.attachment = attachment;
      this.attachment.packages.forEach((key: any) => {
        key.accordionState = 'collapsed';
      });
      this.attachment.resources.forEach((res: any) => {
        res.typeInfo = this.getResourceTypeInfo(res.type === 'file' ? this.getExtension(res.name) : res.type);
      });
    }, err => {
      console.log('Error loading attachments: ', err)
        this.attachmentError = true;
    });

    return attachmentSubject;
  }

  private loadDictionary() {
    this.opportunityService.getOpportunityDictionary('classification_code,naics_code,set_aside_type,fo_justification_authority').subscribe(data => {
      // do something with the dictionary api
      this.dictionary = data;
    }, err => {
      console.log('Error loading dictionaries: ', err);
    });
  }

  // Sets the correct displayField flags for this opportunity type
  private setDisplayFields(combinedOpportunityAPI: Observable<any>) {
    combinedOpportunityAPI.subscribe(([opportunity, parent]) => {
      if(opportunity.data == null || opportunity.data.type == null) {
        console.log('Error: No opportunity type');
        return;
      }

      this.displayField = {}; // for safety, clear any existing values

      switch (opportunity.data.type) {
        // Base opportunity types
        // These types are a superset of 'j', using case fallthrough
        case 'p': // Presolicitation
        case 'r': // Sources Sought
        case 's': // Special Notice
        case 'g': // Sale of Surplus Property
        case 'f': // Foreign Government Standard
          this.displayField[OpportunityFields.Award] = false;
          this.displayField[OpportunityFields.StatutoryAuthority] = false;
          this.displayField[OpportunityFields.ModificationNumber] = false;
        // Other types
        case 'j': // Justification and Approval (J&A)
          this.displayField[OpportunityFields.AwardAmount] = false;
          this.displayField[OpportunityFields.LineItemNumber] = false;
          this.displayField[OpportunityFields.AwardedName] = false;
          this.displayField[OpportunityFields.AwardedDUNS] = false;
          this.displayField[OpportunityFields.AwardedAddress] = false;
          this.displayField[OpportunityFields.Contractor] = false;

          this.displayField[OpportunityFields.JustificationAuthority] = false;
          this.displayField[OpportunityFields.OrderNumber] = false;
          break;

        // Type 'i' is a superset of 'l', using case fallthrough
        case 'i': // Intent to Bundle Requirements (DoD-Funded)
          this.displayField[OpportunityFields.AwardDate] = false;
          this.displayField[OpportunityFields.JustificationAuthority] = false;
          this.displayField[OpportunityFields.ModificationNumber] = false;
        case 'l': // Fair Opportunity / Limited Sources Justification
          this.displayField[OpportunityFields.AwardAmount] = false;
          this.displayField[OpportunityFields.LineItemNumber] = false;
          this.displayField[OpportunityFields.AwardedName] = false;
          this.displayField[OpportunityFields.AwardedDUNS] = false;
          this.displayField[OpportunityFields.AwardedAddress] = false;
          this.displayField[OpportunityFields.Contractor] = false;
          this.displayField[OpportunityFields.StatutoryAuthority] = false;
        case 'm': //Todo: Modification/Amendment/Cancel
        case 'k': //Todo: Combined Synopsis/Solicitation
          break;

        case 'a': // Award Notice
          this.displayField[OpportunityFields.ResponseDate] = false;
          this.displayField[OpportunityFields.StatutoryAuthority] = false;
          this.displayField[OpportunityFields.JustificationAuthority] = false;
          this.displayField[OpportunityFields.OrderNumber] = false;
          this.displayField[OpportunityFields.ModificationNumber] = false;
          this.displayField[OpportunityFields.ClassificationCode] = false;
          this.displayField[OpportunityFields.POP] = false;
          break;

        default:
          console.log('Error: Unknown opportunity type ' + opportunity.data.type);
          break;
      }

      /**
       * TODO: Check conditional logic with PO
       * TODO: Check if original archive date condition is needed (not mentioned in excel spreadsheet)
       * TODO: Find ways to refactor or simplify this logic
       */
      if(parent != null) {
        let originalPostedDateCondition = opportunity.postedDate != null
          && parent.postedDate != null
          && opportunity.postedDate !== parent.postedDate;

        this.displayField[OpportunityFields.OriginalPostedDate] = originalPostedDateCondition;

        let originalResponseDateCondition = opportunity.data != null
          && opportunity.data.solicitation != null && opportunity.data.solicitation.deadlines != null
          && opportunity.data.solicitation.deadlines.response != null && parent.data != null
          && parent.data.solicitation != null && parent.data.solicitation.deadlines != null
          && parent.data.solicitation.deadlines.response != null
          && opportunity.data.solicitation.deadlines.response !== parent.data.solicitation.deadlines.response;

        this.displayField[OpportunityFields.OriginalResponseDate] = originalResponseDateCondition;

        let originalArchiveDateCondition = opportunity.data != null && opportunity.data.archive != null
          && opportunity.data.archive.date != null && parent.data != null && parent.data.archive != null
          && parent.data.archive.date != null
          && opportunity.data.archive.date !== parent.data.archive.date;

        this.displayField[OpportunityFields.OriginalArchiveDate] = originalArchiveDateCondition;

        let originalSetAsideCondition = opportunity.data != null && opportunity.data.solicitation != null
          && opportunity.data.solicitation.setAside != null && parent.data != null
          && parent.data.solicitation != null && parent.data.solicitation.setAside != null
          && opportunity.data.solicitation.setAside !== parent.data.solicitation.setAside;

        this.displayField[OpportunityFields.OriginalSetAside] = originalSetAsideCondition;
      }
    });
  }

  // Input should be one of the fields defined in OpportunityFields enum
  // To hide a field, set the flag displayField[field] to false
  // A field is always displayed by default, unless it is explicitly set not to
  private shouldBeDisplayed(field: OpportunityFields) {
    return this.displayField[field] !== false;
  }

  // Given a field name, generates an id for it by adding the correct prefixes
  private generateID(name: string, prefix?: string) {
    let id = name;
    if(prefix != null) { id = prefix + '-' + id; }
    return 'opportunity-' + id;
  }

  // If any part of a POC exists, then we consider the entire POC to exist
  // If a POC does not exist, its section header is hidden
  private hasPOC(index: number): boolean {
    if(this.opportunity && this.opportunity.data && this.opportunity.data.pointOfContact[index]) {
      return (this.opportunity.data.pointOfContact[index].email != null
        || this.opportunity.data.pointOfContact[index].phone != null
        || this.opportunity.data.pointOfContact[index].fullName != null
        || this.opportunity.data.pointOfContact[index].title != null
        || this.opportunity.data.pointOfContact[index].fax != null);
    }
    return false;
  }

  private isSecure(field: string){
    if(field === "Public"){
      return "Not Secure";
    } else {
      return "Secured"
    }
  }

  pageChange(pagenumber){
    this.pageNum = pagenumber;
    if (this.pageNum>=0){
      this.pageNum++;
    } else {
      this.pageNum = 1;
    }
    let navigationExtras: NavigationExtras = {
      queryParams: {page: this.pageNum},
      fragment: 'opportunity-award-summary'
    };
    this.router.navigate(['/opportunities',this.opportunity.opportunityId],navigationExtras);
    this.loadRelatedOpportunitiesByIdAndType(this.opportunityAPI);
  }


  public getDownloadFileURL(fileID: string){
    return this.getBaseURL() + '/file/' + fileID + this.getAPIUmbrellaKey();
  }

  currentTabSelected(tab){
    this.currentTab = tab.title;
  }

  public getDownloadPackageURL(packageID: string) {
    return this.getBaseURL() + '/opportunity/resources/packages/' + packageID + '/download/zip' + this.getAPIUmbrellaKey();
  }

  public getDownloadAllPackagesURL(opportunityID: string) {
    return this.getBaseURL() + '/opportunity/' + opportunityID + '/download/zip' + this.getAPIUmbrellaKey();
  }

  public getBaseURL() {
    return API_UMBRELLA_URL + '/cfda/v1';
  }

  public getAPIUmbrellaKey() {
    return '?api_key=' + API_UMBRELLA_KEY;
  }

  public toggleAccordion(card){
    card.accordionState = card.accordionState == 'expanded' ? 'collapsed' : 'expanded';
  }

  public hasResources(){
    for(let pkg of this.attachment['packages']) {
      if(pkg['access'] === 'Public') { return true; }
    }
    return false;
  }

  private getExtension(filename: string) {
    let ext = filename.match(/\.[a-z0-9]+$/i);

    if(ext != null) {
      return ext[0];
    }

    return null;
  }

  private static readonly TYPE_UNKNOWN = { name: 'Unknown file type', iconClass: 'fa fa-file' };
  private static readonly TYPE_LINK = { name: 'External link', iconClass: 'fa fa-link' };
  private static readonly TYPE_ZIP = { name: 'Zip archive', iconClass: 'fa fa-file-archive-o' };
  private static readonly TYPE_XLS = { name: 'Excel spreadsheet', iconClass: 'fa fa-file-excel-o' };
  private static readonly TYPE_PPT = { name: 'Powerpoint presentation', iconClass: 'fa fa-file-powerpoint-o' };
  private static readonly TYPE_DOC = { name: 'Word document', iconClass: 'fa fa-file-word-o' };
  private static readonly TYPE_TXT = { name: 'Text file', iconClass: 'fa fa-file-text-o' };
  private static readonly TYPE_PDF = { name: 'PDF document', iconClass: 'fa fa-file-pdf-o' };
  private static readonly TYPE_HTML = { name: 'Html document', iconClass: 'fa fa-html5' };
  private static readonly TYPE_IMG = { name: 'Image', iconClass: 'fa fa-file-image-o' };

  private getResourceTypeInfo(type: string) {
    switch(type) {
      case 'link':
        return OpportunityPage.TYPE_LINK;

      case '.zip':
        return OpportunityPage.TYPE_ZIP;

      case '.xls':
      case '.xlsx':
        return OpportunityPage.TYPE_XLS;

      case '.ppt':
      case '.pptx':
        return OpportunityPage.TYPE_PPT;

      case '.doc':
      case '.docx':
        return OpportunityPage.TYPE_DOC;

      case '.txt':
      case '.rtf':
        return OpportunityPage.TYPE_TXT;

      case '.pdf':
        return OpportunityPage.TYPE_PDF;

      case '.htm':
      case '.html':
        return OpportunityPage.TYPE_HTML;

      case '.jpg':
      case '.png':
      case '.jpeg':
      case '.tif':
        return OpportunityPage.TYPE_IMG;

      default:
        return OpportunityPage.TYPE_UNKNOWN;
    }
  }
}