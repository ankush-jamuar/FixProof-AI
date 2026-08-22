import { getAllIssues, getAllWorkOrders } from '@/lib/db/queries';
import { IssueCategory, IssueSeverity, WorkOrderStatus } from '@/types/domain';

export interface MaintenanceInsight {
  id: string;
  type: 'LOCATION_CLUSTER' | 'CATEGORY_SPIKE' | 'REPEATED_REPAIR_FAILURE';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location?: string;
  category?: string;
  incidentCount: number;
  timeWindowDays: number;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
  supportingIssueIds: string[];
}

/**
 * Deterministic Maintenance Intelligence Engine
 * Analyzes real issue and work order database records to detect recurring failure patterns.
 */
export async function getMaintenanceInsights(): Promise<MaintenanceInsight[]> {
  const issues = await getAllIssues();
  const workOrders = await getAllWorkOrders();

  // Filter out any benchmark/evaluation test records
  const realIssues = (issues || []).filter(
    (i) => Boolean(i) && !i.title?.startsWith('EVAL:') && !i.description?.startsWith('EVAL:')
  );

  const realWorkOrders = (workOrders || []).filter(
    (w) => Boolean(w) && !w.problem?.startsWith('EVAL:')
  );

  if (realIssues.length === 0) {
    return [];
  }

  const insights: MaintenanceInsight[] = [];
  const processedIssueIds = new Set<string>();

  // 1. PATTERN 1: REPEATED REPAIR FAILURES & REOPENED WORK ORDERS (CRITICAL)
  const reopenedIssues = realIssues.filter((i) => i.status === 'REOPENED');
  for (const issue of reopenedIssues) {
    const linkedWO = realWorkOrders.find((w) => w.issueId === issue.id);
    const categoryName = issue.aiCategory || linkedWO?.category || 'General';

    insights.push({
      id: `insight_reopened_${issue.id}`,
      type: 'REPEATED_REPAIR_FAILURE',
      title: `Unresolved Defect: Reopened ${categoryName.toUpperCase()} Repair`,
      severity: 'CRITICAL',
      location: issue.location,
      category: categoryName,
      incidentCount: 2,
      timeWindowDays: 7,
      explanation: `2nd-stage visual AI verification detected remaining unresolved defects after technician completion.`,
      whyItMatters: `Unverified repair completion risks secondary facility damage and technician rework loops.`,
      recommendation: `Escalate to supervisor on-site inspection and verify replacement parts before approving secondary repair attempt.`,
      supportingIssueIds: [issue.id],
    });

    processedIssueIds.add(issue.id);
  }

  // 2. PATTERN 2: LOCATION CLUSTERS (REPEATED INCIDENTS IN SAME LOCATION)
  const locationGroups: Record<string, typeof realIssues> = {};
  for (const issue of realIssues) {
    if (!issue.location) continue;
    const normLoc = issue.location.trim().toLowerCase();
    if (!locationGroups[normLoc]) {
      locationGroups[normLoc] = [];
    }
    locationGroups[normLoc].push(issue);
  }

  for (const [normLoc, group] of Object.entries(locationGroups)) {
    if (group.length >= 2) {
      const displayLocation = group[0].location;
      const categories = group.map((g) => g.aiCategory).filter(Boolean);
      const dominantCategory = categories.length > 0 ? categories[0] : 'general';
      const issueIds = group.map((g) => g.id);

      // Determine timeframe window in days
      const timestamps = group.map((g) => new Date(g.createdAt || Date.now()).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const daysDiff = Math.max(1, Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)));

      const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = group.length >= 3 ? 'HIGH' : 'MEDIUM';

      insights.push({
        id: `insight_loc_${normLoc.replace(/[^a-z0-9]/g, '_')}`,
        type: 'LOCATION_CLUSTER',
        title: `Recurring ${dominantCategory ? dominantCategory.toUpperCase() : ''} Incidents Detected`,
        severity,
        location: displayLocation,
        category: dominantCategory || undefined,
        incidentCount: group.length,
        timeWindowDays: Math.min(daysDiff, 30),
        explanation: `${group.length} maintenance incidents have occurred at ${displayLocation} within the last ${Math.min(daysDiff, 30)} days.`,
        whyItMatters: `Multiple repairs in the same physical area suggest a shared underlying infrastructure defect rather than isolated failures.`,
        recommendation: `Inspect shared supply lines, upstream electrical breakers, or common fixtures serving ${displayLocation} instead of treating these as isolated repairs.`,
        supportingIssueIds: issueIds,
      });

      issueIds.forEach((id) => processedIssueIds.add(id));
    }
  }

  // 3. PATTERN 3: CATEGORY SPIKES (HIGH CONCENTRATION OF SAME CATEGORY)
  const categoryGroups: Record<string, typeof realIssues> = {};
  for (const issue of realIssues) {
    const cat = issue.aiCategory || 'general';
    if (!categoryGroups[cat]) {
      categoryGroups[cat] = [];
    }
    categoryGroups[cat].push(issue);
  }

  for (const [cat, group] of Object.entries(categoryGroups)) {
    if (group.length >= 3) {
      const issueIds = group.map((g) => g.id);

      // Only add category spike insight if we don't already have duplicate insights covering all of them
      const newIssueIds = issueIds.filter((id) => !processedIssueIds.has(id));
      if (newIssueIds.length >= 2 || insights.length === 0) {
        insights.push({
          id: `insight_cat_${cat}`,
          type: 'CATEGORY_SPIKE',
          title: `Category Concentration: High ${cat.toUpperCase()} Volume`,
          severity: 'MEDIUM',
          category: cat,
          incidentCount: group.length,
          timeWindowDays: 14,
          explanation: `${group.length} active ${cat} complaints have been reported across campus facility locations.`,
          whyItMatters: `High volume in a single category increases technician dispatch backlog and response latency.`,
          recommendation: `Review preventive maintenance schedules for ${cat} equipment and verify parts stock for on-duty technicians.`,
          supportingIssueIds: issueIds,
        });
      }
    }
  }

  return insights;
}

