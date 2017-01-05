import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Request, RequestMethod, Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class WrapperService {
    private APIs: any = {
        "opportunity": "/cfda/v1/opportunity",
        "search": "/sgs/v1/search",
        "featuredSearch": "/sgs/v1/search/featured",
        "program": "/cfda/v1/program",
        "federalHierarchy": "/cfda/v1/fh",
        "federalHierarchyV2": "/federalorganizations/v1/organizations/hierarchy",
        "federalOrganization": "/federalorganizations/v1/organizations",
        "federalDepartment": "/federalorganizations/v1/organizations/departments",
        "dictionary": "/cfda/v1/dictionary",
        "historicalIndex": "/cfda/v1/historicalIndex",
        "alerts": "/alert/v2/alerts",
        "allAlerts": "/alert/v2/alerts/allAlerts",
        "suggestions": "/sgs/v1/search/suggestions"
    };

    constructor(private _http: Http){}

  /**
    * common function to perform an API CALL
    *
    * @param Object oApiParam {
    *          name: '',
    *          suffix: '',
    *          oParam: {},
    *          method: '' (GET|POST|PUT...)
    *      }
    * @returns Observable
    */
    call(oApiParam: any) {
        let method: string = oApiParam.method;
        let oHeader = new Headers({});
        let oURLSearchParams = new URLSearchParams();

        //add API-Umbrella key
        oURLSearchParams.set("api_key", API_UMBRELLA_KEY);

        //loop through oParam & add them as request parameter
        for (var key in oApiParam.oParam) {
            oURLSearchParams.set(key, (typeof oApiParam.oParam[key] === 'object') ? JSON.stringify(oApiParam.oParam[key]) : oApiParam.oParam[key]);
        }

        var useReverseProxy = document.getElementsByTagName('html')[0].className == "ie9" ? true : false;
        var baseUrl = useReverseProxy ? "/ie_api" : API_UMBRELLA_URL;

        //TODO: Implement Post DATA to request
        let jsonOption = {
            "search": oURLSearchParams,
            "method": RequestMethod.Get,
            "headers": oHeader,
            "body": "",
            "url": baseUrl + this.APIs[oApiParam.name] + ((oApiParam.suffix !== '') ? oApiParam.suffix : '' )
        };

        switch (method.toUpperCase()){
            case "POST":
                jsonOption.method = RequestMethod.Post;
            break;
            case "PUT":
                jsonOption.method = RequestMethod.Put;
            break;
            case "PATCH":
                jsonOption.method = RequestMethod.Patch;
            break;
            case "DELETE":
                jsonOption.method = RequestMethod.Delete;
            break;
        }

        let oRequestOptions = new RequestOptions(jsonOption);
        let oRequest = new Request(oRequestOptions);

        return this._http.request(oRequest).map((res: Response) => { return res.json() } );
    }
}