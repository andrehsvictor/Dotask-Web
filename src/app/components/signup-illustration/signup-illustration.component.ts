import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-signup-illustration',
  standalone: true,
  templateUrl: './signup-illustration.component.html',
})
export class SignupIllustrationComponent {
  @Input() class: string = 'w-full h-auto';
}