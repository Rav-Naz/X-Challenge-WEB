import { Component, OnDestroy } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-counting-visitors',
  templateUrl: './counting-visitors.component.html',
  styleUrls: ['./counting-visitors.component.scss']
})
export class CountingVisitorsComponent implements OnDestroy{

  sub: Subscription;
  currentVisitors: number = 0;

  constructor(private http: HttpService, private websocket: WebsocketService) {
    this.http.getCurrentVisitors().then(val => {
      this.currentVisitors = val.body.currentVisitors;
    });
    this.sub = this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('currentVisitors', (data) => {
        this.currentVisitors = data;
      })
    })
  }

  addOne() {
    this.http.addCurrentVisitors();
  }

  removeOne() {
    if (this.currentVisitors > 0) this.http.removeCurrentVisitors();
  }


  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }
}
