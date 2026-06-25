## Goal

Make the transition to the next question feel instant after a correct answer, while still giving enough time to read feedback after a wrong answer.

## Current behavior

After submitting, the drill waits before showing the next question:
- Correct answer: 350 ms pause
- Wrong answer: 900 ms pause (so the user can see the revealed correct answer)

## Plan

1. **Shorten the correct-answer delay** from 350 ms to 120 ms so the next question appears almost immediately when you're on a streak.
2. **Shorten the wrong-answer delay** from 900 ms to 650 ms — still long enough to read the revealed correct answer, but noticeably snappier.
3. **Keep input focused through the transition** so the keyboard does not flicker on mobile (already in place; verifying it still holds with the shorter timing).

No other behavior changes — combo, hints, race-the-bot, and stats logic stay the same.

## Expected result

Snappier feel on every answer, with wrong answers still readable before moving on.