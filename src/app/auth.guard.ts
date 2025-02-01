import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getUserRole();

    // Check if the user is authenticated
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if the user has the correct role for the route
    if (route.url[0].path === 'admindashboard' && userRole !== 'admin') {
      this.router.navigate(['/login']);  // Redirect to login if the user is not an admin
      return false;
    }

    if (route.url[0].path === 'userdashboard' && userRole !== 'user') {
      this.router.navigate(['/login']);  // Redirect to login if the user is not a regular user
      return false;
    }

    return true;
  }
}
