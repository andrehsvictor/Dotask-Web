import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { LoggerService } from './logger.service';
import { CredentialsDto } from '../interfaces/auth/credentials-dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { GetTokenDto } from '../interfaces/auth/get-token-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = environment.API_URL;

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private localStorageService: LocalStorageService,
  ) { }

  requestToken(credentials: CredentialsDto): Observable<GetTokenDto> {
    return this.http.post<GetTokenDto>(`${this.API_URL}/api/v1/token`, credentials);
  }

  refreshToken(): Observable<GetTokenDto> {
    const refreshToken = this.localStorageService.get<string>('refreshToken');
    if (!refreshToken) {
      this.logger.error('No refresh token found in local storage');
      throw new Error('No refresh token found');
    }
    return this.http.post<GetTokenDto>(`${this.API_URL}/api/v1/token/refresh`, { refreshToken });
  }

  logout(): Observable<void> {
    const refreshToken = this.localStorageService.get<string>('refreshToken');
    if (!refreshToken) {
      this.logger.error('No refresh token found in local storage');
      throw new Error('No refresh token found');
    }
    return this.http.post<void>(`${this.API_URL}/api/v1/token/revoke`, { refreshToken });
  }

}
