import { Component, OnInit } from '@angular/core';
import { UserAccessService } from "api-kit/access/access.service";
import { UserAccessModel } from "../../access.model";
import { ActivatedRoute, Router } from "@angular/router";

import { AlertFooterService } from "../../../alerts/alert-footer/alert-footer.service";
import { UserAccessInterface } from "api-kit/access/access.interface";
import { PropertyCollector } from "../../../app-utils/property-collector";

@Component({
  templateUrl: 'grant-access.template.html'
})
export class GrantAccessPage implements OnInit {

  private userName: string = "";
  private orgs = [];
  private domain;
  private domainOptions = [];
  private role;
  private roleOptions = [];

  // these two will be replaced with real data on the access object
  private permissions: any;
  private objects = [];

  private messages: string = "";

  constructor(
    private userService: UserAccessService,
    private route: ActivatedRoute,
    private footerAlert: AlertFooterService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userName = this.route.parent.snapshot.params['id'];

    this.userService.getRoles().subscribe(
      roles => {
        this.roleOptions = roles.map(role => {
          return { value: role.id, label: role.roleName };
        });
      },
      error => {
        this.footerAlert.registerFooterAlert({
          title:"Unable to fetch access information.",
          description:"",
          type:'error',
          timer:0
        });
      }
    );
  }

  permissionId(permission, object) {
    return permission.val + '_' + object.function.val;
  }

  onOrganizationsChange(orgs) {
    this.orgs = orgs;
  }

  onRoleChange(role) {
    this.role = role;
    delete this.domain;
    this.domainOptions = [];
    this.objects = [];

    this.userService.getPermissions(this.role).subscribe(
      perms => {
        this.permissions = perms;
        let c = new PropertyCollector(perms);
        let domains = c.collect(['DomainContent', [], 'domain']);
        this.domainOptions = domains.map(d => {
          return { label: d.val, value: d.id };
        });
      },
      err => {
        this.domainOptions = [];
        this.footerAlert.registerFooterAlert({
          title:"Unable to fetch permission information.",
          description:"",
          type:'error',
          timer:0
        });
      }
    );
  }

  onDomainChange(domain) {
    this.domain = domain;

    let d = this.permissions.DomainContent.find(dom => {
      return +dom.domain.id === +this.domain;
    });
    if (d) {
      this.objects = d.FunctionContent;
    } else {
      this.objects = [];
    }
  }

  isGrantDisabled() {
    return !this.domain || !this.orgs.length;
  }

  grantButtonStyle() {
    return {
      "usa-button-disabled": this.isGrantDisabled(),
      "usa-button-primary": !this.isGrantDisabled()
    };
  }

  onGrantClick() {
    let orgIds = this.orgs.map(org => org.value);
    let funcs: any = this.objects.map(obj => {
      let perms = obj.permission.filter(p => p.isChecked).map(p => p.id);
      return {
        id: obj.function.id,
        permissions: perms
      }
    });
    let access: UserAccessInterface = UserAccessModel.FormInputToAccessObject(
      this.userName,
      this.role,
      this.domain,
      orgIds,
      funcs
    );

    this.userService.putAccess(access).subscribe(
      res => {
        this.footerAlert.registerFooterAlert({
          title:"Access updated.",
          description:"",
          type:'success',
          timer:0
        });

        this.router.navigate(['../access']);
      },
      error => {
        this.footerAlert.registerFooterAlert({
          title:"Unable to save access information.",
          description:"",
          type:'error',
          timer:0
        });
      }
    )
  }
}
