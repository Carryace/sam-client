import { Component, Input } from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'labelWrapper',
  template: `
    <div class='label-wrapper' [class.usa-input-error]="!!errorMessage">
      <label [attr.for]="name" [class.usa-input-error-label]="errorMessage">{{label}}<span *ngIf="required" class="usa-additional_text">Required</span></label>
      <span *ngIf="errorMessage" class="usa-input-error-message">{{errorMessage}}</span>
      <span *ngIf="hint" class="usa-form-hint">{{hint}}</span>
      <ng-content></ng-content>
    </div>
  `,
})
export class LabelWrapper {
  @Input() label: string;
  @Input() name: string;
  @Input() hint: string;
  @Input() required: boolean = false;
  @Input() errorMessage: string;

  constructor() { }

  formatErrors(control: FormControl) {
    console.log('format errors for ', control);
    if (!control) {
      return;
    }

    if (control.invalid && control.errors) {
      for (let k in control.errors) {
        let errorObject = control.errors[k];
        switch (k) {
          case 'maxlength':
            const actualLength = errorObject.actualLength;
            const requiredLength = errorObject.requiredLength;
            this.errorMessage = `Too many characters (${actualLength} or ${requiredLength})`;
            return;
          case 'required':
            console.log('set required');
            this.errorMessage = 'This field cannot be empty';
            return;
          case 'isNotBeforeToday':
            this.errorMessage = "Date must not be before today";
            return;
          default:
            console.log(errorObject);
            if (errorObject.message) {
              this.errorMessage = errorObject.message;
            } else {
              this.errorMessage = 'Invalid';
            }
            return;
        }
      }
    } else if (control.valid) {
      this.errorMessage = '';
    }
  }
}
