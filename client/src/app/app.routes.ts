import { Routes } from '@angular/router';
import { roleGuard } from './core/role.guard';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { StudentDashboardComponent } from './pages/student-dashboard.component';
import { ApplicationFormComponent } from './pages/application-form.component';
import { ReviewComponent } from './pages/review.component';
import { StatusComponent } from './pages/status.component';
import { AdminQueueComponent } from './pages/admin-queue.component';
import { AdminDetailComponent } from './pages/admin-detail.component';
import { OversightComponent } from './pages/oversight.component';

// Guards are UX only — the Express API re-checks the role on every request.
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'student', component: StudentDashboardComponent, canActivate: [roleGuard('applicant')] },
  { path: 'student/apply', component: ApplicationFormComponent, canActivate: [roleGuard('applicant')] },
  { path: 'student/review', component: ReviewComponent, canActivate: [roleGuard('applicant')] },
  { path: 'student/status', component: StatusComponent, canActivate: [roleGuard('applicant')] },
  { path: 'admin', component: AdminQueueComponent, canActivate: [roleGuard('admin')] },
  { path: 'admin/applications/:id', component: AdminDetailComponent, canActivate: [roleGuard('admin')] },
  { path: 'dashboard', component: OversightComponent, canActivate: [roleGuard('admin', 'director')] },
  { path: '**', redirectTo: 'login' },
];
