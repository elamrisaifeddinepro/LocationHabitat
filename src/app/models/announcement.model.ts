export interface Announcement {
  id: string;
  titre: string;
  descriptionCourte: string;
  descriptionLongue: string;
  mensualite: number;
  dateDisponibilite: Date;
  photos: string[];
  adresseLocalisation: string;
  latitude?: number | null;
  longitude?: number | null;
  actif: boolean;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  vues: number;
  nombrePieces?: number;
  superficie?: number;
  createdAt: Date;
  updatedAt: Date;
}