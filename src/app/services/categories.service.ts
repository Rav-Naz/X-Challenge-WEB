import { TranslateService } from '@ngx-translate/core';
import { APIResponse } from './../models/response';
import { CategoryMain } from './../models/category-main';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  public categories = new BehaviorSubject<Array<CategoryMain> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService) {
    this.getAllCategories();
  }

  public getAllCategories() {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.getAllCategories.catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        this.categories.next(value.body);
      }
      resolve(value);
    });
  }

  public addRobotCategory(kategoria_id: number, robot_uuid: string) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.addRobotCategory(kategoria_id, robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        // this.categories.next(value.body);
      }
      resolve(value);
    });
  }

  public deleteRobotCategory(kategoria_id: number, robot_uuid: string) {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.deleteRobotCategory(kategoria_id, robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        // this.categories.next(value.body);
      }
      resolve(value);
    });
  }

  getCategoryType(kategoria_id: number): null | number | void {
    if(this.categories.value) {
      return this.categories.value.find(el => el.kategoria_id === kategoria_id)?.rodzaj;
    } else {
      return null
    }

  }

  get categories$() {
    return this.categories.asObservable();
  }

}
