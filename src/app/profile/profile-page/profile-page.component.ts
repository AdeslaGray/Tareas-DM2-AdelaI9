import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { addIcons } from 'ionicons';
import {
  cardOutline,
  cameraOutline,
  checkmarkCircle,
  locationOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  peopleOutline,
  personOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class ProfilePageComponent implements OnInit {
  profileForm!: FormGroup;
  userProfileImage = 'https://ui-avatars.com/api/?name=Usuario&background=6ebd45&color=fff&size=220';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private router: Router,
    private cloudinaryService: CloudinaryService,
  ) {
    addIcons({ cardOutline, cameraOutline, checkmarkCircle, locationOutline, lockClosedOutline, logOutOutline, mailOutline, peopleOutline, personOutline, phonePortraitOutline });
  }

  async ngOnInit(): Promise<void> {
    this.profileForm = this.fb.group({
      firstName: ['Usuario', [Validators.required, Validators.minLength(2)]],
      lastName: ['Conductor', [Validators.required, Validators.minLength(2)]],
      nationalId: [{ value: '0501199700232', disabled: true }, Validators.required],
      phone: [{ value: '32323232', disabled: true }, Validators.required],
      email: [{ value: 'abdgfx@gmail.com', disabled: true }, [Validators.required, Validators.email]],
      address: ['Colonia Palmira, Tegucigalpa, F.M.', [Validators.required, Validators.minLength(5)]],
    });
    await Promise.all([this.loadStoredProfileImage(), this.loadStoredProfile()]);
  }

  get firstNameControl() { return this.profileForm.get('firstName'); }
  get lastNameControl() { return this.profileForm.get('lastName'); }
  get addressControl() { return this.profileForm.get('address'); }
  get isFirstNameInvalid(): boolean { return !!(this.firstNameControl?.touched && this.firstNameControl.invalid); }
  get isLastNameInvalid(): boolean { return !!(this.lastNameControl?.touched && this.lastNameControl.invalid); }
  get isAddressInvalid(): boolean { return !!(this.addressControl?.touched && this.addressControl.invalid); }

  private async loadStoredProfile(): Promise<void> {
    const { value } = await Preferences.get({ key: 'userProfile' });
    if (!value) return;
    try {
      this.profileForm.patchValue(JSON.parse(value));
    } catch {
      console.warn('No se pudo cargar el perfil guardado.');
    }
  }

  private async loadStoredProfileImage(): Promise<void> {
    const { value } = await Preferences.get({ key: 'imageProfile' });
    if (value) this.userProfileImage = value;
  }

  async changeProfilePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({ quality: 90, allowEditing: true, resultType: CameraResultType.Base64, source: CameraSource.Prompt });
      if (image.base64String) {
        this.isSubmitting = true;
        this.cloudinaryService.uploadImage(image.base64String).subscribe({
          next: async (url: string) => {
            this.userProfileImage = url;
            await Preferences.set({ key: 'imageProfile', value: url });
            this.isSubmitting = false;
            await this.presentToast('Foto de perfil actualizada y subida a la nube.', 'success');
          },
          error: async (error: any) => {
            this.isSubmitting = false;
            const message = error?.message || 'No se pudo subir la imagen al servidor.';
            await this.presentToast(message, 'danger');
          }
        });
      }
    } catch {
      console.log('Captura cancelada o no disponible.');
    }
  }

  async onSaveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    await Preferences.set({ key: 'userProfile', value: JSON.stringify(this.profileForm.getRawValue()) });
    this.isSubmitting = false;
    await this.presentToast('Perfil actualizado correctamente.', 'success');
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.presentToast('Sesión cerrada correctamente.', 'success');
    await this.router.navigate(['/login']);
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await toast.present();
  }
}
