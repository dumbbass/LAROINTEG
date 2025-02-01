import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentListService {
  private apiUrl = 'http://localhost:3000/api/appointments';  // Backend endpoint

  constructor(private http: HttpClient) {}

  // Fetch all appointments
  getAppointments(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
