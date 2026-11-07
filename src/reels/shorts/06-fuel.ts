import type { Series } from '../types';

// Short-form motivation reels: 3–4 punchy beats, ~10 seconds, deep slow voice.
// An intentional exception to the 45–70s explainer format in AUTHORING.md §7.

const commit = [
  { cmd: 'git add .' },
  { cmd: 'git commit -m "rough v1"' },
  { out: '[main 8d4e7b0] rough v1', tone: 'muted' as const },
];

export const series: Series = {
  id: 'fuel',
  title: 'Fuel',
  emoji: '🔥',
  color: '#ff6b2c',
  order: 6,
  blurb: 'Ten seconds of push for the days the build feels heavy.',
  reels: [
    {
      id: 'ship-it-anyway',
      title: 'Ship it anyway',
      voice: 'am_onyx',
      speed: 0.9,
      beats: [
        {
          say: 'Perfect code never ships.',
          emphasis: ['ships'],
          scene: { type: 'title', kicker: 'Hard truth', title: 'Perfect code never *ships*', style: 'slam' },
        },
        {
          say: 'Localhost has zero users. Zero.',
          speak: 'Local host has zero users. Zero.',
          emphasis: ['zero'],
          sfx: 'riser',
          scene: { type: 'stat', value: '0', label: 'users on *localhost*', sub: 'nobody can use what you never ship', tone: 'bad' },
        },
        {
          say: 'Commit the rough version. Tonight.',
          emphasis: ['tonight'],
          sfx: 'type',
          scene: { type: 'terminal', title: '11:59 PM', lines: commit },
        },
        {
          say: 'Push it. Then make it great.',
          emphasis: ['push', 'great'],
          sfx: 'success',
          scene: {
            type: 'terminal',
            title: '11:59 PM',
            lines: [...commit, { cmd: 'git push origin main' }, { out: '8d4e7b0  main -> main', tone: 'good' }],
          },
        },
      ],
    },
  ],
};
