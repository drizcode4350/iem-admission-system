import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Application, Course } from '../core/models';

@Component({
  standalone: true, imports: [ReactiveFormsModule, RouterLink],
  template: `
  <h1>Application form</h1>
  @if (app?.locked) { <div class="alert">This application is submitted and locked. <a routerLink="/student/status">View status</a></div> }
  @else {
  <form [formGroup]="f" (ngSubmit)="save(false)">
    <div class="card"><h2>Personal details</h2>
      <div class="grid">
        <div><label for="fn">Full name</label><input id="fn" formControlName="fullName" />@if (err('fullName')) {<div class="err">{{ err('fullName') }}</div>}</div>
        <div><label for="dob">Date of birth</label><input id="dob" type="date" formControlName="dob" />@if (err('dob')) {<div class="err">{{ err('dob') }}</div>}</div>
        <div><label for="ph">Phone</label><input id="ph" formControlName="phone" placeholder="10-digit mobile" />@if (err('phone')) {<div class="err">{{ err('phone') }}</div>}</div>
      </div>
      <label for="ad">Address</label><textarea id="ad" rows="2" formControlName="address"></textarea>@if (err('address')) {<div class="err">{{ err('address') }}</div>}
    </div>
    <div class="card"><h2>Academic details & course</h2>
      <div class="grid">
        <div><label for="p10">10th %</label><input id="p10" type="number" formControlName="percent10" />@if (err('percent10')) {<div class="err">{{ err('percent10') }}</div>}</div>
        <div><label for="p12">12th %</label><input id="p12" type="number" formControlName="percent12" />@if (err('percent12')) {<div class="err">{{ err('percent12') }}</div>}</div>
        <div><label for="rk">IEMJEE rank</label><input id="rk" type="number" formControlName="iemjeeRank" />@if (err('iemjeeRank')) {<div class="err">{{ err('iemjeeRank') }}</div>}</div>
      </div>
      <label for="c">Course preference</label>
      <select id="c" formControlName="courseId"><option value="">Select a course</option>
        @for (c of courses; track c._id) { <option [value]="c._id">{{ c.courseName }} ({{ c.department }})</option> }
      </select>@if (err('courseId')) {<div class="err">{{ err('courseId') }}</div>}
    </div>
    <div class="card"><h2>Certificates (PDF only, max 5 MB each)</h2>
      @if (!app) { <p class="muted">Save the draft once to enable uploads.</p> }
      @else {
        <div class="drop" [class.over]="over" (click)="picker.click()" (dragover)="$event.preventDefault(); over=true"
             (dragleave)="over=false" (drop)="drop($event)">Drag & drop PDFs here or click to choose</div>
        <input #picker type="file" accept="application/pdf,.pdf" multiple hidden (change)="pick($event)" />
        @if (uploadErr) { <div class="alert">{{ uploadErr }}</div> }
        <table><tbody>
          @for (d of app.documents; track d._id) {
            <tr><td>{{ d.originalName }}</td><td class="muted">{{ (d.size/1024).toFixed(0) }} KB</td>
            <td class="row"><button type="button" class="btn ghost" (click)="api.openDoc(d._id)">View</button>
            <button type="button" class="btn ghost" (click)="remove(d._id)">Remove</button></td></tr>
          }
        </tbody></table>
      }
    </div>
    @if (msg) { <div class="alert" [class.success]="ok">{{ msg }}</div> }
    <p class="row">
      <button class="btn ghost" [disabled]="busy">Save draft</button>
      <button type="button" class="btn" [disabled]="busy" (click)="save(true)">Review application →</button>
    </p>
  </form>
  }`,
})
export class ApplicationFormComponent implements OnInit {
  api = inject(ApiService); private router = inject(Router);
  courses: Course[] = []; app: Application | null = null;
  errors: Record<string, string> = {}; msg = ''; ok = false; busy = false; over = false; uploadErr = '';
  f = inject(FormBuilder).group({
    fullName: ['', [Validators.minLength(3)]], dob: [''], phone: ['', Validators.pattern(/^[6-9]\d{9}$/)], address: [''],
    courseId: [''], percent10: [null as number | null, [Validators.min(0), Validators.max(100)]],
    percent12: [null as number | null, [Validators.min(0), Validators.max(100)]], iemjeeRank: [null as number | null, Validators.min(1)],
  });
  ngOnInit() {
    this.api.courses().subscribe((c) => (this.courses = c));
    this.api.mine().subscribe((a) => {
      this.app = a; if (!a) return;
      const cid = a.courseId && typeof a.courseId === 'object' ? a.courseId._id : (a.courseId as string) || '';
      this.f.patchValue({ ...a, courseId: cid, dob: a.dob ? a.dob.slice(0, 10) : '' } as any);
    });
  }
  err(k: string) {
    if (this.errors[k]) return this.errors[k];
    const c = this.f.get(k)!; if (!c.invalid || !c.touched) return '';
    return c.errors?.['pattern'] ? 'Invalid format' : c.errors?.['minlength'] ? 'Too short' : 'Invalid value';
  }
  save(next: boolean) {
    this.f.markAllAsTouched(); this.errors = {}; this.msg = '';
    if (this.f.invalid) { this.msg = 'Please fix the highlighted fields'; this.ok = false; return; }
    this.busy = true;
    const body = this.f.getRawValue();
    const req = this.app ? this.api.update(this.app._id, body) : this.api.create(body);
    req.subscribe({
      next: (a) => { this.app = { ...a, courseId: a.courseId }; this.busy = false; this.ok = true; this.msg = 'Draft saved';
        if (next) this.router.navigateByUrl('/student/review'); },
      error: (e) => { this.busy = false; this.ok = false; this.errors = e.error?.errors || {}; this.msg = e.error?.message || 'Save failed'; },
    });
  }
  drop(e: DragEvent) { e.preventDefault(); this.over = false; this.uploadFiles(Array.from(e.dataTransfer?.files || [])); }
  pick(e: Event) { const i = e.target as HTMLInputElement; this.uploadFiles(Array.from(i.files || [])); i.value = ''; }
  uploadFiles(files: File[]) {
    this.uploadErr = '';
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) { this.uploadErr = `${file.name}: only PDF files are allowed`; continue; }
      if (file.size > 5 * 1024 * 1024) { this.uploadErr = `${file.name}: larger than 5 MB`; continue; }
      this.api.upload(this.app!._id, file).subscribe({ next: (a) => (this.app = a), error: (e) => (this.uploadErr = e.error?.message || 'Upload failed') });
    }
  }
  remove(docId: string) { this.api.removeDoc(this.app!._id, docId).subscribe((a) => (this.app = a)); }
}
