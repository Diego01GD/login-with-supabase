export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  career: string;
}

export interface SkillExchange {
  id: string;
  sender_id: string;
  receiver_id: string;
  career: string;
  status: ExchangeStatus;
  profiles: Profile; // Para el join con el receptor/emisor
}

export interface Message {
  id: string;
  exchange_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}