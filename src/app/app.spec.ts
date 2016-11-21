import {
  inject,
  TestBed
} from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

// Load the implementations that should be tested

import { App } from './app.component';
import { ROUTES } from "./app.route";
import { HomePage } from "./application-content/home/home.page";
import { SearchPage } from "./search/search.page";
import { SamUIKitModule } from "ui-kit";
import { SearchService } from 'api-kit';
import { OpportunitiesResult } from "./opportunity/search-result/opportunities-result.component";
import { AssistanceListingResult } from "./assistance-listing/search-result/assistance-listing-result.component";
import { FederalHierarchyResult } from "./organization/search-result/federal-hierarchy-result.component";
import { EntitiesResult } from "./entity/search-result/entities-result.component";
import { FHInputComponent } from "./search/agency-selector/agency-selector.component";
import { ProgramModule } from "./assistance-listing/assistance-listing.module";
import { OpportunityPage } from "./opportunity/opportunity.page";
import { PageNotFoundErrorPage } from "./application-content/404/404.page";
import { PipesModule } from "./app-pipes/app-pipes.module";
import { NoticeTypeLabelPipe } from "./opportunity/pipes/notice-type-label.pipe";
import { TimezoneLabelPipe } from "./opportunity/pipes/timezone-label.pipe";


class RouterStub {
  navigate(url:string) {
    return url;
  }
}

var activatedRouteStub = {
  queryParams: {
    subscribe: () => {
      return {};
    }
  }
};
var searchServiceStub = {};


describe('App', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [HomePage, SearchPage, OpportunitiesResult, AssistanceListingResult, FederalHierarchyResult, EntitiesResult, FHInputComponent, OpportunityPage, PageNotFoundErrorPage, NoticeTypeLabelPipe, TimezoneLabelPipe],
    imports: [PipesModule, SamUIKitModule, RouterTestingModule.withRoutes(ROUTES), ProgramModule],
    providers: [
      App,
      {provide: Router, useClass: RouterStub},
      {provide: ActivatedRoute, useValue: activatedRouteStub},
      {provide: SearchService, useValue: searchServiceStub}
    ]
  }));

  it('should have a test value', inject([App], (app) => {
    // expect(app.testValue.value).toEqual('Test');
    // app.ngOnInit();
    // expect(app.testValue.value).toEqual('Test' );
  }));

});
