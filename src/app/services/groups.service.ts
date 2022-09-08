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
export class GroupsService {

  public groups = new BehaviorSubject<Array<any> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService,private websocket: WebsocketService) {
    this.getAllGroups();
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('addGroup', (data) => {
        this.WS_addGroup(data)}
      )
      socket?.on('deleteGroup', (data) => {
        this.WS_deleteGroup(data)}
      )
      socket?.on('activateGroup', (data) => {
        this.WS_activateGroup(data)}
      )
      })
  }

  public getAllGroups() {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.getAllGroups.catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        this.groups.next(value.body);
      }
      resolve(value);
    });
  }

  public addGroup(kategoria_id: number, nazwa: string) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.addGroup(kategoria_id, nazwa).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public activateGroup(grupa_id: number) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.activateGroup(grupa_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public deactivateGroup(grupa_id: number) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.deactivateGroup(grupa_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public WS_addGroup(data: any) {
    this.groups.value?.push(data)
    this.groups.next(this.groups.value);
  }

  public WS_deleteGroup(data: any) {
    const index = this.groups.value?.findIndex(el => el.grupa_id == data.grupa_id)
    if (index && index >= 0) {
      this.groups.value?.splice(index,1)
      this.groups.next(this.groups.value);
    }
  }

  public WS_activateGroup(data: any) {
    const index = this.groups.value?.findIndex(el => el.grupa_id == data.grupa_id)
    if (index && index >= 0) {
      this.groups.value![index].czy_aktywna = data.czy_aktywna;
      this.groups.next(this.groups.value);
    }
  }

  get groups$() {
    return this.groups.asObservable();
  }
}
