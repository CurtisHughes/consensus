export type SwipeHandlers = {
  onLeft: () => void;
  onRight: () => void;
};

export function useSwipe({ onLeft, onRight }: SwipeHandlers, threshold = 50) {
  let start: { x: number; y: number } | null = null;
  let swiped = false;

  function onPointerdown(event: PointerEvent) {
    start = { x: event.clientX, y: event.clientY };
    swiped = false;
  }

  function onPointerup(event: PointerEvent) {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return;
    swiped = true;
    if (dx < 0) onLeft();
    else onRight();
  }

  function onPointercancel() {
    start = null;
  }

  // A swipe that starts and ends on the same day would otherwise also toggle it.
  function onClickCapture(event: MouseEvent) {
    if (!swiped) return;
    swiped = false;
    event.stopPropagation();
    event.preventDefault();
  }

  return { onPointerdown, onPointerup, onPointercancel, onClickCapture };
}
