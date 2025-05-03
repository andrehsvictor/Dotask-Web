import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetUserDto } from '../interfaces/user/get-user-dto';
import { PostUserDto } from '../interfaces/user/post-user-dto';
import { SendActionEmailDto } from '../interfaces/user/send-action-email-dto';
import { TokenService } from './token.service';
import { PutUserDto } from '../interfaces/user/put-user-dto';
import { ResetPasswordTokenDto } from '../interfaces/user/reset-password-token-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  create(user: PostUserDto): Observable<GetUserDto> {
    return this.http.post<GetUserDto>(`${this.API_URL}/api/v1/users`, user);
  }

  sendActionEmail(sendActionEmailDto: SendActionEmailDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/api/v1/users/send-action-email`, sendActionEmailDto);
  }

  updateMe(user: PutUserDto): Observable<GetUserDto> {
    return this.http.put<GetUserDto>(`${this.API_URL}/api/v1/users/me`, user, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  getMe(): Observable<GetUserDto> {
    return this.http.get<GetUserDto>(`${this.API_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  resetPassword(resetPasswordTokenDto: ResetPasswordTokenDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/api/v1/users/password/reset`, resetPasswordTokenDto);
  }

}
