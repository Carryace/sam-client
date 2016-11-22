import { Component, Input, Output, ViewChild, EventEmitter  } from '@angular/core';
import { LabelWrapper } from '../wrapper/label-wrapper.component';
import { OptionsType } from '../types';

/**
 * The <samMultiSelect> component is a select/options group compliant with sam.gov standards
 * https://gsa.github.io/sam-web-design-standards/
 *
 * @Input/@Output model - the bound value of the component
 * @Input options: [{Option}] - the array of checkbox values and labels (see OptionsType)
 * @Input label: string - the innerHtml of <fieldset>
 * @Input name: string - semantic description for the component
 * @Input hint: string - helpful text for the using the component
 * @Input errorMessage: string - red error message
 *
 */
@Component({
  selector: 'samMultiSelect',
  template: `
  <labelWrapper [label]="label" [name]="name" [hint]="hint" [errorMessage]="errorMessage">
    <select #select multiple (change)="change($event.target.options)" class="sam-multiselect" [disabled]="disabled">
      <option *ngFor="let item of options" [value]="item.value">
        {{item.name}}
      </option>
    </select>
  </labelWrapper>
  `,
  styleUrls: ['multiselect.styles.scss']
})
export class SamMultiSelectComponent {
  @ViewChild('select') selectElRef;
  @Input() options: OptionsType;
  @Input() label: string;
  @Input() name: string;
  @Input() hint: string;
  @Input() errorMessage: string;
  @Input() disabled:boolean;
  @Output() selectionUpdate = new EventEmitter<any>();
  selectedValues = [];
  constructor() { console.clear(); }
  ngAfterViewInit() {
    this.updateSelectList();
  }
  updateSelectList() {
    let options = this.selectElRef.nativeElement.options;
    for(let i=0; i < options.length; i++) {
      options[i].selected = this.selectedValues.indexOf(options[i].value) > -1;
    }
  }
  change(options) {
    this.selectedValues = Array.apply(null,options)  // convert to real Array
      .filter(option => option.selected)
      .map(option => option.value)
  }

}
