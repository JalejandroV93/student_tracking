/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from '@prisma/client';
import { JWTPayload } from 'jose';

export interface UserPayload extends JWTPayload {
  id: string;
  username: string;
  document: string;
  fullName: string;
  role: Role;
  email?: string;    //Added
  phonenumber?: string; //Added
  groupCode?: string; // Added for TEACHER role
  [key: string]: any; // Añade esta línea
}

export interface PhidiasPayload extends JWTPayload {
  name: string;
  email: string;
  [key: string]: any; // Añade esta línea
}