import { boot } from './boot';
import type { SeriesModule } from './boot';
import { DSA } from './data';

// /dsa/reels: one reel per /dsa lesson, one series per module, in course order.
boot(DSA, import.meta.glob<SeriesModule>('./dsa/*.ts'));
