import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  tokenService = inject(TokenService);
  authService = inject(AuthService);

  get currentUser() {
    return this.tokenService.currentUser();
  }

  get isLoggedIn() {
    return this.tokenService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
  }
}
