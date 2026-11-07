import type { Series } from '../types';

// Short-form genre sampler for everyone, not just developers: one 3–4 beat reel
// (~12–25s) per genre, each with its own voice. An intentional exception to the
// 45–70s explainer format in AUTHORING.md §7 (beat count, outro ending, scene variety).

// $10,000 once, growing 7% a year (10000 × 1.07^n).
const growth = [
  { label: 'Start', sub: '$10,000', icon: '🌱' },
  { label: 'Year 10', sub: '$19,672', icon: '🌿' },
  { label: 'Year 20', sub: '$38,697', icon: '🪴' },
  { label: 'Year 30', sub: '$76,123', icon: '🌳' },
  { label: 'Year 40', sub: '$149,745', icon: '💰', tone: 'accent' as const },
];

const studyQuiz = {
  type: 'quiz' as const,
  question: 'Same 3 hours of study. Which sticks best a *week later*?',
  options: ['One 3-hour cram', 'Three 1-hour sessions', 'No real difference'],
  answer: 1,
};

const reviews = [
  { label: 'Learn it', sub: 'today', icon: '📖' },
  { label: 'Test yourself', sub: 'tomorrow', icon: '❓' },
  { label: 'Test again', sub: 'in a few days', icon: '🔁' },
  { label: 'Once more', sub: 'next week', icon: '🧠', tone: 'accent' as const },
];

const todo = (done: boolean) => ({
  type: 'phone' as const,
  os: 'ios' as const,
  screen: {
    kind: 'app' as const,
    title: 'To-do',
    icon: '📝',
    // Done tasks sink to the bottom; the big ones rise and stay open.
    items: done
      ? [
          { id: 'trip', label: 'Plan the trip', sub: '2 hours', icon: '✈️', checked: false },
          { id: 'report', label: 'Write the report', sub: '3 hours', icon: '📄', checked: false },
          { id: 'sam', label: 'Reply to Sam', sub: '1 minute', icon: '💬', checked: true },
          { id: 'bill', label: 'Pay the water bill', sub: '2 minutes', icon: '💧', checked: true },
          { id: 'dishes', label: 'Put dishes away', sub: '2 minutes', icon: '🍽️', checked: true },
        ]
      : [
          { id: 'sam', label: 'Reply to Sam', sub: '1 minute', icon: '💬', checked: false },
          { id: 'trip', label: 'Plan the trip', sub: '2 hours', icon: '✈️', checked: false },
          { id: 'bill', label: 'Pay the water bill', sub: '2 minutes', icon: '💧', checked: false },
          { id: 'report', label: 'Write the report', sub: '3 hours', icon: '📄', checked: false },
          { id: 'dishes', label: 'Put dishes away', sub: '2 minutes', icon: '🍽️', checked: false },
        ],
    toast: done ? '3 done in 5 minutes' : undefined,
  },
  caption: done ? 'small jobs, gone on the spot' : 'five tasks, three are tiny',
});

const offerScript = [
  { text: '“I’m *excited* about this offer.”', icon: '😊', sub: 'warm first: you want this' },
  { text: '“Similar roles pay around *$95k*.”', icon: '📊', sub: 'a number backed by research' },
  { text: '“Is there *flexibility*?”', icon: '🤝', sub: 'a question, not a threat' },
];

