import { Component,Input,OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import {FHService} from "../../../api-kit/fh/fh.service";
import { ReplaySubject, Observable } from 'rxjs';

@Component({
  moduleId: __filename,
  selector: 'fh-featured-result',
  template: `
    <div class="featured-result">

      <div class="card">
        <div class="card-header-secure">
          <h3>
            <a [routerLink]="['/organization', data._id]">{{ data.name }}</a>
          </h3>
          <ng-container *ngIf="data.alternativeNames && data.alternativeNames !== null">
              Also known as <strong><em>{{ data.alternativeNames }}</em></strong>
          </ng-container>
        </div>
        <div class="card-secure-content clearfix">

          <div *ngIf="logoUrl" class="logo-small"  style="float: left; margin-right: 10px;">
            <img [src]="logoUrl" alt="HTML5 Icon">
          </div>

          <div>
            <ul class="usa-unstyled-list">
              <li *ngIf="data.parentOrganizationHierarchy && data.parentOrganizationHierarchy !== null">
                <strong>Department: {{ data.name }}</strong>
              </li>
              <li>
                {{ data.type=="Agency" ? 'Sub-Tier' : data.type }}
              </li>
              <li>
                Code <strong>{{ data.code }}</strong>
              </li>    
            </ul>
          </div>

        </div>
        <div class="card-extra-content">
          <i class="fa fa-star" aria-hidden="true" style="color:#fdb81e;"></i> <strong>Featured Result</strong>
        </div>
      </div>

    </div>
  `
})
export class FHFeaturedResult implements OnInit {
  @Input() data: any={};
  logoUrl: string;
  constructor(private fhService: FHService) { }

  ngOnInit() {}

  ngOnChanges(changes) {
    if(this.data['_id']) {
    this.callOrganizationById(this.data['_id']);
    }
  }

  private callOrganizationById(orgId: string) {
    let organizationSubject = new ReplaySubject(1);
    this.fhService.getOrganizationById(orgId).subscribe(organizationSubject);
      this.loadLogo(organizationSubject);
  }

  private loadLogo(organizationAPI: Observable<any>) {
    organizationAPI.subscribe(org => {
      if(org == null || org['_embedded'] == null || org['_embedded'][0] == null) {
        return;
      }

      if(org['_embedded'][0]['_link'] != null && org['_embedded'][0]['_link']['logo'] != null && org['_embedded'][0]['_link']['logo']['href'] != null) {
        this.logoUrl = org['_embedded'][0]['_link']['logo']['href'];
        return;
      }

      if(org['_embedded'][0]['org'] != null && org['_embedded'][0]['org']['parentOrgKey'] != null) {
        // this.loadLogo(this.fhService.getOrganizationById(org['_embedded'][0]['org']['parentOrgKey']));
        this.callOrganizationById(org['_embedded'][0]['org']['parentOrgKey']);
      }
    }, err => {
      console.log('Error loading logo: ', err);
    });
  }

}
