import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TimetableService } from '../../services/timetable.service';
import { UserService } from '../../services/user.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent implements OnInit, OnDestroy {

  timetable: Array<any> = [];
  timetableValues: Array<any> | null = null;
  timetableIndex: number = 0;
  activeTimetableCells: Array<TableCell> | null = null;
  editingCellIndex: number | null = null;
  public isEnglish: boolean = true;
  formTimetable: FormGroup;
  formCell: FormGroup;
  private loading: boolean = false;
  isTimetableVisible: boolean = false;
  public scrollTimer: any;
  private isScrollingDown = true;
  public lastScrollPos = 0;


  constructor(public translate: TranslateService, public timetableService: TimetableService, public userService: UserService, private formBuilder: FormBuilder, private ui: UiService) {
    const prefLanguage = localStorage.getItem("prefLang");
    this.isEnglish = prefLanguage !== 'pl';
    this.timetableService.allTimetables$.subscribe((val) => {
      let filtered = userService.isAdmin ? val : val?.filter(el => el.czy_widoczny == 1);
      this.timetableValues = filtered ? filtered : null;
      this.updateTimetableCells();

    });
    translate.stream('timetable.table').subscribe((table: Array<any>) => {
      this.timetable = table;
    });
    this.formTimetable = this.formBuilder.group({
      harmonogram: [null, [Validators.required]],
      kolumny: [null, [Validators.required]],
      wiersze: [null, [Validators.required]],
      interwal: [null, [Validators.required]],
      godzina_rozpoczecia: [null, [Validators.required]],
    });
    this.formCell = this.formBuilder.group({
      nazwaPL: [null, [Validators.required]],
      nazwaENG: [null, [Validators.required]],
      kolumna: [null, [Validators.required]],
      wiersz: [null, [Validators.required]],
      colSpan: [null, [Validators.required]],
      rowSpan: [null, [Validators.required]],
      backgroundColor: [null, [Validators.required]],
      fontColor: [null, [Validators.required]],
      fontSize: [null, [Validators.required]],
      fontWeight: [null, [Validators.required]]
    });
    // this.formTimetable.valueChanges.subscribe(val => {
    //   console.log(val)
    //   console.log(this.isFormTimetableValid)
    // })
    this.formCell.valueChanges.subscribe((val) => {
      if (this.editingCellIndex != null && val.nazwaPL != null && val.nazwaENG != null && val.kolumna != null && val.wiersz != null && val.colSpan != null && val.rowSpan != null) {
        let cell = this.activeTimetableCells![this.editingCellIndex];
        cell.nazwaPL = val.nazwaPL;
        cell.nazwaENG = val.nazwaENG;
        cell.col = Number(val.kolumna);
        cell.row = Number(val.wiersz);
        cell.colSpan = Number(val.colSpan);
        cell.rowSpan = Number(val.rowSpan);
        let splitted = cell.style.split(";")
        if (val.fontColor) {
          splitted = splitted.filter(element => !(element.includes("color")));
          splitted.push(`color: ${val.fontColor}`)
        }
        if (val.backgroundColor) {
          splitted = splitted.filter(element => !(element.includes("background-color")));
          splitted.push(`background-color: ${val.backgroundColor}`)
        }
        if (val.fontSize) {
          splitted = splitted.filter(element => !(element.includes("font-size")));
          splitted.push(`font-size: ${val.fontSize}px`)
        }
        if (val.fontWeight) {
          splitted = splitted.filter(element => !(element.includes("font-weight")));
          splitted.push(`font-weight: ${val.fontWeight}`)
        }
        splitted = splitted.filter(element => !(element.includes("grid-column-start") || element.includes("grid-column-end") || element.includes("grid-row-start") || element.includes("grid-row-end") || element.includes("z-index")))
        cell.style = splitted.join(';') + ";" + this._gridColAndRow(cell.col, cell.row, cell.colSpan, cell.rowSpan, this.editingCellIndex + 10)
      }
    });
  }

  ngOnInit(): void {
    let isDisplayDevice = localStorage.getItem('isDisplayDevice') == 'true';

    if (isDisplayDevice) {
      this.scrollTimer = setInterval(() => {
        if (window.scrollY < document.body.scrollHeight && this.isScrollingDown) {
          window.scrollTo(0, window.scrollY + 3);
          if (window.scrollY == this.lastScrollPos) {
            this.isScrollingDown = false;
          }
          this.lastScrollPos = window.scrollY;
        } else if (window.scrollY > 0 && !this.isScrollingDown) {
          window.scrollTo(0, window.scrollY - 3);
          this.lastScrollPos = window.scrollY;
        } else if (window.scrollY == document.body.scrollHeight) {
          this.isScrollingDown = false;
        } else if (window.scrollY == 0) {
          this.isScrollingDown = true;
        }
      }, 50)
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.scrollTimer);
  }

  changeTimetable(index: number) {
    this.timetableIndex = index;
    if (this.userService.isAdmin) {
      this.formCell.reset()
      this.editingCellIndex = null;
    }
    this.updateTimetableCells();
  }

  updateTimetableCells() {
    this.activeTimetableCells = null;
    if (this.getCurrentTableCells != null) {
      let cells = JSON.parse(JSON.parse(this.getCurrentTableCells)) as Array<any>
      this.activeTimetableCells = cells.map(el => new TableCell(el.nazwaPL, el.nazwaENG, el.col, el.row, el.colspan, el.rowSpan, el.style))
    }
  }

  buildCell(col: number, row: number): TableCell {
    if (col == 0 || col == (this.getColumns!.length - 1)) {
      if (row == 0) {
        let cell = new TableCell('Godzina', 'Hour', 0, 0, 0, 0, `background-color: #202020; color: white; font-weight: bold; font-family: 'Goldman'; font-size: 2rem;`)
        cell.style += this._gridColAndRow(col, row + 1, cell.colSpan, cell.rowSpan, 2);
        return cell;
      } else {
        let date = new Date(this.getCurrentTable.godzina_rozpoczecia);
        date.setMinutes(date.getMinutes() + this.getCurrentTable.interwal * (row - 1));
        let cell = new TableCell(`${date.toLocaleTimeString().substring(0, 5)}`, `${date.toLocaleTimeString().substring(0, 5)}`, 0, 0, 0, 0, `background-color: #202020; color: white; font-weight: bold; font-family: 'Goldman'; font-size: 2rem;`)
        cell.style += this._gridColAndRow(col, row + 1);
        return cell;
      }
    }
    let znalezione = this.activeTimetableCells?.find(cell => cell.col == col && cell.row == row);
    if (znalezione) {
      return znalezione;
    }
    let cell = new TableCell("", "", 0, 0, 0, 0, "")
    cell.style += this._gridColAndRow(col, row);
    return cell;
  }

  _gridColAndRow(col: number, row: number, colSpan: number = 0, rowSpan: number = 0, zIndex: number = 1) {
    return `grid-column-start: ${col + 1}; grid-column-end: ${col + 2 + colSpan}; grid-row-start: ${row}; grid-row-end: ${row + rowSpan}; z-index: ${zIndex}`
  }

  _updateFormCell(cell: TableCell | null) {
    if (!this.userService.isAdmin) return;

    if (cell) {
      this.formCell.get('nazwaPL')?.setValue(cell.nazwaPL);
      this.formCell.get('nazwaENG')?.setValue(cell.nazwaENG);
      this.formCell.get('kolumna')?.setValue(cell.col);
      this.formCell.get('wiersz')?.setValue(cell.row);
      this.formCell.get('colSpan')?.setValue(cell.colSpan);
      this.formCell.get('rowSpan')?.setValue(cell.rowSpan);

      let splitted = cell.style.split(";")
      let color = splitted.find(el => el.includes('color') && el.length <= 15)?.split(": ")[1]
      this.formCell.get('fontColor')?.setValue(color);
      let bgcolor = splitted.find(el => el.includes('background-color'))?.split(": ")[1]
      this.formCell.get('backgroundColor')?.setValue(bgcolor);
      let fsize = splitted.find(el => el.includes('font-size'))?.split(": ")[1]
      fsize = fsize?.substring(0, fsize.length - 2)
      this.formCell.get('fontSize')?.setValue(Number(fsize));
      let fweight = splitted.find(el => el.includes('font-weight'))?.split(": ")[1]
      this.formCell.get('fontWeight')?.setValue(fweight);
      this.editingCellIndex = this.activeTimetableCells!.indexOf(cell);
    } else { this.formCell.reset() }
  }

  onSaveTimetable() {
    if (!this.userService.isAdmin) return;

    if (this.activeTimetableCells && this.getCurrentTable) {
      let cells = JSON.stringify([...this.activeTimetableCells].map(tc => tc.toObject()))
      this.loading = true;
      this.timetableService.editTimetable(
        this.getCurrentTable.harmonogram_id,
        cells,
        this.isTimetableVisible ? 1 : 0
      ).catch(err => console.log(err))
        .finally(() => {
          this.ui.showFeedback("succes", "Harmonogram został zaktualizowany")
          this.loading = false;
        })
    }
  }

  onCellClick(col: number, row: number) {
    if (!this.userService.isAdmin) return;
    if (col != -1 && col != (this.getColumns!.length - 1)) {
      const cellIndex = this.activeTimetableCells?.findIndex(cell => cell.col == col + 1 && cell.row == row)
      if (cellIndex != undefined && cellIndex != null && cellIndex >= 0) {
        this.editingCellIndex = null;
        this._updateFormCell(this.activeTimetableCells![cellIndex]);
      } else {
        this.editingCellIndex = null;
        let color = this.formCell.get('fontColor')?.value;
        let bgcolor = this.formCell.get('backgroundColor')?.value;
        let fsize = this.formCell.get('fontSize')?.value;
        let fweight = this.formCell.get('fontWeight')?.value;
        let cell = new TableCell('nowy', 'nowy', col + 1, row, 0, 0, `background-color: ${bgcolor ? bgcolor : "#0000ff"}; color: ${color ? color : "#ffffff"}; font-size: ${fsize ? fsize + "px" : "16px"}; font-weight: ${fweight ? fweight : '400'};`)
        cell.style += this._gridColAndRow(cell.col, cell.row, cell.colSpan, cell.rowSpan, 2);
        if (this.activeTimetableCells) {
          this.activeTimetableCells?.push(cell);
        } else {
          this.activeTimetableCells = [cell];
        }
        this._updateFormCell(cell);
      }
    }
  }

  async removeCurrentCell() {
    if (!this.userService.isAdmin) return;

    if (this.editingCellIndex != null && this.activeTimetableCells) {
      let cell = this.activeTimetableCells[this.editingCellIndex];
      const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć komórkę ${cell.nazwaPL}?`);
      if (decision) {
        this.activeTimetableCells.splice(this.editingCellIndex, 1);
        this.formCell.reset()
      }
    }
  }

  onFormSubmit() {
    if (!this.userService.isAdmin) return;

    if (this.isFormTimetableValid) {
      this.loading = true;
      let time = (this.formTimetable.get('godzina_rozpoczecia')?.value as string).split(':');
      let date = new Date();
      date.setHours(Number(time[0]))
      date.setMinutes(Number(time[1]))
      this.timetableService.addNewTimetable(
        this.formTimetable.get('harmonogram')?.value,
        date,
        this.formTimetable.get('interwal')?.value,
        this.formTimetable.get('wiersze')?.value,
        this.formTimetable.get('kolumny')?.value
      ).catch(err => console.log(err))
        .finally(() => {
          this.ui.showFeedback("succes", "Harmonogram został zaktualizowany")
          this.formTimetable.reset()
          this.loading = false;
        })
    }
  }

  async onDeleteTimetable() {
    if (!this.userService.isAdmin) return;

    if (this.isLoading || this.getCurrentTable == null) return;
    let wybrany = this.getCurrentTable
    const decision = await this.ui.wantToContinue(`Czy na pewno chcesz usunąć harmonogram ${wybrany.nazwa}?`);
    if (decision) {
      this.loading = true;
      this.timetableService.deleteTimetable(wybrany.harmonogram_id).finally(() => {
        this.ui.showFeedback("succes", "Harmonogram został usunięty")
        this.formCell.reset()
        this.loading = false;
      });
    }
  }

  clamp(num: number, min: number, max: number) {
    return num <= min
      ? min
      : num >= max
        ? max
        : num
  }

  onChangeDisplayDevice() {
    this.isTimetableVisible = !this.isTimetableVisible;
  }


  get getRows() {
    return this.timetableValues && this.timetableIndex < this.timetableValues.length ? Array.from({ length: this.getCurrentTable.wiersze }, (v, i) => i) : null
  }

  get getColumns() {
    return this.timetableValues && this.timetableIndex < this.timetableValues.length ? Array.from({ length: this.getCurrentTable.kolumny + 2 }, (v, i) => i) : null
  }

  get getIndex() {
    return this.timetableValues ? this.clamp(this.timetableIndex, 0, this.timetableValues.length - 1) : 0;
  }

  get getCurrentTable() {
    return this.timetableValues ? this.timetableValues[this.getIndex] : null;
  }

  get getCurrentTableCells() {
    return this.getCurrentTable ? (this.getCurrentTable.komorki ? this.getCurrentTable.komorki : "\"[]\"") : null;
  }

  get getTimetableStyle() {
    if (this.getCurrentTable) {
      let columns = "min(min-content, 1fr) ".repeat(this.getCurrentTable.kolumny + 2)
      let rows = "auto ".repeat(this.getCurrentTable.wiersze)
      return `grid-template-columns: ${columns};`
    }
    return ""
  }

  get isFormTimetableValid() {
    return this.formTimetable.valid && !this.isLoading;
  }
  get isFormCellValid() {
    return this.formCell.valid && !this.isLoading;
  }

  get isLoading() {
    return this.loading;
  }
}

class TableCell {
  nazwaPL: string;
  nazwaENG: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  style: string;
  constructor(nazwaPL: string, nazwaENG: string, col: number, row: number, colSpan: number, rowSpan: number, style: string) {
    this.nazwaPL = nazwaPL;
    this.nazwaENG = nazwaENG;
    this.col = col;
    this.row = row;
    this.colSpan = colSpan;
    this.rowSpan = rowSpan;
    this.style = style;
  }

  toJSON(): string {
    return JSON.stringify(this.toObject())
  }

  fromJSON(jsonString: string) {
    let object = JSON.parse(jsonString)
    this.nazwaPL = object.nazwaPL ? object.nazwaPL : null;
    this.nazwaENG = object.nazwaENG ? object.nazwaENG : null;
    this.col = object.col ? object.col : null;
    this.row = object.row ? object.row : null;
    this.colSpan = object.colSpan ? object.colSpan : null;
    this.rowSpan = object.rowSpan ? object.rowSpan : null;
    this.style = object.style ? object.style : null;
  }

  toObject() {
    return { nazwaPL: this.nazwaPL, nazwaENG: this.nazwaENG, col: this.col, row: this.row, colspan: this.colSpan, rowSpan: this.rowSpan, style: this.style }
  }

  // _gridColAndRow(col: number, row: number, colSpan: number = 0, rowSpan: number = 0, zIndex: number = 1) {
  //   return `grid-column-start: ${col + 1}; grid-column-end: ${col + 2 + colSpan}; grid-row-start: ${row + 1}; grid-row-end: ${row + 1 + rowSpan}; z-index: ${zIndex}`
  // }

}
