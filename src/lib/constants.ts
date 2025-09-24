export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch', 
  DINNER: 'dinner',
  SNACK: 'snack'
} as const;

export const HEALTH_READING_TYPES = {
  BLOOD_PRESSURE: 'blood_pressure',
  BLOOD_SUGAR: 'blood_sugar'
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high'
} as const;

export const NOTIFICATION_TIMES = {
  BREAKFAST: '07:00',
  LUNCH: '12:00',
  DINNER: '18:00'
} as const;

export const NIGERIAN_COLORS = {
  GREEN: 'var(--naija-green)',
  BLUE: 'var(--trust-blue)',
  ORANGE: 'var(--warm-orange)',
  YELLOW: 'var(--golden-yellow)',
  PINK: 'var(--health-pink)',
  PURPLE: 'var(--royal-purple)'
} as const;
