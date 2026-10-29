import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, InputSignal, signal } from '@angular/core';
import { AddCategoryRequest, Category, UpdateCategoryRequest } from '../models/category.model';
import { environment } from '../../../../environments/environment';
import { EditCategory } from '../edit-category/edit-category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  addCategoryStatus = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  updateCategoryStatus = signal<'idle' | 'loading' | 'error' | 'success'>('idle');

  addCategory(category: AddCategoryRequest) { // here we want to add a category by getting the data from the component, using it in the service, and then calling the API.
    this.addCategoryStatus.set('loading');
    this.http.post<void>(`${this.apiBaseUrl}/api/categories`, category, {
      withCredentials: true
    }).subscribe({     // subscribe is RxJS's subscriptions and observables. If we don't subscribe, then they will never make a call to the API.
      next: () => {                                                                    // Subscribe has next and error which is like success and error.
        this.addCategoryStatus.set('success');
      },
      error: () => {
        this.addCategoryStatus.set('error');
      }
    });
  }

  getAllCategories() {
    return httpResource<Category[]>(() => `${this.apiBaseUrl}/api/categories`);
  }

  getCategoryById(id: InputSignal<string | undefined>) { // this input signal comes from edit-category.ts. this signal returns either string or undefined
    return httpResource<Category>(() => `${this.apiBaseUrl}/api/categories/${id()}`);
  }

  updateCategory(id: string, updateCategoryRequestDto: UpdateCategoryRequest) {
    this.updateCategoryStatus.set('loading');

    this.http.put<void>(`${this.apiBaseUrl}/api/categories/${id}`, updateCategoryRequestDto, {
      withCredentials: true
    })
      .subscribe({
        next: () => {                                                                    // Subscribe has next and error which is like success and error.
        this.updateCategoryStatus.set('success');
      },
      error: () => {
        this.updateCategoryStatus.set('error');
      }
    })
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/categories/${id}`, {
      withCredentials: true
    });
  }
}



// Our component needs to know (this is talking about subscribe's next and error methods) whether if this ended up in success or error. we can do that using signals which are defined in line 12