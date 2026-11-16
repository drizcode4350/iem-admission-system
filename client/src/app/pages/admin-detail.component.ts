import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Application, badgeClass, courseName } from '../core/models';

@Component({
  standalone: true, imports: [FormsModule, DatePipe, RouterLink],
  template: `
  <p><a routerLink="/admin">← Back to queue</a></p>
  @if (error && !app) { <div class="alert">{{ error }}</div> }
  @if (app) {
    <div class="row" style="justify-content:space-between"><h1>{{ app.applicationNo }} · {{ app.fullName }}</h1>
      <span [class]="badge(app.status)">{{ app.status }}</span></div>
    <div class="card"><h2>Application</h2><dl>
      <dt>Date of birth</dt><dd>{{ app.dob | date }}</dd><dt>Phone</dt><dd>{{ app.phone }}</dd>
      <dt>Address</dt><dd>{{ app.address }}</dd><dt>Course</dt><dd>{{ cn(app.courseId) }}</dd>
      <dt>10th %</dt><dd>{{ app.percent10 }}</dd><dt>12th %</dt><dd>{{ app.percent12 }}</dd>
      <dt>IEMJEE rank</dt><dd>{{ app.iemjeeRank }}</dd><dt>Submitted</dt><dd>{{ app.submissionDate | date:'medium' }}</dd>
    </dl></div>
    <div class="card"><h2>Documents</h2>
      @for (d of app.documents; track d._id) {
        <div class="row" style="justify-content:space-between;padding:6px 0"><span>{{ d.originalName }}</span>
        <button class="btn ghost" (click)="api.openDoc(d._id)">Preview</button></div>
      }</div>
    <div class="card"><h2>Change status</h2>
      @if (!app.allowedNext?.length) { <p class="muted">{{ app.status }} is a final state. No further changes allowed.</p> }
      @else {
        <label for="ns">Next status</label>
        <select id="ns" [(ngModel)]="next"><option value="">Select…</option>
          @for (s of app.allowedNext; track s) { <option [value]="s">{{ s }}</option> }</select>
        <label for="rm">Remarks (optional)</label><textarea id="rm" rows="2" [(ngModel)]="remarks"></textarea>
        @if (error) { <div class="alert">{{ error }}</div> }
        <p><button class="btn" [disabled]="!next || busy" (click)="change()">Update status</button></p>
      }
    </div>
    <div class="card"><h2>History</h2>
      <table><thead><tr><th>From</th><th>To</th><th>By</th><th>When</th><th>Remarks</th></tr></thead><tbody>
        @for (h of app.statusHistory; track $index) {
          <tr><td>{{ h.from }}</td><td>{{ h.to }}</td><td>{{ by(h.changedBy) }}</td><td>{{ h.changedAt | date:'short' }}</td><td>{{ h.remarks }}</td></tr>
        }</tbody></table></div>
  }`,
})
export class AdminDetailComponent implements OnInit {
  api = inject(ApiService); private route = inject(ActivatedRoute);
  app: Application | null = null; next = ''; remarks = ''; error = ''; busy = false; badge = badgeClass; cn = courseName;
  ngOnInit() { this.api.adminGet(this.route.snapshot.paramMap.get('id')!).subscribe({ next: (a) => (this.app = a), error: (e) => (this.error = e.error?.message || 'Not found') }); }
  by(b: any) { return b && typeof b === 'object' ? b.fullName : b ? 'Admin' : 'Applicant'; }
  change() {
    this.busy = true; this.error = '';
    this.api.setStatus(this.app!._id, this.next, this.remarks).subscribe({
      next: () => { this.next = ''; this.remarks = ''; this.busy = false; this.ngOnInit(); },
      error: (e) => { this.busy = false; this.error = e.error?.message || 'Update failed'; },
    });
  }
}
