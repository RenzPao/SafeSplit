import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contractAddress,
      clientAddress,
      freelancerAddress,
      arbiterAddress,
      totalXlm,
      milestones,
      arbiterFeeBps,
    } = body;

    if (
      !contractAddress ||
      !clientAddress ||
      !freelancerAddress ||
      !arbiterAddress ||
      !totalXlm ||
      !milestones ||
      !Array.isArray(milestones)
    ) {
      return NextResponse.json(
        { error: 'Missing required escrow configuration fields' },
        { status: 400 }
      );
    }

    // Map and generate SHA-256 description hashes for on-chain parameter parity
    const processedMilestones = milestones.map((m: any, index: number) => {
      const { title, description, amountXlm } = m;
      if (!title || !description || amountXlm === undefined) {
        throw new Error(`Milestone at index ${index} is missing details`);
      }

      // Generate SHA-256 hash of the milestone terms
      const textToHash = `${title.trim()}:${description.trim()}:${amountXlm}`;
      const descriptionHash = createHash('sha256').update(textToHash).digest('hex');

      return {
        milestoneIndex: index,
        title: title.trim(),
        description: description.trim(),
        amountXlm: Number(amountXlm),
        descriptionHash,
        status: 'Pending',
      };
    });

    // Create the Escrow record in the database along with its milestones
    const escrow = await prisma.escrow.create({
      data: {
        contract_address: contractAddress,
        client_address: clientAddress,
        freelancer_address: freelancerAddress,
        arbiter_address: arbiterAddress,
        total_xlm: Number(totalXlm),
        status: 'Initialized',
        milestones: {
          create: processedMilestones.map((pm) => ({
            milestone_index: pm.milestoneIndex,
            title: pm.title,
            description: pm.description,
            amount_xlm: pm.amountXlm,
            status: pm.status,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    // Create initial activity log
    await prisma.activityLog.create({
      data: {
        escrow_id: escrow.id,
        tx_hash: 'off-chain-init',
        event_name: 'EscrowCreated',
        details: `Escrow metadata initialized for client ${clientAddress} and freelancer ${freelancerAddress}`,
      },
    });

    // Return the escrow along with description hashes so they can be deployed on-chain
    return NextResponse.json({
      success: true,
      escrow,
      descriptionHashes: processedMilestones.map((pm) => ({
        index: pm.milestoneIndex,
        descriptionHash: pm.descriptionHash,
      })),
    });
  } catch (error: any) {
    console.error('Error creating escrow metadata:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
