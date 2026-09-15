/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegistroPage } from './registro.page';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the minimum password length and confirm the match', () => {
    component.passwordForm.setValue({
      FirstName: 'Ana',
      LastName: 'García',
      password: 'abc',
      passwordConfirmation: 'abc'
    });

    expect(component.passwordForm.get('password')?.hasError('minlength')).toBeTrue();

    component.passwordForm.patchValue({
      password: 'Abcdef12',
      passwordConfirmation: 'Abcdef13'
    });

    expect(component.passwordForm.errors?.['passwordMismatch']).toBeTrue();
  });

  it('should include the required profile fields for registration', () => {
    expect(component.passwordForm.contains('FirstName')).toBeTrue();
    expect(component.passwordForm.contains('LastName')).toBeTrue();
    expect(component.passwordForm.contains('Phone')).toBeTrue();
    expect(component.passwordForm.contains('Address')).toBeTrue();
    expect(component.passwordForm.contains('NationalId')).toBeTrue();
    expect(component.passwordForm.contains('Documents')).toBeTrue();
    expect(component.passwordForm.contains('ProfilePhoto')).toBeTrue();
    expect(component.passwordForm.contains('password')).toBeTrue();
    expect(component.passwordForm.contains('passwordConfirmation')).toBeTrue();
  });
});
