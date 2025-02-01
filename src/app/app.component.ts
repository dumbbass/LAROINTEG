import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [RouterModule, CommonModule], // Import RouterModule to recognize <router-outlet>
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  showNavbar = true; // Ensure this is set to true to display the nav links
}
