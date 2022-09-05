import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryMain } from 'src/app/models/category-main';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-manage-fights',
  templateUrl: './manage-fights.component.html',
  styleUrls: ['./manage-fights.component.scss']
})
export class ManageFightsComponent {

  formCategories: FormGroup;

  public categories: Array<CategoryMain> | null = null;

  constructor(private formBuilder: FormBuilder, private categoriesService: CategoriesService) {
    this.formCategories = this.formBuilder.group({
      category: [null, [Validators.required]]
    });

    this.categoriesService.categories$.subscribe(val => {
      this.categories = JSON.parse(JSON.stringify(val));
    })
  }

  get selectedCategory() {
    let val = this.formCategories.get('category')?.value
    return val ? Number(val) : null;
  }

  get getCategories() {
    let categoriesOptions = this.categories ? Object.assign(this.categories.filter(cat => cat.rodzaj == 1)): undefined;
    return categoriesOptions ? JSON.stringify(categoriesOptions.map((categoriesOption: any) => {
      return {value: (categoriesOption.nazwa), id: categoriesOption.kategoria_id}
    })) : undefined;
  }
}
