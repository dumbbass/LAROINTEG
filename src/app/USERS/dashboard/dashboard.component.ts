import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SidenavComponent } from '../sidenav/sidenav.component';

Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    imports: [SidenavComponent, CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  chart: Chart | null = null;
  showModal: boolean = false;

  // Updated modalData to include pastHistory
  modalData = {
    doctor: '',
    date: '',
    activity: '',
    description: '',
    pastHistory: {
      medicalHistory: '',
      surgicalHistory: '',
      medications: '',
      allergies: '',
      injuriesAndAccidents: '',
      specialNeeds: '',
      bloodTransfusion: '',
    },
  };

  greetingMessage: string = ''; // Holds the greeting message
  patientName: string = 'John Doe'; // Replace with dynamic data as needed

  ngOnInit(): void {
    this.setGreetingMessage();
  }

  ngAfterViewInit(): void {
    const canvas = document.getElementById('medicalReportsChart') as HTMLCanvasElement;

    if (canvas) {
      this.initializeChart('monthly');
    } else {
      console.error('Canvas element not found!');
    }
  }

  setGreetingMessage(): void {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (currentHour < 18) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }
  }

  onFilterChange(event: Event): void {
    const filter = (event.target as HTMLSelectElement).value;
    this.updateChart(filter);
  }

  initializeChart(filter: string): void {
    const ctx = document.getElementById('medicalReportsChart') as HTMLCanvasElement;

    if (ctx) {
      const data = this.getFilteredData(filter);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Appointments',
              data: data.values,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }

  updateChart(filter: string): void {
    if (this.chart) {
      const data = this.getFilteredData(filter);
      this.chart.data.labels = data.labels;
      this.chart.data.datasets[0].data = data.values;
      this.chart.update();
    }
  }

  getFilteredData(filter: string): { labels: string[]; values: number[] } {
    switch (filter) {
      case 'daily':
        return {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          values: [5, 10, 8, 6, 9, 12, 4],
        };
      case 'weekly':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [30, 45, 50, 60],
        };
      case 'monthly':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          values: [120, 150, 180, 200, 250, 300, 270, 260, 280, 300, 320, 350],
        };
      case 'yearly':
        return {
          labels: ['2020', '2021', '2022', '2023', '2024'],
          values: [1200, 1500, 1800, 2000, 2200],
        };
      default:
        return { labels: [], values: [] };
    }
  }

  openModal(doctor: string, date: string, activity: string, description: string): void {
    this.modalData = {
      doctor,
      date,
      activity,
      description,
      pastHistory: {
        medicalHistory: 'Hypertension, Diabetes',
        surgicalHistory: 'Appendectomy (2018)',
        medications: 'Metformin, Lisinopril',
        allergies: 'Penicillin, Pollen',
        injuriesAndAccidents: 'Fractured left arm (2020)',
        specialNeeds: 'Requires wheelchair accessibility',
        bloodTransfusion: 'Received blood transfusion in 2022',
      },
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}
