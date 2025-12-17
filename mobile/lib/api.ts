const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function apiGet(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(API_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getHealthScore(userId?: string) {
  return apiGet('/api/health/score', userId ? { userId } : undefined);
}

export async function getMarketplaceItems() {
  return apiGet('/api/marketplace');
}

export async function getRecentHealth(address: string) {
  return apiGet('/api/health', { address });
}

export async function saveDailyHabits(userId: string, habits: Record<string, any>) {
  const res = await fetch(`${API_URL}/api/health/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...habits }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function sendCoachMessage(userId: string, message: string, history: any[] = []) {
  const res = await fetch(`${API_URL}/api/coach/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: userId,
      message,
      history,
      healthContext: null,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getWellnessPlan(userId: string) {
  return apiGet('/api/health/wellness-plan', { userId });
}

export async function getTelemedicineAppointments(userId: string) {
  return apiGet('/api/telemedicine/appointments/list', { userId });
}

export async function getTelemedicineRecords(userId: string) {
  return apiGet('/api/telemedicine/records/list', { userId });
}

export async function uploadMedicalRecord(
  userId: string,
  title: string,
  description?: string,
  fileUrl?: string
) {
  const res = await fetch(`${API_URL}/api/telemedicine/records/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title,
      description: description || undefined,
      fileUrl: fileUrl || undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getCommunityPosts() {
  return apiGet('/api/community/posts');
}

export async function createCommunityPost(
  address: string,
  content: string,
  type: string = 'text'
) {
  const res = await fetch(`${API_URL}/api/community/posts/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      content,
      type,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function likePost(postId: string, address: string) {
  const res = await fetch(`${API_URL}/api/community/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}


