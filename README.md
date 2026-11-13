# Midnight Survivors — website edition

A Vampire-Survivors-like browser game, now split into a static website.

## Run it
1. Open `index.html` directly in a browser, **or**
2. Host the folder anywhere static (GitHub Pages, Netlify, `python -m http.server`, etc.) and open the URL.

No build step, no dependencies — just `index.html`, `style.css`, `game.js`.

## Controls
- Move: WASD / arrow keys / drag (touch joystick on mobile)
- Dash: Space / Shift / Dash button — Pause: Esc / P
- Skill (abilities): Q / E / F / Skill button — Ultimate: U / X / ULT button
- Level-up choices: keys 1-3, R to reroll

## Fixes
- Safety: saves/imports that reference a removed character now fall back to Mage instead of crashing (`CH[M.ch]` guard at load and at run start).

- Fixed crash on desktop browsers: glow sprites now normalize 3-digit hex colors (invalid color in `addColorStop` was killing the whole draw loop).
- Fixed broken map floor: the background tile cache was drawn with a double camera offset — now blitted tile-aligned (verified before/after camera movement).
- Added a `roundRect` polyfill for older browsers.

## Gojo buffs & gem merging
- **Gojo keeps his free revive + mini Hollow Purple on every difficulty** (previously lost on Hardcore), and Hollow Purple now one-shots **everything including bosses**.
- **1000-kill mega ult (Unlimited Void) is now OP**: total invulnerability, 1.6x speed, 0.6x cooldowns, and Lapse Blue crushes/pulls all enemies every 0.45s.
- **Gems merge**: when 120+ XP gems are on the floor they combine into fewer big gems (value summed) — less clutter, less lag.

## Performance & roster
- **Lag fixes**: background tiles are rendered once to an offscreen cache per camera-tile/biome (instead of ~450 tile draws every frame); enemy shadows/highlights, gem glows and projectile glows use pre-rendered sprite blits instead of per-frame radial gradients; off-screen enemies and gems are culled from drawing; enemy cap lowered (220 + 15/night), night quota cap 480, gem drops capped at 420.
- **Roster trimmed**: removed Pyromancer, Cryomancer and Berserker (their kits are covered by Rukia and others) — 16 characters remain.

## Mobile & graphics fixes
- **Mobile joystick fixed**: pointer handling moved to window level with preventDefault, buttons/overlays excluded, `touch-action:none` on canvases.
- **No more blue highlight on hold**: global `user-select:none` / `-webkit-tap-highlight-color:transparent` / `-webkit-touch-callout:none`.
- **Graphics**: parallax far-background silhouettes, gradient-lit enemy bodies, glowing gems, player aura glow.

## Latest update
- **Unique dash per character**, each with an incrusted effect: Ichigo = **Flash Step** (longer dash, longer i-frames, 45% quicker cooldown), Rukia = dash **freezes nearby enemies and releases 6 ice spikes**, plus Mage bolts, Knight aegis+shockwave, Priest heal, Rogue line slash, Druid poison pool, Necro fear-push, Hunter lance, Witch fire trail, Cryo freeze aura, Engineer mine, Berserker/Goku damage surge, Gojo push+blink, Kaido arc slam, Le Chungus slam, Alya charm.
- **QOL**: Auto-ULT toggle, Reduced flashes toggle, press **R** on the end screen to instantly restart.
- **Rukia ult reworked**: giant rotating snowflake + ice pillars. The summoning rune circle is now **Mage-only** — every other ult uses its own summon pattern.
- **Weapon graphics**: bolts are now directional arrowheads, ice shards spin, all projectiles keep motion trails/glow/core.
- **Bug fixes/perf**: music scheduler no longer bursts after tab suspend; `near()` is O(n) instead of a full sort per weapon.
- **Architecture**: per-character data lives in tables (`CH`, `ULT`, `SC`, `PAT`, `UFXK`, `DASH`/`DFX`) — adding a character/ult/dash = add one entry to each table.

