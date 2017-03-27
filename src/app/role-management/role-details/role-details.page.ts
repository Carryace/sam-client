import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserAccessService } from "../../../api-kit/access/access.service";
import { AlertFooterService } from "../../alerts/alert-footer/alert-footer.service";
import * as _ from 'lodash';
import { Title } from "@angular/platform-browser";

@Component({
  templateUrl: 'role-details.page.html'
})
export class RoleDetailsPage {
  mode: 'edit'|'new' = 'new';

  roles = [{ vals: [], name: 'Assistance Listing'}, {vals: [], name: 'IDV'}, {vals: [], name: 'Regional Offices'}];
  role;
  roleId;
  domains: any[] = [];
  domain;
  domainOptions: {label: string, value: any}[] = [];
  selectedDomain;
  domainRoleOptions: any = [{label: 'Agency User', value: 0}, {label: 'Agency Admin', value: 1}, {label: 'Agency Admin Lite', value: 2}];
  domainDefinitions: any = null;
  permissionOptions: any = [];
  requestObject;

  constructor(
    private router: Router
    , private accessService: UserAccessService
    , private footerAlert: AlertFooterService
    , private route: ActivatedRoute
    , private titleService: Title
  ) { }

  ngOnInit() {
    this.determineMode();
    this.setTitle();
    this.getAllDomains();
    if (this.mode === 'edit') {
      this.getDomainAndDefaultRole();
    }
  }

  setTitle() {
    this.titleService.setTitle(this.mode === 'edit' ? 'Edit Role' : 'New Role');
  }

  getDomainAndDefaultRole() {
    this.route.params.switchMap(params => {
      this.roleId = +params['roleId'];
      return this.route.queryParams;
    }).subscribe(qp => {
      this.domain = +qp['domain'];
      this.onDomainChange();
    });
  }

  getLabelForDomain(domainId) {
    let d = this.domainOptions.find(dom => +dom.value === +domainId);
    if (d) {
      return d.label;
    } else {
      return 'Domain not found.';
    }
  }

  determineMode() {
    if(/\/edit/.test(this.router.url)) {
      this.mode = 'edit';
    }
  }

  getAllDomains() {
    this.domains = this.route.parent.snapshot.data['domains']._embedded.domainList;
    this.domainOptions = this.domains.map(d => {
      return {
        label: d.domainName,
        value: d.id,
      };
    });
  }

  onDomainChange() {
    this.domainRoleOptions = null;
    this.accessService.getRoleObjDefinitions('role', ''+this.selectedDomain).subscribe(
      defs => {
        this.domainDefinitions = defs;
        this.domainRoleOptions = [];
        this.permissionOptions = [];
        if (!defs || !defs.length) {
          return;
        }

        if (defs.roleDefinitionMapContent && defs.roleDefinitionMapContent.length) {
          this.domainRoleOptions = defs.roleDefinitionMapContent.map(r => {
            return {
              label: r.role.val,
              value: r.role.id,
            };
          });
        }

        if (defs.functionMapContent && defs.functionMapContent.length){
          this.permissionOptions = defs.functionMapContent.map(f => {
            return {
              name: f.function.val,
              permissions: f.permission.map(perm => {
                return {
                  label: perm.val,
                  value: perm.id
                };
              })
            };
          });
        }

        if (this.mode === 'edit') {
          // find the text label for role and set the text label
          let r = this.domainRoleOptions.find(dr => +this.roleId === +dr.value);
          if (r) {
            this.role = r.label;
          } else {
            this.footerAlert.registerFooterAlert({
              title: 'Role '+this.roleId+' not found',
              type: 'error'
            });
            this.domainRoleOptions = null;
            this.domainDefinitions = null;
            return;
          }
        }
      },
      err => {
        this.showGenericServicesError();
      }
    )
  }

  showGenericServicesError() {
    this.footerAlert.registerFooterAlert({
      title: 'Something went wrong with a required service',
      type: 'error'
    })
  }

  onRoleBlur() {
    if (this.domainRoleOptions.find(d => d.label === this.role)) {
      this.footerAlert.registerFooterAlert({
        title: 'Role exists',
        type: 'error'
      });
      return;
    }
    let lastRole = _.last(this.domainRoleOptions);
    if (lastRole.isNew) {
      this.domainRoleOptions.pop();
    }
    this.domainRoleOptions.push({
      label: this.role,
      value: null,
      isNew: true,
    });
  }

  onSubmitClick() {
    this.requestObject = this.getRequestObject();
    this.footerAlert.registerFooterAlert({
      title: 'Successfully create new role.',
      type: 'success'
    });
    //this.router.navigateByUrl('/access/roles');
  }

  getRequestObject() {
    return {
      'domain': this.domain,
      'domainRoles': this.domainRoleOptions,
      'functions': this.permissionOptions
    };
  }
}
