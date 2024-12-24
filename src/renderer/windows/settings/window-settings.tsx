import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_BAR_THICKNESS, MAX_CORNER_RADIUS } from '../../../constants';
import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import {
  ColorInput,
  FieldSet,
  FormGroup,
  Label,
  Legend,
  RangeValue,
  Row,
  Slider,
  StyledCheckbox,
} from '../../components';
import { INPUT_COLOR } from '../../components/mantine.styled';

export const WindowSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();

  const barThicknessWatch = watch('barThickness');
  const cornerRadiusWatch = watch('cornerRadius');
  const tempTrackInfoWatch = watch('showTrackInfoTemporarilyInSeconds');

  return (
    <FormGroup>
      <FieldSet>
        <Legend>Window</Legend>
        <Row>
          <StyledCheckbox color={INPUT_COLOR} label="Always on top" size="xs" {...register('isAlwaysOnTop')} />
        </Row>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Display in taskbar"
            size="xs"
            {...register('isVisibleInTaskbar')}
          />
        </Row>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Always show song information"
            size="xs"
            {...register('isAlwaysShowTrackInfo')}
          />
        </Row>
        <Row>
          <Label>
            Show Track Info Temporarily (Seconds)
            <Slider
              type="range"
              min={0}
              max={10}
              step={1}
              defaultValue={DEFAULT_SETTINGS.showTrackInfoTemporarilyInSeconds}
              {...register('showTrackInfoTemporarilyInSeconds', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{tempTrackInfoWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Always show song progress"
            size="xs"
            {...register('isAlwaysShowSongProgress')}
          />
        </Row>
        <Row>
          <Label>
            Progress bar thickness
            <Slider
              type="range"
              min={1}
              max={MAX_BAR_THICKNESS}
              step={1}
              defaultValue={DEFAULT_SETTINGS.barThickness}
              {...register('barThickness', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{barThicknessWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <Label>
            Progress bar color
            <ColorInput {...register('barColor')} />
          </Label>
        </Row>
        <Row>
          <Label>
            Border Radius
            <Slider
              type="range"
              min={0}
              max={MAX_CORNER_RADIUS}
              step={1}
              defaultValue={DEFAULT_SETTINGS.cornerRadius}
              {...register('cornerRadius', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{cornerRadiusWatch}</RangeValue>
          </Label>
        </Row>
      </FieldSet>
    </FormGroup>
  );
};
