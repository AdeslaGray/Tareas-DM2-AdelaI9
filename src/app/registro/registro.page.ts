import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonInput, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  arrowBackOutline, 
  arrowForwardOutline,
  cameraOutline,
  cardOutline,
  documentTextOutline,
  eyeOutline, 
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { EmailVerificationService } from '../services/email-verification.service';
import { AuthService } from '../services/auth.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { RegisterPayload, RegisterService } from '../services/register.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegistroPage implements OnInit {
  readonly CameraSource = CameraSource;
  @ViewChild('loginEmailInput') loginEmailInput?: IonInput;
  @ViewChild('registroEmailInput') registroEmailInput?: IonInput;
  pasoActual: number = 1;
  showPassword: boolean = false;
  isLoading: boolean = false;
  activeTab: 'datos' | 'documentos' = 'datos';
  profilePhotoUrl = '';
  licenciaUrl = '';
  revisionUrl = '';
  private readonly pendingDocumentUrl = 'https://placehold.co/1200x800/png?text=Documento+pendiente';
  readonly defaultProfilePhotoUrl = 'https://ui-avatars.com/api/?name=Usuario&background=0E9F6E&color=fff&size=200';

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
    private cloudinaryService: CloudinaryService,
    private registerService: RegisterService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ 
      addOutline,
      arrowBackOutline, 
      arrowForwardOutline,
      cameraOutline,
      cardOutline,
      documentTextOutline,
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
      Documents: [''],
      ProfilePhoto: [''],
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

  setTab(tab: 'datos' | 'documentos') {
    this.activeTab = tab;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
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

  toggleRegisterPasswordConfirmation(): void {
    this.showRegisterPasswordConfirmation = !this.showRegisterPasswordConfirmation;
  }

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

  get registerPassword() {
    return this.passwordForm.get('password');
  }

  get registerPasswordConfirmation() {
    return this.passwordForm.get('passwordConfirmation');
  }

  get passwordsDoNotMatch(): boolean {
    return !!(this.passwordForm.hasError('passwordMismatch') && !!this.registerPasswordConfirmation?.touched);
  }

  buildRegisterPayload(): RegisterPayload {
    const firstName = (this.passwordForm.get('FirstName')?.value ?? '').trim();
    const lastName = (this.passwordForm.get('LastName')?.value ?? '').trim();
    const profileName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Usuario';
    const documents = [
      { type: 'Licencia', url: this.licenciaUrl || this.pendingDocumentUrl },
      { type: 'Revisión Vehicular', url: this.revisionUrl || this.pendingDocumentUrl },
    ];
    return {
      email: (this.step1Form.get('email')?.value ?? '').trim(),
      password: (this.registerPassword?.value ?? '').toString(),
      firstName,
      lastName,
      nationalId: (this.passwordForm.get('NationalId')?.value ?? '').trim(),
      phone: (this.passwordForm.get('Phone')?.value ?? '').trim(),
      address: (this.passwordForm.get('Address')?.value ?? '').trim(),
      profilePhoto: this.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=0E9F6E&color=fff&size=200`,
      documents,
    };
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
    const payload = this.buildRegisterPayload();

    this.registerService.registerUser(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        this.loginForm.patchValue({ email: this.step1Form.get('email')?.value });
        this.pasoActual = 1;
        await this.presentToast('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
      },
      error: async (error) => {
        this.isLoading = false;
        const validationErrors = error?.error?.errors;
        const message = validationErrors
          ? Object.values(validationErrors).reduce((messages: string[], value: unknown) => {
            return messages.concat(Array.isArray(value) ? value.map(String) : String(value));
          }, []).join(' ')
          : error?.error?.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
        await this.presentToast(message, 'danger');
      }
    });
  }

}
