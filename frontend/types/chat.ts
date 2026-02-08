export interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
}

export interface Citation {
  id: number;
  content: string;
  metadata: any;
}

export interface Message {
  id?: string;
  chat_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  citations?: Citation[];
}

export interface Chatcreate {
  title?: string;
}
