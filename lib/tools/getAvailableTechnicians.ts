import { z } from 'zod';
import { getAvailableTechniciansByCategory } from '@/lib/db/queries';
import { IssueCategory, Technician } from '@/types/domain';

export const GetAvailableTechniciansInputSchema = z.object({
  category: z.enum(['plumbing', 'electrical', 'cleaning']),
});

export type GetAvailableTechniciansInput = z.infer<typeof GetAvailableTechniciansInputSchema>;

export async function executeGetAvailableTechnicians(input: GetAvailableTechniciansInput): Promise<Technician[]> {
  const validated = GetAvailableTechniciansInputSchema.parse(input);
  const techs = await getAvailableTechniciansByCategory(validated.category);
  return techs as Technician[];
}
