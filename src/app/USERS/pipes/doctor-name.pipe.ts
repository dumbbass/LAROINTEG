import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'doctorName',
  standalone: true
})
export class DoctorNamePipe implements PipeTransform {
  transform(doctors: any[], doctorId: string): string {
    if (!doctors || !doctorId) return '';
    const doctor = doctors.find(d => d.doctor_id === doctorId);
    return doctor ? `Dr. ${doctor.firstname} ${doctor.lastname}` : '';
  }
} 