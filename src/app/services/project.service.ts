import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetProjectDto } from '../interfaces/project/get-project-dto';
import { PostProjectDto } from '../interfaces/project/post-project-dto';
import { PutProjectDto } from '../interfaces/project/put-project-dto';
import { PageGetProjectDto } from '../interfaces/project/page-get-project-dto';
import { Pageable } from '../interfaces/common/pageable';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.API_URL}/api/v1/projects`;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  findAll(pageable: Pageable, search?: string): Observable<PageGetProjectDto> {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    if (search) {
      params = params.set('q', search);
    }

    return this.http.get<PageGetProjectDto>(this.apiUrl, { params, headers: { Authorization: `Bearer ${this.tokenService.getAccessToken()}` } });
  }

  findById(id: string): Observable<GetProjectDto> {
    return this.http.get<GetProjectDto>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  create(project: PostProjectDto): Observable<GetProjectDto> {
    return this.http.post<GetProjectDto>(this.apiUrl, project, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  update(id: string, project: PutProjectDto): Observable<GetProjectDto> {
    return this.http.put<GetProjectDto>(`${this.apiUrl}/${id}`, project, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  deleteMany(ids: string[]): Observable<void> {
    return this.http.delete<void>(this.apiUrl, { body: ids, headers: { Authorization: `Bearer ${this.tokenService.getAccessToken()}` } });
  }
}