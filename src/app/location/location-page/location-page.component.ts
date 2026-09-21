import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-location-page',
  template: `
    <ion-content>
      <iframe 
        [src]="mapUrl"
        width="100%" 
        height="100%" 
        style="border:0; margin: 0; padding: 0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-bottom: 0;
      --padding-end: 0;
      --padding-start: 0;
      --padding-top: 0;
    }
    iframe {
      display: block;
    }
  `],
  standalone: true,
  imports: [IonicModule],
})
export class LocationPageComponent {
  private sanitizer = inject(DomSanitizer);
  mapUrl: SafeResourceUrl;

  constructor() {
    // Se utiliza la URL embed de Google Maps con las coordenadas proporcionadas
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?q=14.0798187,-87.2180889&z=13&output=embed');
  }
}
