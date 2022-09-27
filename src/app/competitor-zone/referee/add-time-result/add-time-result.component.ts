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
  private loading: boolean = false;
  private subs: Subscription = new Subscription;
  public viewCounter: number = 0;
  public stanowisko_id: number | null = null;
  public kategoria_id: number | null = null;
  public userRobots: Array<Robot> | null = null;
  public selectedRobot: Robot | null = null;

  constructor(private formBuilder: FormBuilder, private refereeService: RefereeService, private route: ActivatedRoute,
    private router: Router, private ui: UiService, private timesService: TimesService, private positionService: PositionsService, public categoryService: CategoriesService, private titleService: Title) {
    this.formUUID = this.formBuilder.group({
      constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    });
    this.formTime = this.formBuilder.group({
      time: [null, [Validators.required, Validators.maxLength(7)]]
    });
  }

  ngOnInit(): void {
    this.stanowisko_id = Number(this.route.snapshot.paramMap.get('stanowisko_id'));
    this.kategoria_id = Number(this.route.snapshot.paramMap.get('kategoria_id'));
  }

  async getUserRobots() {
    if(this.isFormUserUUIDValid) {
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

  async setTimeResult() {
    if (this.isFromTimeValid) {
      this.loading = true;
      const czas_przejazdu = this.formTime.get('time')?.value;
      const response = await this.timesService.setTimeResult(this.selectedRobot!.robot_uuid, czas_przejazdu, this.stanowisko_id!, this.kategoria_id!).catch(err => {
        return null
      });
      if (response !== undefined && response !== null && response.message === "INFO: OK") {
        this.backToPositions();
      } else {
        this.loading = false;
        this.ui.showFeedback("error", `Błąd!`, 3);
      }
    }
  }

  backToPositions() {
    window.close();
  }

  previousPage() {
    if(this.viewCounter === 0) {
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
    if(this.kategoria_id) {
      return this.categoryService.getCategoryType(this.kategoria_id);
    } else {
      return undefined
    }
  }

  get isFormUserUUIDValid() {
    return this.formUUID.valid && !this.isLoading && this.isCredentials;
  }

  get isFromTimeValid() {
    return this.formTime.valid && !this.isLoading && this.isCredentials;
  }

  get isCredentials() {
    return this.kategoria_id && this.stanowisko_id && typeof(this.kategoria_id) === "number" && typeof(this.stanowisko_id) === 'number';
  }

  get isLoading() {
    return this.loading;
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(`XChallenge`);
  }
}
