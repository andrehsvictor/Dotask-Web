import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private logger: LoggerService,
    private router: Router,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Não adiciona tokens em chamadas de autenticação
    if (this.shouldSkipTokenInterceptor(req.url)) {
      return next.handle(req);
    }

    // Adiciona token se disponível
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken) {
      req = this.addTokenHeader(req, accessToken);
    }

    return next.handle(req).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private shouldSkipTokenInterceptor(url: string): boolean {
    // Skip para endpoints de autenticação
    const apiUrl = environment.API_URL;
    return (
      url.includes(`${apiUrl}/api/v1/token`) ||
      url.includes(`${apiUrl}/api/v1/token/refresh`) ||
      url.includes(`${apiUrl}/api/v1/token/revoke`)
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((tokens) => {
            this.isRefreshing = false;

            this.tokenService.setAccessToken(tokens.accessToken);
            this.tokenService.setRefreshToken(tokens.refreshToken);

            this.refreshTokenSubject.next(tokens.accessToken);

            this.logger.debug('Token refreshed successfully');

            return next.handle(this.addTokenHeader(request, tokens.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;

            this.logger.error('Failed to refresh token:', error);

            this.router.navigate(['/'], {
              queryParams: { session_expired: true }
            });

            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.router.navigate(['/']);
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Aguarda até que o token seja atualizado
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenHeader(request, token));
        })
      );
    }
  }
}