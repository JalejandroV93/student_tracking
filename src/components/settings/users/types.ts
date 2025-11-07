import { Role } from "@/prismacl/client";

export type AreaPermission = {
  id: number;
  areaId: number;
  canView: boolean;
  area: {
    id: number;
    name: string;
    code: string;
  };
};

export type User = {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  groupCode?: string | null;
  isBlocked: boolean;
  failedLoginAttempts: number;
  lastLogin: Date | null;
  areaPermissions: AreaPermission[];
};

export type UsersResponse = {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
