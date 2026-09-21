import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  address: string;
  profilePhoto: string;
  documents: {
    type: string;
    url: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'https://ceutec-taxi-api-fucjaqfydahdcghf.centralus-01.azurewebsites.net/api/auth/register';

  constructor(private http: HttpClient) {}

  registerUser(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
