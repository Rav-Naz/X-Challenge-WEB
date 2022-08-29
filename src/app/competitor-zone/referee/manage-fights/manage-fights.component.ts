import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { CategoryMain } from 'src/app/models/category-main';
import { CategoriesService } from 'src/app/services/categories.service';
import { FightsService } from 'src/app/services/fights.service';
import { PositionsService } from 'src/app/services/positions.service';
import { RefereeService } from 'src/app/services/referee.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from '../../../services/groups.service';
import { RobotsService } from '../../../services/robots.service';


@Component({
  selector: 'app-manage-fights',
  templateUrl: './manage-fights.component.html',
  styleUrls: ['./manage-fights.component.scss']
})
export class ManageFightsComponent {

  formCategories: FormGroup;
  formNewGroup: FormGroup;

  public categories: Array<CategoryMain> | null = null;
  public groups: Array<any> | null = null;
  public positions: Array<any> | null = null;
  public selectedPositions: Array<number> = [];
  public robots: Array<any> | null = null;
  public selectedGroup: number | null = null;
  public isLoadingNewGroup = false;
  public resp: string | null = null;
  private subs: Subscription = new Subscription;


  constructor(private refereeService: RefereeService, private positionsService: PositionsService, private formBuilder: FormBuilder,
    private categoriesService: CategoriesService, private translateService: TranslateService, private groupsService: GroupsService, private robotsService: RobotsService,
     private ui: UiService, private figthsService: FightsService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
    this.formCategories = this.formBuilder.group({
      category: [1, [Validators.required]]
    });
    this.formNewGroup = this.formBuilder.group({
      option: [null, [Validators.required]],
      count: [null, [Validators.required]],
      position: [null, [Validators.required]],
    });
    this.positionsService.getAllPositions();
    this.robotsService.getAllRobots();
    const sub1 = combineLatest(this.categoriesService.categories$,this.groupsService.groups$, this.positionsService.allPositions$,this.robotsService.allRobots$).subscribe((val) => {
      if (val[0] !== null && val[1] !== null && val[2] !== null) {
        this.categories = JSON.parse(JSON.stringify(val[0]));
        this.groups = JSON.parse(JSON.stringify(val[1]));
        this.positions = JSON.parse(JSON.stringify(val[2]));
        this.robots = JSON.parse(JSON.stringify(val[3]));
        this.formCategories.get('category')?.valueChanges.subscribe(data => {
          this.selectedGroup = null
        })
      }
    })

    this.subs.add(sub1);

  }
  addPosition() {
    if(this.isPositionFormValid) this.selectedPositions?.push(Number(this.formNewGroup.get('position')?.value))
  }

  removePosition(positionId: number) {
    let index = this.selectedPositions?.indexOf(positionId)!
    this.selectedPositions?.splice(index,1)
  }
  createGroup() {
    if(this.isNewGroupFormValid && this.isLessThanFinalValue) {
      this.isLoadingNewGroup = true;
      const iloscDoFinalu = Number(this.formNewGroup.get('count')?.value);
      const opcja = Number(this.formNewGroup.get('option')?.value) == 0 ? null : Number(this.formNewGroup.get('option')?.value)-1;
      this.refereeService.createGroupForCategory(this.selectedPositions, this.selectedCategory,iloscDoFinalu,opcja).then(resp => {
        this.resp=resp.body;
        this.ui.showFeedback("loading", resp.body, 5)
      }, err => {console.log(err),this.resp=err.error.body}).finally(() => {this.isLoadingNewGroup = false;})
    }
  }
  selectGroup(grupa_id: number) {
    if(grupa_id == -1 ){
      this.formNewGroup.reset();
      this.selectedPositions = [];
      this.resp = null;
    }
    this.selectedGroup = Number(grupa_id);
  }

  get getCategories() {
    let categoriesOptions = this.categories ? Object.assign(this.categories.filter(cat => cat.rodzaj == 1)): undefined;
    return categoriesOptions ? JSON.stringify(categoriesOptions.map((categoriesOption: any) => {
      return {value: (categoriesOption.nazwa), id: categoriesOption.kategoria_id}
    })) : undefined;
  }

  get getPositionsForCategory() {
    let positionsOptions = this.positions ? Object.assign(this.positions): undefined;
    if (positionsOptions) {
      positionsOptions = positionsOptions.filter((pos: { kategorie: string; }) => pos.kategorie.split(', ').includes(this.selectedCategory.toString()))
      return JSON.stringify(
        positionsOptions.map((positionOptions: any) => { return {value: (positionOptions.nazwa_stanowiska), id: positionOptions.stanowisko_id} }
      ))
    }
    return undefined
  }

  get getRobotsInCategory() {
    return this.robots ? this.robots!.filter(robot => robot.czy_dotarl == 1 && robot.powod_odrzucenia == null && robot.kategorie.split(', ').includes(this.selectedCategory.toString())) : []
  }

  get getOptions() {
    return JSON.stringify([{value: "Eliminacje + finał", id: 0},{value: "Tylko eliminacje", id: 1},{value: "Tylko finał", id: 2}])
  }


  get getNumberToFinal() {
    let lista = []
    for (let i = 0; i < 5; i++) {
      let s = Math.pow(2,i)
      if(s > this.getRobotsInCategory.length) break;
      lista.push({value: s.toString(), id: s})
    }
    if(lista.length == 1) {
      lista.push({value: "1", id: 1})
    }
    return JSON.stringify(lista)
  }

  get selectedCategory() {
    return Number(this.formCategories.get('category')?.value);
  }


  get getSelectedPositions() {
    return this.selectedPositions ? this.selectedPositions.map(el => {return this.positions?.find(pos => el == pos.stanowisko_id).nazwa_stanowiska}) : []
  }

  get filteredGroups(){
    return this.groups?.filter(gr => gr.kategoria_id == this.selectedCategory)
  }

  get isPositionFormValid() {
    return this.formNewGroup.get('position')?.value != null
  }

  get isNewGroupFormValid() {
    return this.formNewGroup.valid && this.isProperPositionCount;
  }

  get isLessThanFinalValue() {
    let count =  Number(this.formNewGroup.get('count')?.value);
    return (this.selectedPositions ? this.selectedPositions.length : 1) <= count && (count == 1 || count%2==0);
  }
  get isLessThanFinalValueButton() {
    return (this.selectedPositions ? this.selectedPositions.length : 1) < Number(this.formNewGroup.get('count')?.value)
  }

  get isProperPositionCount() {
    let l = this.selectedPositions?.length;
    return (l == 1 || l == 2 || l == 4 || l == 8 || l == 16);
  }

}
