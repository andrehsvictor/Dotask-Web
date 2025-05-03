import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { GetProjectDto } from '../../interfaces/project/get-project-dto';

interface ProjectForm {
  name: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './project-dialog.component.html'
})
export class ProjectDialogComponent implements OnInit {
  isEditMode: boolean = false;
  loading: boolean = false;
  title: string = 'Add New Project';
  project: ProjectForm = {
    name: '',
    description: '',
    color: '#538083' // Default color
  };

  colorOptions: string[] = [
    '#538083', // Primary
    '#2A7F62', // Secondary
    '#C3ACCE', // Accent
    '#6B717E', // Grey
    '#D57A66', // Orange/Red
    '#5762D5', // Blue
    '#D55C9E'  // Pink
  ];

  constructor(
    public dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: GetProjectDto }
  ) { }

  ngOnInit(): void {
    // Check if we're editing an existing project
    if (this.data && this.data.project) {
      this.isEditMode = true;
      this.title = 'Edit Project';

      // Copy project values to our form model
      this.project = {
        name: this.data.project.name,
        description: this.data.project.description || '',
        color: this.data.project.color || this.colorOptions[0]
      };
    }
  }

  onSubmit(): void {
    if (!this.project.name.trim()) {
      return; // Don't submit if name is empty
    }

    this.loading = true;
    this.dialogRef.close({
      project: this.project,
      isEdit: this.isEditMode
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  selectColor(color: string): void {
    this.project.color = color;
  }
}