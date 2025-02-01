// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php';

  constructor(private http: HttpClient) { }

  getPatientInfo(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getUserProfile&id=${userId}`);
  }
}