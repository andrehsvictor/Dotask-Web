import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SendActionEmailDto } from '../../interfaces/user/send-action-email-dto';
import { ResetPasswordTokenDto } from '../../interfaces/user/reset-password-token-dto';
import { UserService } from '../../services/user.service';
import { LoggerService } from '../../services/logger.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  requestMode = true;
  isLoading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  showSuccessMessage = false;
  successMessage = '';

  requestEmail = '';
  newPassword = '';
  confirmPassword = '';
  token = '';

  // Password must be at least 8 characters with at least one uppercase, lowercase, digit and special character
  passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // Check if token is provided in the URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (this.token) {
      this.requestMode = false;
      this.logger.debug('Reset password token detected in URL');
    }
  }

  onRequestSubmit(form: NgForm): void {
    if (form.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showSuccessMessage = false;

    const resetUrl = `${window.location.origin}/reset-password`;
    const payload: SendActionEmailDto = {
      email: this.requestEmail,
      action: 'RESET_PASSWORD',
      url: resetUrl
    };

    this.userService.sendActionEmail(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.logger.info('Password reset email sent', { email: this.requestEmail });
          this.showSuccess('Password reset link has been sent to your email.');
          form.resetForm();
          this.requestEmail = '';
        },
        error: (error) => {
          this.logger.error('Error sending reset email', error);
          if (error.status === 404) {
            // Don't reveal if email exists or not for security reasons
            this.showSuccess('If this email exists in our system, we have sent a password reset link.');
          } else {
            this.snackBar.open('Could not send reset email. Please try again later.', 'Close',
              { duration: 5000 });
          }
        }
      });
  }

  onResetSubmit(form: NgForm): void {
    if (form.invalid || this.isLoading || this.newPassword !== this.confirmPassword) {
      return;
    }

    this.isLoading = true;
    this.showSuccessMessage = false;

    const payload: ResetPasswordTokenDto = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.userService.resetPassword(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.logger.info('Password reset successful');
          this.showSuccess('Your password has been successfully reset.');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error) => {
          this.logger.error('Error resetting password', error);
          let errorMessage = 'Could not reset your password. Please try again.';

          if (error.status === 401) {
            errorMessage = 'This reset link has expired. Please request a new one.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid reset link. Please request a new one.';
          } else if (error.status === 404) {
            errorMessage = 'Reset link not found. Please request a new one.';
          }

          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.cdr.markForCheck();
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    this.cdr.markForCheck();
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.cdr.markForCheck();
  }

  hasUpperCase(password: string): boolean {
    return password ? /[A-Z]/.test(password) : false;
  }

  hasLowerCase(password: string): boolean {
    return password ? /[a-z]/.test(password) : false;
  }

  hasNumber(password: string): boolean {
    return password ? /[0-9]/.test(password) : false;
  }

  hasSpecialChar(password: string): boolean {
    return password ? /[@$!%*?&#]/.test(password) : false;
  }
}