import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex = /^[2-9]\d{9}$/;
      const valid = phoneRegex.test(control.value);

      return valid ? null : { phoneNumber: { value: control.value } };
    };
  }

  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate >= today ? null : { futureDate: { value: control.value } };
    };
  }

  static minPrice(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      return control.value >= min ? null : { minPrice: { min, actual: control.value } };
    };
  }

  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.value === '') {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: any = {};

      if (password.length < 8) {
        errors.minLength = true;
      }

      if (!/[A-Z]/.test(password)) {
        errors.requireUppercase = true;
      }

      if (!/[a-z]/.test(password)) {
        errors.requireLowercase = true;
      }

      if (!/[0-9]/.test(password)) {
        errors.requireNumber = true;
      }

      return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
    };
  }
}
