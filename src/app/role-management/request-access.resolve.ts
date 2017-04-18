import { Resolve, ActivatedRouteSnapshot, Router, ActivatedRoute } from "@angular/router";
import { UserAccessService } from "../../api-kit/access/access.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AlertFooterService } from "../alerts/alert-footer/alert-footer.service";

@Injectable()
export class RequestAccessResolve implements Resolve<any> {
  constructor(
    private accessService: UserAccessService,
    private router: Router,
    private footerAlerts: AlertFooterService
  )
  {

  }

  resolve(route: ActivatedRouteSnapshot) {
    let rid = route.params['requestId'];

    return this.accessService.getPendingRequestById(rid)
      .map(access => {
        if (!access.userAccessRequestList[0]) {
          throw new Error('');
        } else {
          return access.userAccessRequestList[0];
        }
      })
      .catch(() => {
        this.router.navigateByUrl('/access/role-workspace');
        this.footerAlerts.registerFooterAlert({
          description: "The request ID was not found or there was an error with a required service.",
          type: 'error',
          timer: 3200,
        });
        return Observable.throw('Error while fetching access request.');
    });
  }
}