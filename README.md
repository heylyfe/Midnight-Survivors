# Midnight Survivors v2

Full rebuild of the original single-file prototype. No build step, no dependencies: open `index.html` and play.

## What's new in v2

**Roster (5 characters, each with unique stats, dash, passive and cinematic ultimate)**
- Ichigo (free) - Hollow Rage: +40% damage below 40% HP, every 5th blade swing crits. Bankai now takes real kill count (25, then x2.5 each time) but hits 3x harder with wider reach, a heal, an invulnerability window, and a hollow scream.
- Rukia (2000g) - Shirayuki: chills everything; +50% damage vs chilled/frozen
- Frieren (5000g) - Mana Flow: cooldowns shrink every night survived
- Kaido (8000g) - Dragonskin: half damage below 30% HP, dash flattens enemies
- Gojo (15000g) - "Nah, I'd Win.": Infinity unlocks at 2,000 kills in a single run, then crushes small enemies on contact and slows heavy ones. First death triggers Hollow Purple instead

**Three universal weapons** (no more random weapon soup)
- Bolt - ranged, style varies per character (Gojo flips blue/red)
- Blade - melee arc (Kaido's is a 360 smash that stuns)
- Shield - holy aura: outer ring slows enemies 40%, inner ring blocks a % of damage

**No level-up votes.** Your whole build grows automatically every level: damage, HP, speed, area, cooldowns, dash length, i-frames, block, pickup range (caps in `js/data.js` GROWTH). Levels also sharpen the universal weapons: +1% weapon damage and -1% weapon cooldown per level, plus awakenings — level 25 grants Bolt Twin Shot, Blade Wide Arc and Shield Iron Halo; level 50 grants Bolt Triple Shot, Blade Shockwave (every 4th swing slams a damaging ring) and Shield Sanctuary.

**Gold flows 3x faster** across runs (kills, drops, night pay, pact refusals).

**Cinematic ultimates.** Letterbox bars, slow-mo, zooms and camera rotation on every ult. Getsuga Tensho, Hakka no Togame, Zoltrak barrage, Thunder Bagua, Hollow Purple. Hollow Purple expands in a 650-unit circle, damaging enemies and bosses. The arena spans 12,000 × 12,000 units.

**Enemies with telegraphs.** 9 enemy types: hounds circle and lunge (watch the shiver), chargers wind up, spitters keep range, bombers flash faster as they get close, splitters shatter, tanks soak, matrons summon. Elites glow gold and drop fat loot. 4 bosses at nights 5/10/15/20, endless after.

**Night Pacts** instead of curse chaos: at dawn the Broker offers 2 pacts (real boon + real curse). Refuse for gold, or double-or-nothing the refuse money at 45%. The Gambler's Coin pact grants a reroll every night.

**HEX & GOLD** - the casino under the manor: Coin of Fate, Devil's Dice (over/under 7, exact 7 pays x4.5), Cursed Slots (weighted reels), Fortune's Ladder (10 rungs, climb or bust, cash out anytime, x300 at the top). Persistent ledger, streaks, achievements. The permanent shop's Gambler's Luck rank nudges every table.

**Difficulty:** Normal (fair), Hard, Hardcore (no dawn heal). Win at night 20, then endless if you dare.

**Moon shrines:** A temporary beacon appears during each night. Reach it before it fades to restore health and gain ultimate charge.

**Quality modes:** Low / Medium / High (Settings tab) scale particles, separation, screen shake and render resolution for weaker machines. Runs on desktop and touch.

**Character animation:** Pixel sprite sheets add distinct idle, running, attack, hit, and dash poses. Weapons follow the character's hand and the actual attack direction. Gojo channels Red and Blue through his hands.

**Perf: idle orbs merge.** Pickup orbs left alone for 15s fuse with nearby idlers into one fat orb (grows with the value inside, pulse-ringed).

**Mobile controls reworked:** full page scroll / rubber-band / pinch-zoom / context-menu lock during a run, joystick dead zone, and a pause button on touch.

**Cleaned-up interface:** unified theme tokens, sharper HUD bars and stat row, consistent cards, buttons, toasts, casino and pact styling.

## Controls
- WASD / arrows: move
- Space / Shift: dash (every character's dash is different)
- E: cycle weapon mode (auto / melee / ranged)
- U / X / Q: ultimate (Ichigo and Frieren can aim with the direction pad or arrow keys, with auto-aim after three seconds)
- Esc / P: pause
- Touch: left half of the screen is a joystick, DASH/ULT buttons bottom right

## Dev notes
- Resume restores your night timer, player progress, and boss health; ordinary enemies and dropped loot are reset.
- Run regression tests with `node --test tests/game.test.js`.
- Everything is plain JS with canvas. Balance knobs live in `js/data.js` (DIFF, ET, PACTS, SHOP, GROWTH, CAS_LADDER).
- `tester.html` is the same game with a cheat panel (gold, unlocks, god HP, boss summon, night skip).
- Fan project, no commercial use; characters belong to their respective creators.
