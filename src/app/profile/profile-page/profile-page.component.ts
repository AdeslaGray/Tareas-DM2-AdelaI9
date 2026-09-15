import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-page',
  template: `<ion-header><ion-toolbar><ion-title>Perfil</ion-title></ion-toolbar></ion-header><ion-content class="ion-padding"><h1>Pantalla de Perfil</h1></ion-content>`,
  standalone: true,
  imports: [IonicModule],
})
export class ProfilePageComponent {}
