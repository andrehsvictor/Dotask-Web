import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// Services
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { LoggerService } from '../../services/logger.service';

// Interfaces
import { GetUserDto } from '../../interfaces/user/get-user-dto';
import { GetTaskDto } from '../../interfaces/task/get-task-dto';
import { GetProjectDto } from '../../interfaces/project/get-project-dto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardComponent implements OnInit {
  user: GetUserDto | null = null;
  tasks: GetTaskDto[] = [];
  projects: GetProjectDto[] = [];
  isLoadingTasks = true;
  isLoadingProjects = true;
  pendingTasksCount = 0;
  completedTasksCount = 0;

  get userInitials(): string {
    if (!this.user?.name) return '?';
    return this.user.name
      .split(' ')
      .map(name => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadTasks();
    this.loadProjects();
  }

  loadUserData(): void {
    this.userService.getMe().subscribe({
      next: (userData) => {
        this.user = userData;
        this.logger.debug('User data loaded', { user: this.user });
      },
      error: (error) => {
        this.logger.error('Failed to load user data', error);
        if (error.status === 401) {
          this.handleUnauthenticated();
        }
      }
    });
  }

  loadTasks(): void {
    this.isLoadingTasks = true;
    // Load first page of tasks, sorted by updated date
    this.taskService.findAll({ page: 0, size: 5, sort: ['updatedAt,desc'] })
      .pipe(finalize(() => this.isLoadingTasks = false))
      .subscribe({
        next: (response) => {
          this.tasks = response.content;
          this.logger.debug('Tasks loaded', { tasks: this.tasks });

          // Count tasks by status
          this.countTasksByStatus();
        },
        error: (error) => {
          this.logger.error('Failed to load tasks', error);
          if (error.status === 401) {
            this.handleUnauthenticated();
          }
        }
      });
  }

  loadProjects(): void {
    this.isLoadingProjects = true;
    // Load first page of projects
    this.projectService.findAll({ page: 0, size: 3, sort: ['updatedAt,desc'] })
      .pipe(finalize(() => this.isLoadingProjects = false))
      .subscribe({
        next: (response) => {
          this.projects = response.content;
          this.logger.debug('Projects loaded', { projects: this.projects });
        },
        error: (error) => {
          this.logger.error('Failed to load projects', error);
          if (error.status === 401) {
            this.handleUnauthenticated();
          }
        }
      });
  }

  countTasksByStatus(): void {
    this.pendingTasksCount = this.tasks.filter(task =>
      task.status === 'PENDING' || task.status === 'IN_PROGRESS').length;
    this.completedTasksCount = this.tasks.filter(task =>
      task.status === 'COMPLETED').length;
  }

  updateTaskStatus(taskId: string, status: string): void {
    this.taskService.updateStatus(taskId, status)
      .subscribe({
        next: (updatedTask) => {
          // Update the task in the local array
          const index = this.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.countTasksByStatus();
          }

          this.snackBar.open(`Task marked as ${status.replace('_', ' ').toLowerCase()}`, 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.logger.error('Failed to update task status', error);
          this.snackBar.open('Failed to update task status', 'Close', {
            duration: 3000
          });
        }
      });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(taskId)
        .subscribe({
          next: () => {
            // Remove the task from the local array
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.countTasksByStatus();

            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            this.logger.error('Failed to delete task', error);
            this.snackBar.open('Failed to delete task', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  openNewTaskDialog(): void {
    // This would be implemented with a dialog component
    // For now, navigate to task creation page
    this.router.navigate(['/tasks/new']);
  }

  openEditTaskDialog(task: GetTaskDto): void {
    this.logger.debug('Opening edit task dialog', { task });
  }

  openNewProjectDialog(): void {
    this.logger.debug('Opening new project dialog');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if API call fails, clear tokens and redirect
        this.router.navigate(['/']);
      }
    });
  }

  private handleUnauthenticated(): void {
    
  }
}