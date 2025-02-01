import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminsidenavComponent } from '../adminsidenav/adminsidenav.component';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { ScheduleService } from './schedule.service';  // Adjust import path
import { ScheduleAuthService } from './schedule-auth.service';  // Import the new service
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';  // Import HttpClient

@Component({
  selector: 'app-schedule',
  imports: [
    CommonModule,
    RouterModule,
    AdminsidenavComponent,
    FormsModule
  ],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  // Use BehaviorSubject for efficient updates
  currentMonth$ = new BehaviorSubject<Date>(new Date());
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Cache for generated weeks
  private weeksCache: Date[][] | null = null;
  private cacheMonth: number | null = null;

  selectedDates: Date[] = [];
  isModalOpen = false;
  modalDate: Date | null = null;
  modalTimes: string[] = [];
  newTime = '';

  availability: { date: Date; times: string[] }[] = [];

  // Availability tracking
  availabilityStatus: { [key: string]: boolean } = {};
  isBulkMode = false;
  bulkTimes: string[] = [];
  conflictMessage = '';

  // Loading and message handling
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Preset times for quick selections
  presetTimes: string[] = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00'
  ];

  private apiUrl = 'http://localhost/API/carexusapi/backend/carexus.php';  // Define apiUrl

  // Inject ScheduleService and ScheduleAuthService into the constructor
  constructor(
    private http: HttpClient,  // Inject HttpClient
    private scheduleService: ScheduleService,
    private scheduleAuthService: ScheduleAuthService,  // Inject the new service
    private authService: AuthService  // Inject AuthService here
  ) {
    console.log('ScheduleComponent initialized');
    this.currentMonth$.subscribe(() => {
      this.generateWeeks();
    });
  }

  // Month navigation
  prevMonth() {
    const current = this.currentMonth$.value;
    this.currentMonth$.next(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.currentMonth$.value;
    this.currentMonth$.next(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  // Generate weeks for the current month
  generateWeeks(): Date[][] {
    const current = this.currentMonth$.value;
    if (this.weeksCache && this.cacheMonth === current.getMonth()) {
      return this.weeksCache;
    }

    const weeks: Date[][] = [];
    let week: Date[] = [];
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay());

    while (startDay <= lastDay) {
      week.push(new Date(startDay));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      startDay.setDate(startDay.getDate() + 1);
    }

    this.weeksCache = weeks;
    this.cacheMonth = current.getMonth();
    return weeks;
  }

  getWeeks(): Date[][] {
    return this.generateWeeks();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    return this.selectedDates.some(d => d && isSameDay(d, date));
  }

  toggleDateSelection(date: Date) {
    if (this.isPastDate(date)) {
      this.errorMessage = 'Cannot select past dates';
      return;
    }

    const index = this.selectedDates.findIndex(d => isSameDay(d, date));
    if (index >= 0) {
      this.selectedDates.splice(index, 1);
    } else {
      this.selectedDates.push(new Date(date));
    }
  }

  openModal(date: Date) {
    this.modalDate = new Date(date);

    // Fetch the availability for the selected date from the backend
    const doctorId = this.authService.getDoctorId();
    if (doctorId) {
      this.scheduleService.getSchedule(doctorId.toString()).subscribe(
        (schedule: any) => {
          // Ensure schedule is an array before using .find()
          if (Array.isArray(schedule)) {
            const existingEntry = schedule.find((entry: { date: string; }) => entry.date === this.modalDate!.toISOString().split('T')[0]);

            // If an existing entry is found, update modalTimes with the available times
            this.modalTimes = existingEntry ? [...existingEntry.times] : [];

            // Log to verify the times
            console.log('Modal times:', this.modalTimes);
          } else {
            console.error('Invalid schedule format:', schedule);
            this.errorMessage = 'Failed to load schedule data.';
          }
          this.isModalOpen = true;
        },
        (error) => {
          console.error('Error fetching schedule:', error);
          this.errorMessage = 'Failed to load schedule';
        }
      );
    } else {
      console.error('Doctor ID is not available');
      this.errorMessage = 'Doctor is not logged in';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalDate = null;
    this.modalTimes = [];
    this.newTime = '';
  }

  addTime() {
    if (this.newTime && !this.modalTimes.includes(this.newTime)) {
      this.modalTimes.push(this.newTime);
      this.sortTimes();
      this.newTime = '';
    }
  }

  removeTime(time: string) {
    this.modalTimes = this.modalTimes.filter(t => t !== time);
  }

  saveSchedule(doctorId: string, date: string, timeSlots: string[]): Observable<any> {
    const payload = {
      doctor_id: doctorId,
      date: date,
      time_slot: timeSlots
    };
    
    const params = { action: 'saveSchedule' };
    return this.http.post<any>(this.apiUrl, payload, { params });
  }

  // Save selected date and time slots to the backend
  async saveAvailability() {
    if (!this.modalDate) return;
  
    try {
      if (this.modalTimes.length === 0) {
        throw new Error('Please add at least one time slot');
      }
  
      const formattedDate = this.modalDate.toISOString().split('T')[0];
      const doctorId = this.authService.getDoctorId();
      if (!doctorId) {
        this.errorMessage = 'Doctor is not logged in.';
        console.error('Error: Doctor is not logged in');
        return;
      }
  
      // Convert times to proper format before saving
      const formattedTimes = this.modalTimes.map(time => this.formatToAMPM(time));
  
      this.scheduleService.saveSchedule(doctorId.toString(), formattedDate, formattedTimes)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.successMessage = 'Schedule saved successfully!';
              console.log('Schedule saved successfully!');
  
              // Update the availability status after saving
              this.availability.push({
                date: this.modalDate!,
                times: formattedTimes
              });
  
              // Update availability status
              this.updateAvailabilityStatus(this.modalDate!);
              
              this.closeModal();
            } else {
              this.errorMessage = response.message || 'Failed to save schedule';
              console.error('Failed to save schedule:', response.message);
            }
          },
          error: (error) => {
            this.errorMessage = error.message || 'Error occurred while saving schedule';
            console.error('Error during save availability:', error);
          }
        });
  
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Error occurred';
      console.error('Error during save availability:', this.errorMessage);
    }
  }

  // Helper function to convert time to AM/PM format
  formatToAMPM(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 hours to 12
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amPm}`;
  }

  hasAvailability(date: Date): boolean {
    const dateKey = date.toISOString().split('T')[0];
    return !!this.availabilityStatus[dateKey];
  }

  getAvailabilityForDate(date: Date): string[] {
    const entry = this.availability.find(d => isSameDay(d.date, date));
    return entry ? entry.times : [];
  }

  validateTime(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }

  checkTimeConflict(newTime: string): boolean {
    return this.modalTimes.some(time => {
      const timeDiff = Math.abs(new Date(`1970-01-01T${newTime}:00`).getTime() -
                               new Date(`1970-01-01T${time}:00`).getTime());
      return timeDiff < 30 * 60 * 1000;
    });
  }

  toggleBulkMode() {
    this.isBulkMode = !this.isBulkMode;
    if (!this.isBulkMode) {
      this.bulkTimes = [];
    }
  }

  addBulkTime() {
    if (this.newTime && !this.bulkTimes.includes(this.newTime)) {
      this.bulkTimes.push(this.newTime);
      this.sortTimes();
      this.newTime = '';
    }
  }

  applyBulkAvailability() {
    if (this.bulkTimes.length > 0) {
      this.selectedDates.forEach(date => {
        const existingEntry = this.availability.find(entry => isSameDay(entry.date, date));
        if (existingEntry) {
          existingEntry.times = [...new Set([...existingEntry.times, ...this.bulkTimes])];
        } else {
          this.availability.push({ date: new Date(date), times: [...this.bulkTimes] });
        }
        this.updateAvailabilityStatus(date);
      });
      this.isBulkMode = false;
      this.bulkTimes = [];
    }
  }

  updateAvailabilityStatus(date: Date) {
    const dateKey = date.toISOString().split('T')[0];
    const entry = this.availability.find(d => isSameDay(d.date, date));
    this.availabilityStatus[dateKey] = !!entry && entry.times.length > 0;
  }

  removeBulkTime(time: string): void {
    const index = this.bulkTimes.indexOf(time);
    if (index > -1) {
      this.bulkTimes.splice(index, 1);
    }
  }

  selectDate(date: Date) {
    if (this.isPastDate(date)) {
      this.errorMessage = 'Cannot select past dates';
      return;
    }

    this.openSetAvailableTimeModal(date);
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  addPresetTime(time: string) {
    if (!this.modalTimes.includes(time)) {
      this.modalTimes.push(time);
      this.sortTimes();
    }
  }

  private sortTimes() {
    this.modalTimes.sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a}:00`).getTime();
      const timeB = new Date(`1970-01-01T${b}:00`).getTime();
      return timeA - timeB;
    });
  }

  openSetAvailableTimeModal(date: Date) {
    this.modalDate = new Date(date);
    this.isModalOpen = true;
  }

  async saveAvailableTimes() {
    if (!this.modalDate) return;

    try {
      const formattedDate = this.modalDate.toISOString().split('T')[0]; // "2025-01-30"
      const doctorId = this.authService.getDoctorId();
      if (!doctorId) {
        this.errorMessage = 'Doctor is not logged in.';
        console.error('Error: Doctor is not logged in');
        return;
      }

      const payload = {
        doctor_id: doctorId.toString(),
        date: formattedDate,
        time_slot: this.modalTimes // Assuming modalTimes contains the times to save
      };

      const response = await this.scheduleService.setAvailableSchedule(payload).toPromise();

      if (response.status) {
        this.successMessage = 'Available times set successfully!';
        console.log('Available times set successfully!');
      } else {
        this.errorMessage = 'Failed to set available times';
        console.error('Failed to set available times');
      }

      this.closeModal(); // Close the modal after saving
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Error occurred';
      console.error('Error during save available times:', this.errorMessage);
    }
  }
}

