import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { FieldSet, FormGroup, Label, Legend, RangeValue, Row, Slider, StyledCheckbox } from '../../components';
import { INPUT_COLOR } from '../../components/mantine.styled';

export const AdvancedSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();

  const refreshTimeWatch = watch('refreshTime');

  return (
    <FormGroup>
      <FieldSet>
        <Legend>Advanced</Legend>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Use hardware acceleration (requires restart)"
            size="xs"
            {...register('isUsingHardwareAcceleration')}
          />
        </Row>
        <Row>
          <StyledCheckbox color={INPUT_COLOR} label="Enable dev tools" size="xs" {...register('isDebug')} />
        </Row>
        <Row>
          <Label>
            Refresh Time (milliseconds)
            <Slider
              type="range"
              min={1000}
              max={10000}
              step={500}
              defaultValue={DEFAULT_SETTINGS.refreshTime}
              {...register('refreshTime', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{refreshTimeWatch}</RangeValue>
          </Label>
        </Row>
      </FieldSet>
    </FormGroup>
  );
};