## What's new in this version
- **Gojo**: new avatar (spiky white hair, black blindfold, Six-Eyes glow, dark high collar). Hollow Purple ult is now a full cinematic — Red and Blue orbit with trails, merge, then a screen-wide purple blast with shock rings. Mega ult grants Unlimited Void (swirling vortex). **Maxed Red & Blue (Lv 8) grants INFINITY**: weak enemies cannot damage you at all (∞ pops on blocked hits) and are pushed to the edge of your aura and smashed by it.
- **Boss "summoning" moments**: cinematic letterbox banner with the boss name, screen shake, a synthesized anime-style boss theme (Web Audio, no audio files) that switches to a driving battle track while a boss is alive, plus a calm ambient BGM. Ult activations get a rising sting.
- **Ichigo** (12,000 gold): signature weapon Zangetsu (moon-crescent slashes). Bankai tiers by run kills — 100 kills: BANKAI (robe turns black), 500: Tensa Zangetsu (+damage/speed/area), 1000: HOLLOW BANKAI (white hollow mask with horn). Ult: Getsuga Tenshō crescent.
- **Damage numbers**: bigger pop-in scale, glow, gold crits, cyan labels (Dodge / ∞), they now stay visible during ultimates, and big values are shortened (`12.4k`, `3.2M`).
- **Graphics**: full-resolution smooth rendering by default (anti-aliased, soft gradient shadows, player light aura); toggle **Graphics: Pixelated** in settings for the old retro look.
- **Font**: clean system sans-serif for the UI, bold monospace for all in-game numbers — no webfont download, works offline.
- **Rerolls**: refilled to max every time you clear a night.
- **All ultimates**: shared shockwave rings + ember particles during the cinematic, double shock ring on impact for every character.
- **Balance**: player damage +15%, damage taken -15%, speed 130→140, XP needs -10%, night heal 5%→8%; enemies 10% less HP and 10% lower spawn quota.
- **Signature weapons** appear 3x more often in level-up drafts.
- **Le Chungus** (15,000 gold): +80 HP, +1 armor, +20% area, slow. Weapon: Chungus Slam (big knockback AoE). Ult: MEGACHUNGUS.
- **Unique ults**: every character has its own summon-in animation (pattern x sigil x color), its own ult layer set, AND its own mechanical effect — mines (Mage), curse-cleanse+heal (Priest), wisp swarm (Necro), lance/meteor storms (Hunter/Witch), 8s freeze (Rukia), charm-all (Alya), Kamehameha beam (Goku), screen slam (Le Chungus), aegis reflect (Knight), dash reset (Rogue), heal blooms (Druid), +20 max HP (Monk), 4 turrets (Engineer), bloodrage +50% (Berserker).
- **Weapon animation revamp**: projectiles now have motion trails, bigger glows and white-hot cores; Sode blades and heart waves have their own colors.
- **Rukia** (13,000 gold): Sode no Shirayuki blade — every 5th hit FREEZES the enemy ("FROZEN" pop); all freeze effects (Chrono Hourglass, chill, her ult) are heavily buffed on her. Ult: Sode no Shirayuki (freezes the whole screen on impact).
- **Alya** (13,000 gold): Heart Shockwave — enemies hit are CHARMED: frozen in place with a blush + floating heart. Ult: Heart Confession.
- **More enemies**: shade, wyrm, lich (ranged), mimic, behemoth. **More passives**: Phoenix Feather (auto-revive), Gold Rush, Frostbrand Edge.
- **More juice**: dash afterimages, enemy spawn poofs.
- **Tester build**: open `tester.html` instead of `index.html` for the admin panel (` key): +10k gold, god mode, instant ULT, +1 level, unlock all characters, kill all, spawn boss, heal, save. The normal `index.html` build has no admin code active.
- **Saving**: progress autosaves every 4 s during a run and on pause / tab-hide / window close; three rotating backup slots in localStorage protect against corruption (newest valid save wins, old `ms3`/`ms2` saves are migrated); a "✓ saved HH:MM:SS" indicator shows the last write; backup/restore codes still work in the menu.
