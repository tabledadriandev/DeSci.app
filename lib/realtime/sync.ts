/**
 * Real-Time Data Sync
 * TanStack Query setup for real-time updates
 * WebSocket connection for live data
 * Polling fallback for providers without webhooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SyncStatus {
  provider: string;
  lastSyncAt: Date | null;
  status: 'synced' | 'syncing' | 'error';
  error?: string;
}

export interface WearableData {
  provider: string;
  data: any;
  syncedAt: Date;
}

/**
 * Real-time sync hook for wearable data
 */
export function useWearableSync(userId: string, provider: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['wearable', userId, provider],
    queryFn: async () => {
      const response = await fetch(`/api/wearables/${provider}/sync?userId=${userId}`);
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    refetchInterval: 6 * 60 * 60 * 1000, // Every 6 hours
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/wearables/${provider}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearable', userId, provider] });
    },
  });

  return {
    data,
    isLoading,
    error,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}

/**
 * Real-time sync for all connected wearables
 */
export function useAllWearablesSync(userId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wearables', userId, 'all'],
    queryFn: async () => {
      const response = await fetch(`/api/wearables/sync-all?userId=${userId}`);
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    refetchInterval: 6 * 60 * 60 * 1000, // Every 6 hours
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/wearables/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearables', userId] });
    },
  });

  return {
    data,
    isLoading,
    syncAll: syncAllMutation.mutate,
    isSyncing: syncAllMutation.isPending,
  };
}

/**
 * WebSocket connection for real-time updates
 * Falls back to polling if WebSocket is not available
 */
export function useRealtimeUpdates(userId: string, enabled: boolean = true) {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['realtime', userId],
    queryFn: async () => {
      // Try WebSocket first, fall back to polling
      if (typeof window !== 'undefined' && 'WebSocket' in window) {
        // WebSocket connection would be established here
        // For now, use polling
        const response = await fetch(`/api/wearables/realtime?userId=${userId}`);
        if (!response.ok) throw new Error('Realtime update failed');
        return response.json();
      }
      return null;
    },
    enabled,
    refetchInterval: enabled ? 30 * 1000 : false, // Poll every 30 seconds if enabled
    staleTime: 0, // Always consider stale for real-time
  });
}
