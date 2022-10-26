import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CategoryMain } from 'src/app/models/category-main';
import { Subscription, combineLatest } from 'rxjs';
import { PositionsService } from 'src/app/services/positions.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { TimesService } from 'src/app/services/times.service';
import { FightsService } from 'src/app/services/fights.service';
import { UserService } from 'src/app/services/user.service';
import { onlyUnique } from 'src/app/shared/utils/unique';
import { Position } from './../../models/position';
import { GroupsService } from 'src/app/services/groups.service';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})

export class ResultsComponent implements OnInit, OnDestroy {

  public formOption: FormGroup;
  public formFilter: FormGroup;
  public positions: Array<Position> | null = null;
  public categories: Array<CategoryMain> | null = null;
  public allFights: Array<any> | null = null;
  public allTimes: Array<any> | null = null;
  public filterOptions: string = JSON.stringify([
    { value: "competitor-zone.results.filters.position", id: 1 },
    { value: "competitor-zone.results.filters.uuid", id: 2 },
    { value: "competitor-zone.results.filters.name", id: 3 }
  ]);

  private loading: boolean = false;
  public groups: Array<any> | null = null;
  public actualShowingGroup: any = null;
  public scrollTimer: any;
  public scrollTimer2: any;
  public lastScrollPos = 0;
  public isDisplayDevice = false;
  private isScrolling = false;

  public threeBestRobots: Array<any> | null = null;

  private subs: Subscription = new Subscription;
  public selectedCategory: number | null = null;
  public selectedGroup: number | null = null;
  public isLoading: boolean = false;
  public isShowingDetails: boolean = false;
  private selectedFilter: number | null = 1;
  public showCategories: Array<any> | null = null
  public showGroups: Array<any> | null = null
  private filter: string = '';

  constructor(private positionsService: PositionsService, private formBuilder: FormBuilder,
    private categoriesService: CategoriesService, public translateService: TranslateService, private timesService: TimesService,
    private figthsService: FightsService, public userService: UserService, public authService: AuthService, private groupsService: GroupsService) {

    this.formOption = this.formBuilder.group({
      filter: [this.selectedFilter]
    });
    this.formFilter = this.formBuilder.group({
      filter_name: [this.filter]
    });
    this.isDisplayDevice = localStorage.getItem('isDisplayDevice') == 'true';

    positionsService.getAllPositions();
    timesService.getAllTimes();
    figthsService.getAllFights();
    groupsService.getAllGroups();
    const sub1 = combineLatest(this.categoriesService.categories$, this.positionsService.allPositions$, this.figthsService.allFights$, this.timesService.allTimes$, this.groupsService.groups$).subscribe((val) => {
      if (val[0] && val[1] && val[2] && val[3]) {
        this.categories = JSON.parse(JSON.stringify(val[0]));
        this.positions = JSON.parse(JSON.stringify(val[1]));
        this.allFights = JSON.parse(JSON.stringify(val[2]));
        this.allTimes = JSON.parse(JSON.stringify(val[3]));
        this.groups = JSON.parse(JSON.stringify(val[4]));
        this.loading = false;
        this.showCategories = this.categoriesInPosition!;
        if (this.getCategoryType == 2) {

          this.threeBestRobotsInPoints().then(val => {
            this.threeBestRobots = val;
          })
        } else if (this.getCategoryType == 0) {
          this.threeBestRobotsInTimes().then(val => {
            this.threeBestRobots = val;
          })
        }
      }
    })

    const sub2 = this.formOption.valueChanges.subscribe(async (data) => {
      if (data !== null && data !== undefined) {
        this.selectedFilter = Number(data.filter);
        if (this.selectedFilter === 1) {
          this.selectedCategory = null;
          this.selectedGroup = null;
          this.threeBestRobots = null;
        }
      }
    });
    const sub3 = this.formFilter.valueChanges.subscribe(async (data) => {
      if (data !== null && data !== undefined) {
        this.filter = data.filter_name.toLowerCase();
        this.showCategories = this.categoriesInPosition!;
      }
    });

    this.subs.add(sub1).add(sub2).add(sub3);
  }

