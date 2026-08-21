import { z } from 'zod';
import { createWorkOrderRecord } from '@/lib/db/queries';
import { WorkOrder } from '@/types/domain';

export const CreateWorkOrderInputSchema = z.object({
  issueId: z.string().min(1, 'Issue ID is required'),
  technicianId: z.string().optional(),
  category: z.enum(['plumbing', 'electrical', 'cleaning']),
  problem: z.string().min(2, 'Problem title must be provided'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(2, 'Location must be provided'),
  description: z.string().min(2, 'Description must be provided'),
  reasoning: z.string().optional(),
  selectedTechnicianName: z.string().optional(),
  toolTrace: z.array(z.any()).optional(),
});

export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderInputSchema>;

export async function executeCreateWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const validated = CreateWorkOrderInputSchema.parse(input);

  const defaultLogs = [
    {
      timestamp: new Date().toISOString(),
      step: 'ROUTING_AND_WORK_ORDER_CREATION',
      action: 'CREATE_WORK_ORDER',
      details: validated.reasoning || `Assigned ${validated.category} technician for ${validated.severity} severity issue.`,
      selectedTechnicianName: validated.selectedTechnicianName,
    },
  ];

  const agentLogs = validated.toolTrace && validated.toolTrace.length > 0
    ? validated.toolTrace
    : defaultLogs;

  const workOrder = await createWorkOrderRecord({
    issueId: validated.issueId,
    technicianId: validated.technicianId,
    category: validated.category,
    problem: validated.problem,
    severity: validated.severity,
    location: validated.location,
    description: validated.description,
    agentLogs,
  });

  return workOrder as WorkOrder;
}
