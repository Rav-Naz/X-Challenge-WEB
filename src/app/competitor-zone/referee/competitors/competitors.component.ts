import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UiService } from 'src/app/services/ui.service';
import { RefereeService } from 'src/app/services/referee.service';
import { CategoryMain } from 'src/app/models/category-main';

@Component({
  selector: 'app-competitors',
  templateUrl: './competitors.component.html',
  styleUrls: ['./competitors.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class CompetitorsComponent implements OnInit {

  public formOption: FormGroup;
  public formFilter: FormGroup;
  public allCompetitors: Array<any> | null = null;
  public categories: Array<CategoryMain> | null = null;
  private subs: Subscription = new Subscription;
  public filterOptions: string = JSON.stringify([
    { value: "competitor-zone.competitors.filters.name", id: 1 },
    { value: "competitor-zone.competitors.filters.user-uuid", id: 2 },
    { value: "competitor-zone.competitors.filters.barcode", id: 3 },
    { value: "competitor-zone.competitors.filters.robots-name", id: 4 },
    { value: "competitor-zone.competitors.filters.phone", id: 5 },
    { value: "competitor-zone.competitors.filters.email", id: 6 },
    { value: "competitor-zone.competitors.filters.categories", id: 7 }
  ]);
  private selectedFilter: number | null = 1;
  private filter: string = '';

  constructor(private categoriesService: CategoriesService, private formBuilder: FormBuilder, private router: Router,
    public userService: UserService, private ui: UiService, private refereeService: RefereeService) {
    this.formOption = this.formBuilder.group({
      filter: [this.selectedFilter]
    });
    this.formFilter = this.formBuilder.group({
      filter_name: [this.filter]
    });
  }

  ngOnInit(): void {
    const sub1 = combineLatest(this.categoriesService.categories$, this.refereeService.allUsers$).subscribe((val) => {
      if (val[0] !== null && val[1]) {
        this.allCompetitors = JSON.parse(JSON.stringify(val[1]!));
        this.categories = JSON.parse(JSON.stringify(val[0]!));
        this.allCompetitors?.forEach((user) => {
          if (user.roboty_json) {
            user.roboty = JSON.parse(user.roboty_json);
            if (user.roboty) {
              let user_kategorie: Array<number> = []
              for (let element of user.roboty) {
                let cat = element.kategorie.split(', ').map((e: string) => Number(e))
                cat.forEach((el: number) => {
                  if (!user_kategorie.includes(el)) { user_kategorie.push(el) }
                })
              }
              let nazwy_kategorii: Array<string> = []
              user_kategorie.forEach((kategoria: number) => {
                let finded = this.categories?.find(cat => cat.kategoria_id == kategoria)?.nazwa
                if (finded) {
                  nazwy_kategorii.push(finded)
                }
              })
              user.kategorie = nazwy_kategorii
            }
          }
        })
      }
    })
    const sub2 = this.formOption.valueChanges.subscribe(async (data) => {
      if (data !== null && data !== undefined) {
        this.selectedFilter = Number(data.filter);
      }
    });
    const sub3 = this.formFilter.valueChanges.subscribe(async (data) => {
      if (data !== null && data !== undefined) {
        this.filter = data.filter_name.toLowerCase();
      }
    });
    this.subs.add(sub1).add(sub2).add(sub3);
  }

  get competitorsFiltered() {
    let userzy = this.allCompetitors ? [...this.allCompetitors] : undefined;
    if (this.filter !== '' && userzy) {
      switch (this.selectedFilter) {
        case 1:
          userzy = userzy.filter(user => String(user.imie + ' ' + user.nazwisko).toLowerCase().includes(this.filter));
          break;
        case 2:
          userzy = userzy.filter(user => String(user.uzytkownik_uuid).toLowerCase().includes(this.filter));
          break;
        case 3:
          userzy = userzy.filter(user => String(user.uzytkownik_kod).toLowerCase().includes(this.filter));
          break;
        case 4:
          userzy = userzy.filter(user => String(user.roboty_json).toLowerCase().includes(this.filter));
          break;
        case 5:
          userzy = userzy.filter(user => String(user.numer_telefonu).toLowerCase().includes(this.filter));
          break;
        case 6:
          userzy = userzy.filter(user => String(user.email).toLowerCase().includes(this.filter));
          break;
        case 7:
          userzy = userzy.filter(user => String(user.kategorie).toLowerCase().includes(this.filter));
          break;

        default:
          break;
      }
    }
    return userzy;
  }

  public editUser(uzytkownik_uuid: any) {
    this.router.navigateByUrl(`/competitor-zone/(outlet:competitor/${uzytkownik_uuid})`)
  }

  public dummy(event: Event) {
    event.stopPropagation();
  }

}
