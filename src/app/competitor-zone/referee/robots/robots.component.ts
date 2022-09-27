import { RefereeService } from './../../../services/referee.service';
import { UiService } from './../../../services/ui.service';
import { UserService } from './../../../services/user.service';
import { Router } from '@angular/router';
import { RobotsService } from './../../../services/robots.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryMain } from 'src/app/models/category-main';
import { CategoriesService } from 'src/app/services/categories.service';
import { combineLatest, Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class RobotsComponent implements OnInit, OnDestroy {

  public formOption: FormGroup;
  public formFilter: FormGroup;
  public allRobots: Array<any> | null = null;
  public categories: Array<CategoryMain> | null = null;
  private subs: Subscription = new Subscription;
  public filterOptions: string = JSON.stringify([
    { value: "competitor-zone.robots.filters.name", id: 1 },
    { value: "competitor-zone.robots.filters.uuid", id: 2 },
    { value: "competitor-zone.robots.filters.categories", id: 3 }
    ]);
  private selectedFilter: number | null = 1;
  private filter: string = '';

  constructor(private robotsService: RobotsService, private categoriesService: CategoriesService, private formBuilder: FormBuilder, private router: Router,
    public userService: UserService, private ui: UiService, private refereeService: RefereeService, public authService: AuthService) {
    this.formOption = this.formBuilder.group({
      filter: [this.selectedFilter]
    });
    this.formFilter = this.formBuilder.group({
      filter_name: [this.filter]
    });
  }

  ngOnInit(): void {
    const sub1 = combineLatest(this.categoriesService.categories$, this.robotsService.allRobots$).subscribe((val) => {
      if (val[0] !== null && val[1]) {
        this.allRobots = JSON.parse(JSON.stringify(val[1]!));
        this.categories = JSON.parse(JSON.stringify(val[0]!));
        console.log(this.allRobots)
        // this.allRobots = this.allRobots!.concat(this.allRobots).concat(this.allRobots)
        this.allRobots?.forEach((robot) => {
          const a = [...[...robot.kategorie.split(", ")].map((cat) => this.categories!.find(obj => obj.kategoria_id.toString() === cat)?.nazwa)].join(", ");
          robot.kategorie = a;
        })
      } else if (!val[1]) {
        this.robotsService.getAllRobots();
      }
    })
    const sub2 = this.formOption.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.selectedFilter = Number(data.filter);
      }
    });
    const sub3 = this.formFilter.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.filter = data.filter_name.toLowerCase();
      }
    });
    this.subs.add(sub1).add(sub2).add(sub3);
  }

  get robotsFiltered() {
    let roboty = this.allRobots ? [...this.allRobots] : undefined;
    // if(!this.userService.isAdmin) {
    //   roboty = roboty?.filter(robot => robot.czy_dotarl === 1);
    // }
    if (this.filter !== '' && roboty) {
      switch (this.selectedFilter) {
        case 1:
          roboty = roboty.filter(robot => String(robot.nazwa_robota).toLowerCase().includes(this.filter));
          break;
        case 2:
          roboty = roboty.filter(robot => String(robot.robot_uuid).toLowerCase().includes(this.filter));
            break;
        case 3:
          roboty = roboty.filter(robot => String(robot.kategorie).toLowerCase().includes(this.filter));
          break;

        default:
          break;
      }
    }
    return roboty;
  }

  async confirmArrival(robot: any, event: Event) {
    event.stopPropagation();
    const decision = await this.ui.wantToContinue(`Potwierdzasz dotarcie robota ${robot.nazwa_robota}`)
    if (decision) {
      const response = await this.refereeService.confirmArrival(robot.robot_uuid, true).catch(err => {
        return null
      });
      // console.log(response);
      if (response !== undefined && response !== null && response.message === "INFO: OK") {
        // this.robotsService.confirmArrival(robot.robot_uuid)
        this.ui.showFeedback("succes", `Pomyślnie potwierdzono dotarcie robota ${robot.nazwa_robota}`, 3);

      } else {
        this.ui.showFeedback("error", `Nie udało się potwierdzić dotarcia!`, 3);
      }

    }
  }

  public editRobot(robot_uuid: any) {
    window.open(`/competitor-zone/(outlet:robot/${robot_uuid})`)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subs.unsubscribe();
  }
}
