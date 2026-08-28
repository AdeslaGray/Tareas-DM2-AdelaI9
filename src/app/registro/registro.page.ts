import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  arrowForwardOutline, 
  eyeOutline, 
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { EmailVerificationService } from '../services/email-verification.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegistroPage implements OnInit {
  pasoActual: number = 1;
  showPassword: boolean = false;
  isLoading: boolean = false;

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailVerificationService,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      arrowBackOutline, 
      arrowForwardOutline, 
      eyeOutline, 
      eyeOffOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.step2Form = this.fb.group({
      token: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$')
      ]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  siguientePaso() {
    if (this.pasoActual === 1) {
      this.enviarToken();
    } else if (this.pasoActual === 2) {
      this.verificarToken();
    }
  }

  enviarToken() {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.step1Form.get('email')?.value as string;

    this.emailService.sendToken(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.pasoActual = 2;
        void this.presentToast('El token ha sido enviado exitosamente a tu correo.', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Ocurrió un error al enviar el token. Intente de nuevo.';
        void this.presentToast(message, 'danger');
      }
    });
  }

  verificarToken() {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.step1Form.get('email')?.value as string;
    const token = this.step2Form.get('token')?.value as string;

    this.emailService.verifyToken(email, token).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginForm.patchValue({ email });
        this.pasoActual = 3;
        void this.presentToast('Verificación de token realizada correctamente.', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Ocurrió un error al verificar el token.';
        void this.presentToast(message, 'danger');
      }
    });
  }

  anteriorPaso() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      void this.presentToast('¡Cuenta creada con éxito!', 'success');
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}