import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginResponse, User } from '../models/auth.model';
import { HttpClient, httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { use } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  user = signal<User | null>(null); // the null in the brackets represents the default value
  router = inject(Router);

  loadUser(): HttpResourceRef<User | undefined> {
    return httpResource<User>(() => {
      const request: HttpResourceRequest = {
        url: `${environment.apiBaseUrl}/api/auth/me`,
        withCredentials: true
      }
      return request;
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, {
      email: email,
      password: password // the email and password (left side of the colon) should match the properties we defined in LoginRequestDto in the API
    }, {
      withCredentials: true
    }).pipe(
      tap((userResponse) => this.setUser(userResponse))  // we can set this new userResponse to the user signal at the top
    );
  }

  logout() {
    // We will call the API Logout method

    this.http.post<void>(`${environment.apiBaseUrl}/api/auth/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        // Clear out the user signal
        this.setUser(null);

        // redirect the user to home page
        this.router.navigate(['']);
      }
    });

  }

  setUser(updatedUser: User | null) {
    if (updatedUser) {
      this.user.set({
        email: updatedUser.email,
        roles: updatedUser.roles.map(r => r.toLowerCase())
      });
    }
    else {
      this.user.set(null);
    }
  }
}
