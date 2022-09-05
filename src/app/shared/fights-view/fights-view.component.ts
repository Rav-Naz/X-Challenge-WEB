import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { CategoryMain } from 'src/app/models/category-main';
import { Fight } from 'src/app/models/fight.model';
import { CategoriesService } from 'src/app/services/categories.service';
import { FightsService } from 'src/app/services/fights.service';
import { PositionsService } from 'src/app/services/positions.service';
import { RefereeService } from 'src/app/services/referee.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from '../../services/groups.service';
import { RobotsService } from '../../services/robots.service';
import { TreeFight } from '../../models/tree-fight.model';

@Component({
  selector: 'app-fights-view',
  templateUrl: './fights-view.component.html',
  styleUrls: ['./fights-view.component.scss']
})
export class FightsViewComponent implements OnChanges {

  @Input() selectedCategory!: number | null;
  @Input() selectedGroupFromParent!: number | null;
  @Input() canModify!: boolean;

  formNewGroup: FormGroup;
  formNewFight: FormGroup;
  formEditFight: FormGroup;

  public categories: Array<CategoryMain> | null = null;
  public groups: Array<any> | null = null;
  public positions: Array<any> | null = null;
  public fights: Array<Fight> | null = null;
  public robots: Array<any> | null = null;
  public selectedGroup: number | null = null;
  public selectedPositions: Array<number> = [];
  public filteredFightsInGroup: TreeFight | null = null;
  public bestRobots: Array<any> | null = null;
  public isLoadingNewGroup = false;
  public isLoadingDeletingGroup = false;
  public resp: string | null = null;
  private subs: Subscription = new Subscription;


