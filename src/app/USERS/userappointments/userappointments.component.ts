import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';
import { AuthService } from '../../auth.service';
import { DoctorService } from '../services/doctor.service';
import { PatientService } from '../services/patient.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { HttpClient } from '@angular/common/http';
import { DoctorNamePipe } from '../pipes/doctor-name.pipe';

@Component({
    selector: 'app-userappointments',
    imports: [CommonModule, SidenavComponent, FormsModule, DoctorNamePipe],
    templateUrl: './userappointments.component.html',
    styleUrls: ['./userappointments.component.css'],
    standalone: true
})
export class UserappointmentsComponent implements OnInit {
  showAppointmentForm: boolean = false;
  showLimitModal: boolean = false;
  doctors: any[] = [];
  selectedDoctorId: string | null = null;
  appointmentDate: string = '';
  appointmentPurpose: string = '';
  patientId: number | null = null;
  appointments: any[] = [];
  currentMonth: Date = new Date();
  selectedDates: Date[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysInMonth: Date[] = [];

  availableDates: Date[] = [new Date(), new Date(new Date().setDate(new Date().getDate() + 2)), new Date(new Date().setDate(new Date().getDate() + 5))];
  availableTimes: string[] = [];
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  isModalOpen: boolean = false; // Modal visibility state
  modalDate: Date | null = null; // Date selected for the modal
  modalTimes: { time: string; scheduleId: string }[] = []; // Available times for the selected date

  // Mock availability for specific dates
  timeSlots: { [key: string]: string[] } = {
    '2025-01-29': ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    '2025-01-31': ['10:00 AM', '01:00 PM', '03:30 PM', '05:00 PM'],
    '2025-02-03': ['08:30 AM', '12:00 PM', '03:00 PM']
  };

  doctorSchedules: any[] = [];
  selectedScheduleId: string | null = null;

  remarksModalVisible = false;
  currentRemarks: string = '';

  constructor(
    private doctorService: DoctorService,
    private http: HttpClient, 
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}
  private getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

private renderCalendar(year: number, month: number): void {
    const daysContainer = document.querySelector(".calendar-grid");
    if (!daysContainer) return;
    
    daysContainer.innerHTML = ""; // Clear previous month
    const firstDay = this.getFirstDayOfMonth(year, month);
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day", "empty");
        daysContainer.appendChild(emptyDiv);
    }

    for (let i = 1; i <= totalDays; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = i.toString();
        daysContainer.appendChild(dayDiv);
    }
}



  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
        this.patientService.getPatientInfo(userId).subscribe({
            next: (response: any) => {
                console.log('Initial patient info response:', response);
                if (response.status && response.user && response.user.patient_id) {
                    this.patientId = response.user.patient_id;
                    this.fetchAppointments();
                } else {
                    console.error('Invalid patient info response:', response);
                }
            },
            error: (error) => {
                console.error('Error fetching patient info:', error);
            }
        });
    }

    // Fetch doctors list
    this.doctorService.getDoctors().subscribe(
        (response) => {
            if (response.status) {
                this.doctors = response.doctors;
            }
        }
    );

    this.generateCalendar();
  }

  fetchPatientData(): void {
    const patientIdFromAuth = this.authService.getPatientId();
    if (patientIdFromAuth !== null) {
      this.patientId = patientIdFromAuth;
      this.fetchAppointments();
    } else {
      console.error('Patient ID is null');
    }
  }

  fetchAppointments(): void {
    if (this.patientId !== null) {
      this.appointmentService.getAppointments(Number(this.patientId)).subscribe(
        (response) => {
          if (response.status) {
            this.appointments = response.appointments;
          } else {
            console.error('Failed to fetch appointments:', response.message);
          }
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
  }

  fetchDoctors(): void {
    this.doctorService.getDoctors().subscribe(
      (response) => {
        if (response.status) {
          this.doctors = response.doctors;
        } else {
          console.error('No doctors found');
        }
      },
      (error: any) => {
        console.error('Error fetching doctors:', error);
      }
    );
  }

  bookAppointment(): void {
    const patientId = this.authService.getPatientId();
    if (!this.selectedDoctorId || !this.selectedDate || !this.selectedTime || !this.appointmentPurpose || !patientId) {
        alert('Please fill in all the required fields');
        return;
    }

    // Check for existing appointments in the same week
    const selectedWeekStart = this.getWeekStart(this.selectedDate);
    const selectedWeekEnd = this.getWeekEnd(this.selectedDate);

    // Filter appointments for the same week
    const appointmentsThisWeek = this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate >= selectedWeekStart && 
               appointmentDate <= selectedWeekEnd &&
               appointment.status !== 'declined'; // Don't count declined appointments
    });

    if (appointmentsThisWeek.length >= 1) {
        alert('You can only have one appointment per week. Please select a different week.');
        return;
    }

    const appointmentData = {
        patient_id: patientId,
        schedule_id: this.selectedScheduleId,
        purpose: this.appointmentPurpose
    };

    this.appointmentService.scheduleAppointment(appointmentData).subscribe({
        next: (response) => {
            if (response.status) {
                alert('Appointment scheduled successfully!');
                this.resetForm();
                this.fetchAppointments();
            } else {
                alert(response.message || 'Failed to schedule appointment');
            }
        },
        error: (error) => {
            console.error('Error scheduling appointment:', error);
            alert('Error scheduling appointment. Please try again.');
        }
    });
}

// Helper method to get the start of the week for a given date
private getWeekStart(date: Date): Date {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Go to Sunday
    start.setHours(0, 0, 0, 0);
    return start;
}

// Helper method to get the end of the week for a given date
private getWeekEnd(date: Date): Date {
    const end = new Date(date);
    end.setDate(end.getDate() + (6 - end.getDay())); // Go to Saturday
    end.setHours(23, 59, 59, 999);
    return end;
}

  deleteAppointment(appointmentId: number): void {
    if (!confirm('Are you sure you want to delete this appointment?')) {
        return;
    }

    const apiUrl = `http://localhost/API/carexusapi/backend/delete_appointment.php?action=deleteAppointment&appointmentId=${appointmentId}`;

    this.http.get<{ status: boolean; message: string }>(apiUrl).subscribe(
        (response) => {
            if (response.status) {
                alert('Appointment deleted successfully');
                this.fetchAppointments(); // Refresh the list
            } else {
                alert('Failed to delete appointment: ' + response.message);
            }
        },
        (error) => {
            console.error('Error deleting appointment:', error);
            alert('There was an error deleting the appointment.');
        }
    );
}



  resetSelections(): void {
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableTimes = [];
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
  
    this.daysInMonth = [];
  
    for (let day = 1; day <= lastDay.getDate(); day++) {
      this.daysInMonth.push(new Date(year, month, day));
    }
  }
  

  goToPreviousMonth(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    this.currentMonth = new Date(year, month - 1, 1);
    this.generateCalendar();
  }

  goToNextMonth(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    this.currentMonth = new Date(year, month + 1, 1);
    this.generateCalendar();
  }

  selectDate(date: Date): void {
    if (this.isAvailableDate(date)) {
        this.openRetrieveAvailableTimeModal(date); // Open the modal for retrieving available times
    }
  }
  
  

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  isAvailableDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison
    return date >= today;
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDates.some((selectedDate) => selectedDate.toDateString() === date.toDateString());
  }

  confirmAppointment(): void {
    if (!this.selectedScheduleId || !this.appointmentPurpose) {
        alert('Please select a time slot and enter appointment purpose');
        return;
    }

    if (!this.patientId) {
        const userId = this.authService.getUserId();
        if (!userId) {
            alert('Please log in to book an appointment');
            return;
        }

        this.patientService.getPatientInfo(userId).subscribe({
            next: (response: any) => {
                console.log('Patient info response:', response); // Debug log
                if (response.status && response.user) {
                    this.patientId = response.user.id;
                    this.submitAppointment();
                } else {
                    console.error('Invalid response:', response);
                    alert('Could not retrieve patient information. Please try again.');
                }
            },
            error: (error) => {
                console.error('Error getting patient info:', error);
                alert('Error retrieving patient information. Please try again.');
            }
        });
    } else {
        this.submitAppointment();
    }
  }
  

  openModal(date: Date): void {
    if (!this.selectedDoctorId) {
      alert('Please select a doctor first');
      return;
    }

    const dateString = date.toISOString().split('T')[0];
    this.appointmentService.getDoctorSchedules(this.selectedDoctorId, dateString)
      .subscribe(
        (response) => {
          if (response.status && response.schedules.length > 0) {
            this.modalTimes = response.schedules.map((schedule: any) => ({
              time: schedule.time_slot,
              scheduleId: schedule.schedule_id
            }));
            this.modalDate = date;
            this.isModalOpen = true;
          } else {
            alert('No available time slots for this date');
          }
        }
      );
  }

  closeModal(): void {
    this.isModalOpen = false; // Close the modal
    this.modalDate = null;
    this.modalTimes = [];
  }

  selectTimeFromModal(timeSlot: any): void {
    this.selectedTime = timeSlot.time;
    this.selectedScheduleId = timeSlot.scheduleId;
    this.selectedDate = this.modalDate;
    this.isModalOpen = false;
  }
  
  openRetrieveAvailableTimeModal(date: Date): void {
    if (!this.selectedDoctorId) {
        alert('Please select a doctor first');
        return;
    }

    const dateString = date.toISOString().split('T')[0];
    this.appointmentService.getDoctorSchedules(this.selectedDoctorId, dateString)
        .subscribe(
            (response) => {
                if (response.status && response.schedules && response.schedules.length > 0) {
                    this.modalTimes = response.schedules.map((schedule: any) => ({
                        time: schedule.time_slot,
                        scheduleId: schedule.schedule_id
                    }));
                    this.modalDate = date;
                    this.isModalOpen = true;
                } else {
                    alert('No available time slots for this date');
                }
            },
            (error) => {
                console.error('Error fetching doctor schedules:', error);
                alert('Error fetching available times');
            }
        );
  }

  onDoctorSelect(): void {
    if (this.selectedDoctorId) {
      this.appointmentService.getDoctorSchedules(this.selectedDoctorId)
        .subscribe(
          (response) => {
            if (response.status) {
              this.doctorSchedules = response.schedules;
              // Mark dates with available schedules in the calendar
              this.updateAvailableDates();
            }
          }
        );
    }
  }

  updateAvailableDates(): void {
    this.availableDates = this.doctorSchedules.map(schedule => 
      new Date(schedule.available_date)
    );
  }

  // Helper method to reset form
  resetForm(): void {
    this.selectedDoctorId = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedScheduleId = null;
    this.appointmentPurpose = '';
    this.modalTimes = [];
    this.isModalOpen = false;
  }

  private submitAppointment(): void {
    if (!this.patientId) {
        console.error('No patient ID available');
        alert('Error: Patient ID is missing');
        return;
    }

    const appointmentData = {
        patient_id: this.patientId,
        schedule_id: this.selectedScheduleId,
        purpose: this.appointmentPurpose
    };

    console.log('Submitting appointment with data:', appointmentData);

    this.appointmentService.scheduleAppointment(appointmentData)
        .subscribe({
            next: (response) => {
                console.log('Appointment response:', response);
                if (response.status) {
                    alert('Appointment scheduled successfully!');
                    this.resetForm();
                    this.fetchAppointments();
                } else {
                    alert(response.message || 'Failed to schedule appointment');
                }
            },
            error: (error) => {
                console.error('Error scheduling appointment:', error);
                alert('Error scheduling appointment. Please try again.');
            }
        });
  }

  viewRemarks(remarks: string): void {
    this.currentRemarks = remarks;
    this.remarksModalVisible = true;
  }

  closeRemarksModal(): void {
    this.remarksModalVisible = false;
    this.currentRemarks = '';
  }

  isDateInBookedWeek(date: Date): boolean {
    const weekStart = this.getWeekStart(date);
    const weekEnd = this.getWeekEnd(date);
    
    return this.appointments.some(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate >= weekStart && 
               appointmentDate <= weekEnd &&
               appointment.status !== 'declined';
    });
  }
}
