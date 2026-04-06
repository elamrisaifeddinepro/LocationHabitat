import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { Field, customError, form, schema, submit, required, email } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';

interface ForgotPasswordModel {
  courriel: string;
}

const FORGOT_PASSWORD_SCHEMA = schema<ForgotPasswordModel>((f) => {
  required(f.courriel, { message: 'Email requis' });
  email(f.courriel, { message: 'Email invalide' });
});

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    Field,
    FormErrorsComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private readonly model = signal<ForgotPasswordModel>({ courriel: '' });
  readonly forgotForm = form(this.model, FORGOT_PASSWORD_SCHEMA);
  submitted = false;
  successMessage: string | null = null;
  resetToken: string | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  get loading(): boolean {
    return this.forgotForm().submitting();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.submitted = true;
    if (this.forgotForm().invalid()) return;

    await submit(this.forgotForm, async (f) => {
      try {
        const { courriel } = f().value();
        const response = await firstValueFrom(this.authService.forgotPassword(courriel));

        this.successMessage = response.message || 'Demande envoyée avec succès.';
        this.resetToken = response.resetToken || null;

        this.snackBar.open(this.successMessage, 'Fermer', { duration: 4000 });
        return;
      } catch (err: any) {
        const message = err?.message || 'Erreur lors de la demande de réinitialisation';
        this.snackBar.open(message, 'Fermer', { duration: 4000 });
        return customError({
          kind: 'server',
          message,
          field: this.forgotForm.courriel
        });
      }
    });
  }
}