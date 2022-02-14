import { UiService } from './../../services/ui.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmedValidator } from 'src/app/shared/utils/matching';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  private loading: boolean = false;
  private uzytkownik_uuid: string | null;
  private kod: string | null;
  constructor(public translate: TranslateService, private formBuilder: FormBuilder, private authService: AuthService,
     private router: Router, private route: ActivatedRoute, private ui: UiService) {
    this.uzytkownik_uuid = this.route.snapshot.paramMap.get('uzytkownik_uuid');
    this.kod = this.route.snapshot.paramMap.get('kod');
    this.form = this.formBuilder.group({
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      repeatPassword: [null, [Validators.required]],
    }, { 
      validator: ConfirmedValidator('password', 'repeatPassword')
    });
  }

  ngOnInit() {
    if(!this.uzytkownik_uuid || !this.kod) {
      this.router.navigateByUrl('competitor-zone');
      this.ui.showFeedback("error", this.translate.instant('competitor-zone.reset-password.errors.no-params'))
    }
  }

  onSubmit() {
    if (this.isFormGroupValid) {
      this.loading = true;
      this.authService.resetPassword(this.uzytkownik_uuid!,this.kod!,this.form.get('password')?.value).finally(() => {
        this.loading = false;
      })
    }
  }

  enterSubmit(event: any) {
    if(event.keyCode === 13) this.onSubmit();
  }

  get isFormGroupValid() {
    return this.form.valid && !this.isLoading && this.uzytkownik_uuid && this.kod;
  }

  get isLoading() {
    return this.loading;
  }

}
