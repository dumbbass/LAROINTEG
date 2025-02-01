import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class AdminAppointmentService {
  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php';

  constructor(private http: HttpClient) { }

  // Get all appointments for a specific doctor
  getDoctorAppointments(doctorId: number): Observable<any> {
    return this.http.get<{status: boolean, appointments: DoctorAppointment[]}>
      (`${this.apiUrl}?action=getDoctorAppointments&doctor_id=${doctorId}`);
  }

  // Update appointment status (approve/decline)
  updateAppointmentStatus(data: {
    appointment_id: number;
    status: 'approved' | 'declined' | 'completed';
    remarks?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=updateAppointmentStatus`, data);
  }

  // Get appointment history
  getAppointmentHistory(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getAppointmentHistory&doctor_id=${doctorId}`);
  }

  // Get modified appointments
  getModifiedAppointments(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getModifiedAppointments&doctor_id=${doctorId}`);
  }
} 