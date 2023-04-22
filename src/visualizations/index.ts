import { blueWave } from './blue-wave';
import { VisualizeConfiguration } from './models';
import { rainbowRoad } from './rainbow-road';
import { seascape } from './seascape';
import { stringTheory } from './string-theory';

export interface Visualization {
  name: string;
  visualize: ({ canvas, timeFactor, peakFactor }: VisualizeConfiguration) => void;
}

export const visualizations: Visualization[] = [
  { name: 'Blue Wave', visualize: blueWave },
  { name: 'Rainbow Road', visualize: rainbowRoad },
  { name: 'String Theory', visualize: stringTheory },
  { name: 'Seascape', visualize: seascape },
];
