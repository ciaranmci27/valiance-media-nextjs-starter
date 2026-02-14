export interface EmailAccount {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  encryptedPassword: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface EmailAccountInput {
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isDefault: boolean;
}

export interface EmailAccountSafe {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isDefault: boolean;
  createdAt: string;
}
