import type { Series } from '../types';

// Short-form, everyday-life sampler: one 3–4 beat reel (~10–25s) per genre
// (fitness myth, sleep, breathing, kitchen, first aid, money), each with its own
// voice. An intentional exception to the 45–70s explainer format in AUTHORING.md §7.
// Health content follows mainstream guidance (NHS / CDC / WHO).

// Box breathing: four corners of a literal box, one side per breath phase.
const box = (phase: 0 | 1 | 2 | 3) => {
  const corners = [
    { id: 'in', label: 'Breathe in', icon: '🌸', x: 0, y: 0 },
    { id: 'hold1', label: 'Hold', icon: '✋', x: 2, y: 0 },
    { id: 'out', label: 'Breathe out', icon: '🕯️', x: 2, y: 2 },
    { id: 'hold2', label: 'Hold', icon: '✋', x: 0, y: 2 },
  ];
  const order = ['in', 'hold1', 'out', 'hold2'];
  const from = order[phase];
  const to = order[(phase + 1) % 4];
  return {
    type: 'diagram' as const,
    title: 'Box breathing',
    cols: 3,
    rows: 3,
    nodes: corners.map((c, i) => ({
      ...c,
      sub: '4 counts',
      active: i === phase,
      dim: i !== phase,
    })),
    edges: order.map((id, i) => ({
      from: id,
      to: order[(i + 1) % 4],
      active: i === phase,
      dim: i !== phase,
    })),
    packets: [{ from, to, label: '4', tone: 'accent' as const }],
    caption: 'in · hold · out · hold',
  };
};

const fast = [
  { text: '*F*ace', icon: '🙂', sub: 'one side drooping?' },
  { text: '*A*rms', icon: '💪', sub: 'can they lift both?' },
  { text: '*S*peech', icon: '🗣️', sub: 'slurred or strange?' },
  { text: '*T*ime', icon: '🚑', sub: 'call emergency services', tone: 'bad' as const },
];

const caffeine = [
  { label: '4 PM coffee', sub: 'all the caffeine', icon: '☕' },
  { label: '9 PM', sub: 'about half still in you', icon: '🌆' },
  { label: '11 PM bedtime', sub: 'over a third left', icon: '🛏️' },
  { label: '2 AM', sub: 'still about a quarter', icon: '🌙', tone: 'bad' as const },
];

