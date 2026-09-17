/**
 * Keyboard behaviour for a WAI-ARIA tablist with automatic activation.
 *
 * Returns the index of the tab a key press should select, or null when the key
 * is not a navigation key (so the event is left alone). Arrows wrap at both
 * ends; Home and End jump to the first and last tab. Kept free of imports so it
 * can be tested directly under Node.
 */
export function nextTabIndex(
  key: string,
  current: number,
  count: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): number | null {
  if (count <= 0) return null;
  const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  switch (key) {
    case nextKey:
      return (current + 1) % count;
    case previousKey:
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
