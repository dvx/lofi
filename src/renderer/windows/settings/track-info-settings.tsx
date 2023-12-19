import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_FONT_SIZE, MIN_FONT_SIZE } from '../../../constants';
import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { ColorInput, FieldSet, FormGroup, Label, Legend, RangeValue, Row, Slider } from '../../components';
import { INPUT_COLOR, StyledCheckbox, StyledTextInput } from '../../components/mantine.styled';

export const TrackInfoSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();

  const trackInfoFontSizeWatch = watch('trackInfoFontSize');
  const trackInfoBackgroundOpacityWatch = watch('trackInfoBackgroundOpacity');

  return (
    <FormGroup>
      <FieldSet>
        <Legend>Track Info</Legend>
        <Row>
          <Label>
            Font family
            <StyledTextInput size="xs" {...register('font')} />
          </Label>
        </Row>
        <Row>
          <Label>
            Font size
            <Slider
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              defaultValue={DEFAULT_SETTINGS.trackInfoFontSize}
              {...register('trackInfoFontSize', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{trackInfoFontSizeWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <Label>
            Font color
            <ColorInput {...register('trackInfoColor')} />
          </Label>
        </Row>
        <Row>
          <Label>
            Background color
            <ColorInput {...register('trackInfoBackgroundColor')} />
          </Label>
        </Row>
        <Row>
          <Label>
            Background opacity
            <Slider
              type="range"
              min={0}
              max={100}
              step={1}
              defaultValue={DEFAULT_SETTINGS.trackInfoBackgroundOpacity}
              {...register('trackInfoBackgroundOpacity', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{trackInfoBackgroundOpacityWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Display free account warning"
            size="xs"
            {...register('showFreemiumWarning')}
          />
        </Row>
      </FieldSet>
    </FormGroup>
  );
};
