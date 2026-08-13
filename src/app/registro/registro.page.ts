import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  arrowForwardOutline, 
  cameraOutline, 
  eyeOutline, 
  eyeOffOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegistroPage implements OnInit {
  pasoActual: number = 3;
  showPassword: boolean = false;

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;

  constructor(private fb: FormBuilder) {
    addIcons({ 
      arrowBackOutline, 
      arrowForwardOutline, 
      cameraOutline, 
      eyeOutline, 
      eyeOffOutline 
    });
  }

  ngOnInit() {
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.step2Form = this.fb.group({
      token: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.step3Form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9+]+$')]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.step3Form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  siguientePaso() {
    if (this.pasoActual === 1 && this.step1Form.valid) {
      this.pasoActual = 2;
    } else if (this.pasoActual === 2 && this.step2Form.valid) {
      this.pasoActual = 3;
    }
  }

  anteriorPaso() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  onSubmit() {
    if (this.step3Form.valid) {
      alert('¡Cuenta creada con éxito!');
    } else {
      this.step3Form.markAllAsTouched();
    }
  }
}