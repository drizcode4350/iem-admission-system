import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Application, Course } from '../core/models';

@Component({
  standalone: true, imports: [RouterLink, DatePipe],
  template: `
  <h1>Review & confirm</h1>
  @if (done && app) {
    <div class="card"><h2>Application submitted</h2>
      <p>Your application number is <b>{{ app.applicationNo }}</b>. It is now locked for review.</p>
      <a class="btn" routerLink="/student/status">Track status</a></div>
  } @else if (app) {
    <div class="card"><div class="row" style="justify-content:space-between"><h2>Personal details</h2><a routerLink="/student/apply">Edit</a></div>
      <dl><dt>Full name</dt><dd>{{ app.fullName || '—' }}</dd><dt>Date of birth</dt><dd>{{ app.dob ? (app.dob | date) : '—' }}</dd>
      <dt>Phone</dt><dd>{{ app.phone || '—' }}</dd><dt>Address</dt><dd>{{ app.address || '—' }}</dd></dl></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h2>Academics & course</h2><a routerLink="/student/apply">Edit</a></div>
      <dl><dt>10th %</dt><dd>{{ app.percent10 ?? '—' }}</dd><dt>12th %</dt><dd>{{ app.percent12 ?? '—' }}</dd>
      <dt>IEMJEE rank</dt><dd>{{ app.iemjeeRank ?? '—' }}</dd><dt>Course</dt><dd>{{ cname() }}</dd></dl></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h2>Documents</h2><a routerLink="/student/apply">Edit</a></div>
      @for (d of app.documents; track d._id) { <div>{{ d.originalName }}</div> } @empty { <p class="muted">No files uploaded</p> }</div>
    @if (error) { <div class="alert">{{ error }}
      @for (e of errList; track e) { <div>• {{ e }}</div> }</div> }
    @if (!app.locked) { <button class="btn" [disabled]="busy" (click)="submit()">Confirm & submit</button>
      <p class="muted">After submission your application cannot be edited.</p> }
    @else { <p class="muted">Already submitted.</p> }
  } @else { <p class="muted">Loading…</p> }`,
})
export class ReviewComponent implements OnInit {
  private api = inject(ApiService);
  app: Application | null = null; done = false; busy = false; error = ''; errList: string[] = [];
  ngOnInit() { this.api.mine().subscribe((a) => (this.app = a)); }
  cname() { const c = this.app?.courseId as Course | null; return c && typeof c === 'object' ? c.courseName : '—'; }
  submit() {
    this.busy = true; this.error = '';
    this.api.submit(this.app!._id).subscribe({
      next: (a) => { this.app = a; this.done = true; },
      error: (e) => { this.busy = false; this.error = e.error?.message || 'Submission failed'; this.errList = Object.values(e.error?.errors || {}); },
    });
  }
}
