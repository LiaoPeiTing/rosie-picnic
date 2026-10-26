# Windows 1.0.0 release recovery

Release code: ede0d436963ce32c04e5ec270239bf472c8197c0
Release tag: halloween-windows-v1.0.0-20261026
Previous formal entry: halloween-before-windows-release-20261026

The previous root game scripts and assets remain unchanged. To restore its entry from the repository checkout:

```powershell
git restore --source=halloween-before-windows-release-20261026 -- halloween/index.html
git add halloween/index.html
git commit -m "Restore previous Halloween entry"
git push origin main
```

Wait for GitHub Pages to finish, then verify /halloween/?v=rollback-20261026. Update RELEASE.json to record a rollback if performed. Do not reset main or overwrite release tags.

The user-accepted fully voiced candidate also remains available at /halloween/windows-complete/?v=full118-3. All approved audio and the immutable production version folder remain preserved.

Production validation: installed Windows Chrome and Edge completed all three chapters at original speed, including choices, incorrect answers/hints, Stephanie Says, stickers, pause/resume/replay/end/return and saved 3/3 progress. Both verified 118 approved WAV hashes and decoding. Zero HTTP errors, JavaScript errors, audio failures or browser TTS calls. No audio regenerated.
