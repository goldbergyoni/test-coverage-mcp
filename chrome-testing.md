# Chrome Extension Testing POC - Orion

## Problem
Orion has a Chrome extension that blocks organization users from uploading sensitive information to cloud providers (Google Drive + 50 others). This security-critical code has no tests. Testing is non-trivial due to:
- Logging into cloud services
- Chrome extension interaction
- Complex test scenarios

## Goal
Suggest a viable testing approach with a working proof of concept. Even if some needs aren't fulfilled, identify alternatives or blockers.

## Task Summary
Run a Playwright test against Chrome with the extension installed automatically. Open Google Drive, configure the backend to trigger upload prevention, then verify that file upload is blocked by the extension.

## Deliverables / Questions to Answer

1. Can we run a Playwright test with an installed Chrome extension?
2. Can we access the extension DOM?
3. Can we log in to Google Drive?
4. Can we simulate a blocked upload scenario and assert the upload failed?
5. Can we intercept extension network calls using `page.route.fulfill`?

**Target test:** `test('when a blocked user tries to upload a file, then a warning message is shown and the file is not in google drive')`

## Technical Notes

- Web resources exist on testing extensions with Playwright - use as starting point
- Assert upload failure by searching Google Drive UI for the file and confirming it doesn't exist
- Use Playwright's file upload API
- Need the `.crx` extension file from customer. If delayed, use another extension or create a simple one with Claude Code
