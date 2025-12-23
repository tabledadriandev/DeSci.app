import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/link-wallet
 * Link a wallet address to an existing email account (hybrid user)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const { walletAddress, signature } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Verify wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Verify user session
    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if wallet is already linked to another account
    const existingWalletUser = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingWalletUser && existingWalletUser.id !== user.id) {
      return NextResponse.json(
        { error: 'Wallet address is already linked to another account' },
        { status: 409 }
      );
    }

    // If user already has this wallet, it's already linked
    if (user.walletAddress === walletAddress) {
      return NextResponse.json({
        success: true,
        message: 'Wallet is already linked to this account',
      });
    }

    // Update user's wallet address
    await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress },
    });

    // TODO: Verify signature if provided
    // if (signature) {
    //   const isValid = await verifySignature(walletAddress, signature);
    //   if (!isValid) {
    //     return NextResponse.json(
    //       { error: 'Invalid signature' },
    //       { status: 400 }
    //     );
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Wallet linked successfully. You can now use both email and wallet authentication.',
    });
  } catch (error: any) {
    console.error('Wallet linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link wallet' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/link-wallet
 * Unlink wallet from email account
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const { walletAddress } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user session
    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Can only unlink if user has email authentication
    if (!user.email || !user.emailVerified) {
      return NextResponse.json(
        { error: 'Cannot unlink wallet. Email authentication is required.' },
        { status: 400 }
      );
    }

    // Generate new placeholder wallet address
    const newWalletAddress = `0x${Buffer.from(user.email!).toString('hex').slice(0, 40).padStart(40, '0')}`;

    // Update user's wallet address to placeholder
    await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress: newWalletAddress },
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet unlinked successfully',
    });
  } catch (error: any) {
    console.error('Wallet unlinking error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink wallet' },
      { status: 500 }
    );
  }
}

