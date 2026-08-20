import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: escrow, error: escrowError } = await supabase
    .from('Escrow')
    .select('*, milestones:Milestone(*)')
    .eq('id', id)
    .single();
    
  if (escrowError || !escrow) return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(147, 51, 234); // Purple
  doc.text('SAFESPLIT', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice ID: ${escrow.id.split('-')[0].toUpperCase()}`, 140, 15);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Settlement Receipt: ${escrow.title || 'Escrow Contract'}`, 14, 35);
  
  doc.setFontSize(11);
  doc.text('Parties', 14, 45);
  doc.setFontSize(10);
  doc.text(`Client: ${escrow.client_address}`, 14, 52);
  doc.text(`Freelancer: ${escrow.freelancer_address}`, 14, 58);
  if (escrow.arbiter_address && escrow.arbiter_address !== 'G0000000000000000000000000000000000000000000000000000000') {
    doc.text(`Arbiter: ${escrow.arbiter_address}`, 14, 64);
  }
  
  // Milestones Table
  const tableData = escrow.milestones?.map((m: any, i: number) => [
    i + 1,
    m.title,
    m.status,
    `${m.amount_xlm} XLM`
  ]) || [];

  (doc as any).autoTable({
    startY: 75,
    head: [['#', 'Milestone', 'Status', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [147, 51, 234] },
    foot: [['', '', 'Total', `${escrow.total_xlm || 0} XLM`]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
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
