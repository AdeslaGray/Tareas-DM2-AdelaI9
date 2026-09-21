import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  carOutline,
  star,
  checkmarkCircle,
  checkmarkCircleOutline,
  documentTextOutline,
  gitNetworkOutline,
  sparklesOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-rides-page',
  templateUrl: './rides-page.component.html',
  styleUrls: ['./rides-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RidesPageComponent implements OnInit {
  showYujjuBanner = true;

  constructor(private toastCtrl: ToastController) {
    addIcons({
      cashOutline,
      carOutline,
      star,
      checkmarkCircle,
      checkmarkCircleOutline,
      documentTextOutline,
      gitNetworkOutline,
      sparklesOutline,
    });
  }

  async ngOnInit() {
    const toast = await this.toastCtrl.create({
      message: '🎉 ¡Yujjuu! Bienvenida de nuevo a Taxi Driver App',
      duration: 2500,
      position: 'top',
      color: 'success',
      cssClass: 'yujju-toast',
    });

    await toast.present();

    setTimeout(() => {
      this.showYujjuBanner = false;
    }, 4500);
  }
}
