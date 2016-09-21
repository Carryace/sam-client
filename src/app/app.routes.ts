import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';
import { Search } from './search';
import { NoContent } from './common/no-content';
import {ProgramViewComponent} from './fal/program/program-view.component';
import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '',      component: Home },
  { path: 'home',  component: Home },
  { path: 'search',  component: Search },
  { path: 'programs',  component: ProgramViewComponent },
  { path: '**',    component: NoContent },
];
