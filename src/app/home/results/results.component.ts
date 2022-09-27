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
  private subs: Subscription = new Subscription;
  public selectedCategory: number | null = null;
  public selectedGroup: number | null = null;
  public isLoading: boolean = false;
  private selectedFilter: number | null = 1;
  public showCategories:Array<any> | null = null
  public showGroups:Array<any> | null = null
  private filter: string = '';

  constructor(private positionsService: PositionsService, private formBuilder: FormBuilder,
     private categoriesService: CategoriesService, public translateService: TranslateService, private timesService: TimesService,
     private figthsService: FightsService, public userService: UserService, public authService: AuthService) {

    this.formOption = this.formBuilder.group({
      filter: [this.selectedFilter]
    });
    this.formFilter = this.formBuilder.group({
      filter_name: [this.filter]
    });

    positionsService.getAllPositions();
    timesService.getAllTimes();
    figthsService.getAllFights();
    const sub1 = combineLatest(this.categoriesService.categories$,this.positionsService.allPositions$, this.figthsService.allFights$,this.timesService.allTimes$).subscribe((val) => {
      if (val[0] && val[1] && val[2] && val[3]) {
        this.categories = JSON.parse(JSON.stringify(val[0]));
        this.positions = JSON.parse(JSON.stringify(val[1]));
        this.allFights = JSON.parse(JSON.stringify(val[2]));
        this.allTimes = JSON.parse(JSON.stringify(val[3]));
        this.loading = false;
        this.showCategories = this.categoriesInPosition!;

      }
    })

    const sub2 = this.formOption.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.selectedFilter = Number(data.filter);
        if(this.selectedFilter === 1) {
          this.selectedCategory = null;
          this.selectedGroup = null;
        }
      }
    });
    const sub3 = this.formFilter.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.filter = data.filter_name.toLowerCase();
        this.showCategories = this.categoriesInPosition!;
      }
    });

    this.subs.add(sub1).add(sub2).add(sub3);
  }

  ngOnInit(): void {

  }

  selectCategory(kategoria_id: number) {
    this.selectedCategory = Number(kategoria_id);
    this.selectedGroup = null;
    this.showGroups = this.getFightGroupsFromCategory;
  }

  selectGroup(grupa_id: number) {
    this.selectedGroup = Number(grupa_id);
  }


  get getFightGroupsFromCategory() {
    const groups = [...(this.getCategoryFigths ? this.getCategoryFigths : [])].map(el => {
      return el.grupa_id
    }).filter(onlyUnique).map(el => {
      const temp = this.allFights?.find(fight => fight.grupa_id === el);
      return {grupa_id: el, nazwa_grupy: temp.nazwa_grupy}
    });
    return groups;
  }

  get positionsOptions(): string | undefined {
    return this.positions ? JSON.stringify(Object.assign(this.positions).map((position: Position) => {
      return {value: position.nazwa, id: position.stanowisko_id}
    })) : undefined;
  }

  get categoriesInPosition() {
    const filter = Number(this.formOption.get('filter')?.value);
    const filter_name = this.formFilter.get('filter_name')?.value;
    if(filter && filter === 1 && filter_name !== '') {
      const categories = this.positions?.find(el => Number(el.stanowisko_id) === Number(filter_name))?.kategorie;
      if(categories) {
        const a = [...[...categories.split(", ")].sort().map((cat) => {
          const obj = this.categories!.find(obj => obj.kategoria_id.toString() === cat);
          return {kategoria_id: obj?.kategoria_id, nazwa: obj?.nazwa};
        })];
        return a;
      } else {
        return undefined;
      }
    } else if (this.categories) {
      const categories = [...this.categories].map((cat) => {
        return {kategoria_id: cat.kategoria_id, nazwa: cat.nazwa};
      })
      return categories
    }
    return undefined;
  }

  get resultsFiltered() {
    const rodzaj = this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj;
    let wyniki = rodzaj === 1? (this.getGroupFigths ? [...this.getGroupFigths] : undefined) : (this.getCategoryTimesResult ? [...this.getCategoryTimesResult] : undefined) ;
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

  get getCategoryType() {
    return this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj
  }

  get getCategoryFigths() {
    return this.allFights?.filter(el => el.kategoria_id === this.selectedCategory).sort((a,b) => b.walka_id - a.walka_id).sort((a,b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getGroupFigths() {
    return this.allFights?.filter(el => el.kategoria_id === this.selectedCategory && el.grupa_id === this.selectedGroup).sort((a,b) => b.walka_id - a.walka_id).sort((a,b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getCategoryTimesResult() {
    return this.allTimes?.filter(el => el.kategoria_id === this.selectedCategory).sort((a,b) => b.wynik_id - a.wynik_id);
  }

  formatDate(date: string) {
    const now = new Date(date);
    return now.toISOString();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
