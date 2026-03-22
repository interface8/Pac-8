import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. Create Permissions ───────────────────────────
  const permissionDefs = [
    // Users
    { resource: "users", action: "create", description: "Create users" },
    { resource: "users", action: "read", description: "View users" },
    { resource: "users", action: "update", description: "Update users" },
    { resource: "users", action: "delete", description: "Delete users" },
    // Roles
    { resource: "roles", action: "create", description: "Create roles" },
    { resource: "roles", action: "read", description: "View roles" },
    { resource: "roles", action: "update", description: "Update roles" },
    { resource: "roles", action: "delete", description: "Delete roles" },
    // Permissions
    { resource: "permissions", action: "create", description: "Create permissions" },
    { resource: "permissions", action: "read", description: "View permissions" },
    { resource: "permissions", action: "update", description: "Update permissions" },
    { resource: "permissions", action: "delete", description: "Delete permissions" },
  ];

  const permissions = [];
  for (const def of permissionDefs) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: def.resource, action: def.action } },
      update: {},
      create: def,
    });
    permissions.push(permission);
  }

  console.log(`  ✅ ${permissions.length} permissions created`);

  // ─── 2. Create Admin Role with all permissions ───────
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Full system administrator",
    },
  });

  // Assign all permissions to admin role
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log("  ✅ Admin role created with all permissions");

  // ─── 3. Create Viewer Role (read-only) ───────────────
  const viewerRole = await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: {
      name: "viewer",
      description: "Read-only access",
    },
  });

  const readPermissions = permissions.filter((p) => p.action === "read");
  for (const perm of readPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log("  ✅ Viewer role created with read permissions");

  // ─── 3b. Create Customer Role (default) ─────────────────────────
const customerRole = await prisma.role.upsert({
  where: { name: "Customer" },
  update: {},
  create: {
    name: "Customer",
    description: "Default customer role",
  },
});

console.log("  ✅ Customer role created");

  // ─── 4. Create Admin User ───────────────────────────
  const hashedPassword = await hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
  where: { email: "admin@power8.dev" },
  update: {
    phone: "+10000000001",
  },
  create: {
    email: "admin@power8.dev",
    phone: "+10000000001",
    password: hashedPassword,
    name: "System Admin",
    isActive: true,
  },
});

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("  ✅ Admin user created (admin@power8.dev / admin123)");

  // ─── 5. Create Demo Viewer User ─────────────────────
