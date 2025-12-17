import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      chefId,
      scheduledAt,
      duration = 30,
      clientNotes,
      paymentMethod, // 'crypto' or 'fiat'
      paymentMethodId,
    } = await request.json();

    if (!userId || !chefId || !scheduledAt) {
      return NextResponse.json(
        { error: 'User ID, Chef ID, and scheduled time are required' },
        { status: 400 }
      );
    }

    // Get chef profile
    const chef = await prisma.chefProfile.findUnique({
      where: { id: chefId },
      include: {
        services: {
          where: {
            serviceType: 'consultation',
            isActive: true,
          },
        },
      },
    });

    if (!chef) {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    if (!chef.isActive) {
      return NextResponse.json(
        { error: 'Chef is not accepting bookings' },
        { status: 400 }
      );
    }

    // Get service price
    const consultationService = chef.services.find((s: any) => {
      const serviceDuration = s.duration || 30;
      return Math.abs(serviceDuration - duration) <= 15; // Within 15 minutes
    });

    const price = consultationService?.price || chef.defaultPricePerHour || 200;
    const currency = paymentMethod === 'fiat' ? 'USD' : 'TA';

    // Check if chef accepts this payment method
    if (paymentMethod === 'crypto' && !chef.acceptsCrypto) {
      return NextResponse.json(
        { error: 'Chef does not accept crypto payments' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'fiat' && !chef.acceptsFiat) {
      return NextResponse.json(
        { error: 'Chef does not accept fiat payments' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.chefBooking.create({
      data: {
        chefId: chef.id,
        userId,
        serviceType: 'consultation',
        serviceName: `${duration}-minute Consultation`,
        scheduledAt: new Date(scheduledAt),
        duration,
        location: 'remote',
        status: 'pending',
        paymentStatus: 'pending',
        price,
        currency,
        paymentMethodId: paymentMethodId || null,
        clientNotes,
      },
    });

    // TODO: Generate video call URL (integrate with video call service)
    // For now, we'll add this later
    // const videoCallUrl = await generateVideoCallUrl(booking.id);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        chef: {
          chefName: chef.chefName,
          avatar: chef.avatar,
        },
      },
      message: 'Consultation booking created. Payment processing required.',
    });
  } catch (error: any) {
    console.error('Consultation booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create consultation booking' },
      { status: 500 }
    );
  }
}

