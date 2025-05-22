/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from '@prisma/client';
import { JWTPayload } from 'jose';

export interface Area {
  id: number;
  code: string;
  name: string;
}

export interface AreaPermission {
  id: number; // ID of the AreaPermission record itself
  // userId: string; // Not strictly needed on client if permissions are already part of UserPayload
  areaId: number;
  canView: boolean;
  area: Area; // Nested Area details
}

export interface UserPayload extends JWTPayload {
  id: string;
  username: string;
  document: string;
  fullName: string;
  role: Role;
  email?: string;    //Added
  phonenumber?: string; //Added
  AreaPermissions?: AreaPermission[]; // Add this line
  [key: string]: any; // Añade esta línea
}

export interface PhidiasPayload extends JWTPayload {
  name: string;
  email: string;
  [key: string]: any; // Añade esta línea
}