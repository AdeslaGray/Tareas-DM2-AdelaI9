import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, carOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
})
export class WelcomePage {
  constructor() {
    addIcons({ arrowForwardOutline, carOutline, shieldCheckmarkOutline });
  }
}
