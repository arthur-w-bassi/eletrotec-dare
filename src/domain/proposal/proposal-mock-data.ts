import { ELETROTEC_COMPANY } from "./eletrotec-company";
import {
  formatProposalMonthYear,
  formatProposalSignatureDate,
  generateProposalNumber,
} from "./proposal-customer";
import type {
  MockProposal,
  MockService,
  ProposalLineItem,
  ProposalScheduleItem,
  ProposalTemplate,
} from "./proposal-types";
import { buildDefaultSectionOrder } from "./proposal-section-order";

export const MOCK_SERVICES: MockService[] = [
  {
    id: "1",
    title: "Manutenção Preventiva de HVAC",
    description: "Inspeção e manutenção preventiva de unidades HVAC.",
    image: "https://picsum.photos/seed/hvac1/400/225",
    category: "HVAC",
    price: 1200,
  },
  {
    id: "2",
    title: "Modernização de Quadro Elétrico Comercial",
    description: "Modernização e certificação de quadros de distribuição elétrica principal.",
    image: "https://picsum.photos/seed/elec1/400/225",
    category: "Electrical",
    price: 3500,
  },
  {
    id: "3",
    title: "Inspeção Hidráulica Industrial",
    description: "Inspeção completa de sistemas hidráulicos, incluindo teste de pressão.",
    image: "https://picsum.photos/seed/plumb1/400/225",
    category: "Plumbing",
    price: 950,
  },
  {
    id: "4",
    title: "Contrato de Manutenção Predial",
    description: "Manutenção mensal in loco para sistemas críticos do edifício.",
    image: "https://picsum.photos/seed/maint1/400/225",
    category: "Maintenance",
    price: 2800,
  },
  {
    id: "5",
    title: "Inspeção de Conformidade de Segurança",
    description: "Auditoria abrangente de segurança e conformidade para instalações comerciais.",
    image: "https://picsum.photos/seed/insp1/400/225",
    category: "Inspection",
    price: 1100,
  },
  {
    id: "6",
    title: "Serviço de Gerador de Emergência",
    description: "Teste de carga, verificação do sistema de combustível e validação de desempenho.",
    image: "https://picsum.photos/seed/elec2/400/225",
    category: "Electrical",
    price: 1800,
  },
  {
    id: "7",
    title: "Revisão de Sistema de Chiller",
    description: "Limpeza profunda, análise de refrigerante e ajuste de eficiência do chiller.",
    image: "https://picsum.photos/seed/hvac2/400/225",
    category: "HVAC",
    price: 3200,
  },
  {
    id: "8",
    title: "Teste de Prevenção de Refluxo",
    description: "Teste anual e certificação de dispositivos de prevenção de refluxo.",
    image: "https://picsum.photos/seed/plumb2/400/225",
    category: "Plumbing",
    price: 800,
  },
  {
    id: "9",
    title: "Manutenção de Telhado e Envelope",
    description: "Manutenção preventiva de coberturas, vedações e envelope do edifício.",
    image: "https://picsum.photos/seed/maint2/400/225",
    category: "Maintenance",
    price: 2100,
  },
  {
    id: "10",
    title: "Inspeção de Combate a Incêndio",
    description: "Inspeção e teste de sistemas de combate a incêndio e alarmes.",
    image: "https://picsum.photos/seed/insp2/400/225",
    category: "Inspection",
    price: 1450,
  },
  {
    id: "11",
    title: "Retrofit de Iluminação LED",
    description: "Retrofit LED de alta eficiência para áreas de armazém e escritório.",
    image: "https://picsum.photos/seed/elec3/400/225",
    category: "Electrical",
    price: 2650,
  },
  {
    id: "12",
    title: "Avaliação de Qualidade do Ar",
    description: "Teste de qualidade do ar interno e otimização de filtragem HVAC.",
    image: "https://picsum.photos/seed/hvac3/400/225",
    category: "HVAC",
    price: 1350,
  },
];

function createLineItem(service: MockService, id: string): ProposalLineItem {
  return {
    id,
    serviceId: service.id,
    title: service.title,
    description: service.description,
    image: service.image,
    qty: 1,
    unitPrice: service.price,
  };
}

const hvacService = MOCK_SERVICES[0]!;
const electricalService = MOCK_SERVICES[1]!;
const inspectionService = MOCK_SERVICES[4]!;

export function createBlankProposal(existingNumbers: string[] = []): MockProposal {
  const now = new Date();

  return {
    status: "draft",
    cover: {
      title: "Proposta Comercial",
      client: "",
      clientAddress: "",
      clientDocument: "",
      clientContact: "",
      number: generateProposalNumber(existingNumbers),
      date: formatProposalMonthYear(now),
    },
    introduction: "",
    lineItems: [],
    blocks: [],
    schedule: [],
    notes: "",
    signature: {
      preparedBy: ELETROTEC_COMPANY.name,
      date: formatProposalSignatureDate(now),
    },
    financial: {
      discountPercent: 0,
      taxPercent: 0,
    },
  };
}

