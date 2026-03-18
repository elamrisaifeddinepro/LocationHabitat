import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { LOGIN_SCHEMA, type LoginModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly model = signal<LoginModel>({ courriel: '', password: '' });
  readonly loginForm = form(this.model, LOGIN_SCHEMA);
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get loading(): boolean {
    return this.loginForm().submitting();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();
    this.submitted = true;
    if (this.loginForm().invalid()) return;

    await submit(this.loginForm, async (f) => {
      const { courriel, password } = f().value();
      try {
        await firstValueFrom(this.authService.login(courriel, password));
        this.snackBar.open('Connexion réussie!', 'Fermer', { duration: 3000 });
        this.router.navigate(['/announcements']);
        return;
      } catch (err: any) {
        this.snackBar.open(err?.message || 'Email ou mot de passe incorrect', 'Fermer', { duration: 4000 });
        return customError({
          kind: 'server',
          message: err?.message || 'Email ou mot de passe incorrect',
          field: this.loginForm.courriel
        });
      }
    });
  }
}
