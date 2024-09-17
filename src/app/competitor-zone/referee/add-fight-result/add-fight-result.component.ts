import { UserService } from 'src/app/services/user.service';
import { FightsService } from './../../../services/fights.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RefereeService } from 'src/app/services/referee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';
import { Title } from '@angular/platform-browser';
import { ActiveFightsService } from '../../../services/active_fights';

@Component({
  selector: 'app-add-fight-result',
  templateUrl: './add-fight-result.component.html',
  styleUrls: ['./add-fight-result.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class AddFightResultComponent implements OnInit, OnDestroy {

  formUUID1: FormGroup;
  formUUID2: FormGroup;
  formArena: FormGroup;
  formResult1: FormGroup;
  formResult2: FormGroup;
  formComment: FormGroup;
  private loading: boolean = false;
  private subs: Subscription = new Subscription;
  public viewCounter: number = 0;
  public stanowisko_id: number | null = null;
  public kategoria_id: number | null = null;
  public walka: any = null;
  private settedArena: number | null = null;

  constructor(private formBuilder: FormBuilder, private refereeService: RefereeService, private route: ActivatedRoute,
    private router: Router, private ui: UiService, private fightService: FightsService, public userService: UserService, private titleService: Title, private activeFightService: ActiveFightsService) {
    this.formUUID1 = this.formBuilder.group({
      constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    });
    this.formUUID2 = this.formBuilder.group({
      constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    });
    this.formResult1 = this.formBuilder.group({
      fight_result: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]]
    });
    this.formResult2 = this.formBuilder.group({
      fight_result: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]]
    });
    this.formArena = this.formBuilder.group({
      arena: [null, [Validators.required]]
    });
    this.formComment = this.formBuilder.group({
      comment: [null, [Validators.maxLength(500)]]
    });

  }

  ngOnInit(): void {
    this.stanowisko_id = Number(this.route.snapshot.paramMap.get('stanowisko_id'));
    this.kategoria_id = Number(this.route.snapshot.paramMap.get('kategoria_id'));
    try {
      this.walka = JSON.parse((window as any).walka);
    } catch (err) {
      this.backToPositions();
    }
    if (!this.isCredentials || !this.walka) this.backToPositions();
    this.titleService.setTitle(`⚔️ ${this.walka.robot1_nazwa} vs ${this.walka.robot2_nazwa}`);
  }

  backToPositions() {
    window.close()
  }

  async goToArenaNumber() {
    if (this.isFormUserUUIDValid) {
      this.loading = true;
      const uzytkownik_uuid1 = this.formUUID1.get('constructor_uuid')?.value;
      const uzytkownik_uuid2 = this.formUUID2.get('constructor_uuid')?.value;
      const response1 = await this.refereeService.checkIfUserIsConstructorOfRobot(uzytkownik_uuid1, this.walka.robot1_uuid).catch(err => { return null });
      const response2 = await this.refereeService.checkIfUserIsConstructorOfRobot(uzytkownik_uuid2, this.walka.robot2_uuid).catch(err => { return null });
      if (response1 !== undefined && response1 !== null && response1.body.pCzyJest === 1 && response2 !== undefined && response2 !== null && response2.body.pCzyJest === 1) {
        this.nextPage();
      } else {
        this.loading = false;
        this.ui.showFeedback("error", `Użytkownik nie jest konstruktorem robota ${response1.body.pCzyJest === 1 ? this.walka.robot2_nazwa : this.walka.robot1_nazwa}!`, 3);
      }
    }
  }

  async goToSetFight() {
    if (this.isFormArenaValid) {
      this.settedArena = this.formArena.get('arena')?.value;
      this.loading = true;
      if (this.settedArena) {
        const response = await this.activeFightService.addCurrentFightOrTime(this.stanowisko_id!, this.kategoria_id!, this.settedArena, this.walka.robot1_id, this.walka.robot2_id);
        if (response !== undefined && response !== null && response.message === "INFO: OK") {
          this.nextPage();
        } else {
          this.loading = false;
          this.ui.showFeedback("error", `Nie udało się dodać informacji o numerze areny`, 3);
        }
      } else {
        this.nextPage();
      }
    }
  }

  async setFight() {
    if (this.isFormResultValid) {
      const wygrane_rundy1 = this.formResult1.get('fight_result')?.value;
      const wygrane_rundy2 = this.formResult2.get('fight_result')?.value;
      const decision = await this.ui.wantToContinue(`Czy potwierdzasz, że robot ${this.walka.robot1_nazwa} wygrał ${wygrane_rundy1} rund/y a robot ${this.walka.robot2_nazwa} wygrał ${wygrane_rundy2} rund/y?`)
      if (decision) {
        this.loading = true;
        const uwagi = this.formComment.get('comment')?.value;

        const response = await this.fightService.setFightResult(this.walka.walka_id, wygrane_rundy1, wygrane_rundy2, uwagi != undefined ? uwagi : null).catch(err => { return null });
        if (this.settedArena) {
          await this.activeFightService.removeCurrentFightOrTime(this.stanowisko_id!, this.kategoria_id!, this.settedArena);
        }
        if (response !== undefined && response !== null && response.message === "INFO: OK") {
          this.backToPositions();
        } else {
          this.loading = false;
          this.ui.showFeedback("error", `Błąd!`, 3);
        }
      }
    }
  }

  async callTheConstructor(robot_uuid: string, robot_nazwa: string) {
    const decision = await this.ui.wantToContinue(`Jeśli potwierdzisz wykonanie procedury, do wszystkich konstruktorów robota ${robot_nazwa} zostanie wysłana wiadomość wzywająca ich do walki na ringu`)
    if (decision) {
      const response = await this.refereeService.callForConstructors(robot_uuid, this.stanowisko_id!, robot_nazwa);
      if (response !== undefined && response !== null && response.body.sendedCount > 0) {
        this.ui.showFeedback("succes", `Konstruktorzy robota ${robot_nazwa} zostali wezwani`, 3);
      } else if (response !== undefined && response !== null && response.body.sendedCount == 0) {
        this.ui.showFeedback("loading", `Żaden z konstruktorów robota ${robot_nazwa} nie ma przypisanego numeru telefonu`, 5);
      } else {
        this.ui.showFeedback("error", `Błąd!`, 3);
      }
    }
  }

  previousPage() {
    if (this.viewCounter === 0) {
      this.backToPositions();
    } else {
      this.viewCounter--;
    }
  }

  async skip(info: boolean) {
    if (info) {
      const decision = await this.ui.wantToContinue(`Uwaga! Pominięcie etapu sprawdzania konstruktorów może skutkować przyznaniem punktów nieodpowieniemu robotowi`)
      if (!decision) return;
    }
    this.nextPage()
  }

  nextPage() {
    this.viewCounter++;
    this.loading = false;
  }

  get isFormResultValid() {
    const wygrane_rundy1 = this.formResult1.get('fight_result')?.value;
    const wygrane_rundy2 = this.formResult2.get('fight_result')?.value;
    return this.formResult1.valid && this.formResult2.valid && !this.isLoading && this.isCredentials && wygrane_rundy1 != wygrane_rundy2;
  }

  get isFormArenaValid() {
    return this.formArena.valid && !this.isLoading && this.isCredentials;
  }

  get isFormUserUUIDValid() {
    return this.formUUID1.valid && this.formUUID2.valid && !this.isLoading && this.isCredentials;
  }

  get isCredentials() {
    return this.kategoria_id && this.stanowisko_id && this.walka && typeof (this.kategoria_id) === "number" && typeof (this.stanowisko_id) === 'number' && typeof (this.walka) === 'object';
  }

  get isLoading() {
    return this.loading;
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(`XChallenge`);
  }

}
