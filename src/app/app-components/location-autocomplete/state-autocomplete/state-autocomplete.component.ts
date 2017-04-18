import { Directive, Injectable, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { AutocompleteService } from 'sam-ui-kit/form-controls/autocomplete/autocomplete.service';
import { LocationService } from 'api-kit/location/location.service';
import { AlertFooterService } from '../../../alerts/alert-footer/alert-footer.service'

@Injectable()
export class StateServiceImpl implements AutocompleteService {

  country = "USA";

  constructor(private locationService: LocationService, private alertFooterService: AlertFooterService) { }

  getAllStatesJSON(q:string, country:string): ReplaySubject<any> {
    const results = new ReplaySubject();
    this.locationService.getAutoCompleteStates(q,country).subscribe(
      (res) => {
        results.next(res._embedded.stateList.reduce( (prev, curr) => {
          const newObj = {
            key: curr.stateCode.toString(),
            value: curr.state.toString()
          };
          prev.push(newObj);
          return prev;
        }, []));
      },
      (error) => {
        this.alertFooterService.registerFooterAlert({
          title:"The location service encountered an error.",
          description:"",
          type:'error',
          timer:0
        });
        return error;
      }
    );
    return results;
  }

  setFetchMethod(_?: any): any {}

  fetch(val: string, pageEnd: boolean, searchOptions?: any): Observable<any> {
    if(searchOptions === null) searchOptions = {key:"USA"};
    return this.getAllStatesJSON(val, searchOptions.key).map(o => o);
  }
}

@Directive({
  selector: 'sam-autocomplete[state]',
  providers: [
    {provide: AutocompleteService, useClass: StateServiceImpl}
  ]
})
export class SamStateServiceAutoDirective {}



