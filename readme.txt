
Test 1 — Heatmap
Open app → Home tab
Verify colored circles appear on map
Click a circle → tooltip shows street name + risk level
Test 2 — Primary SOS

Go to Contacts → add a contact name + phone
Return to Home → press the red 🆘 SOS button
Verify: SOS overlay appears, SMS intent link opens with your contact's number and your GPS coords
Test 3 — Secondary SOS (Manual trigger test)

Long-press (2s) the orange ⚠ AUTO SOS button
Verify: Secondary overlay shows, pre-filled SMS to police/hospital numbers
Test 4 — Code Word Detection

Settings → set code word (e.g. "help") + dB threshold (60)
Home → enable microphone → yell "HELP" loudly
Verify: Secondary SOS triggers with voice indicator
Test 5 — Throw / Motion Detection

In Chrome DevTools → Sensors → override Device Orientation
OR physically shake phone (if testing on mobile)
Verify: Secondary SOS triggers within 2 seconds
Test 6 — Power-Off / Tab Close SOS

Activate monitoring in Settings
Close the browser tab
Verify: Browser shows leave-page warning + SMS intent fires 