  ngOnInit(): void {
    if (this.isDisplayDevice) {
      this.scrollTimer = setInterval(() => {
        if (window.scrollY < document.body.scrollHeight) {

          window.scrollTo(0, window.scrollY + (this.getCategoryType == 1 ? 1 : 3));
          this.isScrolling = this.lastScrollPos != window.scrollY;
          this.lastScrollPos = window.scrollY;
        }
      }, 50)
      this.scrollTimer2 = setInterval(() => {
        if (this.categories && !this.isScrolling) {
          let acutal = this.categories.find(cat => cat.kategoria_id == this.selectedCategory)
          if (acutal) {
            let indexCategory = this.categories.indexOf(acutal);
            if (this.filteredGroups) {
              let group = this.filteredGroups?.find(gr => gr.grupa_id == this.actualShowingGroup)
              let groupIndex = this.filteredGroups?.indexOf(group)
              if (groupIndex >= 0 && (this.filteredGroups.length - 1) > groupIndex) {
                this.actualShowingGroup = this.filteredGroups[groupIndex + 1].grupa_id;
                return;
              } else if (this.filteredGroups.length > 0 && groupIndex != this.filteredGroups.length - 1) {
                this.actualShowingGroup = this.filteredGroups[0].grupa_id;
                return;
              }
            }
            this.selectCategory(indexCategory != this.categories.length - 1 ? this.categories[indexCategory + 1].kategoria_id : this.categories[0].kategoria_id)
            this.actualShowingGroup = null;
            window.scrollTo(0, 0)
            if (this.filteredGroups) {
              let group = this.filteredGroups?.find(gr => gr.grupa_id == this.actualShowingGroup)
              let groupIndex = this.filteredGroups?.indexOf(group)
              if (groupIndex >= 0 && (this.filteredGroups.length - 1) > groupIndex) {
                this.actualShowingGroup = this.filteredGroups[groupIndex + 1].grupa_id;
                return;
              } else if (this.filteredGroups.length > 0 && groupIndex != this.filteredGroups.length - 1) {

                this.actualShowingGroup = this.filteredGroups[0].grupa_id;
                return;
              }
            }
          } else {
            this.selectCategory(this.categories[0].kategoria_id);
            this.actualShowingGroup = null;
            window.scrollTo(0, 0)
            if (this.filteredGroups) {
              let group = this.filteredGroups?.find(gr => gr.grupa_id == this.actualShowingGroup)
              let groupIndex = this.filteredGroups?.indexOf(group)
              if (groupIndex >= 0 && (this.filteredGroups.length - 1) > groupIndex) {
                this.actualShowingGroup = this.filteredGroups[groupIndex + 1].grupa_id;
                return;
              } else if (this.filteredGroups.length > 0 && groupIndex != this.filteredGroups.length - 1) {
                this.actualShowingGroup = this.filteredGroups[0].grupa_id;
                return;
              }
            }
          }
        }
      }, 5000)
    }
  }

  selectCategory(kategoria_id: number) {
    this.selectedCategory = Number(kategoria_id);
    this.selectedGroup = null;
    this.threeBestRobots = null;
    this.showGroups = this.getFightGroupsFromCategory;
    if (this.getCategoryType == 2) {
      this.threeBestRobotsInPoints().then(val => {
        this.threeBestRobots = val;
      })
    } else if (this.getCategoryType == 0) {
      this.threeBestRobotsInTimes().then(val => {
        this.threeBestRobots = val;
      })
    }
  }

  selectGroup(grupa_id: number) {
    this.selectedGroup = Number(grupa_id);
  }

  onChangeDisplayDetails() {
    this.isShowingDetails = !this.isShowingDetails;
    localStorage.setItem('isShowingDetails', this.isShowingDetails.toString());
  }


  async threeBestRobotsInTimes() {
    let results = this.getCategoryTimesResult;
    if (results == undefined || results == null) return null;
    results.sort((a, b) => a.czas_przejazdu - b.czas_przejazdu);
    let robotsAndPoints: any[] = []
    results.forEach(result => {
      let current = robotsAndPoints.find(r => r.robot_uuid == result.robot_uuid)
      if (current) {
        if (current.wynik > result.czas_przejazdu) {
          current.wynik = result.czas_przejazdu
        }
      } else {
        robotsAndPoints.push({ robot_uuid: result.robot_uuid, nazwa_robota: result.nazwa_robota, wynik: result.czas_przejazdu })
      }
    })
    robotsAndPoints = robotsAndPoints.sort((a, b) => a.wynik - b.wynik)
    return robotsAndPoints
  }
  async threeBestRobotsInPoints() {
    let results = this.getCategoryTimesResult;
    // console.log(results);
    if (results == undefined || results == null) return null;
    results.sort((a, b) => b.czas_przejazdu - a.czas_przejazdu);
    let robotsAndPoints: any[] = []
    results.forEach(result => {
      let current = robotsAndPoints.find(r => r.robot_uuid == result.robot_uuid)
      if (current) {
        current.wynik += result.czas_przejazdu;
      } else {
        robotsAndPoints.push({ robot_uuid: result.robot_uuid, nazwa_robota: result.nazwa_robota, wynik: result.czas_przejazdu })
      }
    })
    if (this.selectedCategory == 11) { // Cebula house
      robotsAndPoints.forEach(robot => {
        var count = results?.filter(res => robot.robot_uuid == res.robot_uuid).length;
        robot.wynik /= count != undefined ? count : 1;
        robot.wynik = Math.floor(robot.wynik * 10) / 10;
      });
    }
    robotsAndPoints = robotsAndPoints.sort((a, b) => b.wynik - a.wynik);
    return robotsAndPoints
  }


