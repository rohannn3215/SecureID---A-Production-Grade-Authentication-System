import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../core/services/token.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tokenService = inject(TokenService);
  authService = inject(AuthService);

  user: User | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.user = this.tokenService.currentUser();

    // Fetch freshest user profile from /api/user/me
    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
