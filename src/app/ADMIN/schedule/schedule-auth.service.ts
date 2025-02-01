import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',  // This makes the service available throughout the app
})
export class ScheduleAuthService {
  private doctorId: number | null = null;

  constructor() {
    // For now, we'll simulate getting the doctorId from localStorage
    const storedDoctorId = localStorage.getItem('doctorId');
    if (storedDoctorId) {
      this.doctorId = parseInt(storedDoctorId, 10);
    }
  }

  // Method to get doctorId (or null if not logged in)
  getDoctorId(): number | null {
    return this.doctorId;
  }

  // Method to set doctorId (you can use this after login)
  setDoctorId(doctorId: number) {
    this.doctorId = doctorId;
    localStorage.setItem('doctorId', doctorId.toString());
  }

  // Method to clear the doctorId (call this on logout)
  clearDoctorId() {
    this.doctorId = null;
    localStorage.removeItem('doctorId');
  }
}
