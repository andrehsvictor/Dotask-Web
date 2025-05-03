import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupIllustrationComponent } from '../../components/signup-illustration/signup-illustration.component';
import { Router, RouterLink } from '@angular/router';
import { PostUserDto } from '../../interfaces/user/post-user-dto';
import { UserService } from '../../services/user.service';
import { SendActionEmailDto } from '../../interfaces/user/send-action-email-dto';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { LoggerService } from '../../services/logger.service';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
    SignupIllustrationComponent
  ]
})
export class SignupComponent {
  user: SignupForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isSubmitting = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  // Password must be at least 8 characters with at least one uppercase, lowercase, digit and special character
  passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) { }

  onSubmit(form: NgForm) {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.logger.debug('Starting user registration process');

    const userData: PostUserDto = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password
    };

    this.userService.create(userData)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (user) => {
          this.logger.info('User registered successfully', { userId: user.id });

          const verificationBaseUrl = `${window.location.origin}/verify-email`;

          const emailRequest: SendActionEmailDto = {
            email: user.email,
            action: 'VERIFY_EMAIL',
            url: verificationBaseUrl
          };

          this.userService.sendActionEmail(emailRequest)
            .subscribe({
              next: () => {
                this.logger.info('Verification email sent', { email: user.email });
                this.showSuccessAndRedirect();
              },
              error: (error) => {
                this.logger.error('Error sending verification email', error);
                this.snackBar.open(
                  'Account created, but we could not send the verification email. Please try to login and request another verification email.',
                  'Close',
                  { duration: 8000 }
                );
                this.router.navigate(['/']);
              }
            });
        },
        error: (error) => {
          this.logger.error('Error registering user', error);
          if (error.status === 409) {
            this.snackBar.open('This email is already registered. Please use another email or try to login.', 'Close', {
              duration: 5000
            });
          } else {
            this.snackBar.open('Error creating your account. Please try again later.', 'Close', {
              duration: 5000
            });
          }
        }
      });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.cdr.markForCheck();
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    this.cdr.markForCheck();
  }

  private showSuccessAndRedirect() {
    this.snackBar.open(
      'Account created! Please check your email to verify your account.',
      'Close',
      { duration: 8000 }
    );
    this.router.navigate(['/']);
  }
}