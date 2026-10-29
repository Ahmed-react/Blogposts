import { Component, effect, inject, input } from '@angular/core';
import { CategoryService } from '../services/category-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateCategoryRequest } from '../models/category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-category',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-category.html',
  styleUrl: './edit-category.css',
})
export class EditCategory {
// the code in the contructor is to redirect to the categort-list page
  constructor() {
    effect(() => {
      if (this.categoryService.updateCategoryStatus() === 'success') {
        this.categoryService.updateCategoryStatus.set('idle');
        this.router.navigate(['/admin/categories']);
      }

      if (this.categoryService.updateCategoryStatus() === 'error') {
        this.categoryService.updateCategoryStatus.set('idle');
        console.error('something went wrong!');
      }
    });
  }

  id = input<string>(); // this id should match the id we passed in app.routes.ts and line 32 of category-list.html
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  categoryResourceRef = this.categoryService.getCategoryById(this.id);
  categoryResponse = this.categoryResourceRef.value;

  editCategoryFormGroup = new FormGroup({
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
  return this.editCategoryFormGroup.controls.name;
}

get urlHandleFormControl() {
  return this.editCategoryFormGroup.controls.urlHandle;
}

// this effect reacts to the changes. If any questions about this arise, then refer to Section 5 video 45.
// this code about effect is to get the form field values for the text boxes if we click on edit button.
effectRef = effect(() => {
  this.editCategoryFormGroup.controls.name.patchValue(this.categoryResponse()?.name ?? '');
  this.editCategoryFormGroup.controls.urlHandle.patchValue(this.categoryResponse()?.urlHandle ?? '');
})

onSubmit() {
  const id = this.id();
  if (!this.editCategoryFormGroup.valid || !id) {
    return;
  }

  const formRawValue = this.editCategoryFormGroup.getRawValue();
  const updateCategoryRequestDto: UpdateCategoryRequest = {
    name: formRawValue.name,
    urlHandle: formRawValue.urlHandle
  }

  this.categoryService.updateCategory(id, updateCategoryRequestDto)
}

deleteCategory() {
  const id = this.id();
  if (!id) {
    return;
  }

  this.categoryService.deleteCategory(id)
  .subscribe({
    next: () => {
      this.router.navigate(['/admin/categories']);
    },
    error: () => {
      console.error('Something went wrong!');
    }
  });

}

}
