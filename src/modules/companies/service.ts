import * as companyRepo from "./repository";
import type { CreateCompanyInput, UpdateCompanyInput } from "./types";

export async function listCompanies() {
  return companyRepo.findCompanies();
}

export async function getCompanyById(id: string) {
  const company = await companyRepo.findCompanyById(id);
  if (!company) throw new Error("Company not found");
  return company;
}

export async function createCompany(input: CreateCompanyInput) {
  if (await companyRepo.findCompanyByName(input.name)) {
    throw new Error("Company already exists");
  }
  return companyRepo.createCompany(input);
}

export async function updateCompany(id: string, input: UpdateCompanyInput) {
  if (!(await companyRepo.companyExists(id))) {
    throw new Error("Company not found");
  }
  return companyRepo.updateCompany(id, input);
}

export async function deleteCompany(id: string) {
  if (!(await companyRepo.companyExists(id))) {
    throw new Error("Company not found");
  }
  return companyRepo.deleteCompany(id);
}
