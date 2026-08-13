import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegistroPage implements OnInit {
  pasoActual: number = 1;

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;

  constructor(private fb: FormBuilder) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    // Pantalla 1: Verificación de correo
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Pantalla 2: Validación de Token (OTP)
    this.step2Form = this.fb.group({
      token: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    // Pantalla 3: Información Personal y Seguridad
    this.step3Form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).{8,}$')
      ]]
    });
  }

  siguientePaso() {
    if (this.pasoActual === 1 && this.step1Form.valid) {
      this.pasoActual = 2;
    } else if (this.pasoActual === 2 && this.step2Form.valid) {
      this.pasoActual = 3;
    } else {
      this.marcarComoTocados(this.pasoActual);
    }
  }

  anteriorPaso() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  marcarComoTocados(paso: number) {
    const form = paso === 1 ? this.step1Form : paso === 2 ? this.step2Form : this.step3Form;
    form.markAllAsTouched();
  }

  onSubmit() {
    if (this.step3Form.valid) {
      const datosCompletos = {
        ...this.step1Form.value,
        ...this.step2Form.value,
        ...this.step3Form.value
      };
      console.log('Registro completado:', datosCompletos);
    } else {
      this.step3Form.markAllAsTouched();
    }
  }
}