import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService{

  public socket = new BehaviorSubject<Socket | null>(null);
  private lastSocket: Socket | null = null;

  constructor() {

    this.getWebSocket$.subscribe((socket) => {
      if(socket !== null && socket !== undefined) {
        if(this.lastSocket !== null) {
          this.lastSocket.disconnect();
        }
        this.lastSocket = socket;
      }
    })
  }

  createSocket(jwt?: string) {
    if (jwt) {
      const socket = io('http://127.0.0.1:8080/', {
        auth: {
          token: jwt
        }
      });
      // console.log("socket", socket)
      this.socket.next(socket);
    } else {
      const socket = io('http://127.0.0.1:8080/');
      // console.log("socket", socket)
      this.socket.next(socket);
    }
  }

  get getWebSocket$() {
    return this.socket.asObservable();
  }
}
