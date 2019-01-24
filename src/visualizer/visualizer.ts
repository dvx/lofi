import { volume } from '../../build/release/volume.node';
import { nextVisualization, prevVisualization, visualizations } from '../visualizations/visualizations.js';
import { remote, ipcRenderer } from 'electron';

let visualizationId = 0;

const byeVisualization = function() {
    let canvas = document.getElementsByTagName('canvas')[0];
    if (canvas) {
        let gl = canvas.getContext('experimental-webgl');
        if (gl.getExtension('WEBGL_lose_context')) {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
        document.body.removeChild(canvas);
    }
}

const doVisualization = function(vis: Function) {
    byeVisualization();
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    vis(canvas, function() { return { volume } });
}

ipcRenderer.on('next-visualization', function (event:Event, data:any) {
    visualizationId = nextVisualization(visualizationId);
    doVisualization(visualizations[visualizationId]);
});

ipcRenderer.on('prev-visualization', function (event:Event, data:any) {
    visualizationId = prevVisualization(visualizationId);
    doVisualization(visualizations[visualizationId]);
});

doVisualization(visualizations[visualizationId]);