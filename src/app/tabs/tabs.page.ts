import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { carOutline, locationOutline, personOutline } from 'ionicons/icons';
import { FcmService } from '../services/fcm.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage implements OnInit {
  private readonly fcmService = inject(FcmService);

  constructor() {
    addIcons({ carOutline, locationOutline, personOutline });
  }

  ngOnInit(): void {
    void this.fcmService.initPushNotifications();
  }
}
