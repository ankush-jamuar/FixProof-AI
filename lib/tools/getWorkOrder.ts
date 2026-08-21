import { z } from 'zod';
import { getWorkOrderById, getIssueById, getTechnicianById } from '@/lib/db/queries';
import { WorkOrder } from '@/types/domain';

export const GetWorkOrderInputSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order ID is required'),
});

export type GetWorkOrderInput = z.infer<typeof GetWorkOrderInputSchema>;

export async function executeGetWorkOrder(input: GetWorkOrderInput): Promise<WorkOrder | null> {
  const validated = GetWorkOrderInputSchema.parse(input);
  const wo = await getWorkOrderById(validated.workOrderId);
  if (!wo) return null;

  const [issue, technician] = await Promise.all([
    getIssueById(wo.issueId),
    wo.technicianId ? getTechnicianById(wo.technicianId) : Promise.resolve(null),
  ]);

  return {
    ...wo,
    issue,
    technician,
  } as unknown as WorkOrder;
}
