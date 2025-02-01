import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // ✅ Makes it globally available
})
export class DoctorService {
  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php?action=getDoctors';

  constructor(private http: HttpClient) {}  // ✅ Injected here

  getDoctors(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
