import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import * as ics from 'ics';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: milestones, error } = await supabase.from('Milestone').select('*').eq('escrow_id', id);

  if (error || !milestones) return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });

  const events: ics.EventAttributes[] = milestones.map((m: any) => {
    const createdAt = new Date();
    const deadline = new Date(m.deadline || (createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)); 
    
    return {
      title: `Milestone: ${m.title}`,
      description: `Amount: ${m.amount_xlm} XLM\nStatus: ${m.status}`,
      start: [createdAt.getFullYear(), createdAt.getMonth() + 1, createdAt.getDate(), createdAt.getHours(), createdAt.getMinutes()],
      end: [deadline.getFullYear(), deadline.getMonth() + 1, deadline.getDate(), deadline.getHours(), deadline.getMinutes()],
    };
  });

  const { error: icsError, value } = ics.createEvents(events);
  if (icsError || !value) return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });

  return new NextResponse(value, {
    headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': `attachment; filename="escrow_${id}_calendar.ics"` },
  });
}
