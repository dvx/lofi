import React, { FunctionComponent, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { visualizations } from '../../../../visualizations';
import { Size } from '../../../models';

const VisualizerWrapper = styled.canvas`
  background-color: transparent;
  position: absolute;
  top: 0;
  transition: 0.5s;
`;

interface Props {
  visualizationId: number;
  visualizerOpacity: number;
  peakFactor?: number;
  timeFactor?: number;
  size?: Size;
}

export const Visualizer: FunctionComponent<Props> = ({
  visualizationId,
  visualizerOpacity,
  peakFactor,
  timeFactor,
  size,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!visualizationId || visualizationId < 0 || visualizationId >= visualizations.length) {
      visualizations[0].visualize({ canvas: canvasRef.current, peakFactor, timeFactor });
    } else {
      visualizations[visualizationId].visualize({ canvas: canvasRef.current, peakFactor, timeFactor });
    }
    const canvasRefValue = canvasRef.current;
    return () => {
      if (canvasRefValue) {
        const gl = canvasRefValue.getContext('webgl');
        gl.getExtension('WEBGL_lose_context').loseContext();
      }
    };
  }, [peakFactor, timeFactor, visualizationId]);

  return (
    <VisualizerWrapper
      ref={canvasRef}
      className="cover full"
      style={{ opacity: visualizerOpacity / 100 }}
      height={size?.height}
      width={size?.width}
      id="small-visualization"
    />
  );
};
