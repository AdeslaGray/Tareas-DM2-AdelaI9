import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonInput, ToastController } from '@ionic/angular';
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
<<<<<<< Updated upstream
=======
  @ViewChild('loginEmailInput') loginEmailInput?: IonInput;
  @ViewChild('registroEmailInput') registroEmailInput?: IonInput;
  readonly CameraSource = CameraSource;
>>>>>>> Stashed changes
  pasoActual: number = 1;
  showPassword: boolean = false;
  isLoading: boolean = false;

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  passwordForm!: FormGroup;
  loginForm!: FormGroup;
  showRegisterPassword = false;
  showRegisterPasswordConfirmation = false;

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

    this.passwordForm = this.fb.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{8,20}$/)]],
      Address: ['', [Validators.required, Validators.minLength(5)]],
      NationalId: ['', [Validators.required, Validators.minLength(5)]],
      Documents: ['', [Validators.required, Validators.minLength(3)]],
      ProfilePhoto: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const passwordConfirmation = group.get('passwordConfirmation')?.value;

    if (!password || !passwordConfirmation) {
      return null;
    }

    return password === passwordConfirmation ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

<<<<<<< Updated upstream
=======
  async focusLoginEmail(): Promise<void> {
    await this.loginEmailInput?.setFocus();
  }

  async focusRegistroEmail(): Promise<void> {
    await this.registroEmailInput?.setFocus();
  }

  toggleTerms(): void {
    const control = this.step1Form.get('aceptaTerminos');
    control?.setValue(!control.value);
    control?.markAsTouched();
  }

  async tomarFoto(tipo: 'profile' | 'licencia' | 'revision', source: CameraSource = CameraSource.Prompt) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source,
      });

      if (!image.base64String) {
        return;
      }

      this.isLoading = true;
      this.cloudinaryService.uploadImage(image.base64String).subscribe({
        next: (url) => {
          this.isLoading = false;

          if (tipo === 'profile') {
            this.profilePhotoUrl = url;
          }
          if (tipo === 'licencia') {
            this.licenciaUrl = url;
          }
          if (tipo === 'revision') {
            this.revisionUrl = url;
          }

          void this.presentToast('Imagen subida correctamente a Cloudinary.', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          const message = error?.message || 'No se pudo subir la imagen al servicio de Cloudinary.';
          void this.presentToast(message, 'danger');
        }
      });
    } catch (error) {
      console.log('Captura cancelada o no disponible', error);
    }
  }

>>>>>>> Stashed changes
  toggleRegisterPasswordConfirmation() {
    this.showRegisterPasswordConfirmation = !this.showRegisterPasswordConfirmation;
  }

  get registerPassword() {
    return this.passwordForm.get('password');
  }

  get registerPasswordConfirmation() {
    return this.passwordForm.get('passwordConfirmation');
  }

  get passwordsDoNotMatch(): boolean {
    return !!(this.passwordForm.hasError('passwordMismatch') && !!this.registerPasswordConfirmation?.touched);
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

  intentarAcceso() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.loginEndpoint(this.loginForm.getRawValue()).subscribe({
      next: async () => {
        this.isLoading = false;
        await this.presentToast('Inicio de sesión exitoso.', 'success');
        await this.router.navigate(['/tabs/rides']);
      },
      error: async (error) => {
        this.isLoading = false;
        const message = error?.status === 401
          ? 'Correo o contraseña incorrectos.'
          : error?.error?.message || 'No se pudo completar la operación en la API.';
        await this.presentToast(message, 'danger');
      }
    });
  }

  onLoginSubmit() {
    this.intentarAcceso();
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
        const message = error?.status === 409
          ? 'Este correo ya tiene un registro pendiente o ya está registrado. Usa otro correo o inicia sesión.'
          : error?.error?.message || 'Ocurrió un error al enviar el token. Intente de nuevo.';
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
        this.pasoActual = 4;
        void this.presentToast('Correo verificado. Crea tu contraseña.', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Ocurrió un error al verificar el token.';
        void this.presentToast(message, 'danger');
      }
    });
  }

  crearCuenta() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.step1Form.get('email')?.value as string,
      token: this.step2Form.get('token')?.value as string,
      firstName: this.passwordForm.get('FirstName')?.value as string,
      lastName: this.passwordForm.get('LastName')?.value as string,
      FirstName: this.passwordForm.get('FirstName')?.value as string,
      LastName: this.passwordForm.get('LastName')?.value as string,
      Phone: this.passwordForm.get('Phone')?.value as string,
      Address: this.passwordForm.get('Address')?.value as string,
      NationalId: this.passwordForm.get('NationalId')?.value as string,
      Documents: this.passwordForm.get('Documents')?.value as string,
      ProfilePhoto: this.passwordForm.get('ProfilePhoto')?.value as string,
      password: this.registerPassword?.value as string
    };

    this.authService.registerEndpoint(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        this.loginForm.patchValue({ email: this.step1Form.get('email')?.value });
        this.pasoActual = 1;
        await this.presentToast('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
      },
      error: async (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
        await this.presentToast(message, 'danger');
      }
    });
  }

}