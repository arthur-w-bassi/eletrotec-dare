import type { Prisma } from "../../src/generated/prisma/client.js";

/** IDs estáveis para upsert — mapeiam os ids mock originais ("1"…"12"). */
export const PROPOSAL_SEED_SERVICE_IDS = {
  "1": "a0000001-0000-4000-8000-000000000001",
  "2": "a0000002-0000-4000-8000-000000000002",
  "3": "a0000003-0000-4000-8000-000000000003",
  "4": "a0000004-0000-4000-8000-000000000004",
  "5": "a0000005-0000-4000-8000-000000000005",
  "6": "a0000006-0000-4000-8000-000000000006",
  "7": "a0000007-0000-4000-8000-000000000007",
  "8": "a0000008-0000-4000-8000-000000000008",
  "9": "a0000009-0000-4000-8000-000000000009",
  "10": "a0000010-0000-4000-8000-000000000010",
  "11": "a0000011-0000-4000-8000-000000000011",
  "12": "a0000012-0000-4000-8000-000000000012",
} as const;

export const PROPOSAL_SEED_TEMPLATE_IDS = {
  "tpl-facilities": "b0000001-0000-4000-8000-000000000001",
  "tpl-hvac": "b0000002-0000-4000-8000-000000000002",
  "tpl-electrical": "b0000003-0000-4000-8000-000000000003",
  "tpl-compliance": "b0000004-0000-4000-8000-000000000004",
  "tpl-building": "b0000005-0000-4000-8000-000000000005",
} as const;

export const PROPOSAL_SEED_PROPOSAL_IDS = {
  "seed-1": "c0000001-0000-4000-8000-000000000001",
  "seed-2": "c0000002-0000-4000-8000-000000000002",
  "seed-3": "c0000003-0000-4000-8000-000000000003",
  "seed-4": "c0000004-0000-4000-8000-000000000004",
} as const;

type SeedServiceRow = {
  mockId: keyof typeof PROPOSAL_SEED_SERVICE_IDS;
  name: string;
  description: string;
  imageUrl: string;
  serviceCategory: "ELECTRICAL" | "HVAC" | "PLUMBING" | "MAINTENANCE" | "INSPECTION";
  price: number;
};