/**
 * Pure deterministic pattern detection function for unit testing
 */
export function analyzeIncidentsForTesting(
  issues: Array<{ id: string; title: string; location: string; aiCategory?: string; status: string; createdAt?: Date }>
): MaintenanceInsight[] {
  const realIssues = issues.filter((i) => !i.title.startsWith('EVAL:'));
  if (realIssues.length === 0) return [];

  const insights: MaintenanceInsight[] = [];
  const locationGroups: Record<string, typeof realIssues> = {};

  for (const issue of realIssues) {
    if (issue.status === 'REOPENED') {
      insights.push({
        id: `insight_reopened_${issue.id}`,
        type: 'REPEATED_REPAIR_FAILURE',
        title: `Unresolved Defect: Reopened Repair`,
        severity: 'CRITICAL',
        location: issue.location,
        category: issue.aiCategory || 'general',
        incidentCount: 2,
        timeWindowDays: 7,
        explanation: `2nd-stage visual AI verification detected remaining unresolved defects.`,
        whyItMatters: `Unverified repair completion risks secondary facility damage.`,
        recommendation: `Escalate to supervisor on-site inspection.`,
        supportingIssueIds: [issue.id],
      });
    }

    const normLoc = issue.location.trim().toLowerCase();
    if (!locationGroups[normLoc]) locationGroups[normLoc] = [];
    locationGroups[normLoc].push(issue);
  }

  for (const [normLoc, group] of Object.entries(locationGroups)) {
    if (group.length >= 2) {
      insights.push({
        id: `insight_loc_${normLoc.replace(/[^a-z0-9]/g, '_')}`,
        type: 'LOCATION_CLUSTER',
        title: `Recurring Incidents in ${group[0].location}`,
        severity: group.length >= 3 ? 'HIGH' : 'MEDIUM',
        location: group[0].location,
        category: group[0].aiCategory,
        incidentCount: group.length,
        timeWindowDays: 14,
        explanation: `${group.length} maintenance incidents reported in ${group[0].location}.`,
        whyItMatters: `Repeated issues suggest shared underlying infrastructure defect.`,
        recommendation: `Inspect common supply lines or upstream fixtures serving ${group[0].location}.`,
        supportingIssueIds: group.map((g) => g.id),
      });
    }
  }

  return insights;
}
