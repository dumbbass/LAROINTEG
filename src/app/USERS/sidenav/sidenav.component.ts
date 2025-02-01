import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Add this line

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [CommonModule, RouterModule], // Ensure RouterModule is here
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  isLogoutModalVisible = false; // Controls the visibility of the logout modal
  showDashboardLink = false; // Add this property to control dashboard visibility

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