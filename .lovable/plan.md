## Goal

Prevent the mobile keyboard from closing and reopening after each submitted answer on both Android and iOS.

## Root cause

The drill currently disables the answer input during the short feedback pause. Mobile browsers dismiss the soft keyboard when a focused input becomes disabled. Tapping the Submit button can also steal focus from the input, which causes the same keyboard flicker.

## Plan

1. **Keep the input focusable during feedback**
   - Change the answer input from `disabled` to `readOnly` while feedback is showing.
   - Keep the same green/red feedback styling so users still see correct/wrong state.

2. **Stop Submit from stealing focus**
   - Prevent the Submit button from taking focus on touch/mouse press.
   - Let the form submit normally, but keep focus on the answer field.

3. **Guard against accidental edits during feedback**
   - Ignore input changes while feedback is visible.
   - Keep the Submit button disabled during feedback as it is now.

4. **Keep autofocus only as a fallback**
   - Leave the focus call after question change for desktop/fallback behavior.
   - The main mobile fix will be that the input never loses focus in the first place.

## Expected result

After answering a question, the keyboard stays open while the next question appears, instead of collapsing and popping back up.