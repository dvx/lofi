import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_BAR_THICKNESS } from '../../../constants';
import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import {
  ColorInput,
  FormGroup,
  Label,
  NoBorderFieldSet,
  RangeValue,
  Row,
  Slider,
  StyledCheckbox,
} from '../../components';
import { INPUT_COLOR } from '../../components/mantine.styled';

export const WindowSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();

  const barThicknessWatch = watch('barThickness');

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
            Progress bar: thickness
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
          {/* </Row>

        <Row> */}
          <Label>
            color
            <ColorInput {...register('barColor')} />
          </Label>
        </Row>
      </NoBorderFieldSet>
    </FormGroup>
  );
};
