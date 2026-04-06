import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Field,
  customError,
  form,
  schema,
  submit,
  required,
  minLength,
  validateTree
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';

interface ResetPasswordModel {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const RESET_PASSWORD_SCHEMA = schema<ResetPasswordModel>((f) => {
  required(f.token, { message: 'Token requis' });
  required(f.newPassword, { message: 'Nouveau mot de passe requis' });
  minLength(f.newPassword, 8, { message: 'Min 8 caractères' });
  required(f.confirmPassword, { message: 'Confirmation requise' });

  validateTree(f, ({ value, fieldTreeOf }) => {
    const v = value();
    if (!v?.newPassword || !v?.confirmPassword) return;
    if (v.newPassword !== v.confirmPassword) {
      const form = fieldTreeOf(f);
      return customError({
        kind: 'passwordMismatch',
        message: 'Les mots de passe ne correspondent pas',
        field: form.confirmPassword
      });
    }
    return;
  });
});

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly model = signal<ResetPasswordModel>({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  readonly resetForm = form(this.model, RESET_PASSWORD_SCHEMA);
  submitted = false;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (token) {
      this.model.set({
        ...this.model(),
        token
      });
    }
  }

  get loading(): boolean {
    return this.resetForm().submitting();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.submitted = true;
    if (this.resetForm().invalid()) return;

    await submit(this.resetForm, async (f) => {
      try {
        const { token, newPassword } = f().value();
        const response = await firstValueFrom(this.authService.resetPassword(token, newPassword));
        this.successMessage = response.message || 'Mot de passe réinitialisé avec succès.';
        this.snackBar.open(this.successMessage, 'Fermer', { duration: 4000 });
        return;
      } catch (err: any) {
        const message = err?.message || 'Erreur lors de la réinitialisation du mot de passe';
        this.snackBar.open(message, 'Fermer', { duration: 4000 });
        return customError({
          kind: 'server',
          message,
          field: this.resetForm.token
        });
      }
    });
  }
}