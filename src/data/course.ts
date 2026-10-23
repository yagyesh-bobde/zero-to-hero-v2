// Original, independent hands-on companion to "Neural Networks: Zero to Hero"
// (https://karpathy.ai/zero-to-hero.html). Lessons are written in our own words and
// do not transcribe the lectures or replace their implementations — watch each
// linked video for the full build.
import type { CourseModule } from '../types';
import { microgradModule } from './modules/micrograd';
import { bigramModule } from './modules/bigram';
import { mlpModule } from './modules/mlp';
import { batchnormModule } from './modules/batchnorm';
import { backpropModule } from './modules/backprop';
import { wavenetModule } from './modules/wavenet';
import { gptModule } from './modules/gpt';
import { tokenizerModule } from './modules/tokenizer';

export const modules: CourseModule[] = [
  microgradModule,
  bigramModule,
  mlpModule,
  batchnormModule,
  backpropModule,
  wavenetModule,
  gptModule,
  tokenizerModule,
];
