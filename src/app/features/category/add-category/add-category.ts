import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCategoryRequest } from '../models/category.model';
import { CategoryService } from '../services/category-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-category',
  imports: [ReactiveFormsModule],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.categoryService.addCategoryStatus() === 'success') {
        this.categoryService.addCategoryStatus.set('idle');
        this.router.navigateByUrl('/admin/categories'); // Redirect back to category list page
      }

      if (this.categoryService.addCategoryStatus() === 'error') {
        console.error('Add category request failed');
      }
    });
  }

  private categoryService = inject(CategoryService) // this line injects or calls the category service.
  // 1) Import ReactiveFormsModule
  // 2) FormGroups -> FormControls

  addCategoryFormGroup = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    urlHandle: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    })
  });

  get nameFormControl() {
    return this.addCategoryFormGroup.controls.name;
  }

  get urlHandleFormControl() {
    return this.addCategoryFormGroup.controls.urlHandle;
  }

  onSubmit() { // this method takes the method from the form and passes this data to the angular service.
    const addCategoryFormValue = this.addCategoryFormGroup.getRawValue();

    const addCategoryRequestDto: AddCategoryRequest = {
      name: addCategoryFormValue.name,
      urlHandle: addCategoryFormValue.urlHandle
    };

    this.categoryService.addCategory(addCategoryRequestDto);

  }
}

