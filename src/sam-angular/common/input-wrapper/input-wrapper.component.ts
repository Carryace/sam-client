import { Component, Input } from '@angular/core';

export type InputWrapperConfigType = {
  label?: string,
  hint?: string,
  errorMessage?: string,
  errorLabel?: string,
  labelFor?: string
};

export type OptionsType = Array<{
  value: string | number,
  label: string,
  idFor?: string,
  disabled?: boolean
}>;

/**
 * @Input() label: <string> *optional* The text value of the <label> which will describe the wrapped content
 * @Input() errorLabel: <string> *optional* An error message
 * @Input() errorMessage: <string> *optional* An alternate error message
 * @Input() hint: <string> *optional* Helpful text describing how to use the wrapped content
 * @Input() labelFor: <string> *optionsal* The value of the for attribute of the label.
 */
@Component({
  selector: 'inputWrapper',
  template: `
    <div [class.usa-input-error]="!!errorMessage">
      <label *ngIf="label" [attr.for]="labelFor">{{label}}</label>
      <span *ngIf="errorLabel" class="usa-input-error-label">{{errorLabel}}</span>
      <span *ngIf="hint" class="usa-form-hint">{{hint}}</span>
      <span *ngIf="errorMessage" class="usa-input-error-message">{{errorMessage}}</span>
      <ng-content></ng-content>
    </div>
  `,
})
export class InputWrapper {
  @Input() errorLabel: string;
  @Input() errorMessage: string;
  @Input() label: string;
  @Input() hint: string;
  @Input() labelFor: string;

  constructor() { }
}
