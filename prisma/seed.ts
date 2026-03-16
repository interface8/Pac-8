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
