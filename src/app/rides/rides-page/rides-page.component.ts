import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cashOutline, carOutline, star, checkmarkCircle, checkmarkCircleOutline, documentTextOutline, gitNetworkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-rides-page',
  templateUrl: './rides-page.component.html',
  styleUrls: ['./rides-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RidesPageComponent {
  constructor() {
    addIcons({ cashOutline, carOutline, star, checkmarkCircle, checkmarkCircleOutline, documentTextOutline, gitNetworkOutline });
  }
}
