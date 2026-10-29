import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogImage } from '../models/image.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageSelectorService {
  http = inject(HttpClient);
  showImageSelector = signal<boolean>(false);
  selectedImage = signal<string | null>(null);

  displayImageSelector() {
    this.showImageSelector.set(true);
  }

  hideImageSelector() {
    this.showImageSelector.set(false);
  }

  uploadImage(file: File, fileName: string, title: string): Observable<BlogImage> {
    const formData = new FormData();
    formData.append('file', file); // this string 'file' should match the paramter name in the Image controller of the API
    formData.append('fileName', fileName);
    formData.append('title', title);

    return this.http.post<BlogImage>(`${environment.apiBaseUrl}/api/images`, formData);
  }

  getAllImages(id: WritableSignal<string | undefined>): HttpResourceRef<BlogImage[] | undefined> {
    return httpResource<BlogImage[]>(() => {
      id();
      return `${environment.apiBaseUrl}/api/images`;
    })
  }

  selectImage(imageUrl: string) {
    this.selectedImage.set(imageUrl);
    this.hideImageSelector();
  }
}
