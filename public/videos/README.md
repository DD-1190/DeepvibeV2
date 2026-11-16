# Founder film

Drop the files here and set their paths in `data/site.ts` → `founderVideo`.

Recommended encodes (keep the hero light):

| File | Size | Notes |
|---|---|---|
| founder.webm | 1080×1350 (4:5), VP9, ~1.5–2.5 Mbps, ≤ 20 s loop | primary |
| founder.mp4 | 1080×1350, H.264 High, CRF 23, `-movflags +faststart` | Safari / fallback |
| founder-mobile.webm / .mp4 | 720×900, ~0.8–1.2 Mbps | phones only |
| /images/founder-poster.jpg | 1080×1350, first frame, ~80 KB | shown instantly |

Example (ffmpeg):

    ffmpeg -i master.mov -vf "crop=ih*4/5:ih,scale=1080:1350" -an -c:v libvpx-vp9 -b:v 2M -row-mt 1 founder.webm
    ffmpeg -i master.mov -vf "crop=ih*4/5:ih,scale=1080:1350" -c:v libx264 -preset veryfast -crf 23 -movflags +faststart founder.mp4

Keep the audio track only if you want the sound toggle to be meaningful (video always starts muted).
