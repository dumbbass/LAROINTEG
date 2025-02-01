import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private apiUrl = 'http://localhost/API/carexusapi/api/';  // Base API URL

    constructor(private http: HttpClient) { }

      // Method to handle user login
    login(loginData: any): Observable<any> {
        const url = `${this.apiUrl}login`;
        return this.http.post<any>(url, loginData);
    }

    // Method to schedule an appointment
    scheduleAppointment(appointmentData: any): Observable<any> {
        // Send the request with action as query parameter
        const url  =  `${this.apiUrl}scheduleAppointment`;
        return this.http.post<any>(url, appointmentData);
    }

    // Method to get appointments for a patient
    getAppointments(patientId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}getAppointments&patient_id=${patientId}`);
    }
    

    // Fetch the patient details using the user ID
    getPatientInfo(patientId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}getPatients&id=${patientId}`);
    }

    getPatientUserInfo(userId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}getPatientsUser&id=${userId}`);
    }

    getDoctors(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}getDoctors`);
    }
    

    // Fetch all appointments
    getAppointment(patientId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}getAppointments&id=${patientId}`);
    }
    
}
