import { boot } from './boot';
import type { SeriesModule } from './boot';
import { RN_REELS } from './data';

// /react-native-reels: the course series.
boot(RN_REELS, import.meta.glob<SeriesModule>('./series/*.ts'));
