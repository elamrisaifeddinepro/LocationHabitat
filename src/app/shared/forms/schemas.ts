import {
  customError,
  email,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  schema,
  validate,
  validateTree
} from '@angular/forms/signals';

export interface LoginModel {
  courriel: string;
  password: string;
}

export const LOGIN_SCHEMA = schema<LoginModel>((f) => {
  required(f.courriel, { message: 'Email requis' });
  email(f.courriel, { message: 'Email invalide' });
  required(f.password, { message: 'Mot de passe requis' });
  minLength(f.password, 1, { message: 'Mot de passe requis' });
});

export interface RegisterModel {
  nom: string;
  prenom: string;
  numero: string;
  telephone: string;
  courriel: string;
  password: string;
  confirmPassword: string;
  adresse: string;
}

export const REGISTER_SCHEMA = schema<RegisterModel>((f) => {
  required(f.nom, { message: 'Nom requis' });
  minLength(f.nom, 2, { message: 'Min 2 caractères' });

  required(f.prenom, { message: 'Prénom requis' });
  minLength(f.prenom, 2, { message: 'Min 2 caractères' });

  required(f.numero, { message: 'Numéro requis' });

  required(f.telephone, { message: 'Téléphone requis' });
  pattern(f.telephone, /^[2-9]\d{9}$/, { message: 'Téléphone invalide (10 chiffres)' });

  required(f.courriel, { message: 'Email requis' });
  email(f.courriel, { message: 'Email invalide' });

  required(f.password, { message: 'Mot de passe requis' });
  minLength(f.password, 8, { message: 'Min 8 caractères' });
  validate(f.password, ({ value }) => {
    const pwd = String(value() ?? '');
    if (!pwd) return;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    if (hasUpper && hasLower && hasNumber) return;
    return customError({
      kind: 'strongPassword',
      message: 'Doit contenir une majuscule, une minuscule et un chiffre'
    });
  });

  required(f.confirmPassword, { message: 'Confirmation requise' });
  required(f.adresse, { message: 'Adresse requise' });

  validateTree(f, ({ value, fieldTreeOf }) => {
    const v = value();
    if (!v?.password || !v?.confirmPassword) return;
    if (v.password !== v.confirmPassword) {
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

export interface ProfileModel {
  nom: string;
  prenom: string;
  numero: string;
  telephone: string;
  courriel: string;
  adresse: string;
  currentPassword: string;
}

export const PROFILE_SCHEMA = schema<ProfileModel>((f) => {
  required(f.nom, { message: 'Nom requis' });
  minLength(f.nom, 2, { message: 'Min 2 caractères' });

  required(f.prenom, { message: 'Prénom requis' });
  minLength(f.prenom, 2, { message: 'Min 2 caractères' });

  required(f.numero, { message: 'Numéro requis' });

  required(f.telephone, { message: 'Téléphone requis' });
  pattern(f.telephone, /^[2-9]\d{9}$/, { message: 'Téléphone invalide (10 chiffres)' });

  required(f.courriel, { message: 'Email requis' });
  email(f.courriel, { message: 'Email invalide' });

  required(f.adresse, { message: 'Adresse requise' });
  required(f.currentPassword, { message: 'Mot de passe requis' });
});

export interface AnnouncementFormModel {
  titre: string;
  descriptionCourte: string;
  descriptionLongue: string;
  mensualite: number | string;
  dateDisponibilite: Date | string;
  photos: string;
  adresseLocalisation: string;
  latitude: number | null;
  longitude: number | null;
}

export const ANNOUNCEMENT_SCHEMA = schema<AnnouncementFormModel>((f) => {
  required(f.titre, { message: 'Titre requis' });
  minLength(f.titre, 5, { message: 'Min 5 caractères' });

  required(f.descriptionCourte, { message: 'Description courte requise' });
  minLength(f.descriptionCourte, 10, { message: 'Min 10 caractères' });

  required(f.descriptionLongue, { message: 'Description longue requise' });
  minLength(f.descriptionLongue, 50, { message: 'Min 50 caractères' });

  required(f.mensualite, { message: 'Mensualité requise' });
  min(f.mensualite, 500, { message: 'Minimum 500$' });

  required(f.dateDisponibilite, { message: 'Date de disponibilité requise' });
  validate(f.dateDisponibilite, ({ value }) => {
    const v = value();
    if (!v) return;
    const d = v instanceof Date ? v : new Date(String(v));
    if (Number.isNaN(d.getTime())) {
      return customError({ kind: 'date', message: 'Date invalide' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) {
      return customError({ kind: 'futureDate', message: 'La date doit être aujourd’hui ou plus tard' });
    }
    return;
  });

  required(f.photos, { message: 'Au moins une photo requise' });
  maxLength(f.photos, 3000, { message: 'Texte trop long' });
  validate(f.photos, ({ value }) => {
    const text = String(value() ?? '').trim();
    if (!text) return;
    const urls = text.split(',').map((s) => s.trim()).filter(Boolean);
    const urlRegex = /^https?:\/\//i;
    const bad = urls.find((u) => !urlRegex.test(u));
    if (bad) {
      return customError({
        kind: 'photos',
        message: 'URLs invalides: utilisez http(s):// et séparez par virgules'
      });
    }
    return;
  });

  required(f.adresseLocalisation, { message: 'Adresse requise' });
});

export interface SendMessageModel {
  objet: string;
  contenu: string;
}

export const SEND_MESSAGE_SCHEMA = schema<SendMessageModel>((f) => {
  required(f.objet, { message: 'Objet requis' });
  minLength(f.objet, 3, { message: 'Min 3 caractères' });
  required(f.contenu, { message: 'Message requis' });
  minLength(f.contenu, 10, { message: 'Min 10 caractères' });
});

export interface ContactMessageModel {
  sujet: string;
  texte: string;
}

export const CONTACT_MESSAGE_SCHEMA = schema<ContactMessageModel>((f) => {
  required(f.sujet, { message: 'Sujet requis' });
  required(f.texte, { message: 'Message requis' });
  minLength(f.texte, 10, { message: 'Min 10 caractères' });
});