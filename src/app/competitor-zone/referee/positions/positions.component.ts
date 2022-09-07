import { Component, OnInit } from '@angular/core';
import { PositionsService } from '../../../services/positions.service';
import { CategoriesService } from '../../../services/categories.service';
import { CategoryMain } from 'src/app/models/category-main';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UiService } from '../../../services/ui.service';
import { UserService } from '../../../services/user.service';
import { RefereeService } from '../../../services/referee.service';

@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent {

  public allPositions: Array<any> | null = null;
  public allCategories: Array<any> | null = null;
  public allReferees: Array<any> | null = null;
  public editingPosition: number | null = null;

  public formCategory: FormGroup;
  public formName: FormGroup;
  public formReferee: FormGroup;


  public loadingCategories: boolean = false;
  public loadingPosition: boolean = false;
  public loadingReferee: boolean = false;

  constructor(private positionsService: PositionsService, private categoriesService: CategoriesService, private refereeService: RefereeService, private formBuilder: FormBuilder, private ui: UiService) {
    positionsService.allPositions$.subscribe(val => {
      this.allPositions = val;
    })
    categoriesService.categories$.subscribe(val => {
      this.allCategories = val;
    })
    refereeService.allUsers$.subscribe(val => {
      if (val) {
        this.allReferees = val.filter(u => u.uzytkownik_typ >= 2);
      }
    })
    this.formCategory = this.formBuilder.group({
      category: [null, [Validators.required]]
    });
    this.formName = this.formBuilder.group({
      position: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(40)]]
    });
    this.formReferee = this.formBuilder.group({
      referee: [null, [Validators.required]]
    });
  }

  onAddCategory() {
    if(this.editingPosition && this.isFormCategoriesValid) {
      let kategoria_id = Number(this.formCategory.get("category")?.value);
      this.loadingCategories = true;
      this.positionsService.addCategoryToPosition(this.editingPosition,kategoria_id).then(succes => {
        this.ui.showFeedback("succes", "Dodano kategorie stanowiska")
      }, err => {console.log(err)}).finally(() => {this.loadingCategories = false; this.formCategory.reset()});
    }
  }

  async onRemoveCategory(kategoria_id: number) {
    if(this.editingPosition) {
      const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć kategorię ${this.getCategoryName(kategoria_id)}`)
      if(!decision) return;
      this.loadingCategories = true;
      this.positionsService.removeCategoryFromPosition(this.editingPosition,kategoria_id).then(succes => {
        this.ui.showFeedback("succes", "Usunięto kategorie stanowiska")
      }, err => {console.log(err)}).finally(() => {this.loadingCategories = false});
    }
  }

  onAddReferee() {
    if(this.editingPosition && this.isFormRefereeValid) {
      let uzytkownik_uuid = this.formReferee.get("referee")?.value;
      this.loadingReferee = true;
      this.positionsService.addRefereeToPosition(this.editingPosition,uzytkownik_uuid).then(succes => {
        this.ui.showFeedback("succes", "Dodano sędziego")
      }, err => {console.log(err)}).finally(() => {this.loadingReferee = false; this.formReferee.reset()});
    }
  }

  async onRemoveReferee(uzytkownik_uuid: string) {
    if(this.editingPosition) {
      const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć sędziego ${this.getUserName(uzytkownik_uuid)} z tego stanowiska?`)
      if(!decision) return;
      this.loadingReferee = true;
      this.positionsService.removeRefereeFromPosition(this.editingPosition,uzytkownik_uuid).then(succes => {
        this.ui.showFeedback("succes", "Usunięto sędziego")
      }, err => {console.log(err)}).finally(() => {this.loadingReferee = false});
    }
  }

  onAddPosition() {
    if(this.isFormNameValid) {

      this.loadingPosition = true;
      this.positionsService.addPosition(this.formName.get("position")?.value).then(succes => {
        this.ui.showFeedback("succes", "Dodano nowe stanowisko")
      }, err => {console.log(err)}).finally(() => {this.loadingPosition = false});
    }

  }

  onUpdateName() {
    if(this.isFormNameValid && this.editingPosition) {
      this.loadingPosition = true;
      this.positionsService.editPosition(this.editingPosition,this.formName.get("position")?.value).then(succes => {
        this.ui.showFeedback("succes", "Zaktualizowano stanowisko")
      }, err => {console.log(err)}).finally(() => {this.loadingPosition = false});
    }
  }
  async onDeletePosition() {
    const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć stanowisko ${this.allPositions?.find(pos => pos.stanowisko_id == this.editingPosition).nazwa_stanowiska}`)
    if(decision && this.editingPosition) {
      this.loadingPosition = true;
      this.positionsService.removePosition(this.editingPosition).then(succes => {
        this.ui.showFeedback("succes", "Usunięto stanowisko")
      }, err => {console.log(err)}).finally(() => {this.loadingPosition = false});
    }
  }

  stringToArray(string: string): Array<any> {
    return string ? string.split(', ') : []
  }

  editPosition(stanowisko_id: number | null) {
    this.editingPosition = stanowisko_id;
    this.formCategory.reset();
    this.formName.reset()
    this.formReferee.reset()
    if (stanowisko_id) {
      let name = this.allPositions?.find(pos => pos.stanowisko_id == stanowisko_id).nazwa_stanowiska;
      this.formName.get("position")?.setValue(name);
    }
  }


  public get categoriesOptions(): string | undefined {
    if (this.allCategories && this.allPositions) {
      let postionCategories = this.stringToArray(this.allPositions?.find(pos => pos.stanowisko_id == this.editingPosition).kategorie).map(val => Number(val))
      let filtered = this.allCategories.filter(cat => postionCategories.findIndex(el => el == cat.kategoria_id) < 0)
      return JSON.stringify(filtered.map((category: CategoryMain) => {
        return { value: category.nazwa, id: category.kategoria_id };
      }));
    }
    else {
      return undefined;
    }
  }

  public get refereeOptions(): string | undefined {
    if (this.allReferees) {
      let postionReferees = this.stringToArray(this.allPositions?.find(pos => pos.stanowisko_id == this.editingPosition).sedziowie)
      let filtered = this.allReferees.filter(cat => postionReferees.findIndex(el => el == cat.uzytkownik_uuid) < 0)
      return JSON.stringify(filtered.map((user) => {
        return { value: `${user.imie} ${user.nazwisko}`, id: user.uzytkownik_uuid };
      }));
    }
    else {
      return undefined;
    }
  }

  public getCategoryName(kategoria_id: string | number) {
    let id = typeof kategoria_id === "number" ? kategoria_id : Number(kategoria_id);
    let category = this.allCategories?.find(cat => cat.kategoria_id === id);
    return category ? category.nazwa : "???";
  }

  public getUserName(uzytkownik_uuid: string ) {
    let user = this.allReferees?.find(u => u.uzytkownik_uuid == uzytkownik_uuid);
    return user ? `${user.imie} ${user.nazwisko}` : "???";
  }

  get isFormCategoriesValid () {
    return this.formCategory.valid;
  }
  get isFormNameValid () {
    return this.formName.valid;
  }
  get isFormRefereeValid () {
    return this.formReferee.valid;
  }

  get isLoadingCategories () {
    return this.loadingCategories;
  }
  get isLoadingName () {
    return this.loadingPosition;
  }
  get isLoadingReferee () {
    return this.loadingReferee;
  }

}
