import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [logsResponse, messagesResponse] = await Promise.all([
    supabase.from('ActivityLog').select('*').eq('escrow_id', id),
    supabase.from('Message').select('*').eq('escrow_id', id)
  ]);

  const logs = logsResponse.data || [];
  const messages = messagesResponse.data || [];

  const timeline = [
    ...logs.map((log: any) => ({
      type: 'log',
      timestamp: new Date(log.timestamp).getTime(),
      date: new Date(log.timestamp).toISOString(),
      content: `[LOG] ${log.event_name} - ${log.details || ''}`
    })),
    ...messages.map((msg: any) => ({
      type: 'message',
      timestamp: new Date(msg.created_at).getTime(),
      date: new Date(msg.created_at).toISOString(),
      content: `[MESSAGE] ${msg.sender_address}: ${msg.content}`
    }))
  ];

  timeline.sort((a: any, b: any) => a.timestamp - b.timestamp);

  let markdown = `# Escrow Timeline (${id})\n\n`;
  for (const item of timeline) {
    markdown += `**${item.date}**\n${item.content}\n\n`;
  }

  return new NextResponse(markdown, {
    headers: { 'Content-Type': 'text/markdown', 'Content-Disposition': `attachment; filename="escrow_${id}_timeline.md"` },
  });
}