export const PROPOSAL_SEED_SERVICES: SeedServiceRow[] = [
  {
    mockId: "1",
    name: "Manutenção Preventiva de HVAC",
    description: "Inspeção e manutenção preventiva de unidades HVAC.",
    imageUrl: "https://picsum.photos/seed/hvac1/400/225",
    serviceCategory: "HVAC",
    price: 1200,
  },
  {
    mockId: "2",
    name: "Modernização de Quadro Elétrico Comercial",
    description: "Modernização e certificação de quadros de distribuição elétrica principal.",
    imageUrl: "https://picsum.photos/seed/elec1/400/225",
    serviceCategory: "ELECTRICAL",
    price: 3500,
  },
  {
    mockId: "3",
    name: "Inspeção Hidráulica Industrial",
    description: "Inspeção completa de sistemas hidráulicos, incluindo teste de pressão.",
    imageUrl: "https://picsum.photos/seed/plumb1/400/225",
    serviceCategory: "PLUMBING",
    price: 950,
  },
  {
    mockId: "4",
    name: "Contrato de Manutenção Predial",
    description: "Manutenção mensal in loco para sistemas críticos do edifício.",
    imageUrl: "https://picsum.photos/seed/maint1/400/225",
    serviceCategory: "MAINTENANCE",
    price: 2800,
  },
  {
    mockId: "5",
    name: "Inspeção de Conformidade de Segurança",
    description: "Auditoria abrangente de segurança e conformidade para instalações comerciais.",
    imageUrl: "https://picsum.photos/seed/insp1/400/225",
    serviceCategory: "INSPECTION",
    price: 1100,
  },
  {
    mockId: "6",
    name: "Serviço de Gerador de Emergência",
    description: "Teste de carga, verificação do sistema de combustível e validação de desempenho.",
    imageUrl: "https://picsum.photos/seed/elec2/400/225",
    serviceCategory: "ELECTRICAL",
    price: 1800,
  },
  {
    mockId: "7",
    name: "Revisão de Sistema de Chiller",
    description: "Limpeza profunda, análise de refrigerante e ajuste de eficiência do chiller.",
    imageUrl: "https://picsum.photos/seed/hvac2/400/225",
    serviceCategory: "HVAC",
    price: 3200,
  },
  {
    mockId: "8",
    name: "Teste de Prevenção de Refluxo",
    description: "Teste anual e certificação de dispositivos de prevenção de refluxo.",
    imageUrl: "https://picsum.photos/seed/plumb2/400/225",
    serviceCategory: "PLUMBING",
    price: 800,
  },
  {
    mockId: "9",
    name: "Manutenção de Telhado e Envelope",
    description: "Manutenção preventiva de coberturas, vedações e envelope do edifício.",
    imageUrl: "https://picsum.photos/seed/maint2/400/225",
    serviceCategory: "MAINTENANCE",
    price: 2100,
  },
  {
    mockId: "10",
    name: "Inspeção de Combate a Incêndio",
    description: "Inspeção e teste de sistemas de combate a incêndio e alarmes.",
    imageUrl: "https://picsum.photos/seed/insp2/400/225",
    serviceCategory: "INSPECTION",
    price: 1450,
  },
  {
    mockId: "11",
    name: "Retrofit de Iluminação LED",
    description: "Retrofit LED de alta eficiência para áreas de armazém e escritório.",
    imageUrl: "https://picsum.photos/seed/elec3/400/225",
    serviceCategory: "ELECTRICAL",
    price: 2650,
  },
  {
    mockId: "12",
    name: "Avaliação de Qualidade do Ar",
    description: "Teste de qualidade do ar interno e otimização de filtragem HVAC.",
    imageUrl: "https://picsum.photos/seed/hvac3/400/225",
    serviceCategory: "HVAC",
    price: 1350,
  },
];

function mapMockServiceIds(mockIds: string[]): string[] {
  return mockIds.map((id) => PROPOSAL_SEED_SERVICE_IDS[id as keyof typeof PROPOSAL_SEED_SERVICE_IDS]);
}

type SeedTemplateRow = {
  mockId: keyof typeof PROPOSAL_SEED_TEMPLATE_IDS;
  title: string;
  description: string;
  category: SeedServiceRow["serviceCategory"];
  introduction: string;
  serviceMockIds: string[];
  schedule: Array<{ period: string; activity: string; notes: string }>;
};

