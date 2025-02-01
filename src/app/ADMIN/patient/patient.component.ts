import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminsidenavComponent } from '../adminsidenav/adminsidenav.component';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { ArchiveService } from '../archive/archive.service';

@Component({
    selector: 'app-patient',
    imports: [
        CommonModule,
        RouterModule,
        AdminsidenavComponent,
        FormsModule // Add FormsModule here
    ],
    templateUrl: './patient.component.html',
    styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  searchQuery: string = '';
  showArchiveModal: boolean = false;
  userToArchive: any = null;
  archiveRemarks: string = '';
  isRemarksTooLong: boolean = false; // Flag to check if remarks exceed word limit

  constructor(private http: HttpClient, private archiveService: ArchiveService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // Word count check for remarks
  checkRemarks() {
    const wordCount = this.archiveRemarks.split(/\s+/).length;
    this.isRemarksTooLong = wordCount > 30;  // Check if words exceed 30
  }

  fetchUsers() {
    this.http.get<{ status: boolean; users: any[] }>( 
      'http://localhost/API/carexusapi/Backend/carexus.php?action=getUsers'
    ).subscribe(
      response => {
        if (response.status) {
          const archivedUsers = JSON.parse(localStorage.getItem('archivedUsers') || '[]');
          this.users = response.users.filter(user => 
            !archivedUsers.some((archived: any) => archived.email === user.email)
          );
          this.filteredUsers = [...this.users];
        } else {
          console.error('Failed to fetch users');
        }
      },
      error => console.error('Error fetching users', error)
    );
  }

  searchUsers() {
    if (this.searchQuery.trim() === '') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user => 
        (user.firstname + ' ' + user.lastname).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  viewUser(user: any) {
    this.selectedUser = {
      firstname: user.firstname || 'N/A',
      lastname: user.lastname || 'N/A',
      gender: user.gender || 'N/A',
      email: user.email || 'N/A',
      contact_number: user.contact_number || 'N/A',
      home_address: user.home_address || 'N/A',
      birhtplace: user.birhtplace || 'N/A',
      age: user.age || 'N/A',
      nationality: user.nationality || 'N/A',
      religion: user.religion || 'N/A',
      civil_status: user.civil_status || 'N/A',
      // height: user.height || 'N/A',
      // weight: user.weight || 'N/A',
      // medicalHistory: user.medicalHistory || []
    };
  }

  closeModal() {
    this.selectedUser = null;
  }

  openArchiveModal(user: any) {
    this.userToArchive = user;
    this.showArchiveModal = true;
  }

  closeArchiveModal() {
    this.showArchiveModal = false;
    this.userToArchive = null;
    this.archiveRemarks = '';
  }

  confirmArchive() {
    if (this.userToArchive && !this.isRemarksTooLong) {
      const archivedUsers = JSON.parse(localStorage.getItem('archivedUsers') || '[]');
      archivedUsers.push({
        ...this.userToArchive,
        dateArchived: new Date().toISOString().split('T')[0],
        remarks: this.archiveRemarks
      });
      localStorage.setItem('archivedUsers', JSON.stringify(archivedUsers));

      this.users = this.users.filter(user => user.email !== this.userToArchive.email);
      this.filteredUsers = this.filteredUsers.filter(user => user.email !== this.userToArchive.email);

      this.closeArchiveModal();
      console.log('User archived successfully:', this.userToArchive);
    } else if (this.isRemarksTooLong) {
      alert("Remarks should not exceed 30 words.");
    }
  }
}
