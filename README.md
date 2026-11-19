# neon-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/trungminhdo4-glitch/neon-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/trungminhdo4-glitch/neon-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Cover Studio** turns your photos and a caption into a multi-panel poster cover with a sunset or neon colour grade, and exports it as a PNG in the common post sizes: 1080 × 1080, 1080 × 1350 and 1920 × 1080. It is static files only, runs offline in a desktop browser and never uploads a photo.

- **5 poster layouts**: Mosaic Nine, Hero + Three, Slash Three, Split Band, Full Bleed. Panels are polygons with even gutters, so diagonal cuts work too.
- **Own lettering**: a heavy, condensed block alphabet drawn on canvas with no font file, in three treatments: Sunset Chrome, Neon Tube and Poster Block, with an optional forward lean and a tagline.
- **5 colour grades**: Sunset Strip, Neon Night, Golden Hour, Ocean Drive and Natural Pop. Each is a gradient map with adjustable strength, plus film grain and scanlines. The title cell gets a striped sun, a glowing horizon grid and palm silhouettes.
- **Any photo**: add photos by picking, dropping or pasting them. Click a panel, drag to position, scroll to zoom, and mirror or reset it. "One photo, all panels" fills the poster with differently cropped shots of a single photo.
- **Fast export**: one click exports the current size, another exports all three sizes.

Sample pictures: the kit's two photos (made with an image model for make.fun) and three scenes the app paints itself.

## Run it

```sh
node serve.ts                              # then open http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes the entry: app/, screenshots/, dossier.json
node tools/capture-shots.mjs http://localhost:8080 <edge-profile-dir>   # retakes screenshots/ with headless Edge
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
