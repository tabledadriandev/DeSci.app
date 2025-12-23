/**
 * Google Fit API Client
 * OAuth 2.0 integration for Android devices
 * Documentation: https://developers.google.com/fit/rest
 */

export interface GoogleFitActivity {
  startTimeMillis: string;
  endTimeMillis: string;
  activityType: string;
  calories?: number;
  distance?: number;
  steps?: number;
}

export interface GoogleFitHeartRate {
  value: number;
  startTimeNanos: string;
  endTimeNanos: string;
}

export interface GoogleFitSleep {
  startTimeMillis: string;
  endTimeMillis: string;
  type: number; // 1=asleep, 2=awake, etc.
}

export class GoogleFitClient {
  private baseUrl = 'https://www.googleapis.com/fitness/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Google Fit API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get step count for date range
   */
  async getSteps(startDate: Date, endDate: Date): Promise<number> {
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    const response = await this.request<{
      bucket: Array<{
        dataset: Array<{
          point: Array<{
            value: Array<{ intVal: number }>;
          }>;
        }>;
      }>;
    }>(
      `/users/me/dataset:aggregate`,
      {
        method: 'POST',
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    let totalSteps = 0;
    for (const bucket of response.bucket || []) {
      for (const dataset of bucket.dataset || []) {
        for (const point of dataset.point || []) {
          for (const value of point.value || []) {
            totalSteps += value.intVal || 0;
          }
        }
      }
    }

    return totalSteps;
  }

  /**
   * Get heart rate data for date range
   */
  async getHeartRate(startDate: Date, endDate: Date): Promise<GoogleFitHeartRate[]> {
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    const response = await this.request<{
      point: Array<{
        value: Array<{ fpVal: number }>;
        startTimeNanos: string;
        endTimeNanos: string;
      }>;
    }>(
      `/users/me/dataSources/raw:com.google.heart_rate.bpm:com.google.android.apps.fitness:user_input/datasets/${startTimeMillis}000000-${endTimeMillis}000000`
    );

    return (response.point || []).map(point => ({
      value: point.value[0]?.fpVal || 0,
      startTimeNanos: point.startTimeNanos,
      endTimeNanos: point.endTimeNanos,
    }));
  }

  /**
   * Get activity sessions
   */
  async getActivities(startDate: Date, endDate: Date): Promise<GoogleFitActivity[]> {
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    const response = await this.request<{
      session: GoogleFitActivity[];
    }>(
      `/users/me/sessions?startTime=${startTimeMillis}000000&endTime=${endTimeMillis}000000`
    );

    return response.session || [];
  }

  /**
   * Get sleep data
   */
  async getSleep(startDate: Date, endDate: Date): Promise<GoogleFitSleep[]> {
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    const response = await this.request<{
      session: Array<{
        startTimeMillis: string;
        endTimeMillis: string;
        activityType: number; // 72 = sleep
      }>;
    }>(
      `/users/me/sessions?startTime=${startTimeMillis}000000&endTime=${endTimeMillis}000000&activityType=72`
    );

    return (response.session || []).map(session => ({
      startTimeMillis: session.startTimeMillis,
      endTimeMillis: session.endTimeMillis,
      type: 1, // asleep
    }));
  }
}

export const createGoogleFitClient = (accessToken: string) => new GoogleFitClient(accessToken);
