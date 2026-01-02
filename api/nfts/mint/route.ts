import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contractService } from '@/lib/contract-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, achievementId, type, name, description, image } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If minting from achievement
    if (achievementId) {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      });

      if (!achievement || achievement.userId !== user.id) {
        return NextResponse.json(
          { error: 'Achievement not found' },
          { status: 404 }
        );
      }

      // TODO: Achievement model doesn't have nftMinted field
      // Check HealthBadge instead
      const existingBadge = await prisma.healthBadge.findFirst({
        where: {
          userId: user.id,
          badgeType: achievement.type,
        },
      });
      
      if (existingBadge && existingBadge.tokenId) {
        return NextResponse.json(
          { error: 'NFT already minted for this achievement' },
          { status: 400 }
        );
      }

      // Generate token ID (in production, this would be on-chain)
      const tokenId = `TA-ACH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const collectionId = `ACHIEVEMENT-${achievement.type || 'general'}`;

      // Determine reward amount based on achievement type
      const rewardAmounts: Record<string, number> = {
        bronze: 10,
        silver: 25,
        gold: 50,
        platinum: 100,
        diamond: 250,
      };
      const rewardAmount = rewardAmounts[achievement.type?.toLowerCase() || 'bronze'] || 10;

      // Try to process NFT reward on-chain
      let txHash: string | null = null;
      try {
        txHash = await contractService.processNFTReward(
          address as `0x${string}`,
          collectionId,
          rewardAmount
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('On-chain NFT reward processing failed, continuing with off-chain:', errorMessage);
        // Continue with off-chain NFT creation if on-chain fails
      }

      // TODO: NFT model not yet implemented, use HealthBadge instead
      const nft = await prisma.healthBadge.create({
        data: {
          userId: user.id,
          badgeType: achievement.type || 'achievement',
          tokenId,
          mintTxHash: txHash || null,
          metadata: {
            achievementId: achievement.id,
            unlockedAt: achievement.unlockedAt,
            collectionId,
            rewardAmount,
          },
        },
      });

      // Achievement model doesn't have nftMinted field, so we don't update it

      // Create reward transaction if on-chain was successful
      if (txHash) {
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'reward',
            amount: rewardAmount,
            description: `NFT Reward: ${achievement.type}`,
            status: 'confirmed',
            txHash,
          },
        });
      }

      return NextResponse.json({ 
        success: true, 
        data: {
          ...nft,
          rewardAmount,
          txHash,
          onChain: !!txHash,
        }
      });
    }

    // Direct NFT creation
    if (!type || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tokenId = `TA-${type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // TODO: NFT model not yet implemented, use HealthBadge instead
    const nft = await prisma.healthBadge.create({
      data: {
        userId: user.id,
        badgeType: type,
        tokenId,
        metadata: {
          name,
          description,
          image: image || 'https://via.placeholder.com/400',
        },
      },
    });

    return NextResponse.json({ success: true, data: nft });
  } catch (error: unknown) {
    console.error('Error minting NFT:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

