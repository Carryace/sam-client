/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentInjectService } from './common/service/component.inject.service.ts';
import { InputTypeConstants } from './common/constants/input.type.constants.ts';
<<<<<<< HEAD
import { SamFooter } from './common/samuikit/sam-footer.ts';
import { SamHeader } from './common/samuikit/sam-header.ts';
import { SamSpace } from './common/samuikit/sam-space.ts';
import { SamButton } from './common/samuikit/sam-button.ts';
import { SamLabel } from './common/samuikit/sam-label.ts';
import { SamAccordions } from './common/samuikit/sam-accordions.ts';
import { SamSelect } from './common/samuikit/sam-select.ts';
=======
>>>>>>> b77fa7888ce80cf7671c6e4e904fa3bf99961c69
import '../assets/js/samuikit.js';


/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.css'
  ],
  templateUrl: 'app.template.html',
  providers : [ComponentInjectService,InputTypeConstants
})
export class App {
  testValue = { value: 'Test' };
  buttonValue = {type:"default", data:"Default"};
  labelValue = {type:"small", data:"Day"};
  accordionsValue = {accordions: [
                                          {title:"Test1", content:"This is Test1",expanded:false},
                                          {title:"Test2", content:"This is Test2", expanded:true},
                                          {title:"Test3", content:"This is Test3",expanded:false}
                                        ],
                          bordered:false };
  selectValue = {
                                type: 'dropdown',
                                label: 'Dropdown label',
                                name: 'options',
                                options: {
                                  'value1': 'Option A',
                                  'value2': 'Option B',
                                  'value3': 'Option C'
                                }
                              };
  constructor() {

  }

  ngOnInit() {
       this.testValue = { value: 'Test2' };
  }

}
