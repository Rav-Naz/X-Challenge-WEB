import { ConstructorsService } from 'src/app/services/constructors.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryMain } from './../../../models/category-main';
import { CategoriesService } from './../../../services/categories.service';
import { Robot } from './../../../models/robot';
import { RobotsService } from './../../../services/robots.service';
import { AuthService } from './../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-my-robots',
  templateUrl: './my-robots.component.html',
  styleUrls: ['./my-robots.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class MyRobotsComponent implements OnInit {

  private subs: Subscription = new Subscription;
  public userRobots: Array<Robot> | null = null;
  public categories: Array<CategoryMain> | null = null;

  constructor(public authService: AuthService, private robotsService: RobotsService, private categoriesService: CategoriesService,
     public translate: TranslateService, public router: Router, public userService: UserService) { }

  ngOnInit(): void {
    /// START DEBUG
    // this.userRobots = [
    //   {kategorie: '1, 2, 3', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3, 4', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3', nazwa_robota: "Cwelik", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    //   {kategorie: '1, 2, 3', nazwa_robota: "1234567890123456789012345678901234567890", robot_id: 1, robot_uuid: "7038b7ad-0ff8-11ec-87bf-b8ca3a5bc7d0"},
    // ]
    // this.categories = [
    //   {kategoria_id: 1, nazwa: "Smash Bots by RoboLAB", ilosc_robotow: 2, rodzaj: 1},
    //   {kategoria_id: 2, nazwa: "Line Follower Turbo Enchanced", ilosc_robotow: 2, rodzaj: 1},
    //   {kategoria_id: 3, nazwa: "Line Follower Standard", ilosc_robotow: 2, rodzaj: 1},
    //   {kategoria_id: 4, nazwa: "Lego Sumo", ilosc_robotow: 2, rodzaj: 1},
    // ]
    // this.userRobots?.forEach((robot) => {
    //   const a = [...[...robot.kategorie.split(", ")].map((cat) => this.categories!.find(obj => obj.kategoria_id.toString() === cat)?.nazwa)].join(", ");
    //   robot.kategorie = a;
    // })
    // return;
    /// END DEBUG

    const sub1 = combineLatest(this.categoriesService.categories$, this.robotsService.userRobots$).subscribe((val) => {
      if (val[0] !== null && val[1]) {
        this.userRobots = JSON.parse(JSON.stringify(val[1]!));
        this.categories = JSON.parse(JSON.stringify(val[0]!));
        this.userRobots?.forEach((robot) => {
          const a = [...[...robot.kategorie.split(", ")].map((cat) => this.categories!.find(obj => obj.kategoria_id.toString() === cat)?.nazwa)].join(", ");
          robot.kategorie = a;
        })
      }
    })
    this.subs.add(sub1)

  }

  public editRobot(robot_uuid: any) {
    this.router.navigateByUrl(`/competitor-zone/(outlet:robot/${robot_uuid})`)
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }
}
