How to install and use the Meet Caption Saver extension:

1. Open Chrome and go to chrome://extensions
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked" and select the folder:
   /Users/shoya/Documents/string_saver/meet-caption-saver
4. Open a Google Meet meeting (https://meet.google.com/...), enable captions in Meet.
5. Click the Meet Caption Saver toolbar icon and click "Start capturing".
6. Captions shown in the meeting will be saved while capturing is ON.
7. Use "Download .txt" to save captured captions to a file, or "Clear" to reset.

Notes / Caveats:
- The extension looks for elements with aria-live or region roles and common "caption" class names; Google Meet DOM may change, so detection may need tuning.
- Captions are stored in extension local storage; they persist until cleared.
- Tested as an unpacked Chrome extension (Manifest V3).

If you want adjustments (auto-download at meeting end, different formatting, per-speaker grouping), tell me which behavior to add.
