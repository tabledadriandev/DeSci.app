/**
 * WHOOP API Client
 * Integration for strain, recovery, sleep, and training data
 * Documentation: https://developer.whoop.com/
 */

export interface WhoopStrain {
  score: number; // 0-21
  kilojoules: number;
  averageHeartRate: number;
  maxHeartRate: number;
  zoneMinutes: {
    zone_zero: number;
    zone_one: number;
    zone_two: number;
    zone_three: number;
    zone_four: number;
    zone_five: number;
  };
}

export interface WhoopRecovery {
  score: number; // 0-100
  restingHeartRate: number;
  hrvRmssd: number;
  spo2: number;
  skinTempCelsius: number;
}

export interface WhoopSleep {
  id: number;
  score: {
    stageSummary: {
      totalSleepTimeMs: number;
      totalAwakeTimeMs: number;
      totalNoDataTimeMs: number;
      totalLightSleepTimeMs: number;
      totalSlowWaveSleepTimeMs: number;
      totalRemSleepTimeMs: number;
    };
    respiratoryRate: number;
    sleepPerformancePercentage: number;
    sleepConsistencyPercentage: number;
    sleepEfficiencyPercentage: number;
  };
}

export class WhoopClient {
  private baseUrl = 'https://api.prod.whoop.com/developer/v1';
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
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `WHOOP API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get strain data for a date range
   */
  async getStrain(startDate: Date, endDate: Date): Promise<WhoopStrain[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const response = await this.request<{ records: WhoopStrain[] }>(
      `/activity/workout?start=${start}&end=${end}`
    );

    return response.records || [];
  }

  /**
   * Get recovery data for a date range
   */
  async getRecovery(startDate: Date, endDate: Date): Promise<WhoopRecovery[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const response = await this.request<{ records: WhoopRecovery[] }>(
      `/recovery?start=${start}&end=${end}`
    );

    return response.records || [];
  }

  /**
   * Get sleep data for a date range
   */
  async getSleep(startDate: Date, endDate: Date): Promise<WhoopSleep[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const response = await this.request<{ records: WhoopSleep[] }>(
      `/sleep?start=${start}&end=${end}`
    );

    return response.records || [];
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    return this.request('/user/profile/basic');
  }
}

export const createWhoopClient = (accessToken: string) => new WhoopClient(accessToken);
