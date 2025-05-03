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
import { TaskDialogComponent } from '../../dialogues/task-dialog/task-dialog.component';
import { ProjectDialogComponent } from '../../dialogues/project-dialog/project-dialog.component';

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
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.task) {
        this.createTask(result.task);
      }
    }
    );
  }

  openEditTaskDialog(task: GetTaskDto): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      maxHeight: '90vh',
      data: { task },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.task) {
        this.updateTask(task.id, result.task);
      }
    });
  }

  createTask(taskData: GetTaskDto): void {
    this.taskService.create(taskData)
      .subscribe({
        next: (newTask) => {
          // Add the new task to the beginning of the array
          this.tasks = [newTask, ...this.tasks].slice(0, 5);
          this.countTasksByStatus();

          // Update user task count if available
          if (this.user && this.user.taskCount !== undefined) {
            this.user.taskCount += 1;
          }

          this.snackBar.open('Task created successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.logger.error('Failed to create task', error);
          this.snackBar.open('Failed to create task', 'Close', {
            duration: 3000
          });
        }
      });
  }

  updateTask(taskId: string, taskData: GetTaskDto): void {
    this.taskService.update(taskId, taskData)
      .subscribe({
        next: (updatedTask) => {
          // Update the task in the local array
          const index = this.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.countTasksByStatus();
          }

          this.snackBar.open('Task updated successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.logger.error('Failed to update task', error);
          this.snackBar.open('Failed to update task', 'Close', {
            duration: 3000
          });
        }
      });
  }

  openNewProjectDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.project) {
        this.createProject(result.project);
      }
    });
  }

  createProject(projectData: GetProjectDto): void {
    this.projectService.create(projectData)
      .subscribe({
        next: (newProject) => {
          // Add the new project to the beginning of the array
          this.projects = [newProject, ...this.projects].slice(0, 3);

          // Update user project count if available
          if (this.user && this.user.projectCount !== undefined) {
            this.user.projectCount += 1;
          }

          this.snackBar.open('Project created successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.logger.error('Failed to create project', error);
          this.snackBar.open('Failed to create project', 'Close', {
            duration: 3000
          });
        }
      });
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
}


// // ...existing code...

// import { ProjectDialogComponent } from '../../components/project-dialog/project-dialog.component';

// // ...existing code...

//   openNewProjectDialog(): void {
//     const dialogRef = this.dialog.open(ProjectDialogComponent, {
//       width: '500px',
//       disableClose: true
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result && result.project) {
//         this.createProject(result.project);
//       }
//     });
//   }

//   createProject(projectData: any): void {
//     this.projectService.create(projectData)
//       .subscribe({
//         next: (newProject) => {
//           // Add the new project to the beginning of the array
//           this.projects = [newProject, ...this.projects].slice(0, 3);
          
//           // Update user project count if available
//           if (this.user && this.user.projectCount !== undefined) {
//             this.user.projectCount += 1;
//           }
          
//           this.snackBar.open('Project created successfully', 'Close', {
//             duration: 3000
//           });
//         },
//         error: (error) => {
//           this.logger.error('Failed to create project', error);
//           this.snackBar.open('Failed to create project', 'Close', {
//             duration: 3000
//           });
//         }
//       });
//   }

//   // ...existing code...