import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-location-page',
  template: `<ion-header><ion-toolbar><ion-title>Ubicación</ion-title></ion-toolbar></ion-header><ion-content class="ion-padding"><h1>Pantalla de Ubicación</h1></ion-content>`,
  standalone: true,
  imports: [IonicModule],
})
export class LocationPageComponent {}
