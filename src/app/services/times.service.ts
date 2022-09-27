import { UiService } from './ui.service';
import { WebsocketService } from './websocket.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from './errors.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class TimesService {

  private timesForPosition = new BehaviorSubject<Array<any> | null>(null);
  private timesForRobot = new BehaviorSubject<Array<any> | null>(null);
  private allTimes = new BehaviorSubject<Array<any> | null>(null);
  private actualPosition: number | null = null;

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService,
    private websocket: WebsocketService, private ui: UiService) {
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('updateTimeResult', (data) => {
        this.WS_updateTimeResult(data);
      })
    })

    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('setTimeResult', (data) => {
        this.WS_setTimeResult(data);
      })
    })

    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('deleteTimeResult', (data) => {
        this.WS_deleteTimeResult(data);
      })
    })
  }

  public getAllTimes() {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      if (this.allTimes.value === null && this.allTimes.value === undefined && this) { reject(); return; }
      if(this.allTimes.value !== null) { resolve({message: "INFO: OK", body: this.allTimes.value}); return;}
      const value = await this.http.getAllTimes.catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.allTimes.next(value.body);
      }
      resolve(value);
    });
  }

  public getAllTimesForPosiotion(stanowisko_id: number) {
    return new Promise<APIResponse | void | Array<any>>(async (resolve, reject) => {
      if (this.isEmptyPositionList(stanowisko_id)) { reject(); return; }
      this.actualPosition = stanowisko_id;
      let value: APIResponse | void | Array<any>;
      if (this.allTimes.value) {
        value = this.allTimes.value.filter((el) => el.stanowisko_id === stanowisko_id);
      } else {
        const response = await this.http.getAllTimesForPosiotion(stanowisko_id).catch(err => {
          if (err.status === 400) {
            this.errorService.showError(err.status, this.translate.instant(err.error.body));
          } else {
            this.errorService.showError(err.status);
          }
        })
        if (response && response.message === 'INFO: OK') {
          value = response.body;
        }
      }
      if (value !== undefined) {
        this.pushNewTimesForPosition(value as any);
      }
      resolve(value);
    });
  }

  public getAllTimesOfRobots(robot_uuid: string) {
    this.timesForRobot.next(null);
    return new Promise<any>(async (resolve) => {
      if (this.allTimes.value && this.allTimes.value.length > 0) {
        const times = this.allTimes.value.filter(el => el.robot_uuid === robot_uuid);
        this.timesForRobot.next(times)
        resolve(times)
      } else {
        const value = await this.http.getAllTimesOfRobot(robot_uuid).catch(err => {
          if (err.status === 400) {
            this.errorService.showError(err.status, this.translate.instant(err.error.body));
          } else {
            this.errorService.showError(err.status);
          }
        })

        if (value !== undefined) {
          this.timesForRobot.next(Object.assign(value.body));
        }
        resolve(value);
      }
    });
  }


  public setTimeResult(robot_uuid: string, czas_przejazdu: number, stanowisko_id: number, kategoria_id: number) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.setTimeResult(robot_uuid, czas_przejazdu, stanowisko_id, kategoria_id).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public updateTimeResult(wynik_id: number, czas_przejazdu: number) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.updateTimeResult(wynik_id, czas_przejazdu).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public pushNewTimesForPosition(times: Array<any> | null) {
    const sorted = times ? times.sort((a, b) => b.wynik_id - a.wynik_id) : times;
    this.timesForPosition.next(sorted);
  }

  WS_updateTimeResult(data: any) {
    const timeIndex = this.timesForPosition.value?.findIndex(time => time.wynik_id === data?.wynik_id)
    if (timeIndex !== undefined && timeIndex !== null && timeIndex >= 0 && this.timesForPosition.value) {
      this.timesForPosition.value![timeIndex].czas_przejazdu = data?.czas_przejazdu;
      this.timesForPosition.next(this.timesForPosition.value)
    }
    if (this.timesForRobot.value && this.timesForRobot.value.length > 0) {
      const index = this.timesForRobot.value.findIndex(val => val.wynik_id === data.wynik_id);
      if (index >= 0) {
        this.timesForRobot.value![index].czas_przejazdu = data?.czas_przejazdu;
        this.timesForRobot.next(this.timesForRobot.value)
      }
    }
    if (this.allTimes.value) {
      const allTimeIndex = this.allTimes.value?.findIndex(time => time.wynik_id === data?.wynik_id)
      if (allTimeIndex !== undefined && allTimeIndex !== null && allTimeIndex >= 0 && this.allTimes.value) {
        this.allTimes.value![allTimeIndex].czas_przejazdu = data?.czas_przejazdu;
        this.allTimes.next(this.allTimes.value)
      }
    }
  }

  WS_setTimeResult(data: any) {
    if (this.actualPosition === data.stanowisko_id) {
      const new_time = data;
      delete new_time.stanowisko_id;
      this.timesForPosition.value?.push(new_time);
      this.pushNewTimesForPosition(this.timesForPosition.value);
      this.ui.showFeedback("succes", `Pomyślnie dodano nowy czas przejazdu (${new_time.wynik_id}) dla robota ${new_time.nazwa_robota}`, 3);
    }
    if (this.timesForRobot.value && this.timesForRobot.value.length > 0 && this.timesForRobot.value[0].robot_id === data.robot_id) {
      this.timesForRobot.value.push(data);
      this.timesForRobot.next(this.timesForRobot.value)
    }
    if (this.allTimes.value) {
      const new_time = data;
      const timeIndex = this.allTimes.value?.findIndex(time => time.wynik_id === data?.wynik_id)
      if (timeIndex && timeIndex >= 0) {
        this.WS_updateTimeResult(data);
      } else {
        this.allTimes.value?.push(new_time);
        this.allTimes.next(this.allTimes.value);
      }
    }
  }

  WS_deleteTimeResult(data: any) {
    if (this.timesForPosition.value !== null && this.timesForPosition.value !== undefined) {
      const timeIndex = this.timesForPosition.value.findIndex(f => f.wynik_id === data.wynik_id);
      if (timeIndex >= 0) {
        this.timesForPosition.value.splice(timeIndex, 1);
        this.timesForPosition.next(this.timesForPosition.value)
        this.ui.showFeedback('loading', `Usunięto wynik ${data.wynik_id}`, 3)
      }
    }
    if (this.timesForRobot.value && this.timesForRobot.value.length > 0) {
      const index = this.timesForRobot.value.findIndex(val => val.wynik_id === data.wynik_id);
      if (index >= 0) {
        this.timesForRobot.value.splice(index, 1);
        this.timesForRobot.next(this.timesForRobot.value)
      }
    }
    if (this.allTimes.value) {
      const timeIndex = this.allTimes.value.findIndex(f => f.wynik_id === data.wynik_id);
      if (timeIndex >= 0) {
        this.allTimes.value.splice(timeIndex, 1);
        this.allTimes.next(this.allTimes.value)
      }
    }
  }

  isEmptyPositionList(stanowisko_id: number) {
    return this.timesForPosition.value && this.timesForPosition.value.length > 0 && this.actualPosition === stanowisko_id;
  }

  get timesForPosition$() {
    return this.timesForPosition.asObservable();
  }

  get timesForRobot$() {
    return this.timesForRobot.asObservable();
  }

  get allTimes$() {
    return this.allTimes.asObservable();
  }
}