const viewerUser = await prisma.user.upsert({
  where: { email: "viewer@power8.dev" },
  update: {
    phone: "+10000000002",
  },
  create: {
    email: "viewer@power8.dev",
    phone: "+10000000002",
    password: await hash("viewer123", 12),
    name: "Demo Viewer",
    isActive: true,
  },
});

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: viewerUser.id,
        roleId: viewerRole.id,
      },
    },
    update: {},
    create: {
      userId: viewerUser.id,
      roleId: viewerRole.id,
    },
  });

  console.log("  ✅ Viewer user created (viewer@power8.dev / viewer123)");

  // ─── 6. Create Companies ─────────────────────────────
  const companiesDefs = [
    {
      name: "SolarMax Energy",
      description: "Leading manufacturer of solar panels and inverters",
      address: "12 Industrial Avenue, Lagos",
      contactNumber: "+2348012345678",
    },
    {
      name: "PowerGrid Solutions",
      description: "Specialist in batteries and energy storage systems",
      address: "45 Tech Park Road, Abuja",
      contactNumber: "+2348023456789",
    },
    {
      name: "GreenVolt Industries",
      description: "Renewable energy equipment supplier",
      address: "78 Commerce Street, Port Harcourt",
      contactNumber: "+2348034567890",
    },
  ];

  const createdCompanies = [];
  for (const company of companiesDefs) {
    const created = await prisma.company.create({ data: company });
    createdCompanies.push(created);
  }

  console.log(`  ✅ ${createdCompanies.length} companies created`);

  // ─── 7. Create Product Categories ────────────────────
  const categoriesDefs = [
    { name: "Solar Panels", description: "Photovoltaic solar panels", sort: 1 },
    { name: "Inverters", description: "Power inverters for solar systems", sort: 2 },
    { name: "Batteries", description: "Energy storage batteries", sort: 3 },
    { name: "Charge Controllers", description: "Solar charge controllers", sort: 4 },
    { name: "Accessories", description: "Cables, connectors, and mounting equipment", sort: 5 },
  ];

  const createdCategories = [];
  for (const category of categoriesDefs) {
    const created = await prisma.productCategory.create({ data: category });
    createdCategories.push(created);
  }

  console.log(`  ✅ ${createdCategories.length} product categories created`);

  // ─── 8. Create Products ──────────────────────────────
  const productsDefs = [
    {
      name: "250W Mono Solar Panel",
      description: "High efficiency monocrystalline solar panel, ideal for residential use",
      categoryId: createdCategories[0].id,
      companyId: createdCompanies[0].id,
      price: 45000,
      warranty: 25,
      capacity: 250,
      stockQuantity: 50,
    },
    {
      name: "400W Mono Solar Panel",
      description: "Premium monocrystalline panel for commercial installations",
      categoryId: createdCategories[0].id,
      companyId: createdCompanies[0].id,
      price: 72000,
      warranty: 25,
      capacity: 400,
      stockQuantity: 30,
    },
    {
      name: "550W Bifacial Solar Panel",
      description: "Dual-sided panel capturing reflected light for maximum output",
      categoryId: createdCategories[0].id,
      companyId: createdCompanies[2].id,
      price: 95000,
      warranty: 30,
      capacity: 550,
      stockQuantity: 15,
    },
    {
      name: "3.5KVA Hybrid Inverter",
      description: "Hybrid inverter with MPPT charge controller built-in",
      categoryId: createdCategories[1].id,
      companyId: createdCompanies[0].id,
      price: 185000,
      warranty: 24,
      capacity: 3500,
      stockQuantity: 20,
    },
    {
      name: "5KVA Pure Sine Wave Inverter",
      description: "High capacity inverter for homes and small offices",
      categoryId: createdCategories[1].id,
      companyId: createdCompanies[1].id,
      price: 250000,
      warranty: 24,
      capacity: 5000,
      stockQuantity: 12,
    },
    {
      name: "200Ah Lithium Battery",
      description: "Deep cycle lithium iron phosphate battery, 5000+ cycles",
      categoryId: createdCategories[2].id,
      companyId: createdCompanies[1].id,
      price: 320000,
      warranty: 36,
      capacity: 200,
      stockQuantity: 25,
    },
    {
      name: "100Ah Gel Battery",
      description: "Maintenance-free gel battery for solar systems",
      categoryId: createdCategories[2].id,
      companyId: createdCompanies[1].id,
      price: 85000,
      warranty: 12,
      capacity: 100,
      stockQuantity: 40,
    },
    {
      name: "60A MPPT Charge Controller",
      description: "Maximum power point tracking controller for optimal charging",
      categoryId: createdCategories[3].id,
      companyId: createdCompanies[2].id,
      price: 45000,
      warranty: 24,
      capacity: 60,
      stockQuantity: 35,
    },
    {
      name: "30A PWM Charge Controller",
      description: "Budget-friendly pulse width modulation controller",
      categoryId: createdCategories[3].id,
      companyId: createdCompanies[2].id,
      price: 12000,
      warranty: 12,
      capacity: 30,
      stockQuantity: 60,
    },
    {
      name: "Solar Cable 6mm (100m)",
      description: "UV resistant solar cable, 100 meter roll",
      categoryId: createdCategories[4].id,
      companyId: createdCompanies[2].id,
      price: 25000,
      warranty: 10,
      capacity: 0,
      stockQuantity: 100,
    },
    {
      name: "Panel Mounting Kit",
      description: "Complete roof mounting kit for 4 solar panels",
      categoryId: createdCategories[4].id,
      companyId: createdCompanies[0].id,
      price: 18000,
      warranty: 15,
      capacity: 0,
      stockQuantity: 45,
    },
    {
      name: "Out of Stock Panel",
      description: "This product is intentionally out of stock for testing",
      categoryId: createdCategories[0].id,
      companyId: createdCompanies[0].id,
      price: 50000,
      warranty: 25,
      capacity: 300,
      stockQuantity: 0,
    },
  ];

  for (const product of productsDefs) {
    await prisma.product.create({ data: product });
  }

  console.log(`  ✅ ${productsDefs.length} products created`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
