import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import * as CryptoJS from 'crypto-js';
import { Observable, from, throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

interface LocalAccount {
  userId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Address?: string;
  NationalId?: string;
  Documents?: string;
  ProfilePhoto?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  token?: string;
  firstName?: string;
  lastName?: string;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Address?: string;
  NationalId?: string;
  Documents?: string;
  ProfilePhoto?: string;
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
  private directApiUrl = 'https://ceutec-taxi-api-fucjaqfydahdcghf.centralus-01.azurewebsites.net/api/auth/login';
  private registerUrl = '/api/auth/register';
  private secretKey = 'CEUTEC_TAXI_SECRET_KEY';
  private localAccountsKey = 'taxi_driver_local_accounts';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl, credentials).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      concatMap((response) => from(this.storeLoginData(response)).pipe(map(() => response))),
      catchError((error) => from(this.tryLocalLogin(credentials)).pipe(map((response) => response))),
    );
  }

  loginEndpoint(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.directApiUrl, credentials).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      concatMap((response) => from(this.storeLoginData(response)).pipe(map(() => response))),
      catchError((error) => from(this.tryLocalLogin(credentials)).pipe(map((response) => response))),
    );
  }

  register(credentials: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.registerUrl, credentials).pipe(
      catchError((error) => from(this.tryLocalRegister(credentials)).pipe(map((response) => response))),
    );
  }

  registerEndpoint(credentials: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.registerUrl, credentials).pipe(
      catchError((error) => from(this.tryLocalRegister(credentials)).pipe(map((response) => response))),
    );
  }

  private async tryLocalLogin(credentials: LoginRequest): Promise<LoginResponse> {
    const accounts = await this.getLocalAccounts();
    const account = accounts.find((item) => item.email.toLowerCase() === credentials.email.toLowerCase() && item.password === credentials.password);

    if (!account) {
      throw new Error('Credenciales inválidas.');
    }

    const response: LoginResponse = {
      token: this.generateToken(account.userId),
      userId: account.userId,
      data: { accessToken: this.generateToken(account.userId) },
      email: account.email,
      user: {
        firstName: account.firstName || account.FirstName || '',
        lastName: account.lastName || account.LastName || '',
      },
    };

    await this.storeLoginData(response);
    return response;
  }

  private async tryLocalRegister(credentials: RegisterRequest): Promise<LoginResponse> {
    const email = (credentials.email || '').trim().toLowerCase();
    if (!email) {
      throw new Error('El correo es requerido.');
    }

    const accounts = await this.getLocalAccounts();
    const alreadyExists = accounts.some((item) => item.email.toLowerCase() === email);

    if (alreadyExists) {
      throw new Error('Este correo ya está registrado en la app.');
    }

    const cleanPassword = credentials.password || '';
    if (!cleanPassword || cleanPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres.');
    }

    const newAccount: LocalAccount = {
      userId: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      email,
      password: cleanPassword,
      firstName: credentials.FirstName || credentials.firstName,
      lastName: credentials.LastName || credentials.lastName,
      FirstName: credentials.FirstName || credentials.firstName,
      LastName: credentials.LastName || credentials.lastName,
      Phone: credentials.Phone,
      Address: credentials.Address,
      NationalId: credentials.NationalId,
      Documents: credentials.Documents,
      ProfilePhoto: credentials.ProfilePhoto,
    };

    accounts.push(newAccount);
    await Preferences.set({ key: this.localAccountsKey, value: JSON.stringify(accounts) });

    const response: LoginResponse = {
      token: this.generateToken(newAccount.userId),
      userId: newAccount.userId,
      data: { accessToken: this.generateToken(newAccount.userId) },
      email: newAccount.email,
      user: {
        firstName: newAccount.firstName || '',
        lastName: newAccount.lastName || '',
      },
    };

    await this.storeLoginData(response);
    return response;
  }

  private async getLocalAccounts(): Promise<LocalAccount[]> {
    const { value } = await Preferences.get({ key: this.localAccountsKey });

    if (!value) {
      return [];
    }

    try {
      return JSON.parse(value) as LocalAccount[];
    } catch {
      return [];
    }
  }

  private generateToken(userId: string): string {
    return `local-token-${userId}-${Date.now()}`;
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
