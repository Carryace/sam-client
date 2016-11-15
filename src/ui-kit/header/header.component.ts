import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'samHeader',
  template: `<header>
              <nav class="usa-grid-full" aria-label="Main navigation">
                <div class="usa-width-one-fourth align-top">
                  <ul class="usa-grid usa-unstyled-list">
                    <li><a><img src="../../assets/img/transition-sam-logo.png"></a></li>
                  </ul>
                </div>
                <SamHeaderLinks (onDropdownToggle)="dropdownEventControl($event)"></SamHeaderLinks>
            
              </nav>
            </header>`,
  styleUrls: ['header.scss']

})
export class SamHeaderComponent {


  @Output()
  dropdownControl:EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  dropdownEventControl(value){
    this.dropdownControl.emit(value);
  }
}
