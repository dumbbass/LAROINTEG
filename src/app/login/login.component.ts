import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: ''
  };

  loginError = false;  // Flag to show error message
  errorMessage = '';   // Store the error message

  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php?action=login';
  private patientsApiUrl = 'http://localhost/API/carexusapi/backend/carexus.php?action=getPatients';
  private doctorsApiUrl = 'http://localhost/API/carexusapi/backend/carexus.php?action=getDoctors';  // New endpoint for doctors

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  onLogin(event: Event): void {
    event.preventDefault();
    console.log('Login attempt with:', this.loginData);

    // Reset error flag and message before making the request
    this.loginError = false;
    this.errorMessage = '';

    // Check if email or password is empty
    if (!this.loginData.email || !this.loginData.password) {
      this.loginError = true;
      this.errorMessage = 'Please enter your email and password';
      return; // Stop further execution if fields are empty
    }

    // Call the backend API to validate login credentials
    this.http.post<any>(this.apiUrl, this.loginData).subscribe(
      (response) => {
        console.log('Response from backend:', response);

        if (response.status === true) {
          // Ensure user object exists and extract user details safely
          if (response.user && response.user.id) {
            const { token, role, id } = response.user; // Extract token, role, and user id

            // Store the session data (token, role, and userId) in localStorage
            this.authService.setSession(token, role, id);

            // If user is a regular user, fetch their patient id
            if (role === 'user') {
              this.http.get<any>(this.patientsApiUrl).subscribe(
                (patientsResponse) => {
                  console.log('Fetched patients:', patientsResponse); // Log the response from patients API
                  const patients = patientsResponse.patients as { patient_id: number, id: number, email: string }[];

                  console.log('Logged user id:', id);
                  console.log('Patient list:', patients);

                  // Find the patient based on id
                  const patient = patients.find(p => p.id === id);
                  console.log('Found patient:', patient);

                  // If patient found, store patient_id
                  if (patient) {
                    console.log('Patient found:', patient); // Log the patient found
                    const patientId = patient.patient_id;
                    // Update session with patientId
                    this.authService.setSession(token, role, id, patientId);
                    this.router.navigate(['/userappointments']); // Navigate to user profile page
                  } else {
                    // Clear session if patient not found
                    this.authService.clearSession();
                    this.loginError = true;
                    this.errorMessage = 'Patient not found for this user.';
                    console.log('Patient not found for user id:', id); // Log the error case
                  }
                },
                (error) => {
                  console.log('Error fetching patients:', error);
                  this.loginError = true;
                  this.errorMessage = 'An error occurred while fetching patient data.';
                }
              );
            } else if (role === 'doctor' || role === 'admin') {
              // If user is a doctor, fetch doctor details
              this.http.get<any>(this.doctorsApiUrl).subscribe(
                (doctorsResponse) => {
                  console.log('Fetched doctors:', doctorsResponse); // Log the response from doctors API
                  const doctors = doctorsResponse.doctors as { doctor_id: number, user_id: number, email: string }[];

                  console.log('Logged doctor id:', id);
                  console.log('Doctor list:', doctors);

                  // Find the doctor based on user_id
                  const doctor = doctors.find(d => d.user_id === id);
                  console.log('Found doctor:', doctor);

                  // If doctor found, store doctor_id
                  if (doctor) {
                    console.log('Doctor found:', doctor); // Log the doctor found
                    const doctorId = doctor.doctor_id;
                    // Update session with doctorId
                    this.authService.setSession(token, role, id, doctorId);
                    this.router.navigate(['/admindashboard']); // Navigate to doctor dashboard
                  } else {
                    // Clear session if doctor not found
                    this.authService.clearSession();
                    this.loginError = true;
                    this.errorMessage = 'Doctor not found for this user.';
                    console.log('Doctor not found for user id:', id); // Log the error case
                  }
                },
                (error) => {
                  console.log('Error fetching doctors:', error);
                  this.loginError = true;
                  this.errorMessage = 'An error occurred while fetching doctor data.';
                }
              );
            }
          } else {
            alert('User ID not found in response');
          }
        } else {
          this.loginError = true;
          this.errorMessage = 'Invalid email or password';
        }
      },
      (error) => {
        console.log('Error during login:', error);
        this.loginError = true;
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    );
  }


  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
