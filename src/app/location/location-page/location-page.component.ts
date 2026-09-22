import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  navigate,
  location,
} from 'ionicons/icons';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-location-page',
  templateUrl: './location-page.component.html',
  styleUrls: ['./location-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class LocationPageComponent implements OnInit, AfterViewInit, OnDestroy {
  map: GoogleMap | null = null;
  isLoading = true;
  currentPosition: Position | null = null;
  earnings = 'L. 1,450';
  isAvailable = true;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      navigate,
      location,
    });
  }

  async ngOnInit() {
    await this.initializeGeolocation();
  }

  async ngAfterViewInit() {
    await this.createMap();
  }

  async initializeGeolocation() {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissionStatus = await Geolocation.checkPermissions();
        
        if (permissionStatus.location !== 'granted') {
          const requestStatus = await Geolocation.requestPermissions();
          if (requestStatus.location !== 'granted') {
            this.showToast('Se requiere permiso de ubicación para mostrar el mapa');
            return;
          }
        }
      }

      this.currentPosition = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      this.showToast('No se pudo obtener la ubicación actual');
    }
  }

  async createMap() {
    try {
      if (!this.mapContainer) {
        console.error('Map container not found');
        return;
      }

      const apiKey = environment.GOOGLE_MAPS_API_KEY;
      
      if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        this.showToast('Por favor configura tu API Key de Google Maps');
        this.isLoading = false;
        return;
      }

      this.map = await GoogleMap.create({
        id: 'location-map',
        element: this.mapContainer.nativeElement,
        apiKey: apiKey,
        config: {
          center: {
            lat: this.currentPosition?.coords.latitude || 14.08, // Default to Tegucigalpa
            lng: this.currentPosition?.coords.longitude || -87.17,
          },
          zoom: 15,
        },
      });

      if (this.currentPosition) {
        await this.addCurrentLocationMarker();
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error creating map:', error);
      this.showToast('Error al cargar el mapa');
      this.isLoading = false;
    }
  }

  async addCurrentLocationMarker() {
    if (!this.map || !this.currentPosition) return;

    try {
      await this.map.addMarker({
        coordinate: {
          lat: this.currentPosition.coords.latitude,
          lng: this.currentPosition.coords.longitude,
        },
        title: 'Tu ubicación',
        snippet: 'Ubicación actual',
      });
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  }

  async centerOnCurrentLocation() {
    if (!this.map || !this.currentPosition) return;

    try {
      await this.map.setCamera({
        coordinate: {
          lat: this.currentPosition.coords.latitude,
          lng: this.currentPosition.coords.longitude,
        },
        zoom: 15,
      });
    } catch (error) {
      console.error('Error centering map:', error);
    }
  }

  toggleAvailability() {
    this.isAvailable = !this.isAvailable;
    const status = this.isAvailable ? 'Disponible' : 'No disponible';
    this.showToast(`Estado: ${status}`);
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.destroy().catch(error => console.error('Error destroying map:', error));
    }
  }
}
