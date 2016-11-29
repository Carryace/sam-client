import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { OpportunityService, FHService } from 'api-kit';
import { ReplaySubject, Observable, Subscription } from 'rxjs';
import { FilterMultiArrayObjectPipe } from '../app-pipes/filter-multi-array-object.pipe';
import { OpportunityFields } from "./opportunity.fields";

@Component({
  moduleId: __filename,
  templateUrl: 'opportunity.page.html',
  styleUrls: ['opportunity.style.css'],
  providers: [
    OpportunityService,
    FilterMultiArrayObjectPipe
  ]
})
export class OpportunityPage implements OnInit, OnDestroy {
  public opportunityFields = OpportunityFields;
  private displayIds = {};

  originalOpportunity: any;
  // opportunityLocation: any;
  opportunity: any;
  organization: any;
  currentUrl: string;
  dictionary: any;

  private organizationSubscription: Subscription;
  private opportunitySubscription: Subscription;

  constructor(
    private route:ActivatedRoute,
    private opportunityService:OpportunityService,
    private fhService:FHService,
    private location: Location) {}

  ngOnInit() {
    this.currentUrl = this.location.path();

    let opportunityApiStream = this.loadOpportunity();
    this.loadOrganization(opportunityApiStream);
    // this.loadOpportunityLocation(opportunityApiStream);
    this.loadDictionary();
    this.setDisplayIds(opportunityApiStream);
  }

  private loadOpportunity() {
    var apiSubject = new ReplaySubject(1); // broadcasts the api data to multiple subscribers

    this.route.params.subscribe((params: Params) => { // construct a stream of api data
      this.opportunityService.getOpportunityById(params['id']).subscribe(apiSubject);
    });

    this.opportunitySubscription = apiSubject.subscribe(api => {
      // run whenever api data is updated
      this.opportunity = api;
      if(this.opportunity.parentOpportunity != null) {
        this.opportunityService.getOpportunityById(this.opportunity.parentOpportunity.opportunityId).subscribe(parent => {
          this.originalOpportunity = parent;
        });
      }
    }, err => {
      console.log('Error logging', err);
    });

    return apiSubject;
  }

  private loadOrganization(opportunityApiStream: Observable<any>) {
    let apiSubject = new ReplaySubject(1);

    opportunityApiStream.subscribe(api => {
      //organizationId length >= 30 -> call opportunity org End Point
      if(api.data.organizationId.length >= 30) {
        this.opportunityService.getOpportunityOrganizationById(api.data.organizationId).subscribe(apiSubject);
      }
      //organizationId less than 30 character then call Octo's FH End point
      else {
        this.fhService.getOrganizationById(api.data.organizationId).subscribe(apiSubject);
      }
    });

    this.organizationSubscription = apiSubject.subscribe(organization => {
      this.organization = organization['_embedded'][0]['org'];
    });

    return apiSubject;
  }

  // private loadOpportunityLocation(opportunityApiStream: Observable<any>) {
  //   opportunityApiStream.subscribe(opAPI => {
  //     if(opAPI.data.organizationLocationId != '' && typeof opAPI.data.organizationLocationId !== 'undefined') {
  //       this.opportunityService.getOpportunityLocationById(opAPI.data.organizationLocationId).subscribe(data => {
  //         this.opportunityLocation = data;
  //       });
  //     }
  //   });
  // }

  private loadDictionary() {
    this.opportunityService.getOpportunityDictionary('classification_code,naics_code,set_aside_type').subscribe(data => {
      this.dictionary = data;
    });
  }

  private setDisplayIds(opportunityApiStream: Observable<any>) {
    opportunityApiStream.subscribe(api => {
      if(api.data == null || api.data.type == null) {
        console.log("Error: No opportunity type");
        return;
      }

      switch (api.data.type) {
        // Base notice types
        case 'p':
        case 'r':
        case 's':
        case 'g':
        case 'f':
          break;

        // Other types
        case 'a':
        case 'm':
        case 'k':
        case 'j':
        case 'i':
        case 'l':
          break;
      }
    });
  }

  private shouldBeDisplayed(id: string) {
    return this.displayIds[id] !== false;
  }

  private getID(field: string, prefix?: string) {
    let id = field;
    if(prefix != null) { id = prefix + id; }
    return 'opportunity-' + id;
  }

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

  ngOnDestroy() {
    if(this.organizationSubscription) this.organizationSubscription.unsubscribe();
    if(this.opportunitySubscription) this.opportunitySubscription.unsubscribe();
  }
}
