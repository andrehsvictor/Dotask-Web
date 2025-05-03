import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskIllustrationComponent } from '../../components/task-illustration/task-illustration.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { CredentialsDto } from '../../interfaces/auth/credentials-dto';
import { LocalStorageService } from '../../services/local-storage.service';
import { TokenService } from '../../services/token.service';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule,
    TaskIllustrationComponent
  ]
})
export class LoginComponent {
  credentials: CredentialsDto = {
    email: '',
    password: ''
  };

  isLoading = false;
  passwordVisible = false;
  showEmailVerificationWarning = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) { }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showEmailVerificationWarning = false;

    this.logger.debug('Attempting login', { email: this.credentials.email });

    this.authService.requestToken(this.credentials)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.logger.info('Login successful');

          this.tokenService.setAccessToken(response.accessToken);
          this.tokenService.setRefreshToken(response.refreshToken);

          // Redirecionar para a dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.logger.error('Login failed', error);

          if (error.status === 401) {
            // Verificar se o erro é devido a email não verificado
            if (error.error?.message?.includes('email') && error.error?.message?.includes('verified')) {
              this.showEmailVerificationWarning = true;
              this.snackBar.open('Please verify your email before logging in.', 'Resend Email', {
                duration: 8000
              }).onAction().subscribe(() => {
                this.resendVerificationEmail();
              });
            } else {
              this.snackBar.open('Invalid email or password', 'Close', { duration: 5000 });
            }
          } else {
            this.snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 5000 });
          }
        }
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.cdr.markForCheck();
  }

  resendVerificationEmail(): void {
    if (!this.credentials.email) {
      this.snackBar.open('Please enter your email address first', 'Close', { duration: 5000 });
      return;
    }

    const verificationBaseUrl = `${window.location.origin}/verify-email`;

    this.userService.sendActionEmail({
      email: this.credentials.email,
      action: 'VERIFY_EMAIL',
      url: verificationBaseUrl
    }).subscribe({
      next: () => {
        this.snackBar.open('Verification email sent! Please check your inbox.', 'Close', { duration: 5000 });
      },
      error: (err) => {
        this.logger.error('Failed to resend verification email', err);
        this.snackBar.open('Could not send verification email. Please try again later.', 'Close', { duration: 5000 });
      }
    });
  }

  forgotPassword(): void {
    this.router.navigate(['/reset-password']);
  }
}