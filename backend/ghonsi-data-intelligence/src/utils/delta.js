export function computeDelta(current, previous) {
  if (previous == null || previous === 0) return { absolute: null, percentage: null, direction: 'new' };
  const absolute = current - previous;
  const percentage = ((absolute / previous) * 100).toFixed(2);
  return {
    absolute: absolute.toFixed(2),
    percentage: parseFloat(percentage),
    direction: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'unchanged',
  };
}

