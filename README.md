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

## What's new in this version
- **Gojo**: new avatar (spiky white hair, black blindfold, Six-Eyes glow, dark high collar). Hollow Purple ult is now a full cinematic — Red and Blue orbit with trails, merge, then a screen-wide purple blast with shock rings. Mega ult grants Unlimited Void (swirling vortex). **Maxed Red & Blue (Lv 8) grants INFINITY**: weak enemies cannot damage you at all (∞ pops on blocked hits) and are pushed to the edge of your aura and smashed by it.
- **Boss "summoning" moments**: cinematic letterbox banner with the boss name, screen shake, a synthesized anime-style boss theme (Web Audio, no audio files) that switches to a driving battle track while a boss is alive, plus a calm ambient BGM. Ult activations get a rising sting.
- **Ichigo** (12,000 gold): signature weapon Zangetsu (moon-crescent slashes). Bankai tiers by run kills — 100 kills: BANKAI (robe turns black), 500: Tensa Zangetsu (+damage/speed/area), 1000: HOLLOW BANKAI (white hollow mask with horn). Ult: Getsuga Tenshō crescent.
- **Damage numbers**: bigger pop-in scale, glow, gold crits, cyan labels (Dodge / ∞), and they now stay visible during ultimates.
- **Saving**: progress autosaves every 4 s during a run and on pause / tab-hide / window close; three rotating backup slots in localStorage protect against corruption (newest valid save wins, old `ms3`/`ms2` saves are migrated); a "✓ saved HH:MM:SS" indicator shows the last write; backup/restore codes still work in the menu.
