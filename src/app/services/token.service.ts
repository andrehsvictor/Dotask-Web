import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import { LoggerService } from './logger.service';
import { GetTokenDto } from '../interfaces/auth/get-token-dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private accessToken: string | null = null;

  constructor(
    private localStorageService: LocalStorageService,
    private logger: LoggerService,
    private router: Router,
    private authService: AuthService,
  ) { }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.logger.debug('Access token set:', token);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setRefreshToken(token: string): void {
    this.localStorageService.set('refreshToken', token);
    this.logger.debug('Refresh token set in local storage:', token);
  }

  getRefreshToken(): string | null {
    const refreshToken = this.localStorageService.get<string>('refreshToken');
    if (!refreshToken) {
      this.logger.error('No refresh token found in local storage');
      this.accessToken = null;
      return null;
    }
    return refreshToken;
  }
}
