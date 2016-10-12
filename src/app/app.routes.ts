import { Routes } from '@angular/router';
import { Home } from './home';
import { Search } from './search/search.component';
import { NoContent } from './common/no-content';
import {ProgramViewComponent} from './fal/program/program-view.component';
import { OpportunityViewComponent } from './display/opportunities/opportunity-view.component';
import { SamAngularDemo } from './sam-angular-demo';

export let ROUTES: Routes = [
  { path: '',      component: Home },
  { path: 'home',  component: Home },
  { path: 'search',  component: Search },
  { path: 'programs',  component: ProgramViewComponent },
  { path: 'opportunities',  component: OpportunityViewComponent },
  { path: '**',    component: NoContent },
];

if (ENV === 'development' || ENV === 'comp') {
  ROUTES.unshift({ path: 'sam-angular', component: SamAngularDemo });
}
