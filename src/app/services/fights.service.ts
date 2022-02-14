import { UiService } from 'src/app/services/ui.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ErrorsService } from './errors.service';
import { TranslateService } from '@ngx-translate/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class FightsService {

  private allFights = new BehaviorSubject<Array<any> | null>(null);
  private fightsForPosition = new BehaviorSubject<Array<any> | null>(null);
  private fightsForRobot = new BehaviorSubject<Array<any> | null>(null);
  private actualPosition: number | null = null;

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService,
    private websocket: WebsocketService, private ui: UiService) {
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('setFightResult', (data) => {
        this.WS_setFightResult(data);
      });
    });
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('addFight', (data) => {
        this.WS_addFight(data);
      });
    });
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('addFightAndRobots', (data) => {
        this.WS_addFight(data);
      });
    });
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('addRobotToFight', (data) => {
        this.WS_addRobotToFight(data);
      });
    });
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('removeFight', (data) => {
        this.WS_removeFight(data);
      });
    });
  }

  public getAllFights() {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      if (this.allFights.value === null && this.allFights.value === undefined) { reject(); return; }
      if (this.allFights.value !== null) { resolve({message: "INFO: OK", body: this.allFights.value}); return;}
      const value = await this.http.getAllFights.catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      });
      if (value !== undefined) {
        this.allFights.next(value.body);
      }
      resolve(value);
    });
  }

  public getAllFightsForPosiotion(stanowisko_id: number) {
    return new Promise<APIResponse | void | Array<any>>(async (resolve, reject) => {
      if (this.isEmptyPositionList(stanowisko_id)) { reject(); return; }
      this.actualPosition = stanowisko_id;
      let value: APIResponse | void | Array<any>;
      if (this.allFights.value !== null) {
        value = this.allFights.value.filter((el) => el.stanowisko_id === stanowisko_id);
      } else {
        const response = await this.http.getAllFightsForPosiotion(stanowisko_id).catch(err => {
          if (err.status === 400) {
            this.errorService.showError(err.status, this.translate.instant(err.error.body));
          } else {
            this.errorService.showError(err.status);
          }
        });
        if (response && response.message === 'INFO: OK') {
          value = response.body;
        }
      }
      if (value !== undefined) {
        this.pushNewFigthsForPosition(value as any);
      }
      resolve(value);
    });
  }

  public getAllFightsOfRobots(robot_uuid: string) {
    this.fightsForRobot.next(null);
    return new Promise<any>(async (resolve) => {
      if (this.allFights.value && this.allFights.value.length > 0) {
        const fights = this.allFights.value.filter(el => (el.robot1_uuid === robot_uuid || el.robot2_uuid === robot_uuid));
        this.fightsForRobot.next(fights)
        resolve(fights)
      } else {
        const value = await this.http.getAllFightsOfRobot(robot_uuid).catch(err => {
          if(err.status === 400) {
            this.errorService.showError(err.status, this.translate.instant(err.error.body));
          } else {
            this.errorService.showError(err.status);
          }
        });
        if(value !== undefined) {
          this.fightsForRobot.next(Object.assign(value.body));
        }
        resolve(value);
      }
    });
  }

  public setFightResult(walka_id: number, wygrane_rundy_robot1: number, wygrane_rundy_robot2: number) {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      const value = await this.http.setFightResult(walka_id, wygrane_rundy_robot1, wygrane_rundy_robot2).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      });
      resolve(value);
    });
  }

  public pushNewFigthsForPosition(fight: Array<any> | null) {
    this.fightsForPosition.next(fight);
  }

  isEmptyPositionList(stanowisko_id: number) {
    return this.fightsForPosition.value && this.fightsForPosition.value.length > 0 && this.actualPosition === stanowisko_id;
  }

  WS_setFightResult(data: any) {
    if (this.actualPosition === data.stanowisko_id && this.fightsForPosition.value !== null && this.fightsForPosition.value !== undefined) {
      const fight = this.fightsForPosition.value.find(f => f.walka_id === data.walka_id);
      if (fight) {
        fight.czas_zakonczenia = data.czas_zakonczenia;
        fight.wygrane_rundy_robot1 = data.wygrane_rundy_robot1;
        fight.wygrane_rundy_robot2 = data.wygrane_rundy_robot2;
        this.pushNewFigthsForPosition(this.fightsForPosition.value);
        this.ui.showFeedback("succes", `Pomyślnie ustawiono wynik walki (${fight.walka_id})`, 3);
      }
      // delete fight.stanowisko_id;
      // this.timesForPosition.value?.push(new_time);
    }
    if(this.fightsForRobot.value && this.fightsForRobot.value.length > 0) {
      const fight = this.fightsForRobot.value.find(val => val.walka_id === data.walka_id);
      if (fight) {
        fight.czas_zakonczenia = data.czas_zakonczenia;
        fight.wygrane_rundy_robot1 = data.wygrane_rundy_robot1;
        fight.wygrane_rundy_robot2 = data.wygrane_rundy_robot2;
      }
      this.fightsForRobot.next(this.fightsForRobot.value);
    }
    if (this.allFights.value) {
      const fight = this.allFights.value.find(f => f.walka_id === data.walka_id);
      if (fight) {
        fight.czas_zakonczenia = data.czas_zakonczenia;
        fight.wygrane_rundy_robot1 = data.wygrane_rundy_robot1;
        fight.wygrane_rundy_robot2 = data.wygrane_rundy_robot2;
        // this.pushNewFigthsForPosition(this.fightsForPosition.value);
        this.allFights.next(this.allFights.value);
      }
    }
  }

  WS_addFight(data: any) {
    if (this.actualPosition === data.stanowisko_id && this.fightsForPosition.value !== null && this.fightsForPosition.value !== undefined) {
      this.fightsForPosition.value.push(data);
      this.pushNewFigthsForPosition(this.fightsForPosition.value);
      this.ui.showFeedback('loading', `Dodano walkę ${data.walka_id}`,3);
    }
    if(this.fightsForRobot.value && this.fightsForRobot.value.length > 0 && (this.fightsForRobot.value[0].robot1_id === data.robot1_id || this.fightsForRobot.value[0].robot1_id === data.robot2_id || this.fightsForRobot.value[0].robot2_id === data.robot1_id || this.fightsForRobot.value[0].robot2_id === data.robot2_id)) {
      const index = this.fightsForRobot.value.findIndex(val => val.walka_id === data.walka_id);
      if (index >= 0) {
        this.fightsForRobot.value[index] = data;
      } else {
        this.fightsForRobot.value.push(data);
      }
      this.fightsForRobot.next(this.fightsForRobot.value);
    }
    if (this.allFights.value) {
      const fight = this.allFights.value.find(f => f.walka_id === data.walka_id);
      if (fight) {
        this.WS_setFightResult(data);
      } else {
        this.allFights.value.push(data);
        this.allFights.next(this.allFights.value);
      }

    }
  }

  WS_addRobotToFight(data: any) {
    if (this.actualPosition === data.stanowisko_id && this.fightsForPosition.value !== null && this.fightsForPosition.value !== undefined) {
      const fightIndex = this.fightsForPosition.value.findIndex(f => f.walka_id === data.walka_id);
      if (fightIndex >= 0) {
        this.fightsForPosition.value[fightIndex] = data;
        this.fightsForPosition.next(this.fightsForPosition.value);
        this.ui.showFeedback('loading', `Dodano robota do walki ${data.walka_id}`,3);
      }
    }
    if(this.fightsForRobot.value && this.fightsForRobot.value.length > 0 && (this.fightsForRobot.value[0].robot1_id === data.robot1_id || this.fightsForRobot.value[0].robot1_id === data.robot2_id || this.fightsForRobot.value[0].robot2_id === data.robot1_id || this.fightsForRobot.value[0].robot2_id === data.robot2_id)) {
      const index = this.fightsForRobot.value.findIndex(val => val.walka_id === data.walka_id);
      if (index >= 0) {
        this.fightsForRobot.value[index] = data;
      } else {
        this.fightsForRobot.value.push(data);
      }
      this.fightsForRobot.next(this.fightsForRobot.value);
    }
    if (this.allFights.value) {
      const fightIndex = this.allFights.value.findIndex(f => f.walka_id === data.walka_id);
      if (fightIndex >= 0) {
        this.allFights.value[fightIndex] = data;
        this.allFights.next(this.allFights.value);
      }
    }
  }

  WS_removeFight(data: any) {
    if (this.fightsForPosition.value !== null && this.fightsForPosition.value !== undefined) {
      const fightIndex = this.fightsForPosition.value.findIndex(f => f.walka_id === data.walka_id);
      if (fightIndex >= 0) {
        this.fightsForPosition.value.splice(fightIndex, 1);
        this.fightsForPosition.next(this.fightsForPosition.value);
        this.ui.showFeedback('loading', `Usunięto walkę ${data.walka_id}`,3);
      }
    }
    if(this.fightsForRobot.value && this.fightsForRobot.value.length > 0) {
      const index = this.fightsForRobot.value.findIndex(val => val.walka_id === data.walka_id);
      if (index >= 0) {
        this.fightsForRobot.value.splice(index, 1);
      }
      this.fightsForRobot.next(this.fightsForRobot.value);
    }
    if (this.allFights.value) {
      const fightIndex = this.allFights.value.findIndex(f => f.walka_id === data.walka_id);
      if (fightIndex >= 0) {
        this.allFights.value.splice(fightIndex, 1);
        this.allFights.next(this.allFights.value);
      }
    }
  }
  get figthsForPosition$() {
    return this.fightsForPosition.asObservable();
  }

  get figthsForRobot$() {
    return this.fightsForRobot.asObservable();
  }

  get allFights$() {
    return this.allFights.asObservable();
  }

}
