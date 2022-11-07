import { CategoriesService } from './../../../services/categories.service';
import { PositionsService } from './../../../services/positions.service';
import { TimesService } from './../../../services/times.service';
import { UiService } from './../../../services/ui.service';
import { RefereeService } from './../../../services/referee.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Robot } from 'src/app/models/robot';
import { Title } from '@angular/platform-browser';
import { ActiveFightsService } from 'src/app/services/active_fights';

@Component({
  selector: 'app-add-time-result',
  templateUrl: './add-time-result.component.html',
  styleUrls: ['./add-time-result.component.scss'],
  host: {
    'class': 'router-flex'
  },
})
export class AddTimeResultComponent implements OnInit, OnDestroy {

  formUUID: FormGroup;
  formTime: FormGroup;
  formArena: FormGroup;
  private loading: boolean = false;
  private subs: Subscription = new Subscription;
  public viewCounter: number = 0;
  public stanowisko_id: number | null = null;
  public kategoria_id: number | null = null;
  public userRobots: Array<Robot> | null = null;
  public selectedRobot: Robot | null = null;
  private settedArena: number | null = null;

  constructor(private formBuilder: FormBuilder, private refereeService: RefereeService, private route: ActivatedRoute,
    private router: Router, private ui: UiService, private activeFightService: ActiveFightsService, private timesService: TimesService, private positionService: PositionsService, public categoryService: CategoriesService, private titleService: Title) {
    this.formUUID = this.formBuilder.group({
      constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    });
    this.formTime = this.formBuilder.group({
      time: [null, [Validators.required, Validators.maxLength(7)]],
      comment: [null, [Validators.maxLength(500)]]
    });
    this.formArena = this.formBuilder.group({
      arena: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.stanowisko_id = Number(this.route.snapshot.paramMap.get('stanowisko_id'));
    this.kategoria_id = Number(this.route.snapshot.paramMap.get('kategoria_id'));
  }

  async getUserRobots() {
    if (this.isFormUserUUIDValid) {
      this.loading = true;
      const uzytkownik_uuid = this.formUUID.get('constructor_uuid')?.value;
      const response = await this.refereeService.getRobotsOfUserInCategory(uzytkownik_uuid, this.kategoria_id!).catch(err => {
        return null
      });
      if (response !== undefined && response !== null && response.body.length > 0) {
        this.userRobots = response.body;
        this.nextPage();
      } else {
        this.loading = false;
        this.ui.showFeedback("error", `Użytkownik nie posiada żadnego robota w podanej kategorii ${this.kategoria_id}!`, 3);
      }
    }
  }

  async chooseRobot(robot: Robot) {
    this.loading = true;
    const response = await this.positionService.checkIfRobotCanInThisPosition(robot.robot_uuid, this.kategoria_id!, this.stanowisko_id!).catch(err => {
      return null
    });
    if (response !== undefined && response !== null && response.body !== undefined && response.body !== null && response.body.pCzyMoze === 1) {
      this.selectedRobot = robot;
      this.titleService.setTitle(`⏱️ ${this.selectedRobot.nazwa_robota}`);
      this.nextPage();
    } else {
      this.loading = false;
      this.ui.showFeedback("error", `Robot nie posiada kategorii ${this.kategoria_id}!`, 3);
    }
  }


  async goToSetTime() {
    if (this.isFormArenaValid) {
      this.settedArena = this.formArena.get('arena')?.value;
      this.loading = true;
      if (this.settedArena) {
        const response = await this.activeFightService.addCurrentFightOrTime(this.stanowisko_id!, this.kategoria_id!, this.settedArena, this.selectedRobot!.robot_id, 0);
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
  async setTimeResult() {
    if (this.isFromTimeValid) {
      this.loading = true;
      const czas_przejazdu = this.formTime.get('time')?.value;
      const uwagi = this.formTime.get('comment')?.value;
      const response = await this.timesService.setTimeResult(this.selectedRobot!.robot_uuid, czas_przejazdu, this.stanowisko_id!, this.kategoria_id!, uwagi != undefined ? uwagi : null).catch(err => {
        return null
      });
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


  async skip(info: boolean) {
    if (info) {
      const decision = await this.ui.wantToContinue(`Uwaga! Pominięcie etapu sprawdzania konstruktorów może skutkować przyznaniem punktów nieodpowieniemu robotowi`)
      if (!decision) return;
    }
    this.nextPage()
  }

  backToPositions() {
    window.close();
  }

  previousPage() {
    if (this.viewCounter === 0) {
      this.backToPositions();
    } else {
      this.viewCounter--;
      this.titleService.setTitle(`XChallenge`);
    }
  }

  nextPage() {
    this.viewCounter++;
    this.loading = false;
  }

  get getCategoryType() {
    if (this.kategoria_id) {
      return this.categoryService.getCategoryType(this.kategoria_id);
    } else {
      return undefined
    }
  }
  get isFormArenaValid() {
    return this.formArena.valid && !this.isLoading && this.isCredentials;
  }

  get isFormUserUUIDValid() {
    return this.formUUID.valid && !this.isLoading && this.isCredentials;
  }

  get isFromTimeValid() {
    return this.formTime.valid && !this.isLoading && this.isCredentials;
  }

  get isCredentials() {
    return this.kategoria_id && this.stanowisko_id && typeof (this.kategoria_id) === "number" && typeof (this.stanowisko_id) === 'number';
  }

  get isLoading() {
    return this.loading;
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(`XChallenge`);
  }
}
