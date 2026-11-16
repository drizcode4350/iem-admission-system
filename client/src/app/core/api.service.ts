// Every call here is step 1 of the request-response loop: Angular → HTTP → Express.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Application, Course, User } from './models';

export const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  register(body: any) { return this.http.post<{ token: string; user: User }>(`${API}/auth/register`, body); }
  login(body: any) { return this.http.post<{ token: string; user: User }>(`${API}/auth/login`, body); }
  courses() { return this.http.get<Course[]>(`${API}/courses`); }
  mine() { return this.http.get<Application | null>(`${API}/applications/mine`); }
  create(body: any) { return this.http.post<Application>(`${API}/applications`, body); }
  update(id: string, body: any) { return this.http.put<Application>(`${API}/applications/${id}`, body); }
  upload(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<Application>(`${API}/applications/${id}/documents`, fd);
  }
  removeDoc(id: string, docId: string) { return this.http.delete<Application>(`${API}/applications/${id}/documents/${docId}`); }
  submit(id: string) { return this.http.post<Application>(`${API}/applications/${id}/submit`, {}); }
  // Authenticated download (FR-16): fetch as blob with the JWT, then open locally.
  openDoc(docId: string) {
    this.http.get(`${API}/documents/${docId}`, { responseType: 'blob' }).subscribe((b) => window.open(URL.createObjectURL(b), '_blank'));
  }
  adminList(q: Record<string, string | number>) {
    let p = new HttpParams(); Object.entries(q).forEach(([k, v]) => { if (v !== '' && v != null) p = p.set(k, String(v)); });
    return this.http.get<{ items: Application[]; total: number; page: number; pages: number }>(`${API}/admin/applications`, { params: p });
  }
  adminGet(id: string) { return this.http.get<Application>(`${API}/admin/applications/${id}`); }
  setStatus(id: string, status: string, remarks: string) { return this.http.patch<Application>(`${API}/admin/applications/${id}/status`, { status, remarks }); }
  summary() { return this.http.get<any>(`${API}/dashboard/summary`); }
}
