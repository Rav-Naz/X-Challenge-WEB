import { UserService } from './../../../services/user.service';
import { FightsService } from './../../../services/fights.service';
import { UiService } from './../../../services/ui.service';
import { TimesService } from './../../../services/times.service';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService } from './../../../services/categories.service';
import { Position } from './../../../models/position';
import { PositionsService } from './../../../services/positions.service';
import { RefereeService } from './../../../services/referee.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { CategoryMain } from 'src/app/models/category-main';
import { ActivatedRoute, Router } from '@angular/router';
import { onlyUnique } from 'src/app/shared/utils/unique';

@Component({
  selector: 'app-referee-zone',
  templateUrl: './referee-zone.component.html',
  styleUrls: ['./referee-zone.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class RefereeZoneComponent implements OnInit, OnDestroy {

  form: FormGroup;
  public positions: Array<Position> | null = null;
  public categories: Array<CategoryMain> | null = null;

  private loading: boolean = false;
  private subs: Subscription = new Subscription;
  public selectedPosition: number | null = null;
  public selectedCategory: number | null = null;
  public selectedGroup: number | null = null;
  public positionFights: Array<any> | null = null;
  public positionTimesResults: Array<any> | null = null;
  public editingTimes: number | null = null;
  public editingTimesForm: FormGroup;
  public showCategories:Array<any> | null = null
  public showGroups:Array<any> | null = null
  public isLoading: boolean = false;

  constructor(private refereeService: RefereeService, private positionsService: PositionsService, private formBuilder: FormBuilder,
     private categoriesService: CategoriesService, private translateService: TranslateService, private timesService: TimesService,
      private ui: UiService, private figthsService: FightsService, private route: ActivatedRoute, private router: Router, public userService: UserService) {

    this.form = this.formBuilder.group({
      position: [null, [Validators.required]]
    });

    this.editingTimesForm = this.formBuilder.group({
      time: [null, [Validators.required, Validators.maxLength(7)]]
    });
    const sub1 = combineLatest(this.categoriesService.categories$,this.positionsService.positions$).subscribe((val) => {
      if (val[0] !== null && val[1]) {
        this.categories = JSON.parse(JSON.stringify(val[0]));
        this.positions = JSON.parse(JSON.stringify(val[1]));
      }
    })
    const sub2 = this.form.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.loading = true;
        this.selectedCategory = null;
        this.selectedGroup = null;
        this.selectedPosition = Number(data.position);
        this.showCategories = this.categoriesInPosition!;
        await this.figthsService.getAllFightsForPosiotion(this.selectedPosition).catch(err => {});
        await this.timesService.getAllTimesForPosiotion(this.selectedPosition).catch(err => {});
        this.loading = false;
      }
    });
    const sub3 = this.timesService.timesForPosition$.subscribe((data) => {
      if(data !== null && data !== undefined) {
        this.positionTimesResults = data;
      }
    });
    const sub4 = this.figthsService.figthsForPosition$.subscribe((data) => {
      if(data !== null && data !== undefined) {
        this.positionFights = data;
      }
    });

    this.subs.add(sub1).add(sub2).add(sub3).add(sub4);
  }

  ngOnInit(): void {
    const stanowisko_id = Number(this.route.snapshot.paramMap.get('stanowisko_id'));
    const kategoria_id = Number(this.route.snapshot.paramMap.get('kategoria_id'));
    const grupa_id = Number(this.route.snapshot.paramMap.get('grupa_id'));

    if(stanowisko_id) {
      this.form.get('position')?.setValue(stanowisko_id);
      if(kategoria_id) {
        this.selectedCategory = kategoria_id;
        if(grupa_id) {
          this.selectedGroup = grupa_id;
        }
      }
    }
  }

  addTimeResult() {
    window.open(`/competitor-zone/(outlet:add-time-result/${this.selectedPosition}/${this.selectedCategory}`)
  }

  selectCategory(kategoria_id: number) {
    this.selectedCategory = Number(kategoria_id);
    this.selectedGroup = null;
    this.showGroups = this.getFightGroupsFromCategory;
  }

  selectGroup(grupa_id: number) {
    this.selectedGroup = Number(grupa_id);
  }

  editTime(wynik_id: number) {
    const wynik = this.positionTimesResults?.find(el => el.wynik_id === wynik_id);
    this.editingTimesForm = this.formBuilder.group({
      time: [wynik.czas_przejazdu, [Validators.required, Validators.maxLength(7)]]
    });
    this.editingTimes = wynik_id;
  }

  async saveEditedTime() {
    if(this.isFormEditTimeValid) {
      const decision = await this.ui.wantToContinue(`Czy na pewno chcesz zaktualizować czas przejazdu ${this.editingTimes}?`)
      if (!decision) return;
      this.isLoading = true;
      const newTime = Number(this.editingTimesForm.get('time')?.value);
      this.timesService.updateTimeResult(this.editingTimes!, newTime).then(() => {
        this.ui.showFeedback("succes", `Pomyślnie zaktualizowano wynik ${this.editingTimes} na ${newTime}`,2);
        this.isLoading = false;
        this.editingTimes = null;
      })
    }
  }

  async deleteTime() {
    const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć czas przejazdu ${this.editingTimes}?`)
    if (!decision || !this.editingTimes) return;
    this.isLoading = true;
    this.timesService.deleteTimeResult(this.editingTimes).then(() => {
      this.isLoading = false;
      this.editingTimes = null;
    })
  }

  get getFightGroupsFromCategory() {
    const groups = [...(this.getCategoryFigths ? this.getCategoryFigths : [])].map(el => {
      return el.grupa_id
    }).filter(onlyUnique).map(el => {
      const temp = this.positionFights?.find(fight => fight.grupa_id === el);
      return {grupa_id: el, nazwa_grupy: temp.nazwa_grupy}
    });
    return groups;
  }

  get positionsOptions(): string | undefined {
    return this.positions ? JSON.stringify(Object.assign(this.positions.length > 1 ? this.positions : this.positions.concat([{kategorie: '0', nazwa: '...', stanowisko_id: 8}])).map((position: Position) => {
      return {value: position.nazwa, id: position.stanowisko_id}
    })) : undefined;
  }

  get categoriesInPosition() {
    const categories = this.positions?.find(el => el.stanowisko_id === this.selectedPosition)?.kategorie;
    if(categories) {
      const a = [...[...categories.split(", ")].sort().map((cat) => {
        const obj = this.categories!.find(obj => obj.kategoria_id.toString() === cat);
        return {kategoria_id: obj?.kategoria_id, nazwa: obj?.nazwa};
      })];
      return a
    } else {
      return undefined;
    }
  }

  get getCategoryType() {
    return this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj
  }

  get getCategoryFigths() {
    return this.positionFights?.filter(el => el.kategoria_id === this.selectedCategory).sort((a,b) => b.walka_id - a.walka_id).sort((a,b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getGroupFigths() {
    return this.positionFights?.filter(el => el.kategoria_id === this.selectedCategory && el.grupa_id === this.selectedGroup).sort((a,b) => b.walka_id - a.walka_id).sort((a,b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getCategoryTimesResult() {
    return this.positionTimesResults?.filter(el => el.kategoria_id === this.selectedCategory).sort((a,b) => b.wynik_id - a.wynik_id);
  }

  public get isFormEditTimeValid() {
    return this.editingTimesForm.valid && !this.isLoading;
  }

  formatDate(date: string) {
    const now = new Date(date);
    return now.toISOString();
  }

  dummy(event: Event) {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
