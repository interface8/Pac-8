export interface PermissionDto {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionInput {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionInput {
  resource?: string;
  action?: string;
  description?: string;
}
