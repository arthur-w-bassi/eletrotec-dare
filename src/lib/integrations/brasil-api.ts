import "server-only";

import ky from "ky";

import type { CnpjLookupDTO } from "@/domain/customer/customer-types";
import { normalizeDigits } from "@/domain/customer/customer-types";
import { RouteError } from "@/lib/http/api-error";
import { logService } from "@/lib/logger/log-service";

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;
const CLEANUP_EVERY_LOOKUPS = 100;

const externalKy = ky.create({
  timeout: 5000,
  retry: { limit: 0 },
});

interface BrasilApiCnpjResponse {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
}

interface ReceitaWsCnpjResponse {
  status?: string;
  nome?: string;
  fantasia?: string;
  cnpj?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
}

const cache = new Map<string, { data: CnpjLookupDTO; expiresAt: number }>();
let lookupCount = 0;

function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

function ensureCapacityBeforeSet(key: string): void {
  if (cache.has(key)) return;
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

function runPeriodicCleanup(): void {
  lookupCount += 1;
  if (lookupCount % CLEANUP_EVERY_LOOKUPS === 0) {
    pruneExpiredEntries();
  }
}

function normalizeZipCode(cep: string | undefined): string {
  const d = normalizeDigits(cep ?? "");
  return d.length === 8 ? d : "";
}

function normalizeState(uf: string | undefined): string {
  const t = (uf ?? "").trim().toUpperCase();
  return t.slice(0, 2);
}

function mapBrasilApiToDto(raw: BrasilApiCnpjResponse, fallbackCnpj: string): CnpjLookupDTO | null {
  const razaoSocial = (raw.razao_social ?? "").trim();
  if (!razaoSocial) return null;

  const fromApi = normalizeDigits(raw.cnpj ?? "");
  const cnpj = fromApi.length === 14 ? fromApi : fallbackCnpj;

  return {
    razaoSocial,
    nomeFantasia: (raw.nome_fantasia ?? "").trim(),
    cnpj,
    zipCode: normalizeZipCode(raw.cep),
    state: normalizeState(raw.uf),
    city: (raw.municipio ?? "").trim(),
    neighborhood: (raw.bairro ?? "").trim(),
    street: (raw.logradouro ?? "").trim(),
    number: String(raw.numero ?? "").trim(),
    complement: (raw.complemento ?? "").trim(),
  };
}

function mapReceitaWsToDto(raw: ReceitaWsCnpjResponse, fallbackCnpj: string): CnpjLookupDTO | null {
  if (raw.status !== "OK") return null;

  const razaoSocial = (raw.nome ?? "").trim();
  if (!razaoSocial) return null;

  const fromApi = normalizeDigits(raw.cnpj ?? "");
  const cnpj = fromApi.length === 14 ? fromApi : fallbackCnpj;

  return {
    razaoSocial,
    nomeFantasia: (raw.fantasia ?? "").trim(),
    cnpj,
    zipCode: normalizeZipCode(raw.cep),
    state: normalizeState(raw.uf),
    city: (raw.municipio ?? "").trim(),
    neighborhood: (raw.bairro ?? "").trim(),
    street: (raw.logradouro ?? "").trim(),
    number: String(raw.numero ?? "").trim(),
    complement: (raw.complemento ?? "").trim(),
  };
}

async function fetchFromBrasilApi(cnpj: string): Promise<CnpjLookupDTO | null> {
  try {
    const res = await externalKy.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!res.ok) return null;
    const raw = (await res.json()) as BrasilApiCnpjResponse;
    return mapBrasilApiToDto(raw, cnpj);
  } catch {
    return null;
  }
}

async function fetchFromReceitaWs(cnpj: string): Promise<CnpjLookupDTO | null> {
  try {
    const res = await externalKy.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    if (!res.ok) return null;
    const raw = (await res.json()) as ReceitaWsCnpjResponse;
    return mapReceitaWsToDto(raw, cnpj);
  } catch {
    return null;
  }
}

export async function lookupCnpj(cnpj: string): Promise<CnpjLookupDTO> {
  const digits = normalizeDigits(cnpj);
  if (digits.length !== 14) {
    throw new RouteError(400, "VALIDATION_ERROR", "CNPJ inválido.");
  }

  runPeriodicCleanup();

  const hit = cache.get(digits);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.data;
  }
  if (hit) {
    cache.delete(digits);
  }

  let dto = await fetchFromBrasilApi(digits);
  if (!dto) {
    dto = await fetchFromReceitaWs(digits);
  }

  if (!dto) {
    logService.warn("Consulta CNPJ falhou em ambas as fontes", { cnpj: digits });
    throw new RouteError(
      502,
      "CNPJ_LOOKUP_FAILED",
      "Não foi possível obter dados do CNPJ. Preenche manualmente.",
    );
  }

  ensureCapacityBeforeSet(digits);
  cache.set(digits, { data: dto, expiresAt: Date.now() + TTL_MS });
  return dto;
}
