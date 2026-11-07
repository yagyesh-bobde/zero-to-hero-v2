import type { Series } from '../types';

// Short-form general-knowledge sampler: one 2–4 beat reel (~10–25s) per genre
// (space, myth-buster, history, trivia, word origin, book summary, language).
// An intentional exception to the 45–70s explainer format in AUTHORING.md §7.

// Andromeda's light vs. the age of our species (Homo sapiens ≈ 300,000 years).
const lightSteps = [
  { label: 'Light leaves', sub: '2.5 million years ago', icon: '🌌' },
  { label: 'Our species', sub: '~300,000 years ago', icon: '🧍' },
  { label: 'Tonight', sub: 'it reaches your eye', icon: '👁️', tone: 'accent' as const },
];

// The Emu War, Western Australia, 1932 (dates from Meredith's operation).
const emuSteps = [
  { label: 'Emus raid wheat', sub: '~20,000 birds', icon: '🌾' },
  { label: 'Army sent in', sub: 'Nov 2 · 2 machine guns', icon: '🪖' },
  { label: 'Army pulls out', sub: 'Nov 8 · birds scatter', icon: '🏳️', tone: 'bad' as const },
  { label: 'Second try ends', sub: 'Dec 10 · called off', icon: '🏁' },
];

const zoneQuiz = {
  type: 'quiz' as const,
  question: 'Which country has the most *time zones*?',
  options: ['Russia', 'USA', 'France', 'China'],
  answer: 2,
};

// mūs → mūsculus → muscle. Latin borrowed the "muscle" sense from Greek mŷs (mouse, muscle).
const muscleChain = (step: 0 | 1) => ({
  type: 'diagram' as const,
  title: 'Where "muscle" comes from',
  cols: 1,
  rows: 4,
  nodes: [
    { id: 'mus', label: 'mūs', sub: 'Latin: mouse', icon: '🐭', x: 0, y: 0 },
    { id: 'musculus', label: 'mūsculus', sub: 'Latin: little mouse', icon: '🐁', x: 0, y: 1.5, active: step === 0 },
    { id: 'muscle', label: 'muscle', sub: 'English, 1300s', icon: '💪', x: 0, y: 3, active: step === 1, dim: step === 0 },
  ],
  edges: [
    { from: 'mus', to: 'musculus', active: step === 0 },
    { from: 'musculus', to: 'muscle', active: step === 1, dashed: step === 0 },
  ],
  packets: step === 1 ? [{ from: 'musculus', to: 'muscle', tone: 'accent' as const }] : [],
  caption: step === 0 ? '-culus makes a word small' : 'Greek mŷs: mouse and muscle',
});

