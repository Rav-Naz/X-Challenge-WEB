import { UserService } from 'src/app/services/user.service';
import { FightsService } from './../../../services/fights.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RefereeService } from 'src/app/services/referee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-add-fight-result',
  templateUrl: './add-fight-result.component.html',
  styleUrls: ['./add-fight-result.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class AddFightResultComponent implements OnInit {

  formUUID1: FormGroup;
  formUUID2: FormGroup; 
  formResult1: FormGroup; 
  formResult2: FormGroup; 
   // formTime: FormGroup;
  private loading: boolean = false;
  private subs: Subscription = new Subscription;
  public viewCounter: number = 0;
  public stanowisko_id: number | null = null;
  public kategoria_id: number | null = null;
  public walka: any = null;

  constructor(private formBuilder: FormBuilder, private refereeService: RefereeService, private route: ActivatedRoute,
    private router: Router, private ui: UiService,private fightService: FightsService, public userService: UserService) {
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

  }

  ngOnInit(): void {
    this.stanowisko_id = Number(this.route.snapshot.paramMap.get('stanowisko_id'));
    this.kategoria_id = Number(this.route.snapshot.paramMap.get('kategoria_id'));
    this.walka = history.state.data;
    if(!this.isCredentials) this.backToPositions();
  }

  backToPositions() {
    this.router.navigateByUrl(`competitor-zone/(outlet:referee-zone/${this.stanowisko_id}/${this.kategoria_id}/${this.walka.grupa_id})`);
  }

  async goToSetFight() {
    if(this.isFormUserUUIDValid) {
      this.loading = true;
      const uzytkownik_uuid1 = this.formUUID1.get('constructor_uuid')?.value;
      const uzytkownik_uuid2 = this.formUUID2.get('constructor_uuid')?.value;
      const response1 = await this.refereeService.checkIfUserIsConstructorOfRobot(uzytkownik_uuid1, this.walka.robot1_uuid).catch(err => {return null});
      const response2 = await this.refereeService.checkIfUserIsConstructorOfRobot(uzytkownik_uuid2, this.walka.robot2_uuid).catch(err => {return null});
      if (response1 !== undefined && response1 !== null && response1.body.pCzyJest === 1 && response2 !== undefined && response2 !== null && response2.body.pCzyJest === 1) {
        this.nextPage();
      } else {
        this.loading = false;
        this.ui.showFeedback("error", `Użytkownik nie jest konstruktorem robota ${response1.body.pCzyJest === 1 ? this.walka.robot2_nazwa : this.walka.robot1_nazwa}!`, 3);
      }
    } else if (this.userService.isAdmin) {
      this.nextPage();
    }
  }

  async setFight() {
    if(this.isFormResultValid) {
      const wygrane_rundy1 = this.formResult1.get('fight_result')?.value;
      const wygrane_rundy2 = this.formResult2.get('fight_result')?.value;
      const decision = await this.ui.wantToContinue(`Czy potwierdzasz, że robot ${this.walka.robot1_nazwa} wygrał ${wygrane_rundy1} rund/y a robot ${this.walka.robot2_nazwa} wygrał ${wygrane_rundy2} rund/y? Jeśli się pomylisz, wynik może poprawić TYLKO administrator (ale nie rób mi tego specjalnie ;) ) `)
      if (decision) {        
        this.loading = true;
        const response = await this.fightService.setFightResult(this.walka.walka_id, wygrane_rundy1, wygrane_rundy2).catch(err => {return null});
        // const response2 = await this.refereeService.checkIfUserIsConstructorOfRobot(uzytkownik_uuid2, this.walka.robot2_uuid).catch(err => {return null});
        if (response !== undefined && response !== null && response.message === "INFO: OK") {
          this.backToPositions();
        } else {
          this.loading = false;
          this.ui.showFeedback("error", `Błąd!`, 3);
        }
      }
    }
  }

  async callTheConstructor(robot_uuid : string, robot_nazwa: string) {
    const decision = await this.ui.wantToContinue(`Jeśli potwierdzisz wykonanie procedury, do wszystkich konstruktorów robota ${robot_nazwa} zostanie wysłana wiadomość wzywająca ich do walki na ringu`)
    if (decision) {
      const response = await this.refereeService.callForConstructors(robot_uuid, this.stanowisko_id!, robot_nazwa);
      if (response !== undefined && response !== null && response.body.pIsSucces === 1) {
        this.ui.showFeedback("succes", `Użytkownicy robota ${robot_nazwa} zostali wezwani`, 3);
      } else {
        this.ui.showFeedback("error", `Błąd!`, 3);
      }
    }
  }

  previousPage() {
    if(this.viewCounter === 0) {
      this.backToPositions();
    } else {
      this.viewCounter--;
    }
  }

  nextPage() {
    this.viewCounter++;
    this.loading = false;
  }

  get isFormResultValid() {
    return this.formResult1.valid && this.formResult2.valid && !this.isLoading && this.isCredentials;
  }

  get isFormUserUUIDValid() {
    return this.formUUID1.valid && this.formUUID2.valid && !this.isLoading && this.isCredentials;
  }

  get isCredentials() {
    return this.kategoria_id && this.stanowisko_id && this.walka && typeof(this.kategoria_id) === "number" && typeof(this.stanowisko_id) === 'number' && typeof(this.walka) === 'object';
  }

  get isLoading() {
    return this.loading;
  }

}
