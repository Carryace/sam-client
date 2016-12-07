import {Injectable} from '@angular/core';
import {WrapperService} from '../wrapper/wrapper.service'
import 'rxjs/add/operator/map';

@Injectable()
export class FHService{

  constructor(private oAPIService: WrapperService){}

  getFederalHierarchyById(id: string, includeParentLevels: boolean, includeChildrenLevels: boolean) {
    let oApiParam = {
      name: 'federalHierarchy',
      suffix: '/'+id,
      oParam: {
        'sort': 'name'
      },
      method: 'GET'
    };
    if (includeParentLevels) {
      oApiParam.oParam['parentLevels'] = 'all';
    }

    if (includeChildrenLevels) {
      oApiParam.oParam['childrenLevels'] = 'all';
    }
    return this.oAPIService.call(oApiParam);
  }

  getOrganizationById(id: string) {
    let oApiParam = {
      name: 'federalHierarchyV2',
      suffix: '/'+id,
      oParam: {
        'sort': 'name'
      },
      method: 'GET'
    };
    return this.oAPIService.call(oApiParam);
  }

  getDepartments() {
    let oApiParam = {
      name: 'department',
      suffix: '/',
      method: 'GET'
    };
    return this.oAPIService.call(oApiParam);
  }

  getFederalHierarchyByIds(aIDs, includeParentLevels: boolean, includeChildrenLevels: boolean) {
    let oApiParam = {
      name: 'federalHierarchy',
      suffix: '/',
      oParam: {
        'sort': 'name',
        'ids': aIDs.join(',')
      },
      oData: {},
      method: 'GET'
    };

    if (includeParentLevels) {
      oApiParam.oParam['parentLevels'] = 'all';
    }

    if (includeChildrenLevels) {
      oApiParam.oParam['childrenLevels'] = 'all';
    }

    //make api call to get federalHierarchy by id
    return this.oAPIService.call(oApiParam);
  };

  getFullLabelPathFederalHierarchyById (id: string, includeParentLevels: boolean, includeChildrenLevels: boolean, successCallback, errorCallback) {
    this.getFederalHierarchyById(id, includeParentLevels, includeChildrenLevels).subscribe(res=>{
      successCallback(this.getFullNameFederalHierarchy(res));
    }, err =>{
      errorCallback(err);
    });
  };

  getFullNameFederalHierarchy (oData) {
    var name = oData.name;

    if (oData.hasOwnProperty('hierarchy')) {
        name += ' / ' + this.getFullNameFederalHierarchy(oData['hierarchy'][0]);
    }

    return name;
  };

  search(oData){
    let oApiParam = {
      name: 'search',
      suffix: '/',
      oParam: {
        index: "fh",
        q: oData.keyword
      },
      method: 'GET'
    };
    if (oData['pageNum']) {
      oApiParam.oParam['page'] = oData['pageNum'];
    }
    if (oData['pageSize']) {
      oApiParam.oParam['size'] = oData['pageSize'];
    }
    if (oData['parentOrganizationId']) {
      oApiParam.oParam['qFilters'] = {
        parentOrganizationId: oData['parentOrganizationId']
      };
    }
    return this.oAPIService.call(oApiParam);
  }

}
