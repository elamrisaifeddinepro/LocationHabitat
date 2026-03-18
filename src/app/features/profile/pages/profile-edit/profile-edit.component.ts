import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { CanComponentDeactivate } from '../../../../core/guards/form-leave.guard';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { PROFILE_SCHEMA, type ProfileModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    Field,
    FormErrorsComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements CanComponentDeactivate {
  private readonly formSubmitted = signal(false);
  submitted = false;
  private readonly model = signal<ProfileModel>(this.initialModel());
  readonly profileForm = form(this.model, PROFILE_SCHEMA);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  private initialModel(): ProfileModel {
    const u = this.authService.currentUserValue;
    return {
      nom: u?.nom || '',
      prenom: u?.prenom || '',
      numero: u?.numero || '',
      telephone: u?.telephone || '',
      courriel: u?.courriel || '',
      adresse: u?.adresse || '',
      currentPassword: ''
    };
  }

  canDeactivate(): boolean {
    if (this.formSubmitted() || !this.profileForm().dirty()) {
      return true;
    }
    return false;
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    this.submitted = true;
    if (this.profileForm().invalid()) return;

    await submit(this.profileForm, async (f) => {
      const v = f().value();
      const { currentPassword, ...profileData } = v;
      try {
        await firstValueFrom(this.authService.updateProfile(profileData, currentPassword));
        this.formSubmitted.set(true);
        this.snackBar.open('Profil mis à jour avec succès!', 'Fermer', { duration: 3000 });
        this.router.navigate(['/announcements']);
        return;
      } catch (err: any) {
        return customError({
          kind: 'server',
          message: err?.message || 'Mot de passe incorrect ou erreur lors de la mise à jour',
          field: this.profileForm.currentPassword
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/announcements']);
  }
}
