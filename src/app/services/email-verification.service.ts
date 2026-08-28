import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendTokenRequest {
  email: string;
}

export interface VerifyTokenRequest {
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private baseUrl = '/api/EmailVerification';

  constructor(private http: HttpClient) {}

  sendToken(email: string): Observable<any> {
    const body: SendTokenRequest = { email };
    return this.http.post(`${this.baseUrl}/send-token`, body);
  }

  verifyToken(email: string, token: string): Observable<any> {
    const body: VerifyTokenRequest = { email, token };
    return this.http.post(`${this.baseUrl}/verify-token`, body);
  }
}