import { NextResponse } from 'next/server';
import { getAllTechnicians, getWorkOrdersByTechnicianId, getTechnicianById, getIssueById } from '@/lib/db/queries';
import { sanitizeServerError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const techId = searchParams.get('techId') || 'tech-1';

    const [technicians, selectedTech, rawWorkOrders] = await Promise.all([
      getAllTechnicians(),
      getTechnicianById(techId),
      getWorkOrdersByTechnicianId(techId),
    ]);

    // Attach issue data and filter out evaluation benchmark records or mismatched assignments
    const workOrders = (
      await Promise.all(
        rawWorkOrders.map(async (wo: any) => {
          const issue = await getIssueById(wo.issueId);
          if (!issue || issue.title?.startsWith('EVAL:')) return null;

          // Double check server-side assignment correctness
          if (wo.technicianId !== techId) return null;
          if (selectedTech && wo.category !== selectedTech.category) return null;

          return {
            ...wo,
            beforeImageUrl: issue.beforeImageUrl,
            location: issue.location || wo.location,
            description: issue.description || wo.description,
            title: issue.title,
          };
        })
      )
    ).filter(Boolean);

    return NextResponse.json({
      success: true,
      technicians,
      selectedTechnician: selectedTech,
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
