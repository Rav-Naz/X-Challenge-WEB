import { UserService } from './../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  form: FormGroup;
  // options = [{value: 'controls.category.name', id: 0}, {value: 'controls.password.name', id: 1}];
  private loading: boolean = false;

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, public authService: AuthService, private router: Router) {
    this.form = this.formBuilder.group({
      email: [null, [Validators.required,Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
    });
  }

  ngOnInit() {
    if(this.authService.isLogged) this.router.navigateByUrl('competitor-zone')
  }

  onSubmit() {
    if (this.isFormGroupValid) {
      this.loading = true;
      this.authService.login(this.form.get('email')?.value,this.form.get('password')?.value)
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
