export interface CompanyDto {
  id: string;
  name: string;
  description: string | null;
  address: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  name: string;
  description?: string;
  address: string;
  contactNumber: string;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;
