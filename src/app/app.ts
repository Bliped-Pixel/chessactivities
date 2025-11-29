import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('ChessApp');
  protected authService = inject(AuthService);
  private router = inject(Router);
  navbarClosed = false;

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
