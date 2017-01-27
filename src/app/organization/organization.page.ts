import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { FHService } from 'api-kit';
import { ReplaySubject, Observable } from 'rxjs';
import { CapitalizePipe } from "../app-pipes/capitalize.pipe";
import * as _ from 'lodash';

@Component({
  moduleId: __filename,
  templateUrl: 'organization.page.html',
  providers: [
    FHService
  ]
})
export class OrganizationPage implements OnInit, OnDestroy {
  subscription: Subscription;
  currentUrl: string;
  organization: any;
  organizationPerPage: any;
  min: number;
  max: number;
  errorOrganization: any;
  errorLogo: any;
  private pageNum = 1;
  private totalPages: any = 0;
  private showPerPage = 10;
  public logoUrl: string;
  errorOrgId: string;

  constructor(
    private activatedRoute:ActivatedRoute,
    private router: Router,
    private location: Location,
    private fhService:FHService) {

    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.getElementById(tree.fragment);
          if (element) { element.scrollIntoView(); }
        }
      }
    });
  }

  ngOnInit() {
    this.currentUrl = this.location.path();
    this.loadOrganization();

  }

  private loadOrganization() {
    let apiSubject = new ReplaySubject(1); // broadcasts the api data to multiple subscribers
    let apiStream = this.activatedRoute.params.switchMap(params => { // construct a stream of api data
      this.errorOrgId = params['id'];
      return this.fhService.getOrganizationById(params['id'], true);
    });
    console.log("API STREAM", apiStream);
    apiStream.subscribe(apiSubject);
    console.log("API SUBJECT", apiSubject);
    this.subscription = apiSubject.subscribe(api => { // run whenever api data is updated
      console.log("API", api);
      let jsonData:any = api;
      this.organization = jsonData._embedded[0].org;
      this.totalPages = Math.ceil(this.organization.hierarchy.length / this.showPerPage);
      this.organizationPerPage = this.filterHierarchy(this.pageNum, this.sortHierarchyAlphabetically(this.organization.hierarchy));
    }, err => {
      console.log('Error logging', err);
      this.errorOrganization = true;
    });

    this.fhService.getOrganizationLogo(apiSubject,
      (logoUrl) => {
        this.logoUrl = logoUrl;
      }, (err) => {
        this.errorLogo = true;
    });

    return apiSubject;
  }

  sortHierarchyAlphabetically(hierarchy){
    let array = [];
    for (let element of hierarchy){
      let item = {name: this.getAgencyName(element).toString(), orgId: element.org.orgKey};
      array.push(item);
    }
    return _.sortBy(array, ['name']);
  }

  filterHierarchy(page,array){
    this.min = page * this.showPerPage - this.showPerPage;
    this.max = page * this.showPerPage;
    return array.slice(this.min,this.max);
  }

  pageChange(pagenumber){
    this.pageNum = pagenumber;
    this.organizationPerPage = this.filterHierarchy(this.pageNum, this.sortHierarchyAlphabetically(this.organization.hierarchy));
    let navigationExtras: NavigationExtras = {
      queryParams: {page: this.pageNum},
      fragment: 'organization-sub-hierarchy'
    };
    this.router.navigate(['/organization',this.organization.orgKey],navigationExtras);
  }

  private isModActive(){
    return (this.organization.modStatus == null || this.organization.modStatus == "active") ? true : false;
  }

  private getAgencyName(element){
    if (element.org.agencyName){
      return element.org.agencyName;
    } else if (element.org.name){
      return (new CapitalizePipe().transform(element.org.name));
    } else {
      return element.org.orgKey;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