export const series: Series = {
  id: 'body-life',
  title: 'Body & life',
  emoji: '🌱',
  color: '#2dd4bf',
  order: 10,
  blurb: 'Twenty-second wins for everyday life: fitness, sleep, calm, kitchen, first aid and money.',
  reels: [
    {
      id: 'fitness-myth-spot-reduction',
      title: 'Fitness myth: crunches burn belly fat',
      voice: 'am_fenrir',
      speed: 1.1,
      beats: [
        {
          say: "Crunches won't burn your belly fat. Here's why.",
          emphasis: ['belly', 'fat'],
          scene: { type: 'title', kicker: 'Fitness myth', title: 'Crunches burn *belly fat*?', emoji: '🏋️', style: 'glitch' },
        },
        {
          say: "You can't pick where fat comes off. Your body burns it from everywhere.",
          emphasis: ['pick', 'everywhere'],
          scene: {
            type: 'compare',
            title: 'Can you spot-burn fat?',
            left: { title: 'Myth', verdict: 'bad', icon: '🙅', items: ['Work abs, lose belly fat', 'Pick where fat goes'] },
            right: { title: 'Fact', verdict: 'ok', icon: '✅', items: ['Fat loss is body-wide', 'Crunches build muscle'] },
          },
        },
        {
          say: 'What works: eat a little less, move more, and lift weights. Crunches just build the muscle underneath.',
          emphasis: ['less', 'move', 'lift'],
          sfx: 'ding',
          scene: {
            type: 'list',
            title: 'What actually works',
            items: [
              { text: 'Eat a *little* less', icon: '🥗', sub: 'a small, steady deficit' },
              { text: 'Move every day', icon: '🚶', sub: 'walks count' },
              { text: 'Lift *weights*', icon: '🏋️', sub: 'twice a week, whole body' },
            ],
          },
        },
      ],
    },
    {
      id: 'sleep-caffeine-cutoff',
      title: 'Sleep science: the caffeine cutoff',
      voice: 'af_sky',
      speed: 1.0,
      beats: [
        {
          say: 'Your four o’clock coffee is still awake at bedtime.',
          emphasis: ['awake'],
          scene: { type: 'title', kicker: 'Sleep science', title: 'Your 4pm coffee is still *awake*', emoji: '☕', style: 'slam' },
        },
        {
          say: 'Caffeine takes about five hours to drop by half. At nine, half of it is still in you.',
          emphasis: ['half'],
          scene: { type: 'timeline', title: 'Where your coffee goes', steps: caffeine, active: 1 },
        },
        {
          say: 'Even at two in the morning, a quarter is still there, making your sleep lighter.',
          emphasis: ['quarter', 'lighter'],
          sfx: 'error',
          scene: { type: 'timeline', title: 'Where your coffee goes', steps: caffeine, active: 3 },
        },
        {
          say: 'So stop caffeine about eight hours before bed. Bed at eleven? Last cup by three.',
          emphasis: ['eight', 'three'],
          sfx: 'ding',
          scene: { type: 'stat', value: '8', unit: 'hrs', label: 'no caffeine before *bed*', sub: 'bed at 11 pm? last cup by 3 pm', tone: 'accent' },
        },
      ],
    },
    {
      id: 'calm-box-breathing',
      title: 'Calm: one box breath, together',
      voice: 'af_nicole',
      speed: 0.75,
      beats: [
        {
          say: 'Breathe with me. In through your nose, two, three, four.',
          speak: 'Breathe with me. In through your nose... two... three... four...',
          emphasis: ['in'],
          scene: box(0),
        },
        {
          say: 'Now hold, nice and still, two, three, four.',
          speak: 'Now hold... nice and still... two... three... four...',
          emphasis: ['hold'],
          sfx: 'none',
          scene: box(1),
        },
        {
          say: 'And out, nice and slow, two, three, four.',
          speak: 'And out... nice and slow... two... three... four...',
          emphasis: ['out'],
          sfx: 'none',
          scene: box(2),
        },
        {
          say: 'Hold, nice and still, two, three, four. Repeat it any time you feel tense.',
          speak: 'Hold... nice and still... two... three... four... Repeat it any time you feel tense.',
          emphasis: ['hold', 'tense'],
          sfx: 'none',
          scene: box(3),
        },
      ],
    },
    {
      id: 'kitchen-pat-it-dry',
      title: 'Kitchen hack: pat it dry',
      voice: 'am_puck',
      speed: 1.1,
      beats: [
        {
          say: "Why won't your steak brown? Because it's wet.",
          emphasis: ['wet'],
          scene: { type: 'title', kicker: 'Kitchen hack', title: 'Why won’t it *brown*?', emoji: '🥩', style: 'slam' },
        },
        {
          say: "Water can't get hotter than boiling, so wet meat steams. Browning needs far more heat.",
          emphasis: ['steams', 'heat'],
          scene: {
            type: 'compare',
            title: 'Into a hot pan',
            left: { title: 'Wet', verdict: 'bad', icon: '💧', items: ['Stuck at 100°C', 'Steams, turns grey'] },
            right: { title: 'Patted dry', verdict: 'ok', icon: '🧻', items: ['Climbs past 140°C', 'Deep brown crust'] },
          },
        },
        {
          say: "So pat it dry with paper towels, heat the pan first, and don't crowd it.",
          emphasis: ['dry'],
          sfx: 'ding',
          scene: {
            type: 'list',
            title: 'For a golden crust',
            numbered: true,
            active: 0,
            items: [
              { text: 'Pat it *dry*', icon: '🧻', sub: 'paper towels, both sides' },
              { text: 'Preheat the pan', icon: '🔥', sub: 'until the oil shimmers' },
              { text: "Don't crowd it", icon: '↔️', sub: 'crowded pans steam too' },
            ],
          },
        },
      ],
    },
    {
      id: 'first-aid-stroke-fast',
      title: 'First aid: spot a stroke FAST',
      voice: 'bm_george',
      speed: 1.0,
      beats: [
        {
          say: 'Spot a stroke FAST. Face: has one side dropped? Ask them to smile.',
          speak: 'Spot a stroke fast. Face: has one side dropped? Ask them to smile.',
          emphasis: ['FAST', 'Face'],
          scene: { type: 'list', title: 'Stroke? Think F.A.S.T.', items: fast, active: 0 },
        },
        {
          say: 'Arms: can they lift both arms and keep them up?',
          emphasis: ['Arms'],
          scene: { type: 'list', title: 'Stroke? Think F.A.S.T.', items: fast, active: 1 },
        },
        {
          say: 'Speech: is it slurred or garbled, or can they not talk at all?',
          emphasis: ['Speech'],
          scene: { type: 'list', title: 'Stroke? Think F.A.S.T.', items: fast, active: 2 },
        },
        {
          say: 'Time: call emergency services right away, and note when it started.',
          emphasis: ['Time', 'emergency'],
          sfx: 'error',
          scene: { type: 'list', title: 'Stroke? Think F.A.S.T.', items: fast, active: 3 },
        },
      ],
    },
    {
      id: 'money-unit-price',
      title: 'Money hack: check the unit price',
      voice: 'af_bella',
      speed: 1.1,
      beats: [
        {
          say: "The bigger pack isn't always the cheaper one.",
          emphasis: ['bigger'],
          scene: { type: 'title', kicker: 'Money hack', title: 'Bigger pack, *better* deal?', emoji: '🛒', style: 'slam' },
        },
        {
          say: 'Ignore the big price. Check the unit price on the shelf tag.',
          emphasis: ['unit', 'price'],
          scene: {
            type: 'compare',
            title: 'Same cereal, two boxes',
            left: { title: 'Big box', verdict: 'bad', icon: '📦', items: ['500 g for $6', '$1.20 per 100 g'] },
            right: { title: 'Small box', verdict: 'ok', icon: '🥣', items: ['200 g for $2', '$1.00 per 100 g'] },
          },
        },
        {
          say: 'Here, the big box costs twenty percent more for the same cereal.',
          emphasis: ['twenty', 'percent'],
          sfx: 'ding',
          scene: { type: 'stat', value: '20', unit: '%', label: 'more for the *big box*', sub: 'the unit price is on the shelf tag', tone: 'warn' },
        },
      ],
    },
  ],
};
