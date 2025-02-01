import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { AuthService } from '../../auth.service';  // Import the AuthService
import { FormsModule } from '@angular/forms';


interface PatientHistory {
  medical_history: string;
  surgical_history: string;
  medications: string;
  allergies: string;
  injuries_accidents: string;
  special_needs: string;
  blood_transfusion: 'Yes' | 'No';
  present_history: string;
}

interface Patient {
  patient_id: number;
  id: number;
  firstname: string;
  lastname: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth: string;
  home_address: string;
  contact_number: string;
  email: string;
  height: number;
  weight: number;
  medications: string;
  birthplace: string;
  nationality: string;
  religion: string;
  civil_status: string;
  age: number;
}

@Component({
    selector: 'app-userprofile',
    imports: [SidenavComponent, CommonModule, FormsModule], // Include HttpClientModule and FormsModule here
    templateUrl: './userprofile.component.html',
    styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  user: any = {};
  userId: number | null = null;  // userId can be null initially
  errorMessage: string = '';
  firstName: string = '';
  lastName: string = '';
  birthplace: string = '';
  date_of_birth: string = '';
  age: number | null = null;
  gender: string = '';
  nationality: string = '';
  religion: string = '';
  civilStatus: string = '';
  height: number | null = null;
  weight: number | null = null;
  medications: string = '';
  home_address: string = '';
  contact_number: string = '';
  email: string = '';
  patientHistory: PatientHistory = {
    medical_history: '',
    surgical_history: '',
    medications: '',
    allergies: '',
    injuries_accidents: '',
    special_needs: '',
    blood_transfusion: 'No',
    present_history: ''
  };
  isEditingHistory = false;
  patientId: number | null = null;


  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
        this.fetchUserProfile();
        this.fetchPatientId(); // This will now fetch patient ID first
    } else {
        this.errorMessage = 'User ID is not available or user is not authenticated!';
        console.error(this.errorMessage);
    }
}

fetchUserProfile(): void {
  if (this.userId) {
    this.http.get<{status: boolean, user: any, message?: string}>(
      `http://localhost/API/carexusapi/backend/carexus.php?action=getUserProfile&id=${this.userId}`
    ).subscribe({
      next: (response) => {
        if (response.status && response.user) {
          this.user = response.user;
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message || 'Failed to fetch patient data';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error fetching patient data: ' + error.message;
      }
    });
  }
}

updateUserProfile(): void {
  if (this.userId && this.user) {
    this.http.post<{status: boolean, message: string}>(
      'http://localhost/API/carexusapi/backend/carexus.php?action=updateUserProfile',
      this.user
    ).subscribe({
      next: (response) => {
        if (response.status) {
          alert('Profile updated successfully!');
          this.closeModal();
          this.fetchUserProfile(); // Refresh the profile data
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.errorMessage = 'Error updating profile: ' + error.message;
      }
    });
  }
}



  fetchPatientId(): void {
    if (this.userId) {
        // Add logging for debugging
        console.log('Fetching patient ID for user:', this.userId);
        
        this.http.get<any>(`http://localhost/API/carexusapi/backend/carexus.php?action=getPatientId&user_id=${this.userId}`)
            .subscribe({
                next: (response) => {
                    console.log('Patient ID response:', response); // Debug log
                    
                    if (response.status && response.patient_id) {
                        this.patientId = response.patient_id;
                        console.log('Patient ID set to:', this.patientId); // Debug log
                        this.fetchPatientHistory(); // Only fetch history after we have the patient ID
                    } else {
                        this.errorMessage = 'Failed to fetch patient ID: ' + (response.message || 'Unknown error');
                        console.error('Failed to fetch patient ID:', response);
                    }
                },
                error: (error) => {
                    this.errorMessage = 'Error fetching patient ID: ' + error.message;
                    console.error('Error fetching patient ID:', error);
                }
            });
    } else {
        this.errorMessage = 'No user ID available';
        console.error('No user ID available for fetching patient ID');
    }
}

fetchPatientHistory(): void {
  if (!this.patientId) {
      console.error('Cannot fetch patient history: No patient ID available');
      return;
  }

  this.http.get<any>(`http://localhost/API/carexusapi/backend/carexus.php?action=getPatientHistory&patient_id=${this.patientId}`)
      .subscribe({
          next: (response) => {
              if (response.status) {
                  this.patientHistory = response.history;
              } else {
                  console.error('Failed to fetch patient history:', response.message);
                  this.errorMessage = 'Fetching History: ' + response.message;
              }
          },
          error: (error) => {
              console.error('Error fetching patient history:', error);
              this.errorMessage = 'Error fetching patient history: ' + error.message;
          }
      });
}


  updatePatientHistory(): void {
    if (this.patientId) { // Use patientId instead of userId
      const data = {
        patient_id: this.patientId,
        ...this.patientHistory
      };

      this.http.post<any>(`http://localhost/API/carexusapi/backend/carexus.php?action=updatePatientHistory`, data)
        .subscribe(
          response => {
            if (response.status) {
              this.isEditingHistory = false;
              alert('Patient history updated successfully');
            } else {
              alert('Failed to update patient history: ' + response.message);
            }
          },
          error => {
            console.error('Error updating patient history:', error);
            alert('Error updating patient history');
          }
        );
    } else {
      alert('Patient ID not found');
    }
  }


  toggleEditHistory(): void {
    this.isEditingHistory = !this.isEditingHistory;
  }

  isModalOpen = false;

  openModal(): void {
    const modal = document.getElementById('updateProfileModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeModal(): void {
    const modal = document.getElementById('updateProfileModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
