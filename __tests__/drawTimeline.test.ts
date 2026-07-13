import { DRAW_TIMELINE as timeline } from '@/constants/draw-timeline';

describe('draw animation timeline', () => {
  it('keeps the physical ritual in chronological order', () => {
    expect(timeline.shakeStart).toBeLessThan(timeline.peek);
    expect(timeline.peek).toBeLessThan(timeline.launch);
    expect(timeline.launch).toBeLessThan(timeline.flight);
    expect(timeline.flight).toBeLessThan(timeline.land);
    expect(timeline.land).toBeLessThan(timeline.handoff);
    expect(timeline.handoff).toBeLessThan(timeline.finish);
  });

  it('finishes the flying stick handoff before the paper number appears', () => {
    expect(timeline.handoff + timeline.flyingExitDuration)
      .toBeLessThanOrEqual(timeline.handoff + timeline.numberDelay);
  });

  it('leaves enough time for the paper flip and final confirmation', () => {
    expect(timeline.handoff + timeline.paperFlipDuration + timeline.finalRevealDuration)
      .toBeLessThanOrEqual(timeline.finish);
  });
});
