import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';


@Injectable()
export class SearchService {

    constructor(private oAPIService: APIService) {}

    runSearch(obj) {
      let oApiParam = {
        name: 'search',
        suffix: '/',
        oParam: {
          index: obj.index,
          q: obj.keyword,
          page: obj.pageNum,
          organizationId: obj.organizationId
        },
        method: 'GET'
      };

      return this.oAPIService.call(oApiParam);
    }

}
