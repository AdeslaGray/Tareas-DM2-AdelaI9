import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import * as CryptoJS from 'crypto-js';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
  providedIn: 'root',
})
export class RegisterService {
  private readonly apiUrl = 'https://ceutec-taxi-api-fucjaqfydahdcghf.centralus-01.azurewebsites.net/api/auth/register';
  private readonly secretKey = 'CEUTEC_TAXI_SECRET_KEY';

  constructor(private http: HttpClient) {}

  registerUser(data: RegisterPayload): Observable<any> {
    const apiPayload = {
      Email: data.email,
      Password: data.password,
      FirstName: data.firstName,
      LastName: data.lastName,
      NationalId: data.nationalId,
      Phone: data.phone,
      Address: data.address,
      ProfilePhoto: data.profilePhoto,
      Documents: data.documents.map((document) => ({
        Type: document.type,
        Url: document.url,
      })),
    };

    console.info('Payload de registro enviado:', {
      ...apiPayload,
      Password: '[oculta]',
    });

    return this.http.post<any>(this.apiUrl, apiPayload).pipe(
      tap(async (res) => {
        await Preferences.set({ key: 'userProfile', value: JSON.stringify(data) });

        if (res?.token) {
          await this.setEncryptedItem('token', res.token);
        }

        if (res?.userId || res?.id) {
          const userId = (res.userId || res.id).toString();
          await this.setEncryptedItem('userId', userId);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Respuesta de error del registro:', error.error ?? error.message);
        return throwError(() => error);
      }),
    );
  }

  async setEncryptedItem(key: string, value: string): Promise<void> {
    const encrypted = CryptoJS.AES.encrypt(value, this.secretKey).toString();
    await Preferences.set({ key, value: encrypted });
  }
}
