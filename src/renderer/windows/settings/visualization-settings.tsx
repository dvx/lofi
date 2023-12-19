import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { visualizations } from '../../../visualizations';
import { FieldSet, FormGroup, Label, Legend, RangeValue, Row, Select, Slider } from '../../components';
import { DisplayData } from '../../models';

interface Props {
  displays: DisplayData[];
  defaultVisualizationId: number;
  defaultVisualizationScreenId: number;
}

export const VisualizationSettings: FunctionComponent<Props> = ({
  displays,
  defaultVisualizationId,
  defaultVisualizationScreenId,
}) => {
  const { register, watch } = useFormContext<Settings>();
  const opacityWatch = watch('visualizerOpacity');
  return (
    <FormGroup>
      <FieldSet>
        <Legend>Visualization</Legend>
        <Row>
          Display on
          <Select
            {...register('visualizationScreenId', { valueAsNumber: true })}
            defaultValue={defaultVisualizationScreenId}>
            {displays.map(({ label }, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </Select>
        </Row>
        <Row>
          Type
          <Select {...register('visualizationId', { valueAsNumber: true })} defaultValue={defaultVisualizationId}>
            {visualizations.map(({ name }, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </Select>
        </Row>
        <Row>
          <Label>
            Opacity
            <Slider
              type="range"
              min={0}
              max={100}
              step={5}
              defaultValue={DEFAULT_SETTINGS.visualizerOpacity}
              {...register('visualizerOpacity', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{opacityWatch}</RangeValue>
          </Label>
        </Row>
      </FieldSet>
    </FormGroup>
  );
};
