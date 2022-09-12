import { TimesService } from 'src/app/services/times.service';
import { FightsService } from 'src/app/services/fights.service';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from './../../../../services/ui.service';
import { UserService } from './../../../../services/user.service';
import { Constructor } from './../../../../models/constructor';
import { CategoriesService } from './../../../../services/categories.service';
import { RobotsService } from './../../../../services/robots.service';
import { AuthService } from './../../../../services/auth.service';
import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Robot } from 'src/app/models/robot';
import { CategoryMain } from 'src/app/models/category-main';
import { ConstructorsService } from 'src/app/services/constructors.service';
import { AlreadyExist } from 'src/app/shared/utils/exist';
import { RefereeService } from '../../../../services/referee.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-robot',
  templateUrl: './robot.component.html',
  styleUrls: ['./robot.component.scss'],
  host: {
    'class': 'router-flex'
  }
})
export class RobotComponent {

  public oldName: string = "";
  public formName: FormGroup;
  public formDocumentation: FormGroup;
  public formMovie: FormGroup;
  public formCategory: FormGroup;
  public formConstructor: FormGroup;
  public formAcceptation: FormGroup;
  private loadingName: boolean = true;
  private loadingCategories: boolean = true;
  private loadingConstructors: boolean = true;
  private loadingAcceptation: boolean = true;
  public loadingResults: boolean = true;
  public loadingDocumenation: boolean = true;
  public loadingMovie: boolean = true;
  private subs: Subscription = new Subscription;
  public robot: Robot | null = null;
  public categories: Array<CategoryMain> | null = null;
  public robots: Array<Robot> | null = null;
  public constructors: Array<Constructor> | null = null;
  public aviableCategories: Array<CategoryMain> | null = null;
  private lastConstructorMessage: object | null = null;
  public selectedCategory: number | null = null;
  public selectedGroup: number | null = null;
  public isEvent: boolean = false;
  public robotFights: Array<any> | null = null;
  public robotTimes: Array<any> | null = null;
  private documentationFile: File | null = null;
  public isEditingDocumentation = false;
  public isEditingMovie = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public authService: AuthService, private robotsService: RobotsService,
    private categoriesService: CategoriesService, private constructorsService: ConstructorsService, public userSerceice: UserService, private router: Router,
    private ui: UiService, private translate: TranslateService, private fightsService: FightsService, private timesService: TimesService, private injector: Injector,  private titleService: Title) {
    const robot_uuid = this.route.snapshot.paramMap.get('robot_uuid');

    const sub1 = combineLatest(this.categoriesService.categories$, userSerceice.isReferee ? this.robotsService.allRobots$ : this.robotsService.userRobots$, this.constructorsService.getNewConstructors$).subscribe(async (val) => {

      if (val[0] !== null && val[1] !== null) {
        const categories = JSON.stringify(val[0]!);
        const robots = JSON.stringify(val[1]!);
        if (categories !== JSON.stringify(this.categories) || JSON.stringify(this.robots) !== robots) {
          this.loadingCategories = true;
          this.loadingName = true;
          this.loadingDocumenation = true;
          this.categories = JSON.parse(categories);
          this.robots = JSON.parse(robots) as Array<Robot>;
          const thisRobot = this.robots.find((rob: any) => rob.robot_uuid == robot_uuid);
          if (thisRobot === undefined || thisRobot === null) {
            this.backToMyRobots();
            return;
          }
          this.robot = thisRobot ? thisRobot : null;
          this.oldName = this.robot!.nazwa_robota;
          this.filterAvaibleCategories();
          if (this.formCategory) {
            this.formCategory.reset();
          }
          if (this.robot) {
            this.titleService.setTitle(`🤖 ${this.robot.nazwa_robota}`);
          }
          if(this.robotFilm) {
            this.formMovie = this.formBuilder.group({
              movie: [this.robotFilm, [Validators.required, Validators.maxLength(500)]]
            });
          }

          this.formName = this.formBuilder.group({
            robot_name: [this.oldName, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]]
          });
          if (this.formName && !this.authService.canModify) {
            this.formName.disable();
          } else {
            this.formName.enable();
          }
          setTimeout(() => {
            this.loadingName = false;
            this.loadingCategories = false;
            this.loadingDocumenation = false;
            this.loadingMovie = false;
            this.loadingAcceptation = false;
          }, 100);
          this.formConstructor = this.formBuilder.group({
            constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
          });
          if (this.formDocumentation) {
            this.formDocumentation.reset();
          }
        }
        if (val[2] !== this.lastConstructorMessage) {
          const newData = val[2] as any;
          if (this.robot !== null && this.constructors === null) {
            this.lastConstructorMessage = newData;
            await this.getConstructors();
          } else if (newData.data !== null && newData.data.robot_uuid === robot_uuid) {
            if (newData.method === 'add') {
              this.loadingConstructors = true;
              await this.getConstructors();
            } else if (newData.method === 'delete') {
              const deletedConstructor = this.constructors?.find(constr => constr.konstruktor_id === newData.data.konstruktor_id);
              const path = `/competitor-zone/(outlet:robot/${newData.data.robot_uuid})`;
              if (deletedConstructor && deletedConstructor.uzytkownik_uuid === this.userUUID && this.router.url === path) {
                this.backToMyRobots();
                this.robotsService.getAllRobotsOfUser();
              } else {
                this.loadingConstructors = true;
                await this.getConstructors();
              }
            }
          }
        }
        this.authService.info$.subscribe((val) => {
          if (val && (val as any).eventDate < new Date() && robot_uuid) {
            this.isEvent = true;
            this.fightsService.getAllFightsOfRobots(robot_uuid);
            this.timesService.getAllTimesOfRobots(robot_uuid);
            const sub1 = combineLatest(this.fightsService.figthsForRobot$, this.timesService.timesForRobot$).subscribe(val => {
              if (val[0] !== null) {
                this.robotFights = val[0];
                this.loadingResults = false;
              }
              if (val[1] !== null) {
                this.robotTimes = val[1].sort((a, b) => a.czas_przejazdu - b.czas_przejazdu);
                this.loadingResults = false;
              }
            })
          }
        })
      } else if (!val[1]) {
        this.robotsService.getAllRobots();
      }

    });
    this.subs.add(sub1);
    this.formName = this.formBuilder.group({
      robot_name: [this.oldName, [Validators.required, Validators.minLength(2), Validators.maxLength(40)]]
    });
    this.formCategory = this.formBuilder.group({
      category: [null, [Validators.required]]
    });
    this.formConstructor = this.formBuilder.group({
      constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    });
    this.formDocumentation = this.formBuilder.group({
      documentation: [null, [Validators.required]]
    });
    this.formMovie = this.formBuilder.group({
      movie: [this.robotFilm, [Validators.required, Validators.maxLength(500)]]
    });
    this.formAcceptation = this.formBuilder.group({
      reason: [null, [Validators.required, Validators.maxLength(1000)]]
    });
  }

  onUpdateName() {
    if (this.isFormGroupNameValid) {
      this.loadingName = true;
      this.robotsService.updateRobot(this.robot!.robot_uuid, this.formName.get('robot_name')?.value).catch(err => {
        this.backToMyRobots();
      }).then(() => {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.update-name'), 2)
      }).finally(() => {
        this.loadingName = false;
      });
    }
  }

  onAddCategory() {
    if (this.isFormGroupCategoryValid) {
      this.loadingCategories = true;
      this.categoriesService.addRobotCategory(this.formCategory.get('category')?.value, this.robot!.robot_uuid).catch(err => {
        this.backToMyRobots();
      }).then(() => {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.add-category'), 2)
      }).finally(() => {
        setTimeout(() => {
        }, 1000);
      });
    }
  }

  async onRemoveCategory(kategoria_id: number) {
    const decision = await this.ui.wantToContinue(this.translate.instant('competitor-zone.robot.want-to-delete-category'));
    if (decision) {
      this.loadingCategories = true;
      this.categoriesService.deleteRobotCategory(kategoria_id, this.robot!.robot_uuid).then(() => {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.delete-category'), 2)
      }).finally(() => {
        setTimeout(() => {
          this.loadingCategories = false;
        }, 1000);
      });
    }
  }

  onAddConstructor() {
    if (this.isFormGroupConstructorValid) {
      this.loadingConstructors = true;
      this.constructorsService.addConstructor(this.formConstructor.get('constructor_uuid')?.value, this.robot!.robot_uuid).catch(err => {
        this.backToMyRobots();
        this.loadingConstructors = false;
      }).then(() => {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.add-constructor'), 2);
      }).finally(() => {
        if (this.formConstructor) this.formConstructor.reset();
      });
    }
  }

  async onDeleteConstructor(konstruktor_id: number) {
    if (this.canDeleteConstructor) {
      const decision = await this.ui.wantToContinue(this.translate.instant('competitor-zone.robot.want-to-delete-constructor'));
      if (decision) {
        this.loadingConstructors = true;
        this.constructorsService.deleteConstructor(konstruktor_id, this.robot!.robot_uuid).catch(err => {
          this.backToMyRobots();
        }).then(() => {
          this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.delete-constructor'), 2);
        });
      }
    }
  }

  async getConstructors() {
    await this.constructorsService.getConstructorsOfRobot(this.robot!.robot_uuid).catch(err => {
      this.backToMyRobots();
    }).then(constructors => {
      this.constructors = constructors as Array<Constructor>;
      this.formConstructor = this.formBuilder.group({
        constructor_uuid: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
      }, {
        validator: AlreadyExist('constructor_uuid', this.constructors)
      });
      this.loadingConstructors = false;
    });
  }

  async onDeleteRobot() {
    const decision = await this.ui.wantToContinue(this.translate.instant('competitor-zone.robot.want-to-delete-robot'));
    if (decision) {
      this.loadingConstructors = true;
      this.loadingCategories = true;
      this.loadingName = true;
      this.loadingDocumenation = true;
      this.robotsService.deleteRobot(this.robot!.robot_uuid).catch(err => {
        this.backToMyRobots();
      }).finally(() => {
        this.backToMyRobots();
      })
    }
  }

  setDocumentationFile(file: any) {
    this.documentationFile = file;
  }

  async onSendDocumentation() {
    if (this.isFormGroupDocumentationValid) {
      this.loadingDocumenation = true;
      this.robotsService.addRobotDocumentation(this.robot!.robot_uuid, this.documentationFile!).catch((err) => {
        this.backToMyRobots();
      }).then(() => {
        this.loadingDocumenation = false;
        this.isEditingDocumentation = false;
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.update-documentation'), 2);
      });
    }
  }

  async onAddRobotMovie() {
    if (this.isFormGroupMovieValid) {
      this.loadingMovie = true;
      this.robotsService.addRobotMovie(this.robot!.robot_uuid, this.formMovie.get('movie')?.value).catch((err) => {
        this.backToMyRobots();
      }).then(() => {
        this.loadingMovie = false;
        this.isEditingMovie = false;
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.update-film'), 2);
      });
    }
  }

  async onSaveReason() {
    if (this.isFormGroupAcceptationValid) {
      this.loadingAcceptation = true;
      this.injector.get(RefereeService).addRobotRejection(this.robot!.robot_uuid,this.formAcceptation.get('reason')?.value).then(() => {
          this.loadingAcceptation = false;
          this.ui.showFeedback("succes", this.translate.instant('competitor-zone.robot.update-reason'), 2);
        });
    }
  }

  async confirmArrival( value: boolean, event: Event) {
    if (!this.robot) return;
    event.stopPropagation();
    const decision = await this.ui.wantToContinue(`Potwierdzasz ${value ? "" : "nie"} dotarcie robota ${this.robot.nazwa_robota}`)
    if (decision) {
      const response = await this.injector.get(RefereeService).confirmArrival(this.robot.robot_uuid, value).catch(err => {
        return null
      });
      if (response !== undefined && response !== null && response.message === "INFO: OK") {
        this.ui.showFeedback("succes", `Pomyślnie potwierdzono ${value ? "" : "nie"} dotarcie robota ${this.robot.nazwa_robota}`, 3);

      } else {
        this.ui.showFeedback("error", `Nie udało się potwierdzić dotarcia!`, 3);
      }

    }
  }

  async onDownloadDocumentation() {
    if (this.robotDocumentation != null) {
      this.robotsService.downloadDocumentation(this.robot!.robot_uuid);
    }
  }

  async onOpenMovie() {
    if (this.robotFilm != null) {
      window.open(this.robotFilm, '_blank')
    }
  }

  backToMyRobots() {
    this.router.navigateByUrl(`/competitor-zone/(outlet:my-robots)`);
  }

  openUserDetails(uzytkownik_uuid: any) {
    if (this.userSerceice.isReferee) this.router.navigateByUrl(`/competitor-zone/(outlet:competitor/${uzytkownik_uuid})`)
  }


  filterAvaibleCategories() {
    if (this.categories && this.robot) {
      let cats = [...this.categories];
      const kategorie_lf = [4, 5, 6, 7, 8];
      const kategorie_sumo = [12, 13, 14, 15, 16];
      const akt_lf = this.robotCategories?.filter(el => kategorie_lf.findIndex(lf => lf === el) >= 0);
      const akt_sumo = this.robotCategories?.filter(el => kategorie_sumo.findIndex(sumo => sumo === el) >= 0);
      if (akt_lf && akt_lf.length >= 2) {
        cats = cats.filter(element => kategorie_lf.findIndex(rC => rC === element.kategoria_id)! < 0);
      }
      if (akt_sumo && akt_sumo.length >= 2) {
        cats = cats.filter(element => kategorie_sumo.findIndex(rC => rC === element.kategoria_id)! < 0);
      }
      this.aviableCategories = cats.filter(element => this.robotCategories?.findIndex(rC => rC === element.kategoria_id)! < 0);
    }
  }

  selectCategory(kategoria_id: number) {
    this.selectedCategory = Number(kategoria_id);
    this.selectedGroup = null;
  }

  selectGroup(grupa_id: number) {
    this.selectedGroup = Number(grupa_id);
  }

  public get isChanged() {
    return this.formName.get('robot_name')?.value !== this.oldName;
  }
  public get isFormGroupNameValid() {
    return this.formName.valid && !this.isLoadingName && this.authService.canModify;
  }
  public get isFormGroupCategoryValid() {
    return this.formCategory.valid && !this.isLoadingCategories && this.authService.canModify && this.canAddCategory;
  }
  public get isFormGroupConstructorValid() {
    return this.formConstructor.valid && !this.isLoadingConstructors && this.authService.canModify && this.canAddConstructor;
  }
  public get isFormGroupDocumentationValid() {
    return this.formDocumentation.valid && !this.isLoadingDocumentation && this.authService.canSendDocumetation && this.documentationFile != null && this.isSuitableFileFormat;
  }
  public get isFormGroupMovieValid() {
    return this.formMovie.valid && !this.isLoadingMovie && this.authService.canSendDocumetation;
  }
  public get isFormGroupAcceptationValid() {
    return this.formAcceptation.valid && !this.isLoadingAcceptation && this.userSerceice.isAdmin;
  }

  public get isLoadingName() {
    return this.loadingName;
  }
  public get isLoadingCategories() {
    return this.loadingCategories;
  }
  public get isLoadingConstructors() {
    return this.loadingConstructors;
  }
  public get isLoadingDocumentation() {
    return this.loadingDocumenation;
  }
  public get isLoadingMovie() {
    return this.loadingMovie;
  }
  public get isLoadingAcceptation() {
    return this.loadingAcceptation;
  }

  public get userUUID() {
    return (this.userSerceice.userDetails as any).uzytkownik_uuid;
  }

  public get robotUUID() {
    return this.robot ? this.robot.robot_uuid : null;
  }

  public get canDeleteConstructor() {
    return this.constructors ? (this.constructors.length > 1) : false;
  }

  public get canAddConstructor() {
    let finded = this.formConstructor.get('constructor_uuid')?.value;
    return this.constructors  && finded != null? (this.constructors.find((el) => el.uzytkownik_uuid == finded) == undefined) : true;
  }

  public get nameFormEmpty() {
    return this.formConstructor.untouched;
  }

  public get categoriesOptions(): string | undefined {
    if (this.aviableCategories) {
      return JSON.stringify(this.aviableCategories.map((category: CategoryMain) => {
        return { value: category.nazwa, id: category.kategoria_id };
      }));
    }
    else {
      return undefined;
    }
  }

  public get isSuitableFileFormat() {
    if (this.documentationFile != null) {
      let format = this.documentationFile.name.split(".").reverse()[0];
      return (format.includes("docx") || format.includes("doc") || format.includes("pdf")) && this.documentationFile.size < (5 * 1024 * 1024) // 1MB
    } else {
      return false;
    }
  }

  public get robotCategories() {
    return this.robot ? this.robot.kategorie.split(', ').map(el => Number(el)) : null;
  }

  public get robotConstructors() {
    return this.constructors ? this.constructors : null;
  }

  public get robotDocumentation() {
    return this.robot?.link_do_dokumentacji ? this.robot.link_do_dokumentacji : null;
  }

  public get robotFilm() {
    return this.robot?.link_do_filmiku ? this.robot.link_do_filmiku : null;
  }

  public get canAddCategory() {
    return this.robotCategories ? this.robotCategories?.length < 4 : false;
  }

  public get canDeleteCategory() {
    return this.robotCategories ? this.robotCategories?.length > 1 : false;
  }

  get isSmashBot() {
    return this.robotCategories ? this.robotCategories?.find(el => el === 1) != undefined : false;
  }

  get isFreestyle() {
    return this.robotCategories ? this.robotCategories?.find(el => el === 2) != undefined : false;
  }

  get isTaskHunters() {
    return this.robotCategories ? this.robotCategories?.find(el => el === 3) != undefined : false;
  }


  get getCategoryType() {
    return this.categories?.find(el => el.kategoria_id === this.selectedCategory)?.rodzaj
  }

  get getCategoryFigths() {
    const fights =  this.robotFights?.filter(el => el.kategoria_id === this.selectedCategory).sort((a, b) => new Date(a.czas_zakonczenia).getTime() - new Date(b.czas_zakonczenia).getTime());
    console.log(fights)
    return fights
  }

  get getGroupFigths() {
    return this.robotFights?.filter(el => el.kategoria_id === this.selectedCategory && el.grupa_id === this.selectedGroup).sort((a, b) => b.walka_id - a.walka_id).sort((a, b) => a.czas_zakonczenia - b.czas_zakonczenia);
  }

  get getCategoryTimesResult() {
    return this.robotTimes?.filter(el => el.kategoria_id === this.selectedCategory).sort((a, b) => b.wynik_id - a.wynik_id);
  }

  public getCategoryName(kategoria_id: string | number) {
    let id = typeof kategoria_id === "number" ? kategoria_id : Number(kategoria_id);
    let category = this.categories?.find(cat => cat.kategoria_id === id);
    return category ? category.nazwa : "???";
  }

  copyUUID() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.robot!.robot_uuid;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.ui.showFeedback('loading', this.translate.instant('competitor-zone.settings.errors.copied'), 3);
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(`XChallenge`);
  }

}