export const PROPOSAL_SEED_TEMPLATES: SeedTemplateRow[] = [
  {
    mockId: "tpl-facilities",
    title: "Facilities Integrado",
    description:
      "Proposta completa com manutenção HVAC, elétrica e inspeção de conformidade para centros logísticos.",
    category: "MAINTENANCE",
    introduction:
      "A Eletrotec DARÉ tem o prazer de apresentar esta proposta comercial para serviços integrados de facilities. Nossa equipe reúne experiência consolidada em soluções elétricas industriais, HVAC e conformidade regulatória. Estamos comprometidos em entregar serviços confiáveis e eficientes, minimizando paradas operacionais e garantindo excelência em toda a instalação.",
    serviceMockIds: ["1", "2", "5"],
    schedule: [
      {
        period: "Semana 1",
        activity: "Visita técnica e levantamento das instalações elétricas e HVAC.",
        notes: "Agendar com o responsável de facilities no local.",
      },
      {
        period: "Semana 2–3",
        activity: "Execução da manutenção preventiva e modernização do quadro elétrico.",
        notes: "Trabalho preferencialmente fora do horário de pico.",
      },
      {
        period: "Semana 4",
        activity: "Inspeção de conformidade, testes finais e entrega do relatório.",
        notes: "Cliente deve validar os itens concluídos antes do encerramento.",
      },
    ],
  },
  {
    mockId: "tpl-hvac",
    title: "Manutenção HVAC Anual",
    description: "Pacote de manutenção preventiva e avaliação de qualidade do ar para sistemas de climatização.",
    category: "HVAC",
    introduction:
      "Apresentamos esta proposta para a manutenção anual dos sistemas HVAC do seu empreendimento. Nossos técnicos certificados realizam inspeções detalhadas, limpeza de componentes críticos e ajustes de eficiência energética, assegurando conforto térmico e prolongando a vida útil dos equipamentos.",
    serviceMockIds: ["1", "7", "12"],
    schedule: [
      {
        period: "Semana 1",
        activity: "Diagnóstico inicial e mapeamento das unidades HVAC.",
        notes: "Verificar acesso às áreas técnicas e disponibilidade de energia.",
      },
      {
        period: "Semana 2",
        activity: "Manutenção preventiva e revisão do sistema de chiller.",
        notes: "Interrupções parciais podem ser necessárias por setor.",
      },
      {
        period: "Semana 3",
        activity: "Avaliação de qualidade do ar e entrega do relatório técnico.",
        notes: "Inclui recomendações de melhorias e próximos passos.",
      },
    ],
  },
  {
    mockId: "tpl-electrical",
    title: "Modernização Elétrica",
    description: "Retrofit de iluminação LED, modernização de quadros e teste de geradores de emergência.",
    category: "ELECTRICAL",
    introduction:
      "Esta proposta contempla a modernização elétrica do seu empreendimento, com foco em eficiência energética, segurança e conformidade com normas técnicas vigentes. A Eletrotec DARÉ executa cada etapa com rigor técnico, documentação completa e mínimo impacto nas operações diárias.",
    serviceMockIds: ["2", "6", "11"],
    schedule: [
      {
        period: "Semana 1",
        activity: "Levantamento elétrico e elaboração do plano de execução.",
        notes: "Identificar pontos críticos e janelas de intervenção.",
      },
      {
        period: "Semana 2–3",
        activity: "Modernização do quadro elétrico e retrofit de iluminação LED.",
        notes: "Execução por etapas para manter áreas operacionais.",
      },
      {
        period: "Semana 4",
        activity: "Teste do gerador de emergência e comissionamento final.",
        notes: "Entrega de laudo e orientações de operação.",
      },
    ],
  },
  {
    mockId: "tpl-compliance",
    title: "Conformidade e Inspeções",
    description: "Auditoria de segurança, inspeção de combate a incêndio e testes hidráulicos.",
    category: "INSPECTION",
    introduction:
      "Oferecemos um pacote integrado de inspeções e auditorias para garantir a conformidade do seu empreendimento com normas de segurança, combate a incêndio e sistemas hidráulicos. Cada visita gera relatório detalhado com não conformidades, prazos e plano de ação corretiva.",
    serviceMockIds: ["3", "5", "8", "10"],
    schedule: [
      {
        period: "Semana 1",
        activity: "Inspeção de conformidade de segurança e levantamento documental.",
        notes: "Solicitar plantas e registros anteriores de inspeção.",
      },
      {
        period: "Semana 2",
        activity: "Inspeção hidráulica e teste de prevenção de refluxo.",
        notes: "Coordenar acesso às áreas técnicas e reservatórios.",
      },
      {
        period: "Semana 3",
        activity: "Inspeção de combate a incêndio e entrega consolidada dos laudos.",
        notes: "Apresentação dos resultados com responsável do cliente.",
      },
    ],
  },
  {
    mockId: "tpl-building",
    title: "Manutenção Predial",
    description: "Contrato mensal de manutenção predial com cobertura de telhado e sistemas críticos.",
    category: "MAINTENANCE",
    introduction:
      "Proposta para contrato de manutenção predial com visitas programadas e atendimento a chamados prioritários. Nossa equipe acompanha sistemas críticos do edifício, realiza inspeções periódicas e mantém registros atualizados para facilitar auditorias e renovações contratuais.",
    serviceMockIds: ["4", "9"],
    schedule: [
      {
        period: "Mês 1",
        activity: "Visita inicial, cadastro de equipamentos e plano de manutenção.",
        notes: "Definir cronograma mensal e contatos de emergência.",
      },
      {
        period: "Mês 2–11",
        activity: "Visitas mensais de manutenção preventiva in loco.",
        notes: "Relatório mensal com fotos e status dos itens verificados.",
      },
      {
        period: "Mês 12",
        activity: "Revisão anual de telhado, envelope e balanço do contrato.",
        notes: "Proposta de renovação com ajustes conforme histórico.",
      },
    ],
  },
];

