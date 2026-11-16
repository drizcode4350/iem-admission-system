import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Application, Course, STATUSES, badgeClass, courseName } from '../core/models';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, DatePipe],
  template: `
  <h1>Application queue</h1>
  <div class="stats">
    <div class="stat"><span class="muted">Total</span><b>{{ totals.total }}</b></div>
    <div class="stat"><span class="muted">Pending</span><b>{{ totals.pending }}</b></div>
    <div class="stat"><span class="muted">Accepted</span><b>{{ totals.accepted }}</b></div>
    <div class="stat"><span class="muted">Rejected</span><b>{{ totals.rejected }}</b></div>
  </div>
  <div class="card">
    <div class="grid">
      <div><label for="q">Search name or application no.</label><input id="q" [(ngModel)]="q" (keyup.enter)="go(1)" /></div>
      <div><label for="cs">Course</label><select id="cs" [(ngModel)]="courseId" (change)="go(1)"><option value="">All</option>
        @for (c of courses; track c._id) { <option [value]="c._id">{{ c.courseName }}</option> }</select></div>
      <div><label for="st">Status</label><select id="st" [(ngModel)]="status" (change)="go(1)"><option value="">All</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }</select></div>
    </div>
    <p><button class="btn ghost" (click)="go(1)">Search</button></p>
    @if (loading) { <p class="muted">Loading…</p> }
    @else if (!items.length) { <p class="muted">No applications match.</p> }
    @else {
      <table><thead><tr><th>App no.</th><th>Name</th><th>Course</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>
        @for (a of items; track a._id) {
          <tr><td>{{ a.applicationNo }}</td><td>{{ a.fullName }}</td><td>{{ cn(a.courseId) }}</td>
          <td><span [class]="badge(a.status)">{{ a.status }}</span></td><td>{{ a.submissionDate | date:'mediumDate' }}</td>
          <td><a class="btn ghost" [routerLink]="['/admin/applications', a._id]">View</a></td></tr>
        }
      </tbody></table>
      <p class="row"><button class="btn ghost" [disabled]="page<=1" (click)="go(page-1)">Prev</button>
        <span class="muted">Page {{ page }} of {{ pages }}</span>
        <button class="btn ghost" [disabled]="page>=pages" (click)="go(page+1)">Next</button></p>
    }
  </div>`,
})
export class AdminQueueComponent implements OnInit {
  private api = inject(ApiService);
  items: Application[] = []; courses: Course[] = []; statuses = STATUSES; badge = badgeClass; cn = courseName;
  q = ''; courseId = ''; status = ''; page = 1; pages = 1; loading = true;
  totals = { total: 0, pending: 0, accepted: 0, rejected: 0 };
  ngOnInit() {
    this.api.courses().subscribe((c) => (this.courses = c));
    this.api.summary().subscribe((s) => {
      const n = (k: string) => s.byStatus.find((x: any) => x.status === k)?.count || 0;
      this.totals = { total: s.total, accepted: n('Accepted'), rejected: n('Rejected'), pending: s.total - n('Accepted') - n('Rejected') };
    });
    this.go(1);
  }
  go(p: number) {
    this.loading = true;
    this.api.adminList({ q: this.q, courseId: this.courseId, status: this.status, page: p }).subscribe((r) => {
      this.items = r.items; this.page = r.page; this.pages = r.pages; this.loading = false;
    });
  }
}
