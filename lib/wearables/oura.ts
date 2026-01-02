/**
 * Oura Ring API Client
 * OAuth 2.0 integration for sleep, HRV, readiness, and activity data
 * Documentation: https://cloud.ouraring.com/docs/
 */

export interface OuraSleepData {
  id: string;
  contributors: {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
  };
  day: string;
  score: number;
  timestamp: string;
}

export interface OuraHRVData {
  id: string;
  bpm: number;
  rmssd: number;
  hrv: number;
  source: string;
  timestamp: string;
}

export interface OuraReadinessData {
  id: string;
  contributors: {
    activity_balance: number;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number;
    previous_night: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
  };
  day: string;
  score: number;
  temperature_deviation: number;
  temperature_trend_deviation: number;
  timestamp: string;
}

export interface OuraActivityData {
  id: string;
  class_5_min: string;
  score: number;
  active_calories: number;
  average_met_minutes: number;
  contributors: {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
  };
  equivalent_walking_distance: number;
  high_activity_met_minutes: number;
  high_activity_time: number;
  inactivity_alerts: number;
  low_activity_met_minutes: number;
  low_activity_time: number;
  medium_activity_met_minutes: number;
  medium_activity_time: number;
  met: {
    interval: number;
    items: number[];
    timestamp: string;
  };
  meters_to_target: number;
  steps: number;
  timestamp: string;
}

export class OuraClient {
  private baseUrl = 'https://api.ouraring.com/v2';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(errorMessage || `Oura API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get sleep data for a date range
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<OuraSleepData[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const response = await this.request<{ data: OuraSleepData[] }>(
      `/usercollection/daily_sleep?start_date=${start}&end_date=${end}`
    );
    
    return response.data || [];
  }

  /**
   * Get HRV data for a date range
   */
  async getHRVData(startDate: Date, endDate: Date): Promise<OuraHRVData[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const response = await this.request<{ data: OuraHRVData[] }>(
      `/usercollection/heartrate?start_date=${start}&end_date=${end}`
    );
    
    return response.data || [];
  }

  /**
   * Get readiness score for a specific date
   */
  async getReadinessScore(date: Date): Promise<OuraReadinessData | null> {
    const dateStr = date.toISOString().split('T')[0];
    const start = new Date(date);
    start.setDate(start.getDate() - 1);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    
    const response = await this.request<{ data: OuraReadinessData[] }>(
      `/usercollection/daily_readiness?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`
    );
    
    return response.data?.find(d => d.day === dateStr) || null;
  }

  /**
   * Get activity data for a date range
   */
  async getActivityData(startDate: Date, endDate: Date): Promise<OuraActivityData[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const response = await this.request<{ data: OuraActivityData[] }>(
      `/usercollection/daily_activity?start_date=${start}&end_date=${end}`
    );
    
    return response.data || [];
  }

  /**
   * Get personal info (for user verification)
   */
  async getPersonalInfo(): Promise<any> {
    return this.request('/userinfo');
  }
}

export const createOuraClient = (accessToken: string) => new OuraClient(accessToken);
