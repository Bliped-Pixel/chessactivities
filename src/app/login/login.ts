import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.signIn(this.email(), this.password());
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
}
