import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contractService } from '@/lib/contract-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      chefId,
      userId,
      mealLogData,
      // Meal data
      date,
      mealType,
      imageUrl,
      foods,
      foodsIdentified,
      portionSizes,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      polyphenols,
      resistantStarch,
      glycemicLoad,
      glycemicIndex,
      vitamins,
      minerals,
      antioxidants,
      allergens,
      notes,
      // Blockchain verification
      verifyOnChain = false,
    } = await request.json();

    if (!chefId || !userId) {
      return NextResponse.json(
        { error: 'Chef ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify chef exists
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
    });

    if (!chef) {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    // Create meal log
    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        chefId,
        chefName: chef.chefName,
        chefVerified: verifyOnChain,
        date: date ? new Date(date) : new Date(),
        mealType: mealType || 'meal',
        imageUrl: imageUrl || null,
        foodsIdentified: foodsIdentified || null,
        portionSizes: portionSizes || null,
        calories: calories || null,
        protein: protein || null,
        carbs: carbs || null,
        fats: fats || null,
        fiber: fiber || null,
        polyphenols: polyphenols || null,
        resistantStarch: resistantStarch || null,
        glycemicLoad: glycemicLoad || null,
        glycemicIndex: glycemicIndex || null,
        vitamins: vitamins || null,
        minerals: minerals || null,
        antioxidants: antioxidants || null,
        allergens: allergens || [],
        foods: foods || [],
        notes: notes || null,
      },
    });

    // Update chef stats
    await prisma.chefProfile.update({
      where: { id: chefId },
      data: {
        totalMealsLogged: {
          increment: 1,
        },
      },
    });

    // Blockchain verification (if requested)
    let txHash: string | null = null;
    if (verifyOnChain) {
      try {
        // Generate verification signature or transaction
        // This would typically involve creating a transaction on-chain
        // For now, we'll mark it as verified
        txHash = `0x${Date.now().toString(16)}`; // Placeholder
        
        // TODO: Implement actual blockchain verification
        // await contractService.verifyChefMeal(chefId, mealLog.id, userId);
      } catch (error: any) {
        console.warn('Blockchain verification failed:', error);
        // Continue without on-chain verification
      }
    }

    // Calculate rewards for chef (Crypto Path: 5 $TA per verified meal)
    const chefVerified = verifyOnChain && txHash !== null;
    if (chef.acceptsCrypto && chefVerified) {
      const rewardAmount = 5; // $TA tokens
      
      // Create earning record
      await prisma.chefEarning.create({
        data: {
          chefId,
          type: 'meal_logged',
          amount: rewardAmount,
          currency: 'TA',
          txHash: txHash || null,
          mealLogId: mealLog.id,
          description: `Verified meal logged for ${chef.chefName}`,
        },
      });

      // Update chef token balance
      await prisma.chefProfile.update({
        where: { id: chefId },
        data: {
          taTokenBalance: {
            increment: rewardAmount,
          },
          taEarningsTotal: {
            increment: rewardAmount,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      mealLog: {
        ...mealLog,
        chef: {
          chefName: chef.chefName,
          avatar: chef.avatar,
        },
      },
      reward: chef.acceptsCrypto && chefVerified ? {
        amount: 5,
        currency: 'TA',
        txHash,
      } : null,
      message: 'Meal logged successfully',
    });
  } catch (error: any) {
    console.error('Log meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log meal' },
      { status: 500 }
    );
  }
}

