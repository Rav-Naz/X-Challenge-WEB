import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmedValidator } from 'src/app/shared/utils/matching';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent{

  form: FormGroup;
  private loading: boolean = false;
  public isRulesChecked: boolean = false;

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, private authService: AuthService) {
    this.form = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      surname: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      email: [null, [Validators.required,Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      repeatPassword: [null, [Validators.required]]
      ,
    }, { 
      validator: ConfirmedValidator('password', 'repeatPassword')
    });
  }

  onSubmit() {
    if (this.isFormGroupValid) {
      this.loading = true;
      this.authService.register(this.form.get('name')?.value ,this.form.get('surname')?.value,this.form.get('email')?.value,this.form.get('password')?.value).catch(err => console.log(err))
      .finally(() => {
        this.loading = false;
      })
    }
  }

  enterSubmit(event: any) {
    if(event.keyCode === 13) this.onSubmit();
  }

  openUrl(url: string): void {
    window.open(url);
  }
  
  onChangeCheckbox() {
    this.isRulesChecked = !this.isRulesChecked;
  }

  get isFormGroupValid() {
    return this.form.valid && !this.isLoading && this.isRulesChecked;
  }

  get isLoading() {
    return this.loading;
  }

}
