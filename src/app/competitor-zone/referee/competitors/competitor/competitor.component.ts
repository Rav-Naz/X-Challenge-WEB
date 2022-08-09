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
  private subs: Subscription = new Subscription;
  public user: any = null;
  private loading = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public authService: AuthService,
    private categoriesService: CategoriesService, public userSerceice: UserService, private router: Router,
    private ui: UiService, private translate: TranslateService, private refereeService: RefereeService) {
    const uzytkownik_uuid = this.route.snapshot.paramMap.get('uzytkownik_uuid');

    this.formPostal = this.formBuilder.group({
      postal_code: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(8)]]
    });
    this.formMessage = this.formBuilder.group({
      message: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
    });
    const sub1 = combineLatest(this.categoriesService.categories$, this.refereeService.allUsers$).subscribe(async (val) => {

      if (val[0] !== null && val[1] !== null) {
        const categories = val[0];
        const users: Array<any> = JSON.parse(JSON.stringify(val[1]));
        const user = users.find(user => user.uzytkownik_uuid === uzytkownik_uuid)
        if(user.kategorie) {
          const a = user.kategorie.split(", ").map((cat: string) => categories.find(obj => obj.kategoria_id.toString() === cat)?.nazwa).join(", ");
          user.kategorie = a;
        }
        if (user) this.user = Object.assign(user);
      }
    });
  }


  savePostalCode() {
    if(this.isFormPostalCodeValid) {
      this.loading = true;
      // this.refereeService.addPostalCode(this.user.uzytkownik_uuid, this.formPostal.get('postal_code')?.value).catch(err => {
      // }).then(() => {
      //   this.ui.showFeedback("succes", "Dodano kod pocztowy", 2)
      // }).finally(() => {
      //   this.loading = false;
      // });
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

  get isFormPostalCodeValid() {
    return this.formPostal.valid
  }

  get isFormMessageValid() {
    return this.formMessage.valid
  }

  get isLoading() {
    return this.loading;
  }

  openRobotDetails(robot_uuid: any) {
    if(this.userSerceice.isReferee) this.router.navigateByUrl(`/competitor-zone/(outlet:robot/${robot_uuid})`)
  }

  public get userCategories() {
    return this.user && this.user.kategorie ? this.user.kategorie.split(', ') : null;
  }

  public get userRobots() {
    return this.user && this.user.roboty_uuid ? this.user.roboty_uuid.split(', ') : null;
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
  }
}
