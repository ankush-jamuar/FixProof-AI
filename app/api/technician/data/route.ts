import { NextResponse } from 'next/server';
import { getAllTechnicians, getAllWorkOrders, getIssueById } from '@/lib/db/queries';
import { sanitizeServerError } from '@/lib/errors';

export async function GET() {
  try {
    const [technicians, rawWorkOrders] = await Promise.all([
      getAllTechnicians(),
      getAllWorkOrders(),
    ]);

    // Attach issue thumbnail data to work orders
    const workOrders = await Promise.all(
      rawWorkOrders.map(async (wo: any) => {
        const issue = await getIssueById(wo.issueId);
        return {
          ...wo,
          issue: issue ? { beforeImageUrl: issue.beforeImageUrl, title: issue.title } : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      technicians,
      workOrders,
    });
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/technician/data');
    return NextResponse.json(
      {
        success: false,
        error: { code: safeError.code, message: safeError.message },
      },
      { status: safeError.statusCode }
    );
  }
}