  constructor(private refereeService: RefereeService, private positionsService: PositionsService, private formBuilder: FormBuilder,
    private categoriesService: CategoriesService, private translateService: TranslateService, private groupsService: GroupsService, private robotsService: RobotsService,
     private ui: UiService, private figthsService: FightsService, private route: ActivatedRoute, private router: Router, public userService: UserService) {
    this.formNewGroup = this.formBuilder.group({
      option: [null, [Validators.required]],
      count: [null, [Validators.required]],
      position: [null, [Validators.required]],
    });
    this.formEditFight = this.formBuilder.group({
      robot1: [null],
      robot2: [null]
    });
    this.formNewFight = this.formBuilder.group({
      position: [null, [Validators.required]],
      next_fight: [null]
    });
    this.positionsService.getAllPositions();
    this.robotsService.getAllRobots();
    this.figthsService.getAllFights();
    const sub1 = combineLatest(this.categoriesService.categories$,this.groupsService.groups$, this.positionsService.allPositions$,this.robotsService.allRobots$, this.figthsService.allFights$).subscribe((val) => {
      if (val[0] !== null && val[1] !== null && val[2] !== null) {
        this.categories = JSON.parse(JSON.stringify(val[0]));
        this.groups = JSON.parse(JSON.stringify(val[1]));
        this.positions = JSON.parse(JSON.stringify(val[2]));
        this.robots = JSON.parse(JSON.stringify(val[3]));
        this.fights = JSON.parse(JSON.stringify(val[4]));
        if(this.selectedGroup != null && this.selectedGroup != -1) {
          this.treeFightsInGroup().then(val => {
            this.filteredFightsInGroup = val;
          })
        }
      }
    })
    this.subs.add(sub1);

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedCategory) {
      this.selectedGroup = null;
      this.filteredFightsInGroup = null;
      this.bestRobots = null;
    }
    if (changes.selectedGroupFromParent) {
      this.selectGroup(changes.selectedGroupFromParent.currentValue)
    }
  }
  addPosition() {
    if(this.isPositionFormValid) this.selectedPositions?.push(Number(this.formNewGroup.get('position')?.value))
  }

  removePosition(positionId: number) {
    let index = this.selectedPositions?.indexOf(positionId)!
    this.selectedPositions?.splice(index,1)
  }
  createGroup() {
    if(this.isNewGroupFormValid && this.isLessThanFinalValue && this.getSelectedCategory) {
      this.isLoadingNewGroup = true;
      const iloscDoFinalu = Number(this.formNewGroup.get('count')?.value);
      const opcja = Number(this.formNewGroup.get('option')?.value) == 0 ? null : Number(this.formNewGroup.get('option')?.value)-1;
      this.refereeService.createGroupForCategory(this.selectedPositions, this.getSelectedCategory,iloscDoFinalu,opcja).then(resp => {
        this.resp=resp.body;
        this.ui.showFeedback("loading", resp.body, 5)
      }, err => {console.log(err),this.resp=err.error.body}).finally(() => {this.isLoadingNewGroup = false;})
    }
  }

  async deleteGroup() {
    const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć grupę ${this.getSelectedGroupName}`)
    if(decision && this.selectedGroup) {
      this.isLoadingDeletingGroup = true;
      this.refereeService.deleteGroup(this.selectedGroup).then(resp => {
        this.ui.showFeedback("loading", "Usunięto", 2)
      }, err => {console.log(err)}).finally(() => {this.isLoadingDeletingGroup = false;       this.selectedGroup = null;      })
    }
  }

  selectGroup(grupa_id: number) {
    this.filteredFightsInGroup = null;
    this.bestRobots = null;
    if(grupa_id == -1 ){
      this.formNewGroup.reset();
      this.selectedPositions = [];
      this.resp = null;
    }
    this.selectedGroup = Number(grupa_id);
    this.formEditFight.reset();

    if (this.getSelectedGroupType == 1) {
      this.treeFightsInGroup().then(val => {
        this.filteredFightsInGroup = val;
      })
    } else {

      this.getBestRobotsInGroup().then(val => {
        this.bestRobots = val;
      })
    }
  }

  editFight(walka_id: number) {
    let robot1 = this.formEditFight.get('robot1')?.value;
    let robot2 = this.formEditFight.get('robot2')?.value;

    if (robot1) {
      this.figthsService.editFight(robot1, walka_id, 0).then(resp => {
        this.ui.showFeedback("loading", "Edytowano robota 1", 2)
      }, err => {console.log(err)}).finally(() => {this.formEditFight.reset();})
    }
    if (robot2) {
      this.figthsService.editFight(robot2, walka_id, 1).then(resp => {
        this.ui.showFeedback("loading", "Edytowano robota 2", 2)
      }, err => {console.log(err)}).finally(() => {this.formEditFight.reset();})
    }
  }
  async deleteFight(walka_id: number) {
    const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć walkę ${walka_id}`)
    if(decision) {
      this.figthsService.deleteFight(walka_id).then(resp => {
        this.ui.showFeedback("loading", "Usunięto walkę", 2)
      }, err => {console.log(err)}).finally(() => {})
    }

  }
  async addFight() {
    if (this.selectedGroup && this.formNewFight.get('position')?.value) {
      this.figthsService.addFight(Number(this.formNewFight.get('position')?.value), this.formNewFight.get('next_fight')?.value != 0 ? Number(this.formNewFight.get('next_fight')?.value) : null, this.selectedGroup).then(resp => {
        this.ui.showFeedback("loading", "Dodano walkę", 2)
      }, err => {console.log(err)}).finally(() => {})
    }
  }

  get getPositionsForCategory() {
    let positionsOptions = this.positions ? Object.assign(this.positions): undefined;
    if (positionsOptions && this.getSelectedCategory) {
      positionsOptions = positionsOptions.filter((pos: { kategorie: string; }) => pos.kategorie.split(', ').includes(this.getSelectedCategory!.toString()))
      return JSON.stringify(
        positionsOptions.map((positionOptions: any) => { return {value: (positionOptions.nazwa_stanowiska), id: positionOptions.stanowisko_id} }
      ))
    }
    return undefined
  }

  get getRobotsInCategory() {
    return this.robots && this.getSelectedCategory ? this.robots!.filter(robot => robot.czy_dotarl == 1 && robot.powod_odrzucenia == null && robot.kategorie.split(', ').includes(this.getSelectedCategory!.toString())) : []
  }

  get getOptions() {
    return JSON.stringify([{value: "Eliminacje + finał", id: 0},{value: "Tylko eliminacje", id: 1},{value: "Tylko finał", id: 2}])
  }

  get robotOptions(): string | undefined {
    let robots = this.getRobotsInCategory;
    return robots ? JSON.stringify(robots.map((robot: any) => {
      return {value: robot.nazwa_robota, id: robot.robot_uuid}
    })) : undefined;
  }

  get fightsOptions(): string | undefined {
    let fights = this.getFightsInGroup;
    let list =  fights ? fights.map((fight: any) => {
      return {value: fight.walka_id.toString(), id: fight.walka_id}
    }) : undefined;
    if (list) list.push({value: "null", id: 0})
    return JSON.stringify(list)
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

  get getSelectedCategory() {
    let cat = this.categories?.find(cat => cat.kategoria_id == this.selectedCategory)
    if (cat && cat.rodzaj == 1) return cat.kategoria_id;
    return null;
  }

  get getSelectedGroupType() {
    let group = this.groups?.find(g => g.grupa_id == this.selectedGroup)
    if (!group) return null;
    if (group.nazwa.toString().slice(0,1).toLowerCase() == "f") {
      return 1
    } else {
      return 0
    }
  }

  get getSelectedGroupName() {
    let group = this.groups?.find(g => g.grupa_id == this.selectedGroup)
    if (!group) return null;
    return group.nazwa.toString();
  }

  get getSelectedPositions() {
    return this.selectedPositions ? this.selectedPositions.map(el => {return this.positions?.find(pos => el == pos.stanowisko_id).nazwa_stanowiska}) : []
  }

  get filteredGroups(){
    return this.groups?.filter(gr => gr.kategoria_id == this.getSelectedCategory)
  }

  get isPositionFormValid() {
    return this.formNewGroup.get('position')?.value != null
  }

  get isNewGroupFormValid() {
    return this.formNewGroup.valid && this.isProperPositionCount;
  }
  get isNewFightFormValid() {
    return this.formNewFight.valid;
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

   async treeFightsInGroup() {
    let walki = this.getFightsInGroup.slice(1)
    let first = walki.find(wal => wal.nastepna_walka_id == null)!;
    let treeFights: TreeFight = {fight: first, children: null}
    await this.searchForFightChildren(treeFights, walki)
    return treeFights
  }

  get getFightsInGroup() {
    return this.fights ? [...this.fights!].filter(w => w.grupa_id == this.selectedGroup).sort((a,b) => a.walka_id - b.walka_id) : [];
  }

  async getBestRobotsInGroup() {
    let robots = this.getRobotsInCategory.map(r => { return {robot: r, punkty: 0}});
    this.getFightsInGroup.forEach(fight => {
      if(fight.wygrane_rundy_robot1 != null && fight.wygrane_rundy_robot2 != null && fight.wygrane_rundy_robot1 > fight.wygrane_rundy_robot2) {
        let robot = robots.find(r => r.robot.robot_id == fight.robot1_id);
        if (robot) robot.punkty += 1;
      }
      if(fight.wygrane_rundy_robot1 != null && fight.wygrane_rundy_robot2 != null && fight.wygrane_rundy_robot1 < fight.wygrane_rundy_robot2) {
        let robot = robots.find(r => r.robot.robot_id == fight.robot2_id);
        if (robot) robot.punkty += 1;
      }
    })
    return robots;
  }

  async searchForFightChildren(fight: TreeFight, fights: Array<Fight>) {
    let filtered = fights.filter(f => f.nastepna_walka_id == fight.fight.walka_id)
    if (filtered) {
      for (const element of filtered) {
        let newTreeFight: TreeFight = {fight: element, children: null}
        if (fight.children == null) {
          fight.children = [newTreeFight]
        } else {
          fight.children.push(newTreeFight)
        }
        await this.searchForFightChildren(newTreeFight, fights)
      }
    }
  }

}
