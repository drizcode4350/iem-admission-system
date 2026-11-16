import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Application, STAGES, badgeClass } from '../core/models';

@Component({
  standalone: true, imports: [DatePipe, RouterLink],
  template: `
  <h1>Application status</h1>
  @if (!app) { <p class="muted">No application yet. <a routerLink="/student/apply">Start one</a></p> }
  @else {
    <div class="card">
      <div class="row" style="justify-content:space-between"><h2>{{ app.applicationNo || 'Draft' }}</h2>
        <span [class]="badge(app.status)">{{ app.status }}</span></div>
      <ul class="timeline">
        @for (s of stages(); track s) { <li [class.done]="reached(s)"><b>{{ s }}</b>
          @if (when(s)) { <span class="muted"> · {{ when(s) | date:'medium' }}</span> }</li> }
      </ul>
      @if (app.remarks) { <p><span class="muted">Remarks:</span> {{ app.remarks }}</p> }
    </div>
    <div class="card"><h2>Uploaded documents</h2>
      @for (d of app.documents; track d._id) {
        <div class="row" style="justify-content:space-between;padding:6px 0"><span>{{ d.originalName }}</span>
        <button class="btn ghost" (click)="api.openDoc(d._id)">Download</button></div>
      } @empty { <p class="muted">None</p> }
    </div>
    <button class="btn ghost" (click)="load()">Refresh</button>
  }`,
})
export class StatusComponent implements OnInit {
  api = inject(ApiService); app: Application | null = null; badge = badgeClass;
  ngOnInit() { this.load(); }
  load() { this.api.mine().subscribe((a) => (this.app = a)); }
  stages() {
  return this.app?.status === 'Rejected'
    ? [...STAGES, 'Rejected']
    : STAGES;
}
  reached(s: string) { return s === 'Draft' || s === this.app?.status || !!this.app?.statusHistory.some((h) => h.to === s); }
  when(s: string) { return this.app?.statusHistory.find((h) => h.to === s)?.changedAt; }
}
