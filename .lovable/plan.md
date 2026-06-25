## Goal

Give users more time to read the revealed correct answer after a wrong response.

## Change

In `src/routes/practice.session.tsx`, update the post-answer delay:
- Correct: 120ms (unchanged)
- Wrong: 650ms → **1200ms**

No other behavior changes.