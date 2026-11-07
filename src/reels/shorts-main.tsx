import { boot } from './boot';
import type { SeriesModule } from './boot';
import { SHORTS } from './data';

// /shorts: short-form sampler reels on the same engine.
boot(SHORTS, import.meta.glob<SeriesModule>('./shorts/*.ts'));
