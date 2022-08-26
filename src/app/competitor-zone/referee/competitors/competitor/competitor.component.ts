import { RefereeService } from 'src/app/services/referee.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { UserService } from 'src/app/services/user.service';
import { UiService } from 'src/app/services/ui.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-competitor',
  templateUrl: './competitor.component.html',
  styleUrls: ['./competitor.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class CompetitorComponent {

  public formPostal: FormGroup;
  public formMessage: FormGroup;
  public formUserType: FormGroup;
  private subs: Subscription = new Subscription;
  public user: any = null;
  public user_roboty: any = null;
  private loading = false;
  private loadingStarerpack = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public authService: AuthService,
    private categoriesService: CategoriesService, public userSerceice: UserService, private router: Router,
    private ui: UiService, private translate: TranslateService, private refereeService: RefereeService, private titleService: Title) {
    const uzytkownik_uuid = this.route.snapshot.paramMap.get('uzytkownik_uuid');
    this.authService.getRegisterAddons();

    this.formPostal = this.formBuilder.group({
      postal_code: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(8)]]
    });
    this.formMessage = this.formBuilder.group({
      message: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
    });
    this.formUserType = this.formBuilder.group({
      user_type: [null, [Validators.required]]
    });
    const sub1 = combineLatest(this.categoriesService.categories$, this.refereeService.allUsers$).subscribe(async (val) => {

      if (val[0] !== null && val[1] !== null) {
        const categories = val[0];
        const users: Array<any> = JSON.parse(JSON.stringify(val[1]));
        const user = users.find(user => user.uzytkownik_uuid === uzytkownik_uuid)
        if (user) this.user = Object.assign(user);
        if (this.user) this.user_roboty = JSON.parse(this.user.roboty_json);
        this.formUserType.controls['user_type'].setValue(this.user.uzytkownik_typ);
        this.titleService.setTitle(`🧑 ${this.user.imie} ${this.user.nazwisko}`);
      }
    });
  }


  giveStarterpack() {
    if (this.user) {
      this.loadingStarerpack = true;
      this.refereeService.confirmGivenStarterPack(this.user.uzytkownik_uuid);
    }
  }

  async sendMessage() {
    if(this.isFormMessageValid) {
      this.loading = true;
      const decision = await this.ui.wantToContinue(`Czy wysłać wiadomość do użytkownika ${this.user!.imie} ${this.user!.nazwisko}?`)
    if (decision) {
      this.refereeService.sendPrivateMessage(this.user.uzytkownik_uuid, this.formMessage.get('message')?.value).catch(err => {
      }).then(() => {
        this.ui.showFeedback("succes", `Wysłano wiadomość do użytkownika ${this.user!.imie} ${this.user!.nazwisko}`, 2);
        this.formMessage.reset();
      }).finally(() => {
        this.loading = false;
      });
    }
    }
  }

  async changeUserType() {
    if(this.isFormUserTypeValid) {
      // console.log(this.formUserType.get('user_type')?.value)
      this.loading = true;
      this.refereeService.changeUserType(this.user.uzytkownik_uuid, this.formUserType.get('user_type')?.value).catch(err => {
      }).finally(() => {
        this.loading = false;
      });
    }
  }

  get isFormPostalCodeValid() {
    return this.formPostal.valid
  }

  get isFormMessageValid() {
    return this.formMessage.valid
  }

  get isFormUserTypeValid() {
    return this.formUserType.valid
  }

  get isLoading() {
    return this.loading;
  }

  get isLoadingStarterpack() {
    return this.loadingStarerpack;
  }

  openRobotDetails(robot_uuid: any) {
    if(this.userSerceice.isReferee) window.open(`/competitor-zone/(outlet:robot/${robot_uuid})`);
  }

  public get userCategories() {
    return this.user && this.user.kategorie ? this.user.kategorie.split(', ') : null;
  }

  public get userRobots() {
    return this.user_roboty;
  }

  public get userPhone() {
    if (this.user.numer_telefonu) {
      let kierunkowy = this.user.numer_telefonu.toString().substring(0,2)
      let numer = this.user.numer_telefonu.toString().substring(2)
      return `(+${kierunkowy})${numer}`
    }
    return null
  }

  get foodOption(): string | undefined {
    let foodOptions = this.authService.foodList ? Object.assign(this.authService.foodList) : undefined;
    return foodOptions && this.user ? this.translate.instant("competitor-zone.register.food."+(foodOptions as Array<string>)[this.user?.preferowane_jedzenie-1]): undefined;
  }

  get tshirtSize(): string | undefined {
    let tshirtSizes = this.authService.tshirtSizes ? Object.assign(this.authService.tshirtSizes): undefined;
    return tshirtSizes && this.user ? (tshirtSizes as Array<string>)[this.user?.rozmiar_koszulki-1] : undefined;
  }

  get userTypes(): string
  {
    return JSON.stringify([
      { value: "Użytkownik", id: 0 },
      { value: "Wolontariusz", id: 1 },
      { value: "Sędzia", id: 2 },
      { value: "Administrator", id: 3 }
      ])
  }


  copyUUID(){
    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = this.user!.uzytkownik_uuid;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.ui.showFeedback('loading', this.translate.instant('competitor-zone.settings.errors.copied'), 3);
    }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
    this.titleService.setTitle(`XChallenge`);
  }
}
