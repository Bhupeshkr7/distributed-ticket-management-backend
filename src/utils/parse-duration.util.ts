const units: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const parseDuration = (value: string): number => {
  const num = Number(value);
  if (!isNaN(num)) return num;

  const match = value.match(/^(\d+)([smhd])$/);
  if (match) return Number(match[1]) * units[match[2]];

  throw new Error(`Invalid duration format: "${value}"`);
};
