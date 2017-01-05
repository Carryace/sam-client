import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routing } from './home.route';
import { SamUIKitModule } from 'ui-kit';
import { SamAPIKitModule } from 'api-kit';
import { HomePage} from "./home.page";

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    SamUIKitModule,
    SamAPIKitModule,
    routing
  ],
  exports: [],
  declarations: [ HomePage ],
  providers: [],
})
export class HomeModule { }