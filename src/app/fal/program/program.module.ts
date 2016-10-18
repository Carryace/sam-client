import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProgramViewComponent }   from './program-view.component';
import { routing } from './program.routing';
import {KeysPipe} from '../../common/pipes/keyspipe.pipe';
import {CapitalizePipe} from '../../common/pipes/capitalize.pipe';
import {FilterMultiArrayObjectPipe} from '../../common/pipes/filter-multi-array-object.pipe';
import {AuthorizationPipe} from '../pipes/authorization.pipe';
import {HistoricalIndexLabelPipe} from '../pipes/historical-index-label.pipe';
import {SamAngularModule} from '../../common/samuikit/samuikit.module';
import { SamUIKitModule } from '../../../ui-kit/ui-kit.module';

@NgModule({
  imports: [
    BrowserModule,
    SamUIKitModule,
    SamAngularModule,
    routing
  ],
  exports: [
    KeysPipe,
    CapitalizePipe,
    FilterMultiArrayObjectPipe,
    AuthorizationPipe,
    ProgramViewComponent,
    HistoricalIndexLabelPipe
  ],
  declarations: [
    KeysPipe,
    CapitalizePipe,
    FilterMultiArrayObjectPipe,
    AuthorizationPipe,
    ProgramViewComponent,
    HistoricalIndexLabelPipe
  ],
  providers: [],
})
export class ProgramModule { }
