import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";

import { routing } from './users.route';
import { SamUIKitModule } from 'ui-kit';
import { SamAPIKitModule } from 'api-kit';
import { UserDirectoryPage } from "./directory/user-directory.page";
import { ParentOrgsComponent } from "./directory/parent-orgs/parent-orgs.component";
import { UserAccessPage } from "./public/access/access.page";
import { UserViewComponent } from "./public/public.component";
import { UserMigrationsPage } from "./public/migrations/migrations.page";
import { UserProfilePage } from "./public/profile/profile.page";
import { GroupByDomainPipe } from "./public/access/group-by-domain.pipe";
import { PipesModule } from "../app-pipes/app-pipes.module";


@NgModule({
  imports: [
    routing,
    BrowserModule,
    RouterModule,
    HttpModule,
    FormsModule,
    SamUIKitModule,
    SamAPIKitModule,
    PipesModule
  ],
  exports: [

  ],
  declarations: [
    UserViewComponent,
    UserMigrationsPage,
    UserAccessPage,
    UserProfilePage,
    UserDirectoryPage,
    ParentOrgsComponent,
    GroupByDomainPipe,
  ],
  providers: [
  ],
})
export class UserDirectoryModule { }
