import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  form: FormGroup;
  private loading: boolean = false;
  public sended: boolean = false;
  public email: string = '';

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.formBuilder.group({
      email: [null, [Validators.required,Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)]],
    });
  }

  ngOnInit() {
    if(this.authService.isLogged) this.router.navigateByUrl('competitor-zone')
  }

  onSubmit() {
    if (this.isFormGroupValid) {
      this.loading = true;
      this.email = this.form.get('email')?.value;
      this.authService.remindPassword(this.email).catch(() => {
        }).then(value => {
        if(value) {
          this.sended = true;
          this.form.reset();
        }
      })
      .finally(() => {
        this.loading = false;
      })
    }
  }

  enterSubmit(event: any) {
    if(event.keyCode === 13) this.onSubmit();
  }

  get isFormGroupValid() {
    return this.form.valid && !this.isLoading;
  }

  get isLoading() {
    return this.loading;
  }

}

