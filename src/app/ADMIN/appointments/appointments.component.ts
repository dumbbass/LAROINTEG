import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminsidenavComponent } from '../adminsidenav/adminsidenav.component';
import { AdminAppointmentService, DoctorAppointment } from '../services/admin-appointment.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [AdminsidenavComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: DoctorAppointment[] = [];
  appointmentHistory: DoctorAppointment[] = [];
  modifiedAppointments: DoctorAppointment[] = [];
  showRemarksModal = false;
  selectedAppointmentId: number | null = null;
  remarks = '';

  constructor(
    private adminAppointmentService: AdminAppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllAppointments();
  }

  loadAllAppointments(): void {
    const doctorId = this.authService.getUserId();
    console.log('Loading appointments for doctor ID:', doctorId);

    if (!doctorId) return;

    // Load current appointments
    this.adminAppointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (response) => {
        console.log('Appointments response:', response);
        if (response.status && response.appointments) {
          this.appointments = response.appointments;
        }
      },
      error: (error: unknown) => console.error('Error loading appointments:', error)
    });

    // Load appointment history
    this.adminAppointmentService.getAppointmentHistory(doctorId).subscribe({
      next: (response) => {
        if (response.status && response.appointments) {
          this.appointmentHistory = response.appointments;
        }
      },
      error: (error: unknown) => console.error('Error loading appointment history:', error)
    });

    // Load modified appointments
    this.adminAppointmentService.getModifiedAppointments(doctorId).subscribe({
      next: (response) => {
        if (response.status && response.appointments) {
          this.modifiedAppointments = response.appointments;
        }
      },
      error: (error: unknown) => console.error('Error loading modified appointments:', error)
    });
  }

  approveAppointment(appointmentId: number): void {
    this.adminAppointmentService.updateAppointmentStatus({
      appointment_id: appointmentId,
      status: 'approved'
    }).subscribe({
      next: (response) => {
        if (response.status) {
          this.loadAllAppointments();
        } else {
          alert(response.message || 'Failed to approve appointment');
        }
      },
      error: (error) => {
        console.error('Error approving appointment:', error);
        alert('Failed to approve appointment. Please try again.');
      }
    });
  }

  openRemarksModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.remarks = '';
    this.showRemarksModal = true;
  }

  closeRemarksModal(): void {
    this.showRemarksModal = false;
    this.selectedAppointmentId = null;
    this.remarks = '';
  }

  declineAppointment(): void {
    if (!this.selectedAppointmentId || !this.remarks.trim()) {
      alert('Please provide remarks for declining the appointment');
      return;
    }

    this.adminAppointmentService.updateAppointmentStatus({
      appointment_id: this.selectedAppointmentId,
      status: 'declined',
      remarks: this.remarks.trim()
    }).subscribe({
      next: (response) => {
        if (response.status) {
          this.closeRemarksModal();
          this.loadAllAppointments();
        } else {
          alert(response.message || 'Failed to decline appointment');
        }
      },
      error: (error) => {
        console.error('Error declining appointment:', error);
        alert('Failed to decline appointment. Please try again.');
      }
    });
  }
}
