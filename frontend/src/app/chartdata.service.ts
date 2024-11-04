import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartdataService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getPatientStateData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patient-states`);
  }

  getGenderAgeData(state: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patients-by-gender-age?state=${state}`);
  }
}