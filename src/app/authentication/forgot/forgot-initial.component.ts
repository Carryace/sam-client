import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

import { IAMService } from 'api-kit';
import { Validators as $Validators } from '../shared/validators';

import { CookieService } from 'angular2-cookie/core';

@Component({
  templateUrl: './forgot-initial.component.html',
  providers: [
    IAMService
  ]
})
export class ForgotInitialComponent {
  private states = {
    submitted: false,
    loading: false,
    error: ''
  };

  private errors = {
    'required': 'Please enter your email',
    'email': 'Enter a valid email address'
  };

  email: FormControl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cookies: CookieService,
    private api: IAMService) {}

  ngOnInit() {
console.log(this.route.params);
    this.email = new FormControl('', [Validators.required, $Validators.email])
  }

  validate() {
    let control = this.email,
        messages = this.errors,
        result = '',
        error;

    for(error in control.errors) {
      if(messages[error] !== undefined) {
        result = messages[error];
        break;
      }
    }

    return result;
  }

  init() {
    let vm = this,
        control = this.email;

    if(control.valid) {
      this.states.loading = true;

      this.zone.runOutsideAngular(() => {
        this.api.iam.user.password.init(control.value, () => {
          vm.zone.run(() => {
            this.states.loading = false;
            this.cookies.put('iam-forgot-email', control.value);
            this.router.navigate(['/forgot/confirm']);
          });
        }, (error) => {
          vm.zone.run(() => {
            this.states.loading = false;
            this.states.error = error;
          });
        });
      });
    }
  }
};
