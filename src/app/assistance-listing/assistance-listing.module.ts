import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProgramPage }   from './assistance-listing.page';
import { FinancialObligationChart } from './assistance-listing.chart';
import { routing } from './assistance-listing.route';
import { AuthorizationPipe } from './pipes/authorization.pipe';
import { HistoricalIndexLabelPipe } from './pipes/historical-index-label.pipe';
import { SamUIKitModule } from 'ui-kit';
import { PipesModule } from "../app-pipes/app-pipes.module";

@NgModule({
  imports: [
    PipesModule,
    BrowserModule,
    SamUIKitModule,
    routing
  ],
  exports: [
    AuthorizationPipe,
    ProgramPage,
    FinancialObligationChart,
    HistoricalIndexLabelPipe,
  ],
  declarations: [
    AuthorizationPipe,
    ProgramPage,
    FinancialObligationChart,
    HistoricalIndexLabelPipe,
  ],
  providers: [],
})
export class ProgramModule { }
