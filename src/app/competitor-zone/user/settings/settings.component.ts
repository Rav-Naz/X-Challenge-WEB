import { UiService } from './../../../services/ui.service';
import { UserService } from './../../../services/user.service';
import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmedValidator } from 'src/app/shared/utils/matching';
import { RefereeService } from '../../../services/referee.service';
import { Esp32Service } from '../../../services/esp32.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class SettingsComponent {

  formName: FormGroup;
  formPhone: FormGroup;
  formPostal: FormGroup;
  formPreferences: FormGroup;
  formPassword: FormGroup;
  formRFID: FormGroup;
  formAge: FormGroup;
  private loadingName: boolean = false;
  private loadingPhone: boolean = false;
  private loadingPostal: boolean = false;
  private loadingAge: boolean = false;
  private loadingPassword: boolean = false;
  private loadingRFID: boolean = false;
  public confirmingPhone: boolean = false;
  public returnedPayload: any;
  public isDisplayDevice: boolean = false;
  public isPersonally: boolean = false;
  constructor(public translate: TranslateService, private formBuilder: FormBuilder,
    public authService: AuthService, public userService: UserService, private ui: UiService, private injector: Injector, public esp32Service: Esp32Service) {
    this.isDisplayDevice = localStorage.getItem('isDisplayDevice') == 'true';
    this.isPersonally = (userService.userDetails as any)?.czy_bedzie_osobiscie;
    this.formName = this.formBuilder.group({
      name: [(userService.userDetails as any)?.imie, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      surname: [(userService.userDetails as any)?.nazwisko, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]]
    });
    const phoneNumber = (userService.userDetails as any)?.numer_telefonu ? [Number((userService.userDetails as any)?.numer_telefonu.toString().substring(0, 2)), (userService.userDetails as any)?.numer_telefonu.toString().substring(2)] : [48, null]
    this.formPhone = this.formBuilder.group({
      phone: [phoneNumber[1], [Validators.required, Validators.pattern('^[0-9]{3}[-\s\.]?[0-9, ]{4,8}$')]],
      country_code: [Number(phoneNumber[0]), [Validators.required]]
    });
    this.formPostal = this.formBuilder.group({
      postal_code: [(userService.userDetails as any)?.kod_pocztowy, [Validators.minLength(2), Validators.maxLength(8)]],
    });
    this.formAge = this.formBuilder.group({
      age: [(userService.userDetails as any)?.wiek, [Validators.required, Validators.max(100), Validators.maxLength(3)]],
    });
    this.formPreferences = this.formBuilder.group({
      preferedFood: [null, [Validators.required]],
      tshirtSize: [null, [Validators.required]]
    });
    this.formRFID = this.formBuilder.group({
      rfid_option: [esp32Service.rfidOption, [Validators.required]]
    });
    this.formPassword = this.formBuilder.group({
      actualPassword: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      newPassword: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      repeatNewPassword: [null, [Validators.required]],
    }, {
      validator: ConfirmedValidator('newPassword', 'repeatNewPassword')
    });
    this.formPreferences.disable();
    this.authService.getRegisterAddons().then(() => {
      this.formPreferences.controls['preferedFood'].setValue(this.foodOption);
      this.formPreferences.controls['tshirtSize'].setValue(this.tshirtSize);
    });
    this.formRFID.get('rfid_option')?.valueChanges.subscribe(val => {
      esp32Service.onChangeRFIDDevice(val);
    })
  }

  onSubmitPasswordForm() {
    if (this.isFormGroupPasswordValid) {
      this.loadingPassword = true;
      this.authService.changeUserPassword(this.formPassword.get('actualPassword')?.value, this.formPassword.get('newPassword')?.value)
        .catch(err => { })
        .then((value) => {
          if (value) {
            this.formPassword.reset();
          }
        }).finally(() => {
          this.loadingPassword = false;
        })
    }
  }

  onSubmitNameForm() {
    if (this.isFormGroupNameValid) {
      this.loadingName = true;
      this.userService.editUser(this.formName.get('name')?.value, this.formName.get('surname')?.value)
        .catch(err => { })
        .finally(() => {
          this.loadingName = false;
        })
    }
  }

  onSubmitPhone() {
    if (this.isFormGroupPhoneValid) {
      this.loadingPhone = true;
      this.authService.setUserPhoneLocaly(null);
      this.userService.addUserPhoneNumber(this.createPhoneNumber!).then(res => {
        if (res) {

          this.authService.setUserPhoneLocaly(this.createPhoneNumber);
        }
      }).finally(() => {
        this.loadingPhone = false;
        this.confirmingPhone = false;
      })
    }
  }

  onSubmitPostalForm() {
    if (this.isFormGroupPostalValid) {
      this.loadingPostal = true;
      this.userService.addPostalCode(this.formPostal.get('postal_code')?.value)
        .catch(err => { })
        .finally(() => {
          this.loadingPostal = false;
        })
    }
  }

  onSubmitAgeForm() {
    if (this.isFormGroupAgeValid) {
      this.loadingAge = true;
      this.userService.addAge(Number(this.formAge.get('age')?.value))
        .catch(err => { })
        .finally(() => {
          this.loadingAge = false;
        })
    }
  }

  onReadRFIDTag() {
    if (this.userService.isReferee) {
      this.injector.get(Esp32Service).readRFIDTag()
        .then((value) => {
          console.log(value);
          let selBox = document.createElement('textarea');
          selBox.style.position = 'fixed';
          selBox.style.left = '0';
          selBox.style.top = '0';
          selBox.style.opacity = '0';
          selBox.value = value;
          document.body.appendChild(selBox);
          selBox.focus();
          selBox.select();
          document.execCommand('copy');
          document.body.removeChild(selBox);
          this.returnedPayload = JSON.stringify(value);
          this.ui.showFeedback('loading', this.translate.instant('competitor-zone.settings.errors.copied'), 3);
        }, err => {
          console.error(err);
        })
    }
  }

  onReadLapTime() {
    if (this.userService.isReferee) {
      this.injector.get(Esp32Service).readOneGate()
        .then((value) => {
          console.log(value);
          let selBox = document.createElement('textarea');
          selBox.style.position = 'fixed';
          selBox.style.left = '0';
          selBox.style.top = '0';
          selBox.style.opacity = '0';
          selBox.value = value;
          document.body.appendChild(selBox);
          selBox.focus();
          selBox.select();
          document.execCommand('copy');
          document.body.removeChild(selBox);
          this.returnedPayload = JSON.stringify(value);
          this.ui.showFeedback('loading', this.translate.instant('competitor-zone.settings.errors.copied-lap-time'), 3);
        }, err => {
          console.error(err);
        })
    }
  }

  onWriteRFIDTag() {
    if (this.userService.isReferee && this.isFormGroupRFIDValid) {
      this.loadingRFID = true;
      this.injector.get(Esp32Service).writeRFIDTag(this.formPostal.get('payload')?.value)
        .then((value) => {
          this.returnedPayload = JSON.stringify(value);
          console.log(value);
        }, err => {
          console.error(err);
        }).finally(() => {
          this.loadingRFID = false;
        })
    }
  }

  onChangeDisplayDevice() {
    this.isDisplayDevice = !this.isDisplayDevice;
    localStorage.setItem('isDisplayDevice', this.isDisplayDevice.toString());
  }

  onChangePersonally() {
    this.isPersonally = !this.isPersonally;
    this.userService.changePersnoally(this.isPersonally);
  }


  get createPhoneNumber() {
    if (this.formPhone.get('country_code')?.value && this.formPhone.get('phone')?.value) {
      return `${this.formPhone.get('country_code')?.value}${this.formPhone.get('phone')?.value.toString().replace(/\s+/g, '')}`;
    } else {
      return null
    }
  }

  get foodOption(): string | undefined {
    let foodOptions = this.authService.foodList ? Object.assign(this.authService.foodList) : undefined;
    return foodOptions ? this.translate.instant("competitor-zone.register.food." + (foodOptions as Array<string>)[(this.userService.userDetails as any)?.preferowane_jedzenie - 1]) : undefined;
  }

  get tshirtSize(): string | undefined {
    let tshirtSizes = this.authService.tshirtSizes ? Object.assign(this.authService.tshirtSizes) : undefined;
    return tshirtSizes ? (tshirtSizes as Array<string>)[(this.userService.userDetails as any)?.rozmiar_koszulki - 1] : undefined;
  }

  get gatesOptions(): string | undefined {
    let options = ['Brak', 'Pojedyncza bramka', 'Podwójna bramka'];
    return options ? JSON.stringify(options.map((option: any) => {
      return { value: option, id: options.indexOf(option) + 1 }
    })) : undefined;
  }

  get userDetails() {
    return this.userService.userDetails as any;
  }


  copyValue(value: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.ui.showFeedback('loading', this.translate.instant('competitor-zone.settings.errors.copied'), 3);
  }

  public get isFormGroupNameValid() {
    return this.formName.valid && !this.loadingName && this.isFormNameChanged;
  }
  public get isFormGroupPhoneValid() {
    return this.formPhone.valid && !this.loadingPhone;
  }
  public get isFormGroupPostalValid() {
    return this.formPostal.valid && !this.loadingPostal;
  }
  public get isFormGroupAgeValid() {
    return this.formAge.valid && !this.loadingAge;
  }
  public get isFormGroupPasswordValid() {
    return this.formPassword.valid && !this.loadingPassword;
  }
  public get isFormGroupRFIDValid() {
    return this.formRFID.valid && !this.loadingRFID;
  }

  public get isFormNameChanged() {
    if (this.userService.userDetails && this.formName) {
      return `${(this.userService.userDetails as any)?.imie} ${(this.userService.userDetails as any)?.nazwisko}` !== `${this.formName.get('name')?.value} ${this.formName.get('surname')?.value}`;
    } else {
      return false;
    }
  }

  public get isPhoneChanged() {
    if (this.userService.userDetails && this.formPhone) {
      return (this.userService.userDetails as any)?.numer_telefonu !== this.createPhoneNumber;
    } else {
      return false;
    }
  }

  public get isPostalChanged() {
    if (this.userService.userDetails && this.formPostal) {
      return (this.userService.userDetails as any)?.kod_pocztowy !== this.formPostal.get('postal_code')?.value;
    } else {
      return false;
    }
  }
  public get isAgeChanged() {
    if (this.userService.userDetails && this.formAge) {
      return (this.userService.userDetails as any)?.wiek !== this.formAge.get('age')?.value;
    } else {
      return false;
    }
  }

}
