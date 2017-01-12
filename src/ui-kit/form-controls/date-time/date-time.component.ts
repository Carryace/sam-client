import {Component, Input, ViewChild, Output, EventEmitter, OnInit, forwardRef, OnChanges} from '@angular/core';
import * as moment from 'moment/moment';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {FieldsetWrapper} from "../wrapper/fieldset-wrapper.component";
import {SamDateComponent} from "../date/date.component";
import {SamTimeComponent} from "../time/time.component";


const MY_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SamDateTimeComponent),
  multi: true
};

@Component({
  selector: 'samDateTime',
  template: `
    <fieldsetWrapper [label]="label" [errorMessage]="errorMessage" [hint]="hint">
      <samTime #timeComponent [(value)]="time" (valueChange)="onInputChange($event)" [name]='name+"_time"' [disabled]="disabled"></samTime>
      <samDate #dateComponent [(value)]="date" (valueChange)="onInputChange($event)" [name]='name+"_date"' [disabled]="disabled"></samDate>
    </fieldsetWrapper>
  `,
  providers: [ MY_VALUE_ACCESSOR ]
})
export class SamDateTimeComponent implements OnInit, ControlValueAccessor {
  public INPUT_FORMAT: string = 'Y-M-DTH:m';

  @Input() value: string = null;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Input() label: string;
  @Input() name: string;
  @Input() errorMessage: string;
  @Input() disabled: boolean = false;
  @Input() control;

  time: string = null;
  date: string = null;

  @ViewChild('dateComponent') dateComponent: SamDateComponent;
  @ViewChild('timeComponent') timeComponent: SamTimeComponent;
  @ViewChild(FieldsetWrapper) wrapper;

  constructor() { }

  ngOnInit() {
    if (!this.name) {
      throw new Error('SamDateTimeComponent requires a [name] input for 508 compliance');
    }

    if (this.control) {
      this.wrapper.formatErrors(this.control);
    }

    this.parseValueString();
  }

  parseValueString() {
    if (this.value) {
      // use the more forgiving format (that doesn't need 0 padding) for inputs
      let m = moment(this.value, this.INPUT_FORMAT);
      if (m.isValid()) {
        this.time = m.format(this.timeComponent.OUTPUT_FORMAT);
        this.date = m.format(this.dateComponent.OUTPUT_FORMAT);
      } else {
        console.error('[value] for samDateTime is invalid');
      }
    }
  }

  emitChanges(val) {
    this.value = val;
    // only when this component is used as a FormControl will change be registered
    if (this.onChange) {
      this.onChange(val);
    }
    this.valueChange.emit(val);
  }

  onInputChange() {
    if (this.dateComponent.isClean() && this.timeComponent.isClean()) {
      this.emitChanges(null);
    } else if (this.dateComponent.isValid() && this.timeComponent.isValid()) {
      this.emitChanges(`${this.date}T${this.time}`);
    } else {
      this.emitChanges('Invalid Date Time');
    }
  }

  onChange: Function;
  onTouched: Function;

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  setDisabledState(disabled) {
    this.disabled = disabled;
  }

  writeValue(value) {
    this.value = value;
    this.parseValueString();
  }

}
