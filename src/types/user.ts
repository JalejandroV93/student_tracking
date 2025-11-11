/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from '@/prismacl/client';
import { JWTPayload } from 'jose';

export interface UserPayload extends JWTPayload {
  id: string;
  username: string;
  document: string;
  fullName: string;
  role: Role;
  email?: string;    
  phonenumber?: string; 
  groupCode?: string; 
  id_phidias?: string; 
  url_photo?: string; 
  [key: string]: any; 
}

export interface PhidiasPayload extends JWTPayload {
  name: string;
  email: string;
  [key: string]: any; 
}