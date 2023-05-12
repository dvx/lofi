import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_BAR_THICKNESS, MAX_FONT_SIZE, MIN_FONT_SIZE } from '../../../constants';
import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import {
  ColorInput,
  FieldSet,
  FormGroup,
  Label,
  Legend,
  NoBorderFieldSet,
  RangeValue,
  Row,
  Slider,
  StyledCheckbox,
} from '../../components';
import { INPUT_COLOR, StyledTextInput } from '../../components/mantine.styled';

export const WindowSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();

  const barThicknessWatch = watch('barThickness');
  const trackInfoFontSizeWatch = watch('trackInfoFontSize');
  const trackInfoBackgroundOpacityWatch = watch('trackInfoBackgroundOpacity');

  return (
    <FormGroup>
      <NoBorderFieldSet>
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
      </NoBorderFieldSet>

      <FieldSet>
        <Legend>TRACK INFO</Legend>

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
      </FieldSet>
    </FormGroup>
  );
};
