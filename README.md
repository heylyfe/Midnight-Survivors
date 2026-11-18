# Midnight Survivors v2

Full rebuild of the original single-file prototype. No build step, no dependencies: open `index.html` and play.

## What's new in v2

**Roster (5 characters, each with unique stats, dash, passive and cinematic ultimate)**
- Ichigo (free) - Hollow Rage: +40% damage below 40% HP, every 5th blade swing crits
- Rukia (2000g) - Shirayuki: chills everything; +50% damage vs chilled/frozen
- Frieren (5000g) - Mana Flow: cooldowns shrink every night survived
- Kaido (8000g) - Dragonskin: half damage below 30% HP, dash flattens enemies
- Gojo (15000g) - "Nah, I'd Win.": first death triggers Hollow Purple instead

**Three universal weapons** (no more random weapon soup)
- Bolt - ranged, style varies per character (Gojo flips blue/red)
- Blade - melee arc (Kaido's is a 360 smash that stuns)
- Shield - holy aura: outer ring slows enemies 40%, inner ring blocks a % of damage

**No level-up votes.** Your whole build grows automatically every level: damage, HP, speed, area, cooldowns, dash length, i-frames, block, pickup range (caps in `js/data.js` GROWTH).

**Cinematic ultimates.** Letterbox bars, slow-mo, zooms and camera rotation on every ult. Getsuga Tensho, Hakka no Togame, Zoltrak barrage, Thunder Bagua, Hollow Purple. Kill caps keep them from wiping whole screens.

**Enemies with telegraphs.** 9 enemy types: hounds circle and lunge (watch the shiver), chargers wind up, spitters keep range, bombers flash faster as they get close, splitters shatter, tanks soak, matrons summon. Elites glow gold and drop fat loot. 4 bosses at nights 5/10/15/20, endless after.

**Night Pacts** instead of curse chaos: at dawn the Broker offers 2 pacts (real boon + real curse). Refuse for gold, or double-or-nothing the refuse money at 45%. The Gambler's Coin pact grants a reroll every night.

**HEX & GOLD** - the casino under the manor: Coin of Fate, Devil's Dice (over/under 7, exact 7 pays x4.5), Cursed Slots (weighted reels), Fortune's Ladder (10 rungs, climb or bust, cash out anytime, x300 at the top). Persistent ledger, streaks, achievements. The permanent shop's Gambler's Luck rank nudges every table.

**Difficulty:** Normal (fair), Hard, Hardcore (no dawn heal). Win at night 20, then endless if you dare.

**Quality modes:** Low / Medium / High (Settings tab) scale particles, separation, screen shake and render resolution for weaker machines. Runs on desktop and touch.

## Controls
- WASD / arrows: move
- Space / Shift: dash (every character's dash is different)
- U / X / Q: ultimate
- Esc / P: pause
- Touch: left half of the screen is a joystick, DASH/ULT buttons bottom right

## Dev notes
- Everything is plain JS with canvas. Balance knobs live in `js/data.js` (DIFF, ET, PACTS, SHOP, GROWTH, CAS_LADDER).
- `tester.html` is the same game with a cheat panel (gold, unlocks, god HP, boss summon, night skip).
- Fan project, no commercial use; characters belong to their respective creators.
