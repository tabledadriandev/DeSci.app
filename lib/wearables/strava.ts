/**
 * Strava API Client
 * OAuth 2.0 integration for workout activities
 * Documentation: https://developers.strava.com/
 */

export interface StravaActivity {
  id: number;
  name: string;
  type: string; // Run, Ride, etc.
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  start_date: string;
  average_speed: number; // m/s
  max_speed: number; // m/s
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  calories: number;
}

export class StravaClient {
  private baseUrl = 'https://www.strava.com/api/v3';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Strava API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get athlete activities
   */
  async getActivities(before?: Date, after?: Date, perPage: number = 30): Promise<StravaActivity[]> {
    const params = new URLSearchParams();
    if (before) params.set('before', Math.floor(before.getTime() / 1000).toString());
    if (after) params.set('after', Math.floor(after.getTime() / 1000).toString());
    params.set('per_page', perPage.toString());

    const activities = await this.request<StravaActivity[]>(
      `/athlete/activities?${params.toString()}`
    );

    return activities;
  }

  /**
   * Get specific activity
   */
  async getActivity(activityId: number): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${activityId}`);
  }

  /**
   * Get athlete stats
   */
  async getStats(athleteId: number): Promise<any> {
    return this.request(`/athletes/${athleteId}/stats`);
  }
}

export const createStravaClient = (accessToken: string) => new StravaClient(accessToken);
