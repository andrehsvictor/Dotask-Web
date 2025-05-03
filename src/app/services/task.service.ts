import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pageable } from '../interfaces/common/pageable';
import { GetTaskDto } from '../interfaces/task/get-task-dto';
import { PageGetTaskDto } from '../interfaces/task/page-get-task-dto';
import { PostTaskDto } from '../interfaces/task/post-task-dto';
import { PutTaskDto } from '../interfaces/task/put-task-dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.API_URL}/api/v1/tasks`;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  findAll(pageable: Pageable, filters?: any): Observable<PageGetTaskDto> {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    // Add optional filters if provided
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<PageGetTaskDto>(this.apiUrl, { params, headers: { Authorization: `Bearer ${this.tokenService.getAccessToken()}` } });
  }

  findById(id: string): Observable<GetTaskDto> {
    return this.http.get<GetTaskDto>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  create(task: PostTaskDto): Observable<GetTaskDto> {
    return this.http.post<GetTaskDto>(this.apiUrl, task, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  createInProject(projectId: string, task: PostTaskDto): Observable<GetTaskDto> {
    return this.http.post<GetTaskDto>(`${environment.API_URL}/api/v1/projects/${projectId}/tasks`, task, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  update(id: string, task: PutTaskDto): Observable<GetTaskDto> {
    return this.http.put<GetTaskDto>(`${this.apiUrl}/${id}`, task, {
      headers: {
        Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      }
    });
  }

  updateStatus(id: string, status: string): Observable<GetTaskDto> {
    return this.http.patch<GetTaskDto>(`${this.apiUrl}/${id}/status?status=${status}`, {
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