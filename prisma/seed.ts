import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

import {
  buildSeedProposalCreateData,
  buildSeedTemplateCreateData,
  PROPOSAL_SEED_PROPOSALS,
  PROPOSAL_SEED_SERVICES,
  PROPOSAL_SEED_SERVICE_IDS,
  PROPOSAL_SEED_TEMPLATES,
} from "./seed-data/proposal-seed-data.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PAYMENT_CONDITIONS = [
  {
    name: "A Vista",
    description: null as string | null,
    installments: 1,
    daysBetween: null as number | null,
    isDefault: true,
    isActive: true,
  },
  {
    name: "30 dias",
    description: null as string | null,
    installments: 1,
    daysBetween: 30,
    isDefault: false,
    isActive: true,
  },
  {
    name: "30/60 dias",
    description: null as string | null,
    installments: 2,
    daysBetween: 30,
    isDefault: false,
    isActive: true,
  },
  {
    name: "30/60/90 dias",
    description: null as string | null,
    installments: 3,
    daysBetween: 30,
    isDefault: false,
    isActive: true,
  },
] as const;

async function seedPaymentConditions(): Promise<void> {
  for (const row of DEFAULT_PAYMENT_CONDITIONS) {
    await prisma.paymentCondition.upsert({
      where: { name: row.name },
      create: {
        name: row.name,
        description: row.description,
        installments: row.installments,
        daysBetween: row.daysBetween,
        isDefault: row.isDefault,
        isActive: row.isActive,
      },
      update: {
        description: row.description,
        installments: row.installments,
        daysBetween: row.daysBetween,
        isDefault: row.isDefault,
        isActive: row.isActive,
      },
    });
  }

  await prisma.paymentCondition.updateMany({
    where: { NOT: { name: "A Vista" } },
    data: { isDefault: false },
  });
  await prisma.paymentCondition.update({
    where: { name: "A Vista" },
    data: { isDefault: true },
  });
}

async function seedProposalCatalogServices(): Promise<void> {
  for (const row of PROPOSAL_SEED_SERVICES) {
    const id = PROPOSAL_SEED_SERVICE_IDS[row.mockId];
    await prisma.catalogItem.upsert({
      where: { id },
      create: {
        id,
        type: "SERVICE",
        name: row.name,
        description: row.description,
        price: row.price,
        serviceCategory: row.serviceCategory,
        imageUrl: row.imageUrl,
        isActive: true,
      },
      update: {
        name: row.name,
        description: row.description,
        price: row.price,
        serviceCategory: row.serviceCategory,
        imageUrl: row.imageUrl,
        isActive: true,
      },
    });
  }
}

async function seedProposalTemplates(): Promise<void> {
  for (const row of PROPOSAL_SEED_TEMPLATES) {
    const data = buildSeedTemplateCreateData(row);
    await prisma.proposalTemplate.upsert({
      where: { id: data.id! },
      create: data,
      update: {
        title: data.title,
        description: data.description,
        category: data.category,
        introduction: data.introduction,
        serviceIds: data.serviceIds,
        schedule: data.schedule,
        isActive: true,
      },
    });
  }
}

async function seedDemoProposals(createdById: string): Promise<void> {
  for (const row of PROPOSAL_SEED_PROPOSALS) {
    const data = buildSeedProposalCreateData(row, createdById);
    const proposalId = data.id!;

    await prisma.proposalLineItem.deleteMany({ where: { proposalId } });
    await prisma.proposalInternalCost.deleteMany({ where: { proposalId } });

    await prisma.proposal.upsert({
      where: { id: proposalId },
      create: data,
      update: {
        status: data.status,
        coverTitle: data.coverTitle,
        coverClient: data.coverClient,
        coverClientAddress: data.coverClientAddress,
        coverClientDocument: data.coverClientDocument,
        coverClientContact: data.coverClientContact,
        coverDate: data.coverDate,
        introduction: data.introduction,
        notes: data.notes,
        signaturePreparedBy: data.signaturePreparedBy,
        signatureDate: data.signatureDate,
        discountPercent: data.discountPercent,
        taxPercent: data.taxPercent,
        blocks: data.blocks,
        sectionOrder: data.sectionOrder,
        schedule: data.schedule,
        completedAt: data.completedAt,
        updatedAt: data.updatedAt,
        lineItems: data.lineItems,
      },
    });
  }
}

async function ensureAdminUser(): Promise<string | null> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsernameRaw = process.env.ADMIN_USERNAME?.trim();

  if (!adminEmail || !adminPassword) {
    return null;
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });

  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const baseUsername =
    adminUsernameRaw && adminUsernameRaw.length >= 3
      ? adminUsernameRaw.slice(0, 32).replace(/[^a-zA-Z0-9_]/g, "_")
      : `adm_${adminEmail.split("@")[0]!.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20)}`;

  let username = baseUsername;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${baseUsername.slice(0, 28)}_${suffix}`;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: existing.id, roleId: adminRole.id },
      },
      create: { userId: existing.id, roleId: adminRole.id },
      update: {},
    });
    return existing.id;
  }

  const created = await prisma.user.create({
    data: {
      email: adminEmail,
      username,
      passwordHash,
      roles: {
        create: { roleId: adminRole.id },
      },
    },
  });

  return created.id;
}

async function main(): Promise<void> {
  await prisma.role.upsert({
    where: { name: "user" },
    create: { name: "user", description: "Utilizador normal" },
    update: {},
  });

  await prisma.role.upsert({
    where: { name: "admin" },
    create: { name: "admin", description: "Administrador" },
    update: {},
  });

  await seedPaymentConditions();
  await seedProposalCatalogServices();
  await seedProposalTemplates();

  const adminUserId = await ensureAdminUser();
  if (adminUserId) {
    await seedDemoProposals(adminUserId);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    process.stderr.write(`${String(e)}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