  get getFightGroupsFromCategory() {
    const groups = [...(this.getCategoryFigths ? this.getCategoryFigths : [])].map(el => {
      return el.grupa_id
    }).filter(onlyUnique).map(el => {
      const temp = this.allFights?.find(fight => fight.grupa_id === el);
      return { grupa_id: el, nazwa_grupy: temp.nazwa_grupy }
    });
    return groups;
  }

  get positionsOptions(): string | undefined {
    return this.positions ? JSON.stringify(Object.assign(this.positions).map((position: Position) => {
      return { value: position.nazwa, id: position.stanowisko_id }
    })) : undefined;
  }

  get categoriesInPosition() {
    const filter = Number(this.formOption.get('filter')?.value);
    const filter_name = this.formFilter.get('filter_name')?.value;
    if (filter && filter === 1 && filter_name !== '') {
      const categories = this.positions?.find(el => Number(el.stanowisko_id) === Number(filter_name))?.kategorie;
      if (categories) {
        const a = [...[...categories.split(", ")].sort().map((cat) => {
          const obj = this.categories!.find(obj => obj.kategoria_id.toString() === cat);
          return { kategoria_id: obj?.kategoria_id, nazwa: obj?.nazwa };
        })];
        return a;
      } else {
        return undefined;
      }
    } else if (this.categories) {
      const categories = [...this.categories].map((cat) => {
        return { kategoria_id: cat.kategoria_id, nazwa: cat.nazwa };
      })
      return categories
    }
    return undefined;
  }

  get resultsFiltered() {
    const rodzaj = this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj;
    let wyniki = rodzaj === 1 ? (this.getGroupFigths ? [...this.getGroupFigths] : undefined) : (this.getCategoryTimesResult ? [...this.getCategoryTimesResult] : undefined);
    if (this.filter !== '' && wyniki) {

      switch (this.selectedFilter) {
        case 2:
          wyniki = wyniki.filter(wynik => rodzaj !== 1 ? String(wynik.robot_uuid).toLowerCase().includes(this.filter) : String(wynik.robot1_uuid).toLowerCase().includes(this.filter) || String(wynik.robot2_uuid).toLowerCase().includes(this.filter));
          break;
        case 3:
          wyniki = wyniki.filter(wynik => rodzaj !== 1 ? String(wynik.nazwa_robota).toLowerCase().includes(this.filter) : String(wynik.robot1_nazwa).toLowerCase().includes(this.filter) || String(wynik.robot2_nazwa).toLowerCase().includes(this.filter));
          break;
        default:
          break;
      }
    }
    return wyniki;
  }

  get filteredGroups() {
    return this.groups?.filter(gr => gr.kategoria_id == this.selectedCategory)
  }

  get getCategoryType() {
    return this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj
  }

  get getCategoryFigths() {
    return this.allFights?.filter(el => el.kategoria_id === this.selectedCategory).sort((a, b) => b.walka_id - a.walka_id).sort((a, b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getGroupFigths() {
    return this.allFights?.filter(el => el.kategoria_id === this.selectedCategory && el.grupa_id === this.selectedGroup).sort((a, b) => b.walka_id - a.walka_id).sort((a, b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getCategoryTimesResult() {
    return this.allTimes?.filter(el => el.kategoria_id === this.selectedCategory).sort((a, b) => b.wynik_id - a.wynik_id);
  }

  formatDate(date: string) {
    const now = new Date(date);
    return now.toISOString();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.scrollTimer)
    clearInterval(this.scrollTimer2)
  }

}
