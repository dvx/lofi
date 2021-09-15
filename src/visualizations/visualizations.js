import { default as blue_wave } from './blue-wave';
import { default as rainbow_road } from './rainbow-road';
import { default as string_theory } from './string-theory';
import { default as seascape } from './seascape';

export const visualizations = [blue_wave, rainbow_road, string_theory, seascape];

export const nextVisualization = function (currentVisualization) {
  currentVisualization++;
  if (currentVisualization >= visualizations.length) {
    return 0;
  }
  return currentVisualization;
};

export const prevVisualization = function (currentVisualization) {
  currentVisualization--;
  if (currentVisualization < 0) {
    return visualizations.length - 1;
  }
  return currentVisualization;
};
