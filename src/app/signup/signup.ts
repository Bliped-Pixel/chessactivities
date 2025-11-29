import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  async onSubmit(): Promise<void> {
    // Validation
    if (!this.displayName() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.signUp(this.email(), this.password(), this.displayName());
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
