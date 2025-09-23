import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, this should be stored in Redis or database
const paymentSessions = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get payment session from storage
    const paymentSession = paymentSessions.get(paymentId);

    if (!paymentSession) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (new Date() > new Date(paymentSession.expiresAt)) {
      paymentSessions.delete(paymentId);
      return NextResponse.json(
        { error: 'Payment session has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentSession
    });

  } catch (error) {
    console.error('Error fetching payment session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    const body = await request.json();
    const { status, paymentIntent } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get existing payment session
    const paymentSession = paymentSessions.get(paymentId);

    if (!paymentSession) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    // Update payment session
    const updatedSession = {
      ...paymentSession,
      status,
      paymentIntent,
      updatedAt: new Date().toISOString()
    };

    paymentSessions.set(paymentId, updatedSession);

    return NextResponse.json({
      success: true,
      paymentSession: updatedSession
    });

  } catch (error) {
    console.error('Error updating payment session:', error);
    return NextResponse.json(
      { error: 'Failed to update payment session' },
      { status: 500 }
    );
  }
} 