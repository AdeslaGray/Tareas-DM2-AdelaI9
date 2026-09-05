import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  arrowForwardOutline, 
  eyeOutline, 
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { EmailVerificationService } from '../services/email-verification.service';
import { AuthService } from '../services/auth.service';

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
    private authService: AuthService,
    private toastCtrl: ToastController,
    private router: Router
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      aceptaTerminos: [false, Validators.requiredTrue]
    });

    this.step2Form = this.fb.group({
      token: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
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

  get emailLogin() {
    return this.loginForm.get('email');
  }

  get isEmailLoginInvalid(): boolean {
    return !!(this.emailLogin?.touched && this.emailLogin.invalid);
  }

  get passwordLogin() {
    return this.loginForm.get('password');
  }

  get isPasswordLoginInvalid(): boolean {
    return !!(this.passwordLogin?.touched && this.passwordLogin.invalid);
  }

  get emailRegistro() {
    return this.step1Form.get('email');
  }

  get isEmailRegistroInvalid(): boolean {
    return !!(this.emailRegistro?.touched && this.emailRegistro.invalid);
  }

  get aceptaTerminos() {
    return this.step1Form.get('aceptaTerminos');
  }

  get isTerminosInvalid(): boolean {
    return !!(this.aceptaTerminos?.touched && this.aceptaTerminos.invalid);
  }

  get tokenStep2() {
    return this.step2Form.get('token');
  }

  get isTokenStep2Invalid(): boolean {
    return !!(this.tokenStep2?.touched && this.tokenStep2.invalid);
  }

  irARegistro() {
    this.pasoActual = 2;
  }

  irALogin() {
    this.pasoActual = 1;
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: async () => {
        this.isLoading = false;
        await this.presentToast('Inicio de sesión exitoso.', 'success');
        await this.router.navigate(['/home']);
      },
      error: async (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        await this.presentToast(message, 'danger');
      }
    });
  }

  enviarTokenRegistro() {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.step1Form.get('email')?.value as string;

    this.emailService.sendToken(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.pasoActual = 3;
        void this.presentToast('El token ha sido enviado exitosamente a tu correo.', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Ocurrió un error al enviar el token. Intente de nuevo.';
        void this.presentToast(message, 'danger');
      }
    });
  }

  verificarTokenOTP() {
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
        this.pasoActual = 1;
        void this.presentToast('Cuenta verificada correctamente. Inicie sesión.', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Ocurrió un error al verificar el token.';
        void this.presentToast(message, 'danger');
      }
    });
  }

}