export const INITIAL_PROPOSAL: MockProposal = {
  id: "seed-1",
  status: "draft",
  cover: {
    title: "Proposta Comercial",
    client: "Centro de Fulfillment Amazon",
    clientAddress: "Av. dos Autonomistas, 1496 — Vila Yara, Osasco — SP",
    clientDocument: "00.000.000/0001-91",
    clientContact: "(11) 3456-7890",
    number: "PR-2026-001",
    date: "Junho de 2026",
  },
  introduction:
    "A Sea Haven Industries tem o prazer de apresentar esta proposta comercial para serviços integrados de facilities no seu centro de fulfillment. Nossa equipe reúne mais de duas décadas de experiência em soluções elétricas industriais, HVAC e conformidade regulatória. Estamos comprometidos em entregar serviços confiáveis e eficientes, minimizando paradas operacionais e garantindo excelência em toda a instalação.",
  lineItems: [
    createLineItem(hvacService, "line-1"),
    createLineItem(electricalService, "line-2"),
    createLineItem(inspectionService, "line-3"),
  ],
  blocks: [
    {
      id: "schedule-block-seed-1",
      type: "schedule",
      items: [
        createScheduleItem({
          period: "Semana 1",
          activity: "Visita técnica e levantamento das instalações elétricas e HVAC.",
          notes: "Agendar com o responsável de facilities no local.",
        }),
        createScheduleItem({
          period: "Semana 2–3",
          activity: "Execução da manutenção preventiva e modernização do quadro elétrico.",
          notes: "Trabalho preferencialmente fora do horário de pico.",
        }),
        createScheduleItem({
          period: "Semana 4",
          activity: "Inspeção de conformidade, testes finais e entrega do relatório.",
          notes: "Cliente deve validar os itens concluídos antes do encerramento.",
        }),
      ],
    },
  ],
  schedule: [],
  notes: "",
  signature: {
    preparedBy: "Sea Haven Industries",
    date: "8 de junho de 2026",
  },
  financial: {
    discountPercent: 5,
    taxPercent: 8.5,
  },
};

export function getServiceById(id: string): MockService | undefined {
  return MOCK_SERVICES.find((service) => service.id === id);
}

export function createLineItemFromService(service: MockService): ProposalLineItem {
  return createLineItem(service, `line-${crypto.randomUUID()}`);
}

export function createScheduleItem(overrides?: Partial<Omit<ProposalScheduleItem, "id">>): ProposalScheduleItem {
  return {
    id: `schedule-${crypto.randomUUID()}`,
    period: "",
    activity: "",
    notes: "",
    ...overrides,
  };
}

export const MOCK_PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: "tpl-facilities",
    title: "Facilities Integrado",
    description:
      "Proposta completa com manutenção HVAC, elétrica e inspeção de conformidade para centros logísticos.",
    category: "Maintenance",
    introduction:
      "A Eletrotec DARÉ tem o prazer de apresentar esta proposta comercial para serviços integrados de facilities. Nossa equipe reúne experiência consolidada em soluções elétricas industriais, HVAC e conformidade regulatória. Estamos comprometidos em entregar serviços confiáveis e eficientes, minimizando paradas operacionais e garantindo excelência em toda a instalação.",
    serviceIds: ["1", "2", "5"],
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
    id: "tpl-hvac",
    title: "Manutenção HVAC Anual",
    description: "Pacote de manutenção preventiva e avaliação de qualidade do ar para sistemas de climatização.",
    category: "HVAC",
    introduction:
      "Apresentamos esta proposta para a manutenção anual dos sistemas HVAC do seu empreendimento. Nossos técnicos certificados realizam inspeções detalhadas, limpeza de componentes críticos e ajustes de eficiência energética, assegurando conforto térmico e prolongando a vida útil dos equipamentos.",
    serviceIds: ["1", "7", "12"],
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
    id: "tpl-electrical",
    title: "Modernização Elétrica",
    description: "Retrofit de iluminação LED, modernização de quadros e teste de geradores de emergência.",
    category: "Electrical",
    introduction:
      "Esta proposta contempla a modernização elétrica do seu empreendimento, com foco em eficiência energética, segurança e conformidade com normas técnicas vigentes. A Eletrotec DARÉ executa cada etapa com rigor técnico, documentação completa e mínimo impacto nas operações diárias.",
    serviceIds: ["2", "6", "11"],
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
    id: "tpl-compliance",
    title: "Conformidade e Inspeções",
    description: "Auditoria de segurança, inspeção de combate a incêndio e testes hidráulicos.",
    category: "Inspection",
    introduction:
      "Oferecemos um pacote integrado de inspeções e auditorias para garantir a conformidade do seu empreendimento com normas de segurança, combate a incêndio e sistemas hidráulicos. Cada visita gera relatório detalhado com não conformidades, prazos e plano de ação corretiva.",
    serviceIds: ["3", "5", "8", "10"],
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
    id: "tpl-building",
    title: "Manutenção Predial",
    description: "Contrato mensal de manutenção predial com cobertura de telhado e sistemas críticos.",
    category: "Maintenance",
    introduction:
      "Proposta para contrato de manutenção predial com visitas programadas e atendimento a chamados prioritários. Nossa equipe acompanha sistemas críticos do edifício, realiza inspeções periódicas e mantém registros atualizados para facilitar auditorias e renovações contratuais.",
    serviceIds: ["4", "9"],
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

export function buildProposalFromTemplate(
  template: ProposalTemplate,
  base: MockProposal,
): MockProposal {
  const lineItems = template.serviceIds
    .map((serviceId) => getServiceById(serviceId))
    .filter((service): service is MockService => service !== undefined)
    .map((service) => createLineItemFromService(service));

  const schedule = template.schedule.map((entry) => createScheduleItem(entry));
  const nonScheduleBlocks = (base.blocks ?? []).filter((block) => block.type !== "schedule");
  const blocks = [
    ...nonScheduleBlocks,
    {
      id: `schedule-block-${crypto.randomUUID()}`,
      type: "schedule" as const,
      items: schedule,
    },
  ];

  return {
    ...base,
    introduction: template.introduction,
    lineItems,
    blocks,
    sectionOrder: buildDefaultSectionOrder(blocks),
    schedule: [],
  };
}

export function getTemplateById(id: string): ProposalTemplate | undefined {
  return MOCK_PROPOSAL_TEMPLATES.find((template) => template.id === id);
}
