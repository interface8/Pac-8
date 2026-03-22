import { prisma } from "@/lib/prisma";
import type { CompanyDto, CreateCompanyInput, UpdateCompanyInput } from "./types";

function toCompanyDto(company: {
  id: string;
  name: string;
  description: string | null;
  address: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
}): CompanyDto {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    address: company.address,
    contactNumber: company.contactNumber,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

export async function findCompanies(): Promise<CompanyDto[]> {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });
  return companies.map(toCompanyDto);
}

export async function findCompanyById(id: string): Promise<CompanyDto | null> {
  const company = await prisma.company.findUnique({ where: { id } });
  return company ? toCompanyDto(company) : null;
}

export async function createCompany(input: CreateCompanyInput): Promise<CompanyDto> {
  const company = await prisma.company.create({ data: input });
  return toCompanyDto(company);
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyDto> {
  const company = await prisma.company.update({
    where: { id },
    data: input,
  });
  return toCompanyDto(company);
}

export async function deleteCompany(id: string): Promise<void> {
  await prisma.company.delete({ where: { id } });
}

export async function companyExists(id: string): Promise<boolean> {
  const count = await prisma.company.count({ where: { id } });
  return count > 0;
}

export async function findCompanyByName(name: string): Promise<CompanyDto | null> {
  const company = await prisma.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  return company ? toCompanyDto(company) : null;
}

