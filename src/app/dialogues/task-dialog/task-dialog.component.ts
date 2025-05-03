import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { GetTaskDto } from '../../interfaces/task/get-task-dto';
import { PostTaskDto } from '../../interfaces/task/post-task-dto';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './task-dialog.component.html'
})
export class TaskDialogComponent implements OnInit {
  isEditMode: boolean = false;
  loading: boolean = false;
  title: string = 'Add New Task';
  task: PostTaskDto = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: null
  };

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: GetTaskDto }
  ) { }

  ngOnInit(): void {
    // Check if we're editing an existing task
    if (this.data && this.data.task) {
      this.isEditMode = true;
      this.title = 'Edit Task';

      // Copy task values to our form model
      this.task = {
        title: this.data.task.title,
        description: this.data.task.description || '',
        priority: this.data.task.priority,
        status: this.data.task.status,
        dueDate: this.data.task.dueDate
      };
    }
  }

  onSubmit(): void {
    if (!this.task.title.trim()) {
      return; // Don't submit if title is empty
    }

    this.loading = true;
    this.dialogRef.close({
      task: this.task,
      isEdit: this.isEditMode
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}