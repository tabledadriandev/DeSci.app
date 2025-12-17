'use server';

// Phase 10: Achievement definitions and evaluation helpers

export const ACHIEVEMENT_TYPES = {
  MICROBIOTA_MASTER: 'microbiota_master',
  POLYPHENOL_PRO: 'polyphenol_pro',
  BIOMARKER_CHAMPION: 'biomarker_champion',
  CHEF_COLLABORATOR: 'chef_collaborator',
} as const;

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[keyof typeof ACHIEVEMENT_TYPES];

export function getAchievementMetadata(type: AchievementType) {
  switch (type) {
    case ACHIEVEMENT_TYPES.MICROBIOTA_MASTER:
      return {
        name: 'Microbiota Master',
        description: 'Achieve a Shannon Index above 4.0 in your microbiome test.',
        icon: '🧫',
      };
    case ACHIEVEMENT_TYPES.POLYPHENOL_PRO:
      return {
        name: 'Polyphenol Pro',
        description: 'Maintain an estimated polyphenol intake of 1,500mg/day for 30 days.',
        icon: '🍇',
      };
    case ACHIEVEMENT_TYPES.BIOMARKER_CHAMPION:
      return {
        name: 'Biomarker Champion',
        description: 'Reduce an inflammatory or cardiometabolic biomarker by more than 30%.',
        icon: '🏅',
      };
    case ACHIEVEMENT_TYPES.CHEF_COLLABORATOR:
      return {
        name: 'Chef Collaborator',
        description: 'Log 10 or more chef-designed meals via the private chef network.',
        icon: '👨‍🍳',
      };
    default:
      return {
        name: 'Achievement',
        description: '',
        icon: '⭐',
      };
  }
}