export function buildSeedTemplateCreateData(
  row: SeedTemplateRow,
): Prisma.ProposalTemplateCreateInput {
  const id = PROPOSAL_SEED_TEMPLATE_IDS[row.mockId];
  return {
    id,
    title: row.title,
    description: row.description,
    category: row.category,
    introduction: row.introduction,
    serviceIds: mapMockServiceIds(row.serviceMockIds),
    schedule: row.schedule,
    isActive: true,
  };
}

const DEMO_SCHEDULE_BLOCK = {
  id: "schedule-block-seed-1",
  type: "schedule" as const,
  items: [
    {
      id: "sched-item-seed-1",
      period: "Semana 1",
      activity: "Visita técnica e levantamento das instalações elétricas e HVAC.",
      notes: "Agendar com o responsável de facilities no local.",
    },
    {
      id: "sched-item-seed-2",
      period: "Semana 2–3",
      activity: "Execução da manutenção preventiva e modernização do quadro elétrico.",
      notes: "Trabalho preferencialmente fora do horário de pico.",
    },
    {
      id: "sched-item-seed-3",
      period: "Semana 4",
      activity: "Inspeção de conformidade, testes finais e entrega do relatório.",
      notes: "Cliente deve validar os itens concluídos antes do encerramento.",
    },
  ],
};

const DEMO_INTRODUCTION =
  "A Sea Haven Industries tem o prazer de apresentar esta proposta comercial para serviços integrados de facilities no seu centro de fulfillment. Nossa equipe reúne mais de duas décadas de experiência em soluções elétricas industriais, HVAC e conformidade regulatória. Estamos comprometidos em entregar serviços confiáveis e eficientes, minimizando paradas operacionais e garantindo excelência em toda a instalação.";

