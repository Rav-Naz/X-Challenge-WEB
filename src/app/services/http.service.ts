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
  private token: string | null = null;

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

  get getAllGroups(): Promise<APIResponse> {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/getAllGroups`).toPromise().then(
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

  public register(imie: string, nazwisko: string, email: string, kodPocztowy: string | null, numerTelefonu: string | null, rozmiarKoszulki: number, preferowaneJedzenie: number, czyOpiekun: number, hasloHashed: string) {
    return new Promise<any>((resolve, rejects) => {
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
        referencerToken: this.token ?? null,
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

  public getCurrentVisitors() {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}public/currentVisitors`, { headers: this.headers }).toPromise().then(
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

  public addRobotDocumentation(robot_uuid: string, file: File) {
    return new Promise<APIResponse>((resolve, rejects) => {
      const formData = new FormData();
      formData.append("documentation", file);
      formData.append("robot_uuid", robot_uuid);
      let headers = new HttpHeaders({
        'token': this.token!
      })
      this.http.post<APIResponse>(`${this.url}user/uploadDocumentation`, formData, {headers: headers}).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public downloadDocumentation(robot_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      const headers = new HttpHeaders().set('token',this.token!);
      this.http.get(`${this.url}user/downloadDocumentation/${robot_uuid}`, {headers, responseType: 'blob' as 'json'}).subscribe(
        (response: any) =>{
          let dataType = response.type;
          let binaryData = [];
          binaryData.push(response);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
          downloadLink.target = "_blank";
          downloadLink.setAttribute('download', "doc-"+robot_uuid);
          document.body.appendChild(downloadLink);
          downloadLink.click();
      }
      )
    })
  }

  public addRobotMovie(robot_uuid: string, link_do_filmiku: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addFilm`, {
        link_do_filmiku: link_do_filmiku,
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

  // ------------- VOLOUNTEER

  public addCurrentVisitors() {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}volunteer/addOnePerson`, { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public removeCurrentVisitors() {
    return new Promise<any>((resolve, rejects) => {
      this.http.get<APIResponse>(`${this.url}volunteer/removeOnePerson`, { headers: this.headers }).toPromise().then(
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

  public confirmGivenStarterpack(uzytkownik_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}referee/confirmStarterpackGiven`, {
        uzytkownik_uuid: uzytkownik_uuid
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

  public confirmArrival(robot_uuid: string, value: boolean) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}referee/confirmArrival`, {
        robot_uuid: robot_uuid,
        value: value
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public sendPrivateMessage(uzytkownik_uuid: string, tresc : string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}referee/sendPrivateMessage`, {
        uzytkownik_uuid: uzytkownik_uuid,
        tresc: tresc
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public readRFIDTag() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`http://bramki.xchallenge.pl:5000/referee/readRFIDTag`,
      { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public readLapTime() {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.get<APIResponse>(`http://bramki.xchallenge.pl:5000/referee/readLapTime`,
      { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public writeRFIDTag(uzytkownik_uuid: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`http://bramki.xchallenge.pl:5000/referee/writeRFIDTag`,{
        uzytkownik_uuid: uzytkownik_uuid
      },
      { headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  // ------------- ADMIN


  public addPostalCode(kod_pocztowy: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}user/addPostalCode`, {
        kod_pocztowy: kod_pocztowy
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public addRobotRejection(robot_uuid: string, powod_odrzucenia: string) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}admin/addRobotRejection`, {
        robot_uuid: robot_uuid,
        powod_odrzucenia: powod_odrzucenia
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public changeUserType(uzytkownik_uuid: string, uzytkownik_typ : number) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.put<APIResponse>(`${this.url}admin/changeUserType`, {
        uzytkownik_uuid: uzytkownik_uuid,
        uzytkownik_typ: uzytkownik_typ
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  public createGroupsFromCategory(stanowiskaLista: Array<number>, kategoria_id: number, iloscDoFinalu: number, opcjaTworzenia: number | null) {
    return new Promise<APIResponse>((resolve, rejects) => {
      this.http.post<APIResponse>(`${this.url}admin/createGroupsFromCategory`, {
        stanowiskaLista: stanowiskaLista,
        kategoria_id: kategoria_id,
        iloscDoFinalu: iloscDoFinalu,
        opcjaTworzenia: opcjaTworzenia
       },{ headers: this.headers }).toPromise().then(
        (value) => { resolve(value) },
        (error) => { rejects(error) }
      );
    })
  }

  // ------------- OTHER

  public setNewToken(jwt: string | null) {
    if (jwt !== null) {
      this.token = jwt;
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
