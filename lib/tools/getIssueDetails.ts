import { z } from 'zod';
import { getIssueById } from '@/lib/db/queries';
import { Issue } from '@/types/domain';

export const GetIssueDetailsInputSchema = z.object({
  issueId: z.string().min(1, 'Issue ID is required'),
});

export type GetIssueDetailsInput = z.infer<typeof GetIssueDetailsInputSchema>;

export async function executeGetIssueDetails(input: GetIssueDetailsInput): Promise<Issue | null> {
  const validated = GetIssueDetailsInputSchema.parse(input);
  const issue = await getIssueById(validated.issueId);
  return issue as Issue | null;
}