export const series: Series = {
  id: 'world-wonder',
  title: 'World & wonder',
  emoji: '🌍',
  color: '#2dd4bf',
  order: 11,
  blurb: 'Fifteen seconds of wonder: space, history, words, books and more.',
  reels: [
    {
      id: 'space-andromeda-light',
      title: 'Space: you can see the past',
      voice: 'bm_george',
      speed: 0.95,
      beats: [
        {
          say: 'That faint smudge in the night sky? You are seeing it as it was long, long ago.',
          emphasis: ['smudge', 'ago'],
          scene: { type: 'title', kicker: 'Space', title: 'You can see the *past*', emoji: '🌌', style: 'slam' },
        },
        {
          say: 'The Andromeda galaxy is two and a half million light-years away, and on a dark night you can see it with bare eyes.',
          emphasis: ['Andromeda', 'million'],
          sfx: 'ding',
          scene: {
            type: 'stat',
            value: '2.5',
            unit: 'M',
            label: '*light-years* to Andromeda',
            sub: 'and you can see it without a telescope',
            tone: 'accent',
          },
        },
        {
          say: 'Its light left before our species even existed.',
          emphasis: ['species'],
          scene: { type: 'timeline', title: 'The light in your eye', steps: lightSteps, active: 1 },
        },
        {
          say: 'So tonight, light older than humanity lands in your eye.',
          emphasis: ['older'],
          sfx: 'success',
          scene: { type: 'timeline', title: 'The light in your eye', steps: lightSteps, active: 2 },
        },
      ],
    },
    {
      id: 'myth-ten-percent-brain',
      title: 'Myth-buster: 10% of your brain',
      voice: 'af_bella',
      speed: 1.1,
      beats: [
        {
          say: 'Myth: you only use ten percent of your brain.',
          emphasis: ['ten', 'percent'],
          scene: { type: 'title', kicker: 'Myth buster', title: 'You only use *10%* of your brain?', emoji: '🧠', style: 'glitch' },
        },
        {
          say: 'Fact: brain scans find no silent ninety percent. Every region has a job, just not all at once.',
          emphasis: ['every', 'job'],
          scene: {
            type: 'compare',
            title: 'Only ten percent?',
            left: { title: 'Myth', verdict: 'bad', icon: '💤', items: ['10% in use', '90% asleep'] },
            right: { title: 'Fact', verdict: 'ok', icon: '⚡', items: ['100% in use', 'Taking turns'] },
          },
        },
        {
          say: "It's two percent of your weight, but burns about twenty percent of your energy. Nothing that hungry sits idle.",
          emphasis: ['twenty', 'idle'],
          sfx: 'ding',
          scene: {
            type: 'stat',
            value: '20',
            unit: '%',
            label: "of your body's *energy*",
            sub: 'from just 2% of your body weight',
            tone: 'good',
          },
        },
      ],
    },
    {
      id: 'history-emu-war',
      title: 'History: the Emu War',
      voice: 'bm_fable',
      speed: 1,
      beats: [
        {
          say: "In 1932, Australia's army went to war against emus.",
          emphasis: ['emus'],
          scene: { type: 'title', kicker: 'History in 15 seconds', title: 'Army vs *emus*', emoji: '🪖', style: 'slam' },
        },
        {
          say: 'Twenty thousand emus were eating the wheat, so soldiers came with two machine guns.',
          emphasis: ['wheat', 'guns'],
          scene: { type: 'timeline', title: 'The Emu War, 1932', steps: emuSteps, active: 1 },
        },
        {
          say: 'The birds scattered, a gun jammed, and within a week the army pulled out.',
          emphasis: ['jammed'],
          sfx: 'error',
          scene: { type: 'timeline', title: 'The Emu War, 1932', steps: emuSteps, active: 2 },
        },
        {
          say: 'Round two claimed under a thousand birds, for nearly ten thousand bullets. Many say the emus won.',
          emphasis: ['bullets', 'won'],
          sfx: 'ding',
          scene: {
            type: 'stat',
            value: '9,860',
            label: 'bullets for *986* emus',
            sub: "the army's own count: ten per bird",
            tone: 'warn',
          },
        },
      ],
    },
    {
      id: 'trivia-time-zones',
      title: 'Trivia: the most time zones',
      voice: 'am_puck',
      speed: 1.1,
      beats: [
        {
          say: 'Quick quiz! Which country has the most time zones?',
          emphasis: ['time', 'zones'],
          sfx: 'riser',
          scene: zoneQuiz,
        },
        {
          say: 'France! Its overseas territories give it twelve. Russia has eleven.',
          emphasis: ['France', 'twelve'],
          sfx: 'ding',
          scene: { ...zoneQuiz, reveal: true, explain: 'Overseas territories give France 12. Russia has 11.' },
        },
        {
          say: 'Tahiti and New Caledonia are twenty-one hours apart, and both are France.',
          emphasis: ['twenty-one', 'France'],
          scene: {
            type: 'stat',
            value: '21',
            label: 'hours apart, both *France*',
            sub: 'from UTC −10 to UTC +11',
            tone: 'accent',
          },
        },
      ],
    },
    {
      id: 'word-origin-muscle',
      title: 'Word origin: muscle',
      voice: 'af_sarah',
      speed: 1.05,
      beats: [
        {
          say: "Every time you flex, you're showing off a little mouse.",
          emphasis: ['mouse'],
          scene: { type: 'title', kicker: 'Word origin', title: 'Your *muscles* are mice', emoji: '🐭', style: 'slam' },
        },
        {
          say: 'In Latin, mus means mouse, and musculus means little mouse.',
          speak: 'In Latin, moose means mouse, and mooskoolus means little mouse.',
          emphasis: ['little', 'mouse'],
          sfx: 'pop',
          scene: muscleChain(0),
        },
        {
          say: 'A flexing muscle looked like a mouse running under the skin. Greek even used one word for both.',
          emphasis: ['muscle', 'both'],
          sfx: 'ding',
          scene: muscleChain(1),
        },
      ],
    },
    {
      id: 'book-atomic-habits',
      title: 'Book in 20 seconds: Atomic Habits',
      voice: 'am_michael',
      speed: 1.05,
      beats: [
        {
          say: 'Atomic Habits, in twenty seconds. Tiny habits, giant results.',
          emphasis: ['tiny', 'giant'],
          scene: { type: 'title', kicker: 'Book in 20 seconds', title: 'Atomic *Habits*', sub: 'James Clear · 2018', emoji: '📘', style: 'stack' },
        },
        {
          say: "Get one percent better every day, and a year later you're about thirty-seven times better.",
          emphasis: ['one', 'thirty-seven'],
          sfx: 'ding',
          scene: {
            type: 'stat',
            value: '37',
            unit: 'x',
            label: 'better after a year of *1%* a day',
            sub: '1.01 multiplied by itself 365 times',
            tone: 'good',
          },
        },
        {
          say: 'Goals set the direction, but your daily systems decide where you actually end up.',
          emphasis: ['systems'],
          scene: {
            type: 'compare',
            title: 'What really matters',
            left: { title: 'Goals', verdict: 'neutral', icon: '🎯', items: ['Set direction', 'A finish line'] },
            right: { title: 'Systems', verdict: 'ok', icon: '🔁', items: ['Daily habits', 'Get you there'] },
          },
        },
        {
          say: 'To build a habit, make it obvious, attractive, easy and satisfying.',
          emphasis: ['obvious', 'satisfying'],
          sfx: 'success',
          scene: {
            type: 'list',
            title: 'To build a habit, make it…',
            numbered: true,
            items: [
              { text: '*Obvious*', sub: 'keep the cue in sight' },
              { text: '*Attractive*', sub: 'pair it with a treat' },
              { text: '*Easy*', sub: 'start with 2 minutes' },
              { text: '*Satisfying*', sub: 'reward it right away' },
            ],
          },
        },
      ],
    },
    {
      id: 'japanese-sumimasen',
      title: 'Japanese: one word, three jobs',
      voice: 'af_heart',
      speed: 1,
      beats: [
        {
          say: 'One Japanese word means excuse me, sorry, and thank you.',
          emphasis: ['one', 'word'],
          scene: { type: 'title', kicker: 'Japanese in 15 seconds', title: 'One word, *three* jobs', emoji: '🗾', style: 'slam' },
        },
        {
          say: 'Sumimasen. Say it slowly: soo, mee, mah, sen.',
          speak: 'Soo-mee-mah-sen. Say it slowly: soo, mee, mah, sen.',
          emphasis: ['Sumimasen'],
          sfx: 'pop',
          scene: { type: 'title', kicker: 'Say it: sumimasen', title: '*Soo* mee *mah* sen', sub: 'written すみません', emoji: '🗣️', style: 'stack' },
        },
        {
          say: 'Use it to call a waiter, to say sorry, or to thank someone who went out of their way.',
          emphasis: ['waiter', 'sorry', 'thank'],
          sfx: 'ding',
          scene: {
            type: 'list',
            title: 'When to say it',
            items: [
              { text: 'Excuse me', icon: '🙋', sub: 'to call a waiter over' },
              { text: 'Sorry', icon: '🙇', sub: 'after a small bump' },
              { text: 'Thank you', icon: '🙏', sub: 'for a kind favour' },
            ],
          },
        },
      ],
    },
  ],
};
