import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-illustration',
  standalone: true,
  templateUrl: './task-illustration.component.html',
})
export class TaskIllustrationComponent {
  @Input() class: string = 'w-full h-auto';
}