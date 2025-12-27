import { TokenRewardsService } from '@/lib/desci/tokenRewards';
import type { RewardAction } from '@/lib/desci/tokenRewards';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    deSciContribution: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

// Mock ContractService
jest.mock('@/lib/contract-service', () => ({
  ContractService: jest.fn().mockImplementation(() => ({})),
}));

describe('TokenRewardsService', () => {
  let service: TokenRewardsService;

  beforeEach(() => {
    service = new TokenRewardsService();
  });

  describe('calculateReward', () => {
    it('calculates reward for daily sync', async () => {
      const action: RewardAction = {
        type: 'daily_sync',
        userId: 'user123',
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(0.1);
      expect(result.dataPoints).toBe(10);
      expect(result.reason).toBe('Daily wearable data sync');
    });

    it('calculates reward for food logging (3+ meals)', async () => {
      const action: RewardAction = {
        type: 'food_logging',
        userId: 'user123',
        metadata: { mealCount: 3 },
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(0.5);
      expect(result.dataPoints).toBe(3);
    });

    it('returns 0 reward for food logging with <3 meals', async () => {
      const action: RewardAction = {
        type: 'food_logging',
        userId: 'user123',
        metadata: { mealCount: 2 },
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(0);
    });

    it('calculates reward for medical upload', async () => {
      const action: RewardAction = {
        type: 'medical_upload',
        userId: 'user123',
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(5.0);
      expect(result.dataPoints).toBe(50);
    });

    it('calculates reward for protocol completion', async () => {
      const action: RewardAction = {
        type: 'protocol_completion',
        userId: 'user123',
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(1.0);
      expect(result.dataPoints).toBe(30);
    });

    it('calculates reward for research study', async () => {
      const action: RewardAction = {
        type: 'research_study',
        userId: 'user123',
        metadata: { studyName: 'HRV Study' },
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(10.0);
      expect(result.dataPoints).toBe(100);
    });

    it('calculates reward for achievement', async () => {
      const action: RewardAction = {
        type: 'achievement',
        userId: 'user123',
        metadata: { achievementType: 'longevity_leader' },
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(5.0);
    });

    it('calculates reward for referral', async () => {
      const action: RewardAction = {
        type: 'referral',
        userId: 'user123',
        metadata: { referredUserId: 'user456' },
      };
      const result = await service.calculateReward(action);
      expect(result.tokenReward).toBe(5.0);
      expect(result.dataPoints).toBe(5);
    });

    it('throws error for unknown action type', async () => {
      const action = {
        type: 'unknown_action',
        userId: 'user123',
      } as unknown as RewardAction;
      await expect(service.calculateReward(action)).rejects.toThrow();
    });
  });
});
