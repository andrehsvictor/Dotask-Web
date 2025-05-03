import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailVerificationTokenDto } from '../../interfaces/user/email-verification-token-dto';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isVerified = false;
  isError = false;
  errorMessage = '';
  token: string | null = null;

  private readonly API_URL = environment.API_URL;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // Extrair o token da URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.isLoading = false;
      this.isError = true;
      this.errorMessage = 'No verification token found in the URL.';
      return;
    }

    this.verifyEmail(this.token);
  }

  verifyEmail(token: string): void {
    const payload: EmailVerificationTokenDto = { token };

    this.http.post<void>(`${this.API_URL}/api/v1/users/email/verify`, payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.isVerified = true;
          this.logger.info('Email successfully verified');
          this.snackBar.open('Email verified successfully! You can now log in.', 'Close', {
            duration: 5000
          });
        },
        error: (error) => {
          this.isError = true;
          this.logger.error('Error verifying email', error);

          switch (error.status) {
            case 400:
              this.errorMessage = 'Invalid verification token.';
              break;
            case 401:
              this.errorMessage = 'This verification link has expired.';
              break;
            case 404:
              this.errorMessage = 'Verification token not found.';
              break;
            default:
              this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      });
  }

  requestNewVerification(): void {
    this.router.navigate(['/request-verification']);
  }
}