type SeedProposalRow = {
  mockId: keyof typeof PROPOSAL_SEED_PROPOSAL_IDS;
  status: "DRAFT" | "COMPLETED";
  coverTitle: string;
  coverClient: string;
  coverClientAddress: string;
  coverClientDocument: string;
  coverClientContact: string;
  coverDate: string;
  introduction: string;
  discountPercent: number;
  taxPercent: number;
  signaturePreparedBy: string;
  signatureDate: string;
  serviceMockIds: string[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const PROPOSAL_SEED_PROPOSALS: SeedProposalRow[] = [
  {
    mockId: "seed-1",
    status: "DRAFT",
    coverTitle: "Proposta Comercial",
    coverClient: "Centro de Fulfillment Amazon",
    coverClientAddress: "Av. dos Autonomistas, 1496 — Vila Yara, Osasco — SP",
    coverClientDocument: "00.000.000/0001-91",
    coverClientContact: "(11) 3456-7890",
    coverDate: "Junho de 2026",
    introduction: DEMO_INTRODUCTION,
    discountPercent: 5,
    taxPercent: 8.5,
    signaturePreparedBy: "Sea Haven Industries",
    signatureDate: "8 de junho de 2026",
    serviceMockIds: ["1", "2", "5"],
    completedAt: null,
    createdAt: new Date("2026-06-01T10:30:00.000Z"),
    updatedAt: new Date("2026-06-08T14:20:00.000Z"),
  },
  {
    mockId: "seed-2",
    status: "COMPLETED",
    coverTitle: "Proposta Comercial",
    coverClient: "Logística Norte S.A.",
    coverClientAddress: "Av. dos Autonomistas, 1496 — Vila Yara, Osasco — SP",
    coverClientDocument: "00.000.000/0001-91",
    coverClientContact: "(11) 3456-7890",
    coverDate: "Maio de 2026",
    introduction: DEMO_INTRODUCTION,
    discountPercent: 5,
    taxPercent: 8.5,
    signaturePreparedBy: "Sea Haven Industries",
    signatureDate: "8 de junho de 2026",
    serviceMockIds: ["1", "2", "5"],
    completedAt: new Date("2026-05-28T16:45:00.000Z"),
    createdAt: new Date("2026-05-12T09:15:00.000Z"),
    updatedAt: new Date("2026-05-28T16:45:00.000Z"),
  },
  {
    mockId: "seed-3",
    status: "COMPLETED",
    coverTitle: "Proposta de Manutenção Anual",
    coverClient: "Indústria Metalúrgica Silva",
    coverClientAddress: "Av. dos Autonomistas, 1496 — Vila Yara, Osasco — SP",
    coverClientDocument: "00.000.000/0001-91",
    coverClientContact: "(11) 3456-7890",
    coverDate: "Dezembro de 2025",
    introduction: DEMO_INTRODUCTION,
    discountPercent: 5,
    taxPercent: 8.5,
    signaturePreparedBy: "Sea Haven Industries",
    signatureDate: "8 de junho de 2026",
    serviceMockIds: ["1", "2"],
    completedAt: new Date("2025-12-18T10:10:00.000Z"),
    createdAt: new Date("2025-12-03T11:00:00.000Z"),
    updatedAt: new Date("2025-12-18T10:10:00.000Z"),
  },
  {
    mockId: "seed-4",
    status: "DRAFT",
    coverTitle: "Proposta Comercial",
    coverClient: "Hospital Regional Sul",
    coverClientAddress: "Av. dos Autonomistas, 1496 — Vila Yara, Osasco — SP",
    coverClientDocument: "00.000.000/0001-91",
    coverClientContact: "(11) 3456-7890",
    coverDate: "Junho de 2026",
    introduction: DEMO_INTRODUCTION,
    discountPercent: 5,
    taxPercent: 8.5,
    signaturePreparedBy: "Sea Haven Industries",
    signatureDate: "8 de junho de 2026",
    serviceMockIds: ["1"],
    completedAt: null,
    createdAt: new Date("2026-06-05T08:00:00.000Z"),
    updatedAt: new Date("2026-06-07T17:30:00.000Z"),
  },
];

export function buildSeedProposalCreateData(
  row: SeedProposalRow,
  createdById: string,
): Prisma.ProposalCreateInput {
  const id = PROPOSAL_SEED_PROPOSAL_IDS[row.mockId];
  const servicesByMockId = new Map(
    PROPOSAL_SEED_SERVICES.map((service) => [service.mockId, service] as const),
  );

  const lineItems: Prisma.ProposalLineItemCreateWithoutProposalInput[] = row.serviceMockIds.map(
    (mockId, index) => {
      const service = servicesByMockId.get(mockId as keyof typeof PROPOSAL_SEED_SERVICE_IDS)!;
      const catalogItemId = PROPOSAL_SEED_SERVICE_IDS[mockId as keyof typeof PROPOSAL_SEED_SERVICE_IDS];
      const quantity = 1;
      const unitPrice = service.price;
      const itemTotal = quantity * unitPrice;

      return {
        id: `${id}-line-${index + 1}`,
        catalogItem: { connect: { id: catalogItemId } },
        title: service.name,
        description: service.description,
        images: service.imageUrl ? [service.imageUrl] : [],
        quantity,
        unitPrice,
        itemTotal,
        sortOrder: index,
      };
    },
  );

  return {
    id,
    status: row.status,
    createdBy: { connect: { id: createdById } },
    coverTitle: row.coverTitle,
    coverClient: row.coverClient,
    coverClientAddress: row.coverClientAddress,
    coverClientDocument: row.coverClientDocument,
    coverClientContact: row.coverClientContact,
    coverDate: row.coverDate,
    introduction: row.introduction,
    notes: "",
    signaturePreparedBy: row.signaturePreparedBy,
    signatureDate: row.signatureDate,
    discountPercent: row.discountPercent,
    taxPercent: row.taxPercent,
    blocks: [DEMO_SCHEDULE_BLOCK],
    sectionOrder: ["introduction", "services", `block:${DEMO_SCHEDULE_BLOCK.id}`],
    schedule: [],
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lineItems: { create: lineItems },
  };
}
