import { Component, effect, inject, input } from '@angular/core';
import { BlogPostService } from '../services/blog-post-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { CategoryService } from '../../category/services/category-service';
import { UpdateBlogPostRequest } from '../models/blogpost.model';
import { Router } from '@angular/router';
import { ImageSelector } from '../../../shared/components/image-selector/image-selector';
import { ImageSelectorService } from '../../../shared/services/image-selector-service';

@Component({
  selector: 'app-edit-blogpost',
  imports: [ReactiveFormsModule, MarkdownComponent, ImageSelector],
  templateUrl: './edit-blogpost.html',
  styleUrl: './edit-blogpost.css',
})
export class EditBlogpost {
  id = input<string>();
  blogPostService = inject(BlogPostService);
  categoryService = inject(CategoryService);
  imageSelectorService = inject(ImageSelectorService);
  router = inject(Router);

  private blogPostRef = this.blogPostService.getBlogPostById(this.id);
  blogPostResponse = this.blogPostRef.value;

  private categoriesRef = this.categoryService.getAllCategories();
  categoriesResponse = this.categoriesRef.value;


  editBlogPostForm = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(100)]
    }),
    shortDescription: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(300)]
    }),
    content: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)]
    }),
    featuredImageUrl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    urlHandle: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    publishedDate: new FormControl<string>(new Date().toISOString().split('T')[0], {
      nonNullable: true,
      validators: [Validators.required]
    }),
    author: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    isVisible: new FormControl<boolean>(false, {
      nonNullable: true
    }),
    categories: new FormControl<string[]>([])
  });

  effectRef = effect(() => {
    if (this.blogPostResponse()) {
      this.editBlogPostForm.patchValue({
        title: this.blogPostResponse()?.title,
        shortDescription: this.blogPostResponse()?.shortDescription,
        content: this.blogPostResponse()?.content,
        author: this.blogPostResponse()?.author,
        featuredImageUrl: this.blogPostResponse()?.featuredImageUrl,
        isVisible: this.blogPostResponse()?.isVisible,
        publishedDate: new Date(this.blogPostResponse()?.publishedDate!).toISOString().split('T')[0], // the ! in this line states that the value can never be undefined 
        urlHandle: this.blogPostResponse()?.urlHandle,
        categories: this.blogPostResponse()?.categories.map(x => x.id)
      });
    }
  });

  selectedImageEffectRef = effect(() => {
    const selectedImageUrl = this.imageSelectorService.selectedImage();
    if (selectedImageUrl) {
      this.editBlogPostForm.patchValue({
        featuredImageUrl: selectedImageUrl
      });
    }
  });

  onSubmit() {
    const id = this.id();
    if (id && this.editBlogPostForm.valid) {
      const formValue = this.editBlogPostForm.getRawValue();

      const updateBlogPostRequestDto: UpdateBlogPostRequest = {
        title: formValue.title,
        shortDescription: formValue.shortDescription,
        content: formValue.content,
        author: formValue.author,
        featuredImageUrl: formValue.featuredImageUrl,
        isVisible: formValue.isVisible,
        urlHandle: formValue.urlHandle,
        publishedDate: new Date(formValue.publishedDate),
        categories: formValue.categories ?? []
      };

      this.blogPostService.editBlogPost(id, updateBlogPostRequestDto)
        .subscribe({
          next: (response) => {
            this.router.navigate(['/admin/blogposts']);
          },
          error: () => {
            console.error('Something went wrong!');
          }
        });
    }

  }

  onDelete() {
    const id = this.id();
    if (id) {
      this.blogPostService.deleteBlogPost(id)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.router.navigate(['/admin/blogposts']);
          },
          error: () => {
            console.error('something went wrong');
          }
        });
    }
  }

  openImageSelector() {
    this.imageSelectorService.displayImageSelector();
  }
}
