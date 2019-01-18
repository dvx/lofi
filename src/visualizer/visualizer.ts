import { volume } from '../../build/release/volume.node';
import visualize from '../visualizations/cube-test/cube-test.visualization'

let canvas = document.getElementById('canvas');
console.log(volume);
visualize(canvas, function() { return { volume } });