import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DoctorAppointment {
  appointment_id: number;
  patient_name: string;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  remarks?: string;
}

interface ApiResponse {
  status: boolean;
  message?: string;
  appointments?: DoctorAppointment[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminAppointmentService {
  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php';

  constructor(private http: HttpClient) { }

  // Get all appointments for a specific doctor
  getDoctorAppointments(doctorId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>
      (`${this.apiUrl}?action=getDoctorAppointments&doctor_id=${doctorId}`).pipe(
        map(response => {
          console.log('Raw API response:', response); // Debug log
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch appointments');
          }
          return response;
        }),
        catchError(error => {
          console.error('Error in getDoctorAppointments:', error);
          throw error;
        })
      );
  }

  // Update appointment status (approve/decline)
  updateAppointmentStatus(data: {
    appointment_id: number;
    status: 'approved' | 'declined' | 'completed';
    remarks?: string;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>
      (`${this.apiUrl}?action=updateAppointmentStatus`, data).pipe(
        map(response => {
          console.log('Update status response:', response); // Debug log
          if (!response.status) {
            throw new Error(response.message || 'Failed to update appointment status');
          }
          return response;
        }),
        catchError(error => {
          console.error('Error updating appointment status:', error);
          throw error;
        })
      );
  }

  // Get appointment history
  getAppointmentHistory(doctorId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>
      (`${this.apiUrl}?action=getAppointmentHistory&doctor_id=${doctorId}`).pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch appointment history');
          }
          return response;
        })
      );
  }

  // Get modified appointments
  getModifiedAppointments(doctorId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>
      (`${this.apiUrl}?action=getModifiedAppointments&doctor_id=${doctorId}`).pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch modified appointments');
          }
          return response;
        })
      );
  }
} 