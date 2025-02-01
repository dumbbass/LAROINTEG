import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php';  // Base API URL

  constructor(private http: HttpClient) { }

  // Method to schedule an appointment
  scheduleAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=scheduleAppointment`, data);
  }

  // Method to get appointments for a patient
  getAppointments(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getAppointments&patient_id=${patientId}`);
  }

  // Add this method to retrieve available times for a specific date
  getAvailableTimes(date: string) {
    return this.http.get<{ status: boolean; times: string[] }>(`http://localhost/API/carexusapi/backend/getAvailableTimes.php?date=${date}`);
  }

  // Add this method to your AppointmentService class
  getDoctorSchedules(doctorId: string, date?: string): Observable<any> {
    let url = `${this.apiUrl}?action=getDoctorSchedules&doctor_id=${doctorId}`;
    if (date) {
      url += `&date=${date}`;
    }
    return this.http.get(url);
  }

  // Get appointments for a specific doctor
  getDoctorAppointments(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getDoctorAppointments&doctor_id=${doctorId}`);
  }

  // Update appointment status with remarks
  updateAppointmentStatus(data: {
    appointment_id: number;
    status: 'approved' | 'declined' | 'completed' | 'rescheduled';
    remarks?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=updateAppointmentStatus`, data);
  }
}
