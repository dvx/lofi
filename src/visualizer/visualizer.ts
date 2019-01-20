import { volume } from '../../build/release/volume.node';
import visualize from '../visualizations/rainbow-road/rainbow-road.visualization'

let canvas: any = document.getElementById('canvas');
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
visualize(canvas, function() { return { volume } });