export const series: Series = {
  id: 'mind-money',
  title: 'Mind & money',
  emoji: '💡',
  color: '#2dd4bf',
  order: 9,
  blurb: 'Twenty-second ideas that pay off for life: money, memory, habits, work and calm.',
  reels: [
    {
      id: 'money-compound-interest',
      title: 'Money: the last decade wins',
      voice: 'am_michael',
      speed: 1.05,
      beats: [
        {
          say: 'The last ten years of investing earn more than the first thirty.',
          emphasis: ['last', 'thirty'],
          scene: {
            type: 'title',
            kicker: 'Money',
            title: 'The last decade earns the *most*',
            sub: 'compound interest, in twenty seconds',
            emoji: '📈',
            style: 'slam',
          },
        },
        {
          say: "Invest ten thousand dollars once. At seven percent a year, thirty years later it's seventy-six thousand.",
          emphasis: ['seven', 'seventy-six'],
          scene: { type: 'timeline', title: '$10k at 7% a year', steps: growth, active: 3 },
        },
        {
          say: "Wait ten more years, and it's a hundred and fifty thousand.",
          emphasis: ['fifty'],
          sfx: 'ding',
          scene: { type: 'timeline', title: '$10k at 7% a year', steps: growth, active: 4 },
        },
        {
          say: 'The last decade alone added seventy-four thousand dollars, more than the first thirty years. So start early.',
          emphasis: ['seventy-four', 'early'],
          sfx: 'success',
          scene: {
            type: 'stat',
            value: '74,000',
            label: 'dollars added in the *last decade*',
            sub: 'more than the first 30 years combined',
            tone: 'good',
          },
        },
      ],
    },
    {
      id: 'psychology-spacing-effect',
      title: 'Psychology: the spacing effect',
      voice: 'af_nicole',
      speed: 1.05,
      beats: [
        {
          say: 'Same three hours of study. Which one sticks best a week later?',
          emphasis: ['week'],
          sfx: 'riser',
          scene: studyQuiz,
        },
        {
          say: "Spread it out. It's called the spacing effect, and science has known it since 1885.",
          emphasis: ['spacing', '1885'],
          sfx: 'ding',
          scene: { ...studyQuiz, reveal: true, explain: 'Same time, spread out: it beats cramming on later tests.' },
        },
        {
          say: 'Learn it today. Then tomorrow, test yourself without notes.',
          emphasis: ['test'],
          scene: { type: 'timeline', title: 'Space your reviews', steps: reviews, active: 1 },
        },
        {
          say: 'Then test again in a few days, and once more next week.',
          emphasis: ['once', 'more'],
          sfx: 'success',
          scene: { type: 'timeline', title: 'Space your reviews', steps: reviews, active: 3 },
        },
      ],
    },
    {
      id: 'stoic-seneca-imagination',
      title: 'Stoic: Seneca on worry',
      voice: 'am_onyx',
      speed: 0.9,
      beats: [
        {
          say: 'We suffer more often in imagination than in reality.',
          emphasis: ['imagination', 'reality'],
          scene: {
            type: 'title',
            kicker: 'Seneca, about 65 AD',
            title: 'We suffer more often in *imagination*',
            sub: '…than in reality.',
            emoji: '🏛️',
            style: 'slam',
          },
        },
        {
          say: "Today, it's the late-night spiral. Ten worst cases on repeat, for one real problem.",
          emphasis: ['spiral', 'one'],
          scene: {
            type: 'compare',
            title: 'The 2 AM spiral',
            left: { title: 'In your head', verdict: 'bad', icon: '🌀', items: ['Ten worst cases', 'Playing on repeat'] },
            right: { title: 'In reality', verdict: 'ok', icon: '🎯', items: ['One real problem', 'One next step'] },
          },
        },
        {
          say: 'So ask one question: what is happening right now? Handle that. Let the rest wait.',
          emphasis: ['now', 'wait'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'Try this tonight', title: 'What is happening *right now*?', emoji: '🧭', style: 'slam' },
        },
      ],
    },
    {
      id: 'productivity-two-minute-rule',
      title: 'Productivity: the 2-minute rule',
      voice: 'af_bella',
      speed: 1.15,
      beats: [
        {
          say: 'If a task takes less than two minutes, do it now.',
          emphasis: ['two', 'now'],
          scene: {
            type: 'title',
            kicker: 'Productivity',
            title: 'Under 2 minutes? Do it *now*.',
            sub: "from David Allen's Getting Things Done",
            emoji: '⏱️',
            style: 'slam',
          },
        },
        {
          say: 'Writing a tiny task down, then tracking it, takes longer than the task itself.',
          emphasis: ['longer'],
          scene: todo(false),
        },
        {
          say: 'So knock them out on the spot. Three tasks, gone in five minutes.',
          emphasis: ['gone'],
          sfx: 'success',
          scene: todo(true),
        },
        {
          say: "Bigger than that? Don't start it now. Give it a real slot on your calendar.",
          emphasis: ['calendar'],
          scene: {
            type: 'compare',
            title: 'The 2-minute rule',
            left: { title: 'Under 2 min', verdict: 'ok', icon: '⚡', items: ['Do it now', 'Done and forgotten'] },
            right: { title: 'Over 2 min', verdict: 'neutral', icon: '📅', items: ['Schedule it', 'Give it real time'] },
          },
        },
      ],
    },
    {
      id: 'habits-implementation-intentions',
      title: 'Habits: when X, I will Y',
      voice: 'af_sarah',
      speed: 1.1,
      beats: [
        {
          say: 'Want a new habit to stick? Write one sentence first.',
          emphasis: ['sentence'],
          scene: { type: 'title', kicker: 'Habit science', title: 'Make any habit *stick*', emoji: '🧲', style: 'slam' },
        },
        {
          say: "The formula: when X happens, I will do Y. When I pour my coffee, I read one page.",
          speak: "The formula: when ex happens, I will do why. When I pour my coffee, I read one page.",
          emphasis: ['when', 'will'],
          sfx: 'pop',
          scene: {
            type: 'diagram',
            title: 'When X, I will Y',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'cue', label: 'When I pour coffee', sub: 'a cue you already do', icon: '☕', x: 0, y: 0 },
              { id: 'act', label: 'I read one page', sub: 'the new habit', icon: '📖', x: 0, y: 2, active: true },
            ],
            edges: [{ from: 'cue', to: 'act', active: true }],
            packets: [{ from: 'cue', to: 'act', label: 'then', tone: 'accent' }],
            caption: 'an implementation intention',
          },
        },
        {
          say: 'In one classic study, 91 percent of people who wrote that plan exercised the next week. Without it, about a third did.',
          emphasis: ['91', 'third'],
          sfx: 'ding',
          scene: {
            type: 'stat',
            value: '91',
            unit: '%',
            label: 'wrote the plan, then *exercised*',
            sub: 'vs about 1 in 3 without a plan',
            tone: 'good',
          },
        },
        {
          say: "A review of 94 tests backs it up. Don't just set a goal. Plan the when and where.",
          emphasis: ['when', 'where'],
          sfx: 'success',
          scene: { type: 'title', kicker: 'Backed by 94 tests', title: 'Plan the *when* and *where*', emoji: '📍', style: 'slam' },
        },
      ],
    },
    {
      id: 'career-offer-script',
      title: 'Career: answer an offer',
      voice: 'bm_george',
      speed: 1.0,
      beats: [
        {
          say: 'Got a job offer? Before you say yes, say this.',
          emphasis: ['this'],
          scene: { type: 'title', kicker: 'Career', title: 'Got an offer? Say *this*.', emoji: '💼', style: 'slam' },
        },
        {
          say: "Open warm. I'm really excited about this offer.",
          emphasis: ['warm', 'excited'],
          scene: { type: 'list', title: 'Word for word', numbered: true, items: offerScript, active: 0 },
        },
        {
          say: 'Then name a number from research. Similar roles pay around ninety-five thousand.',
          emphasis: ['number', 'research'],
          scene: { type: 'list', title: 'Word for word', numbered: true, items: offerScript, active: 1 },
        },
        {
          say: 'Finish with a question. Is there flexibility? Then stop talking, and let them answer.',
          emphasis: ['flexibility', 'stop'],
          sfx: 'success',
          scene: { type: 'list', title: 'Word for word', numbered: true, items: offerScript, active: 2 },
        },
      ],
    },
  ],
};
