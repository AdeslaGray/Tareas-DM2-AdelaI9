import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  private readonly apiUrl = 'https://ceutec-taxi-api-fucjaqfydahdcghf.centralus-01.azurewebsites.net/api/user/fcm-token';
  private initialized = false;

  constructor(private http: HttpClient) {}

  async initPushNotifications(): Promise<void> {
    if (this.initialized || Capacitor.getPlatform() === 'web') {
      return;
    }

    this.initialized = true;
    const listeners = await Promise.all([
      PushNotifications.addListener('registration', (token: Token) => {
        this.sendTokenToBackend(token.value);
      }),
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida en foreground:', notification);
      }),
    ]);

    try {
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt') {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      this.initialized = false;
      await Promise.all(listeners.map((listener) => listener.remove()));
      console.error('No se pudieron inicializar las notificaciones push:', error);
    }
  }

  private sendTokenToBackend(fcmToken: string): void {
    const payload = {
      fcmToken,
      device: Capacitor.getPlatform(),
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => console.log('Token de FCM registrado exitosamente en la API'),
      error: (error) => console.error('Error al enviar el token de FCM al servidor:', error),
    });
  }
}
