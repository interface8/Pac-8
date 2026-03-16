// ─── User module types ──────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone: string,
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: { id: string; name: string }[];
}

export interface CreateUserInput {
  email: string;
  phone: string,
  password: string;
  name: string;
  roleIds?: string[];
}

export interface UpdateUserInput {
  email?: string;
  phone?: string,
  password?: string;
  name?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
