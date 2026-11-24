import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, SignUpRequest, User } from '../models/user.model';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:8080/api';
  public readonly GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorize/google';

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.tokenService.saveToken(response.accessToken);
        this.tokenService.saveUser(response.user);
      })
    );
  }

  signUp(data: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, data).pipe(
      tap(response => {
        this.tokenService.saveToken(response.accessToken);
        this.tokenService.saveUser(response.user);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user/me`).pipe(
      tap(user => {
        this.tokenService.saveUser(user);
      })
    );
  }

  loginWithGoogle(): void {
    window.location.href = this.GOOGLE_AUTH_URL;
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigate(['/login']);
  }
}
