import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-building-plan',
  templateUrl: './building-plan.component.html',
  styleUrls: ['./building-plan.component.scss']
})
export class BuildingPlanComponent implements OnDestroy {

  private subs: Subscription = new Subscription;

  public form: FormGroup;
  public selectedFloor: string | null = "P";

  constructor(public translate: TranslateService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      floor: [this.selectedFloor]
    });

    const sub3 = this.form.valueChanges.subscribe( async (data) => {
      if(data !== null && data !== undefined) {
        this.selectedFloor = data.floor;
      }
    });

    this.subs.add(sub3);
  }

  public floors: string = JSON.stringify([
    { value: "building-plan.floors.P", id: "P" },
    { value: "building-plan.floors.0", id: "0" },
    { value: "building-plan.floors.1", id: "1" },
    { value: "building-plan.floors.2", id: "2" },
    { value: "building-plan.floors.3", id: "3" }
  ]);

  ngOnDestroy() {
    this.subs.unsubscribe()
  }
}
