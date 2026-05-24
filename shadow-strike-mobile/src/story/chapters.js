export const HERO = {
  name: 'Kira Ashida',
  codename: 'Shadow Strike',
  tagline: 'Street fighter turned pit champion',
  bio: 'Once a corporate security drone, Kira walked away after witnessing the syndicate bury evidence of underground fight rigging. Now she fights her way up the illegal circuit to expose Viper Holdings.',
};

export const BOSSES = {
  5: { name: 'Rex "Ironjaw" Tanaka', title: 'Pit Enforcer', portrait: 'viper' },
  10: { name: 'Mako Viper', title: 'Syndicate Champion', portrait: 'viper' },
  15: { name: 'Director Viper', title: 'Head of Viper Holdings', portrait: 'viper' },
};

export const STORY_INTRO = [
  { speaker: 'Announcer', portrait: 'narrator', text: 'Welcome to the Underground Circuit — Neo-Tokyo, 2187. No rules. No mercy. Only glory… and blood.' },
  { speaker: 'Kira', portrait: 'kira', text: 'They think I came here for fame. Wrong. I came to burn Viper Holdings to the ground — one floor at a time.' },
  { speaker: 'Announcer', portrait: 'narrator', text: 'Tonight\'s challenger: KIRA ASHIDA — codename SHADOW STRIKE. Place your bets.' },
];

export function getFloorIntro(floor) {
  if (floor === 1) {
    return [
      ...STORY_INTRO,
      { speaker: 'Kira', portrait: 'kira', text: 'First fight. Move with the left stick. Hold SHOOT — bullets auto-aim at enemies. Tap BOMB when they swarm you. Keep your distance!' },
    ];
  }
  const boss = BOSSES[floor];
  if (boss) {
    return [
      { speaker: 'Announcer', portrait: 'narrator', text: `Floor ${floor} — BOSS FIGHT! ${boss.name}, ${boss.title}, enters the ring!` },
      { speaker: boss.name.split(' ')[0], portrait: boss.portrait, text: floor === 5
        ? 'You picked the wrong pit, little shadow. Ironjaw breaks rookies for breakfast.'
        : floor === 10
        ? 'Mako Viper doesn\'t lose. Your streak ends here.'
        : 'Director Viper owns this city. You\'re already dead — you just don\'t know it.' },
      { speaker: 'Kira', portrait: 'kira', text: 'Talk is cheap. Let\'s fight.' },
    ];
  }
  if (floor % 3 === 0) {
    return [
      { speaker: 'Kira', portrait: 'kira', text: `Floor ${floor}. The crowd's getting louder. Syndicate enforcers are sending heavier hitters.` },
    ];
  }
  return null;
}

export const TUTORIAL_STEPS = [
  {
    title: 'Left Thumb — Move',
    body: 'Use the LEFT joystick to move Kira around the arena. Keep moving — enemies chase you and hurt you when they get close!',
    highlight: 'joystick',
    icon: '🕹️',
  },
  {
    title: 'Right Thumb — SHOOT',
    body: 'Hold SHOOT to fire energy blasts. Bullets auto-aim at the nearest enemy — just like Neon Drift! Stay at range and mow them down.',
    highlight: 'shoot',
    icon: '🔫',
  },
  {
    title: 'BOMB — Crowd Blast',
    body: 'Tap BOMB when enemies surround you. It blasts everyone nearby. 4 second cooldown — save it for swarms!',
    highlight: 'bomb',
    icon: '💥',
  },
  {
    title: 'Clear Floors & Face Bosses',
    body: 'Defeat all enemies to advance. Every 5th floor is a BOSS FIGHT with unique dialogue. Heal 20 HP between floors.',
    highlight: 'hud',
    icon: '🏆',
  },
];
