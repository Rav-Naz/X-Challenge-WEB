import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent  {

  constructor(public translate: TranslateService) {
    translate.stream('timetable.table').subscribe((table: Array<any>) => {
      this.timetable = table;
    });
  }

  timetable: Array<any> = [];
}
