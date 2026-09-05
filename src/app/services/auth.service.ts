import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import * as CryptoJS from 'crypto-js';
import { Observable, from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  data?: {
    accessToken: string;
    accessTokenExpiry?: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth/login';
  private secretKey = 'CEUTEC_TAXI_SECRET_KEY';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl, credentials).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      concatMap((response) => from(this.storeLoginData(response)).pipe(map(() => response))),
    );
  }

  private normalizeLoginResponse(response: LoginResponse): LoginResponse {
    const token = response.token || response.data?.accessToken;
    const userId = response.userId || this.getUserIdFromToken(token);

    if (!token || !userId) {
      throw new Error('La respuesta de autenticación no contiene los datos esperados.');
    }

    return { ...response, token, userId };
  }

  private async storeLoginData(response: LoginResponse): Promise<void> {
    await this.setEncryptedItem('token', response.token);
    await this.setEncryptedItem('userId', response.userId.toString());
  }

  private getUserIdFromToken(token: string | undefined): string | null {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload)) as { sub?: string };
      return decodedPayload.sub || null;
    } catch {
      return null;
    }
  }

  async setEncryptedItem(key: string, value: string): Promise<void> {
    const encryptedValue = CryptoJS.AES.encrypt(value, this.secretKey).toString();
    await Preferences.set({ key, value: encryptedValue });
  }

  async getDecryptedItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    if (!value) {
      return null;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getDecryptedItem('token');
    return !!token;
  }

  async logout(): Promise<void> {
    await Preferences.clear();
  }
}
