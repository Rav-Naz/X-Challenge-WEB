import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmedValidator } from 'src/app/shared/utils/matching';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;
  formPhone: FormGroup;
  private loading: boolean = false;
  public isRulesChecked: boolean = false;
  public isCarer: boolean = false;
  public isEmailEditable: boolean = true;
  public isPersonally: boolean = true;

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, private authService: AuthService, private route: ActivatedRoute) {
    const email = this.route.snapshot.paramMap.get('email');
    if (email != null) this.isEmailEditable = false;
    this.authService.getRegisterAddons();
    this.form = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      surname: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      email: [email, [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)]],
      postal_code: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(8)]],
      tshirtSize: [null, [Validators.required]],
      age: [null, [Validators.required, Validators.max(100), Validators.maxLength(3)]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      repeatPassword: [null, [Validators.required]]
    }, {
      validator: ConfirmedValidator('password', 'repeatPassword')
    });
    this.formPhone = this.formBuilder.group({
      phone: [null, [Validators.required, Validators.pattern('^[0-9]{3}[-\s\.]?[0-9, ]{4,8}$')]],
      country_code: [48, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.isFormGroupValid) {
      this.loading = true;
      this.authService.register(
        this.form.get('name')?.value,
        this.form.get('surname')?.value,
        this.form.get('email')?.value,
        this.form.get('postal_code')?.value,
        this.createPhoneNumber,
        this.form.get('tshirtSize')?.value,
        // this.form.get('preferedFood')?.value,
        this.isCarer,
        this.form.get('password')?.value,
        this.isPersonally,
        parseInt(this.form.get('age')?.value)
      ).catch(err => console.log(err))
        .finally(() => {
          this.loading = false;
        })
    }
  }

  enterSubmit(event: any) {
    if (event.keyCode === 13) this.onSubmit();
  }

  openUrl(url: string): void {
    window.open(url);
  }

  onChangeCheckbox() {
    this.isRulesChecked = !this.isRulesChecked;
  }

  onChangeCarer() {
    this.isCarer = !this.isCarer;
  }
  onChangePersonally() {
    this.isPersonally = !this.isPersonally;
  }

  get foodOptions(): string | undefined {
    let foodOptions = this.authService.foodList ? Object.assign(this.authService.foodList) : undefined;
    return foodOptions ? JSON.stringify(foodOptions.map((foodOption: any) => {
      return { value: ("competitor-zone.register.food." + foodOption), id: (foodOptions as Array<string>).indexOf(foodOption) + 1 }
    })) : undefined;
  }

  get tshirtSizes(): string | undefined {
    let tshirtSizes = this.authService.tshirtSizes ? Object.assign(this.authService.tshirtSizes) : undefined;
    return tshirtSizes ? JSON.stringify(tshirtSizes.map((tshirtSize: any) => {
      return { value: tshirtSize, id: (tshirtSizes as Array<string>).indexOf(tshirtSize) + 1 }
    })) : undefined;
  }

  get createPhoneNumber() {
    if (this.formPhone.get('country_code')?.value && this.formPhone.get('phone')?.value) {
      return `${this.formPhone.get('country_code')?.value}${this.formPhone.get('phone')?.value.toString().replace(/\s+/g, '')}`;
    } else {
      return null
    }
  }

  get isFormGroupValid() {
    return this.form.valid && this.formPhone.valid && !this.isLoading && this.isRulesChecked;
  }

  get isLoading() {
    return this.loading;
  }

}
