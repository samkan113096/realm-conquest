# Realm Conquest — Web Strategy Game

Turn-based hex strategy game. Conquer territories, manage resources, defeat AI rivals.

## Play

```bash
# From project root
npm run web

# Or open index.html directly in a browser
open index.html
```

Visit **http://localhost:8080**

## How to Play

1. Click your territory (blue) to select it
2. Build farms (food), markets (gold), barracks (army capacity)
3. Recruit warriors and archers
4. Attack adjacent territories to expand
5. End turn — AI factions take their moves
6. Control 70% of the map to win

## Strategy Tips

- Farms before barracks — army eats food each turn
- Hills and forests give defense bonuses to defenders
- Neutral territories are easy targets with bonus loot
- Don't spread too thin — AI will counter-attack

## Structure

```
web-game/
├── index.html
├── css/style.css
└── js/
    ├── main.js       # Entry, event wiring
    ├── game.js       # Game state & rules
    ├── map.js        # Hex map generation
    ├── units.js      # Buildings, units, factions
    ├── ai.js         # Enemy AI logic
    ├── renderer.js   # Canvas hex rendering
    └── ui.js         # DOM UI updates
```

## AI Extension Points

- New units: edit `js/units.js`
- AI behavior: edit `js/ai.js`
- Map size/terrain: edit `js/units.js` MAP_SIZE and TERRAIN
- Win conditions: edit `js/game.js` checkWin/checkLose
