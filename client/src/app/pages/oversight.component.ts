import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { badgeClass } from '../core/models';

// Read-only (FR-33): no controls that change data.
@Component({
  standalone: true,
  template: `
  <h1>Oversight dashboard</h1>
  @if (!s) { <p class="muted">Loading…</p> } @else {
    <div class="stats"><div class="stat"><span class="muted">Total applications</span><b>{{ s.total }}</b></div>
      @for (x of s.byStatus; track x.status) { <div class="stat"><span [class]="badge(x.status)">{{ x.status }}</span><b>{{ x.count }}</b></div> }</div>
    <div class="card"><h2>By course</h2>
      @for (c of s.byCourse; track c.course) {
        <div style="margin:10px 0"><div class="row" style="justify-content:space-between"><span>{{ c.course }}</span><b>{{ c.count }}</b></div>
        <div class="bar" [style.width.%]="s.total ? c.count / s.total * 100 : 0"></div></div>
      } @empty { <p class="muted">No submitted applications yet.</p> }</div>
    <div class="card"><h2>By department & status</h2>
      <table><thead><tr><th>Department</th><th>Status</th><th>Count</th></tr></thead><tbody>
        @for (r of s.byDepartmentStatus; track $index) { <tr><td>{{ r.department }}</td><td>{{ r.status }}</td><td>{{ r.count }}</td></tr> }
      </tbody></table>
      <p class="muted">Computed server-side with a MongoDB aggregation pipeline ($match, $group, $lookup).</p></div>
  }`,
})
export class OversightComponent implements OnInit {
  private api = inject(ApiService); s: any = null; badge = badgeClass;
  ngOnInit() { this.api.summary().subscribe((r) => (this.s = r)); }
}
