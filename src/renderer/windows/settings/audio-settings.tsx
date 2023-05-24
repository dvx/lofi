import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_SKIP_SONG_DELAY, MIN_SKIP_SONG_DELAY } from '../../../constants';
import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { FormGroup, Label, NoBorderFieldSet, RangeValue, Row, Slider } from '../../components';

export const AudioSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();
  const volumeIncrementWatch = watch('volumeIncrement');
  const skipSongDelayWatch = watch('skipSongDelay');

  return (
    <NoBorderFieldSet>
      <FormGroup>
        <Row>
          <Label>
            Volume increment
            <Slider
              type="range"
              min={2}
              max={100}
              step={2}
              defaultValue={DEFAULT_SETTINGS.volumeIncrement}
              {...register('volumeIncrement', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{volumeIncrementWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <Label>
            Skip length (seconds)
            <Slider
              type="range"
              min={MIN_SKIP_SONG_DELAY}
              max={MAX_SKIP_SONG_DELAY}
              step={5}
              defaultValue={DEFAULT_SETTINGS.skipSongDelay}
              {...register('skipSongDelay', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{skipSongDelayWatch}</RangeValue>
          </Label>
        </Row>
      </FormGroup>
    </NoBorderFieldSet>
  );
};
