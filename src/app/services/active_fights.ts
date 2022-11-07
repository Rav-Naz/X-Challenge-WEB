import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '../models/response';
import { ErrorsService } from './errors.service';
import { HttpService } from './http.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ActiveFightsService {

  public activeFights = new BehaviorSubject<Array<any> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService, private websocket: WebsocketService) {
    this.getCurrentFightsOrTimes();
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('currentFightsOrTimes', (data) => {
        this.WS_currentFightsOrTimes(data)
      })
    })
  }

  public getCurrentFightsOrTimes() {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.getCurrentFightsOrTimes.catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.activeFights.next(value.body);
      }
      resolve(value);
    });
  }

  public addCurrentFightOrTime(stanowisko_id: number, kategoria_id: number, ring_arena: number, robot1_id: number, robot2_id: number) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.addCurrentFightOrTime(stanowisko_id, kategoria_id, ring_arena, robot1_id, robot2_id).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public removeCurrentFightOrTime(stanowisko_id: number, kategoria_id: number, ring_arena: number) {

    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.removeCurrentFightOrTime(stanowisko_id, kategoria_id, ring_arena).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public WS_currentFightsOrTimes(data: any) {
    this.activeFights.next(data);
  }

  get activeFights$() {
    return this.activeFights.asObservable();
  }
}
