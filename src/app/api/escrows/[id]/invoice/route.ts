import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { jsPDF } from 'jspdf';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: escrow, error: escrowError } = await supabase
    .from('Escrow')
    .select('*, milestones:Milestone(*)')
    .eq('id', id)
    .single();
    
  if (escrowError || !escrow) return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });

  const doc = new jsPDF();
  doc.text(`Invoice for Escrow: ${escrow.title || escrow.id}`, 10, 10);
  doc.text(`Total Amount: ${escrow.total_xlm || 0} XLM`, 10, 20);
  doc.text('Parties:', 10, 30);
  
  doc.text(`- Client: ${escrow.client_address}`, 10, 40);
  doc.text(`- Freelancer: ${escrow.freelancer_address}`, 10, 50);
  doc.text(`- Arbiter: ${escrow.arbiter_address}`, 10, 60);
  
  let y = 80;
  doc.text('Milestones:', 10, y);
  y += 10;
  escrow.milestones?.forEach((milestone: any) => {
    doc.text(`- ${milestone.title}: ${milestone.amount_xlm} XLM (${milestone.status})`, 10, y);
    y += 10;
  });

  const pdfArrayBuffer = doc.output('arraybuffer');
  const fileName = `invoice_${id}_${Date.now()}.pdf`;
  
  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(fileName, pdfArrayBuffer, { contentType: 'application/pdf' });

  if (uploadError) return NextResponse.json({ error: 'Failed to upload invoice' }, { status: 500 });

  const { data: publicUrlData } = supabase.storage.from('invoices').getPublicUrl(fileName);
  const invoiceUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase.from('Escrow').update({ invoice_url: invoiceUrl }).eq('id', id);

  if (updateError) return NextResponse.json({ error: 'Failed to update escrow' }, { status: 500 });

  return NextResponse.json({ invoice_url: invoiceUrl });
}
