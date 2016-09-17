import {Component, DynamicComponentLoader, ElementRef, OnInit, Injector, Input} from '@angular/core';
import { ComponentInjectService } from '../service/component.inject.service.ts';
import { InputTypeConstants } from '../constants/input.type.constants.ts';

@Component({
  selector:'samButton',
  template:`<div id={{labelname}}></div>`,
  providers: [ComponentInjectService, InputTypeConstants]
})
export class SamButton implements OnInit{
  @Input() labelname;
  @Input() config : any;

  constructor(
    private loader: DynamicComponentLoader,
    private elementRef: ElementRef,
    public _injector:Injector,
    private _componentInjectService : ComponentInjectService
  ){}

  ngOnInit(){
    this.loader.loadAsRoot(
      this._componentInjectService.injectComponent('button',this.config),      
      "#"+this.labelname,
      this._injector);
  }
}
