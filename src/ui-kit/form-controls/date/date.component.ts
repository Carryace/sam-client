import {Component, Input, ViewChild, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import * as moment from 'moment/moment';

/**
 * The <samNameInput> component is a Name entry portion of a form
 *
 * @Input/@Output model - the bound value of the component
 * @Input name - Prefix name/id attribute values
 *
 */
@Component({
  selector: 'samDate',
  template: `
    <!--<fieldsetWrapper [label]="label" [name]="getIdentifer('date')" [errorMessage]="errorMessage" [hint]="hint">-->
      <div class="usa-date-of-birth date-group" style="overflow:auto;">
        <div class="usa-form-group usa-form-group-month">
          <label [attr.for]="monthName()">Month</label>
          <input [attr.id]="monthName()" #month="ngModel" (blur)="onBlur($event)" [(ngModel)]="model.month" (ngModelChange)="onChange()" class="usa-input-inline" aria-describedby="dobHint" class="usa-form-control" name="date_of_birth_1" pattern="0?[1-9]|1[012]" type="number" min="1" max="12" maxlength="2" [disabled]="disabled">
        </div>
        <div class="usa-form-group usa-form-group-day">
          <label [attr.for]="dayName()">Day</label>
          <input [attr.id]="dayName()" #day="ngModel" (blur)="onBlur($event)" [(ngModel)]="model.day" (ngModelChange)="onChange()" class="usa-input-inline" aria-describedby="dobHint" class="usa-form-control" name="date_of_birth_2" pattern="0?[1-9]|1[0-9]|2[0-9]|3[01]" type="number" min="1" max="31" maxlength="2" [disabled]="disabled">
        </div>
        <div class="usa-form-group usa-form-group-year">
          <label [attr.for]="yearName()">Year</label>
          <input [attr.id]="yearName()" #year="ngModel" (blur)="onBlur($event)" [(ngModel)]="model.year" (ngModelChange)="onChange()" class="usa-input-inline" aria-describedby="dobHint" class="usa-form-control" name="date_of_birth_3" pattern="[0-9]{4}" type="number" min="1900" max="3000" maxlength="4" [disabled]="disabled">
        </div>
      </div>
    <!--</labelWrapper>-->
  `,
})
export class SamDateComponent implements OnChanges {
  model: any = {
    month:"",
    day:"",
    year:""
  };
  @Input() errorMessage: string = "";
  @Input() name: string = "";
  @Input() label: string = "";
  @Input() hint: string = "";
  @Input() prefix: string = "";
  @Input() disabled: boolean = false;
  @Input() control;

  @Input() value: string;
  @Output() valueChange = new EventEmitter<any>();
  @Output() blurEvent = new EventEmitter<any>();

  @ViewChild('month') month;
  @ViewChild('day') day;
  @ViewChild('year') year;

  constructor() { }

  ngOnInit() {
    if (!this.name) {
      throw new Error('SamTimeComponent required a name for 508 compliance');
    }
  }

  ngOnChanges() {
    if (this.value) {
      // use the forgiving format (that doesn't need 0 padding) for inputs
      let m = moment(this.value, 'Y-M-D');
      if (m.isValid()) {
        this.model.month = m.month() + 1;
        this.model.day = m.date();
        this.model.year = m.year();
      } else {
        console.error('[value] for date is invalid');
      }
    }
  }

  onBlur() {
     this.blurEvent.emit();
  }

  getDate() {
    return moment([this.model.year, this.model.month-1, this.model.day]);
  }

  onChange() {
    if (this.getDate().isValid()) {
      // use the strict format for outputs
      let dateString = this.getDate().format("YYYY-MM-DD");
      this.valueChange.emit(dateString);
    } else {
      this.valueChange.emit(null);
    }
  }

  isValid() {
    return this.getDate().isValid();
  }

  monthName() {
    return `${this.name}_month`;
  }

  dayName() {
    return `${this.name}_day`;
  }

  yearName() {
    return `${this.name}_year`;
  }

}
