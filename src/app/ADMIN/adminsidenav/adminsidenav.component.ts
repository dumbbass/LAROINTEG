import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-adminsidenav',
    imports: [CommonModule, RouterModule],
    templateUrl: './adminsidenav.component.html',
    styleUrls: ['./adminsidenav.component.css']
})
export class AdminsidenavComponent {
  isLogoutModalVisible = false; // Controls the visibility of the logout modal

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  showLogoutModal() {
    this.isLogoutModalVisible = true;
  }

  hideLogoutModal() {
    this.isLogoutModalVisible = false;
  }

  logout() {
    this.isLogoutModalVisible = false; // Hide the modal
    this.router.navigate(['/login']); // Redirect to the login page
  }

  // Define the confirmLogout method
  confirmLogout() {
    this.logout(); // Call logout method
  }

  // Define the cancelLogout method
  cancelLogout() {
    this.hideLogoutModal(); // Hide the modal without logging out
  }
}