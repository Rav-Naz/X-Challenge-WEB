import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActiveFightsService } from 'src/app/services/active_fights';
import { UserService } from '../../../services/user.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-active-fights-and-times',
  templateUrl: './active-fights-and-times.component.html',
  styleUrls: ['./active-fights-and-times.component.scss']
})
export class ActiveFightsAndTimesComponent {
  public activeFightsOrTimes: Array<any> = [];
  private subs: Subscription = new Subscription;

  constructor(private activeFightsService: ActiveFightsService, public userSerceice: UserService, private ui: UiService) {
    const sub = this.activeFightsService.activeFights$.subscribe(val => {
      if (val != null) {
        this.activeFightsOrTimes = this.getGroupedFightsOrTimes(val);
      }
    })
    this.subs.add(sub);
  }
  /// Stanowisko
  /// Kategoria
  /// Ring Robot1 Robot2
  getGroupedFightsOrTimes(list: Array<any>) {
    let agreged: any[] = [];
    list.sort((a, b) => a.ring_arena - b.ring_arena);
    list.forEach(ac => {
      let obj = {
        stanowisko_id: ac.stanowisko_id,
        stanowisko_nazwa: ac.stanowisko_nazwa,
        kategorie: [
          {
            kategoria_id: ac.kategoria_id,
            kategoria_nazwa: ac.kategoria_nazwa,
            aktywne: [
              {
                czas_rozpoczecia: ac.czas_rozpoczecia,
                robot1_id: ac.robot1_id,
                robot1_nazwa: ac.robot1_nazwa,
                robot1_uuid: ac.robot1_uuid,
                robot2_id: ac.robot2_id,
                robot2_nazwa: ac.robot2_nazwa,
                robot2_uuid: ac.robot2_uuid,
                ring_arena: ac.ring_arena
              }
            ]
          }
        ]
      }
      let filtered = agreged.filter(ag => ag.stanowisko_id == ac.stanowisko_id);
      if (filtered?.length == 0) {
        agreged.push(
          obj
        )
      } else {
        let kategorie_filtered = filtered[0].kategorie.filter((cat: { kategoria_id: any; aktywne: any[] }) => cat.kategoria_id == ac.kategoria_id);
        if (kategorie_filtered?.length == 0) {
          filtered[0].kategorie.push(obj.kategorie[0])
        } else {
          kategorie_filtered[0].aktywne.push(obj.kategorie[0].aktywne[0])
        }
      }
    });
    return agreged;
  }

  async removeActive(stanowisko_id: number, kategoria_id: number, arena: number) {
    const decision = await this.ui.wantToContinue(`Czy chcesz usunąć tą aktywność?`)
    if (decision) {
      await this.activeFightsService.removeCurrentFightOrTime(stanowisko_id, kategoria_id, arena);
    }

  }

  openRobotDetails(robot_uuid: string) {

    if (this.userSerceice.isReferee) window.open(`/competitor-zone/(outlet:robot/${robot_uuid})`);
  }
}
