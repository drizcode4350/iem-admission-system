import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Application, badgeClass, courseName } from '../core/models';

@Component({
  standalone: true, imports: [RouterLink, DatePipe],
  template: `
  <h1>Welcome, {{ auth.user()?.fullName }}</h1>
  @if (loading) { <p class="muted">Loading…</p> }
  @else if (!app) {
    <div class="card"><h2>No application yet</h2>
      <p class="muted">Start your application: personal details, academics, course preference and PDF certificates.</p>
      <a class="btn" routerLink="/student/apply">Start application</a></div>
  } @else {
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>{{ app.applicationNo || 'Draft application' }}</h2><span [class]="badge(app.status)">{{ app.status }}</span>
      </div>
      <dl>
        <dt>Course</dt><dd>{{ course(app.courseId) }}</dd>
        <dt>Personal details</dt><dd>{{ app.fullName && app.dob && app.phone && app.address ? 'Complete' : 'Incomplete' }}</dd>
        <dt>Academic details</dt><dd>{{ app.percent10 != null && app.percent12 != null && app.iemjeeRank ? 'Complete' : 'Incomplete' }}</dd>
        <dt>Documents</dt><dd>{{ app.documents.length }} uploaded</dd>
        @if (app.submissionDate) { <dt>Submitted</dt><dd>{{ app.submissionDate | date:'medium' }}</dd> }
      </dl>
      <p class="row" style="margin-top:16px">
        @if (!app.locked) { <a class="btn" routerLink="/student/apply">Continue editing</a> <a class="btn ghost" routerLink="/student/review">Review & submit</a> }
        <a class="btn ghost" routerLink="/student/status">Track application status</a>
      </p>
    </div>
    @if (app.documents.length) {
      <div class="card"><h2>My files</h2>
        <table><tbody>
          @for (d of app.documents; track d._id) {
            <tr><td>{{ d.originalName }}</td><td class="muted">{{ (d.size/1024).toFixed(0) }} KB</td>
            <td><button class="btn ghost" (click)="api.openDoc(d._id)">View / download</button></td></tr>
          }
        </tbody></table></div>
    }
  }`,
})
export class StudentDashboardComponent implements OnInit {
  api = inject(ApiService); auth = inject(AuthService);
  app: Application | null = null; loading = true; badge = badgeClass; course = courseName;
  ngOnInit() { this.api.mine().subscribe((a) => { this.app = a; this.loading = false; }); }
}
