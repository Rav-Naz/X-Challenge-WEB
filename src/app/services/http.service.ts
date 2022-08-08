import { TranslateService } from '@ngx-translate/core';
import { Robot } from './../models/robot';
import { APIResponse } from './../models/response';
import { environment } from './../../environments/environment.prod';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private url: string;
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.url = environment.apiUrl;
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  // ------------- PUBLIC

  get getTest(): Observable<any> {
    return this.http.get<APIResponse>(`http://bramki.xchallenge.pl:5000/companies`, { headers: this.headers });
  }

  get getHomePageInfo(): Observable<APIResponse> {
    return this.http.get<APIResponse>(`${this.url}site/info`, { headers: this.headers });
  }

  get getRegisterAddons(): Observable<APIResponse> {
    return this.http.get<APIResponse>(`${this.url}site/registerAddons`, { headers: this.headers });
  }

  getSiteInfo(): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}site/info`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })  }

  checkIfRobotCanInThisPosition(robot_uuid: string, kategoria_id: number, stanowisko_id: number): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/checkIfRobotCanInThisPosition/${robot_uuid}/${kategoria_id}/${stanowisko_id}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  getPosition(stanowisko_id: number): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getPosition/${stanowisko_id}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  get getAllTimes() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllTimes`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  getAllTimesForPosiotion(stanowisko_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllTimesForPosiotion/${stanowisko_id}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  get getAllFights() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllFights`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  getAllFightsForPosiotion(stanowisko_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllFightsForPosiotion/${stanowisko_id}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  getAllFightsOfRobot(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllFightsForRobot/${robot_uuid}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  getAllTimesOfRobot(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllTimesForRobot/${robot_uuid}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  get getAllPositions(): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getPositions`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  get getAllCategories(): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllCategories`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  get getAllRobots(): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllRobots`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public confirmCode(uzytkownik_uuid: string, kod: string, czy_na_telefon: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/confirmCode/${uzytkownik_uuid}/${kod}/${czy_na_telefon}`).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public register(imie: string, nazwisko: string, email: string, kodPocztowy: string | null, numerTelefonu: string | null, rozmiarKoszulki: number | null, preferowaneJedzenie: number | null, czyOpiekun: number, hasloHashed: string) {
    return new Promise<any>((resolve, rejects) => {
      console.log(rozmiarKoszulki);
      console.log(preferowaneJedzenie);
      this.http.post<APIResponse>(`${this.url}public/registerUser`, {
        imie: imie,
        nazwisko: nazwisko,
        email: email,
        haslo: hasloHashed,
        numer_telefonu: numerTelefonu,
        kod_pocztowy: kodPocztowy,
        preferowane_jedzenie: preferowaneJedzenie,
        rozmiar_koszulki: rozmiarKoszulki,
        czy_opiekun: czyOpiekun,
        lang: this.translate.currentLang
      }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public login(email: string, hasloHashed: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}public/loginUser`, {
        email: email,
        haslo: hasloHashed
      }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public remindPassword(email: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}public/remind`, {
        email: email,
        lang: this.translate.currentLang
      }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public resetPassword(uzytkownik_uuid : string, kod: string, hasloHashed: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}public/reset-password`, {
        uzytkownik_uuid: uzytkownik_uuid,
        kod: kod,
        haslo: hasloHashed,
      }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  // ------------- USER

  public checkIfUserIsConstructorOfRobot(uzytkownik_uuid: string, robot_uuid: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}user/checkIfUserIsConstructorOfRobot/${uzytkownik_uuid}/${robot_uuid}`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public getUser() {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}user/getUser`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public changeUserPassword(stareHasloHashed: string,noweHasloHashed: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}user/changeUserPassword`, {
        stareHaslo: stareHasloHashed,
        noweHaslo: noweHasloHashed,
      }, {headers: this.headers}).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public editUser(imie: string, nazwisko: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}user/editUser`, {
        imie: imie,
        nazwisko: nazwisko,
      }, {headers: this.headers}).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addUserPhoneNumber(numer_telefonu: string) {
    return new Promise<any>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addUserPhoneNumber`, {
        numer_telefonu: numer_telefonu
      }, {headers: this.headers}).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }



  public getAllRobotsOfUser() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}user/getAllRobotsOfUser`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addRobot(nazwa: string, kategoria_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addRobot`, {
        nazwa: nazwa,
        kategoria_id: kategoria_id
      }, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public deleteRobot(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.delete<APIResponse>(`${this.url}user/deleteRobot`, { headers: this.headers, body: {
        robot_uuid: robot_uuid
      } }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public updateRobot(nazwa: string, robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}user/updateRobot`, {
        nazwa: nazwa,
        robot_uuid: robot_uuid
      }, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addRobotCategory(kategoria_id: number, robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addRobotCategory`, {
        kategoria_id: kategoria_id,
        robot_uuid: robot_uuid
      }, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public deleteRobotCategory(kategoria_id: number, robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.delete<APIResponse>(`${this.url}user/deleteRobotCategory`, { headers: this.headers, body: {
        kategoria_id: kategoria_id,
        robot_uuid: robot_uuid
      } }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }





  public getConstructors(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}user/getConstructors/${robot_uuid}`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addConstructor(uzytkownik_uuid: string, robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addConstructor`, {
        uzytkownik_uuid: uzytkownik_uuid,
        robot_uuid: robot_uuid
      }, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public deleteConstructor(konstruktor_id: number, robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.delete<APIResponse>(`${this.url}user/deleteConstructor`, { headers: this.headers, body: {
        konstruktor_id : konstruktor_id,
        robot_uuid: robot_uuid
      } }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  // ------------- REFEREE

  public getRefereePositions(uzytkownik_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}referee/getRefereePositions/${uzytkownik_uuid}`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public setTimeResult(robot_uuid : string, czas_przejazdu: number, stanowisko_id: number, kategoria_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}referee/setTimeResult`, {
        robot_uuid: robot_uuid,
        czas_przejazdu: czas_przejazdu,
        stanowisko_id: stanowisko_id,
        kategoria_id: kategoria_id
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public setFightResult(walka_id: number, wygrane_rundy_robot1: number, wygrane_rundy_robot2: number ) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}referee/setFightResult`, {
        walka_id: walka_id,
        wygrane_rundy_robot1: wygrane_rundy_robot1,
        wygrane_rundy_robot2: wygrane_rundy_robot2
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public updateTimeResult(wynik_id: number, czas_przejazdu: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}referee/updateTimeResult`, {
        wynik_id: wynik_id,
        czas_przejazdu: czas_przejazdu
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public checkIfRobotHasCategory(robot_uuid: string, kategoria_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}referee/checkIfRobotHasCategory/${robot_uuid}/${kategoria_id}`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public get getUsers() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}referee/getUsers`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public getRobotsOfUserInCategory(uzytkownik_uuid: string, kategoria_id: number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}referee/getRobotsOfUserInCategory/${uzytkownik_uuid}/${kategoria_id}`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public callForConstructors(robot_uuid : string, stanowisko_id: number, robot_nazwa: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}referee/sendMessageToAllConstructorsOfRobot`, {
        robot_uuid: robot_uuid,
        tresc: `/PL/ Twoja walka właśnie się rozpoczyna! Przyjdź z robotem ${robot_nazwa} na Stanowisko ${stanowisko_id} w trybie natychmiastowym. Nie pojawienie się w przeciągu 3 minut oznaczać będzie walkower! /EN/ Your fight is about to begin! Come with the robot ${robot_nazwa} to Position ${stanowisko_id} immediately. Not showing up within 3 minutes will mean a forfeit!`
      },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }


  // ------------- ADMIN

  public confirmArrival(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}admin/confirmArrival`, {
        robot_uuid: robot_uuid
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addPostalCode(uzytkownik_uuid: string, kod_pocztowy: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}admin/addPostalCode`, {
        uzytkownik_uuid: uzytkownik_uuid,
        kod_pocztowy: kod_pocztowy
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public sendPrivateMessage(uzytkownik_uuid: string, tresc : string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}admin/sendPrivateMessage`, {
        uzytkownik_uuid: uzytkownik_uuid,
        tresc: tresc
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  // ------------- OTHER

  public setNewToken(jwt: string | null) {
    if (jwt !== null) {
      this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': jwt
      })
    } else {
      this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }
  }
}
