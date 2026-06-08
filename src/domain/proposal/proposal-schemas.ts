import { z } from "zod";

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export const proposalStatusSchema = z.enum(["draft", "completed"]);

export const listProposalsSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
  ),
  status: z.preprocess(
    preprocessEmptyStringToUndefined,
    proposalStatusSchema.optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListProposalsParams = z.infer<typeof listProposalsSchema>;
export type ProposalStatusFilter = z.infer<typeof proposalStatusSchema>;
