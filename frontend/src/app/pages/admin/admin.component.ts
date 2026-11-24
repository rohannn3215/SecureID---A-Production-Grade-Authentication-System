import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { TokenService } from '../../core/services/token.service';
import { AdminStats, Role, User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private tokenService = inject(TokenService);

  users: User[] = [];
  filteredUsers: User[] = [];
  stats: AdminStats = { totalUsers: 0, googleUsers: 0, localUsers: 0, adminUsers: 0 };

  isLoading = true;
  actionMessage = '';
  errorMessage = '';

  searchQuery = '';
  selectedProvider = 'ALL';
  selectedRole = 'ALL';

  get currentUserId() {
    return this.tokenService.currentUser()?.id;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });
  }

  applyFilter(): void {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !this.searchQuery ||
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesProvider =
        this.selectedProvider === 'ALL' || user.provider === this.selectedProvider;

      const matchesRole =
        this.selectedRole === 'ALL' || user.role === this.selectedRole;

      return matchesSearch && matchesProvider && matchesRole;
    });
  }

  onRoleChange(user: User, newRole: string): void {
    if (user.role === newRole) return;

    const role = newRole as Role;
    this.adminService.updateUserRole(user.id, role).subscribe({
      next: (updatedUser) => {
        user.role = updatedUser.role;
        this.showSuccess(`Role for ${user.name} updated to ${role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}.`);
        this.adminService.getStats().subscribe(s => this.stats = s);
      },
      error: (err) => {
        this.showError(err.error?.message || 'Could not update user role.');
      }
    });
  }

  onDeleteUser(user: User): void {
    if (user.id === this.currentUserId) {
      this.showError('You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.applyFilter();
        this.showSuccess(`User "${user.name}" deleted successfully.`);
        this.adminService.getStats().subscribe(s => this.stats = s);
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to delete user.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.actionMessage = msg;
    this.errorMessage = '';
    setTimeout(() => {
      if (this.actionMessage === msg) this.actionMessage = '';
    }, 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => {
      if (this.errorMessage === msg) this.errorMessage = '';
    }, 5000);
  }
}
