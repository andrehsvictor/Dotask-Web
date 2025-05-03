import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import { LoggerService } from './logger.service';
import { GetTokenDto } from '../interfaces/auth/get-token-dto';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private accessToken: string | null = null;

  constructor(
    private localStorageService: LocalStorageService,
    private logger: LoggerService,
    private authService: AuthService,
  ) { }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.logger.debug('Access token set:', token);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.authService.refreshToken().subscribe({
        next: (response: GetTokenDto) => {
          this.accessToken = response.accessToken;
          this.logger.debug('Access token refreshed:', response.accessToken);
        },
        error: (error: HttpErrorResponse) => {
          this.logger.error('Error refreshing access token:', error);
          this.accessToken = null;
          this.localStorageService.remove('refreshToken');
          this.logger.debug('Refresh token removed from local storage');
          this.logger.debug('User logged out due to token refresh failure');
        }
      });
    }
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
