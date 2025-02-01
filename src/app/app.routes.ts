import { Routes } from '@angular/router';
import { RegisterComponent } from './USERS/register/register.component';
import { LoginComponent } from './login/login.component';
import { SidenavComponent } from './USERS/sidenav/sidenav.component';
import { PatientComponent } from './ADMIN/patient/patient.component';
import { AdmindashboardComponent } from './ADMIN/admindashboard/admindashboard.component';
import { ScheduleComponent } from './ADMIN/schedule/schedule.component';
import { UserprofileComponent } from './USERS/userprofile/userprofile.component';
import { UserdashboardComponent } from './USERS/userdashboard/userdashboard.component';
import { UserappointmentsComponent } from './USERS/userappointments/userappointments.component';
import { DashboardComponent } from './USERS/dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';

import { InformationComponent } from './ADMIN/information/information.component';
import { ArchiveComponent } from './ADMIN/archive/archive.component';
import { AppointmentsComponent } from './ADMIN/appointments/appointments.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sidenav', component: SidenavComponent },
  { path: 'patient', component: PatientComponent },
  { path: 'admindashboard', component: AdmindashboardComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'userprofile', component: UserprofileComponent },
  { path: 'userdashboard', component: UserdashboardComponent },
  { path: 'userappointments', component: UserappointmentsComponent },
  { path: 'information', component: InformationComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }, // Placeholder route
];
