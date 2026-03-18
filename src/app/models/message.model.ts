export interface Message {
  id: string;
  sujet: string;
  texte: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  announcementId?: string;
  announcementTitre?: string;
  read: boolean;
  createdAt: Date;
}
