// How much time this took
export const humanTime = (time: number) => {
  if (time < 0) return '0ms';
  if (time < 1_000) return `${time}ms`;
  if (time < 60_000) return `${(time / 1_000).toFixed(2)}s`;
  if (time < 3_600_000) return `${(time / 60_000).toFixed(2)}m`;
  return `${(time / 3_600_000).toFixed(2)}h`;
};
