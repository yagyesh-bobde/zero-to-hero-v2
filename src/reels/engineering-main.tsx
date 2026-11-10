import { boot } from './boot';
import type { SeriesModule } from './boot';
import { ENGINEERING } from './data';

// /engineering: mid-to-senior engineering reels, shuffled on every visit.
boot(ENGINEERING, import.meta.glob<SeriesModule>('./engineering/*.ts'));
