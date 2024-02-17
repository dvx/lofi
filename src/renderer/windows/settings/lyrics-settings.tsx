import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { ApplicationUrl, MAX_FONT_SIZE, MIN_FONT_SIZE } from '../../../constants';
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
  TextArea,
} from '../../components';
import { INPUT_COLOR, StyledTextInput } from '../../components/mantine.styled';
import { HelpLink } from './help-link';

export const LyricsSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();
  const lyricMaxLengthWatch = watch('lyricMaxLength');
  const lyricFontSizeWatch = watch('lyricsFontSize');
  const lyricsBackgroundOpacityWatch = watch('lyricsBackgroundOpacity');

  return (
    <FormGroup>
      <FieldSet>
        <Legend>Lyrics</Legend>
        <Row>
          <Label>
            Lyric width
            <Slider
              type="range"
              min={16}
              max={100}
              step={2}
              defaultValue={DEFAULT_SETTINGS.lyricMaxLength}
              {...register('lyricMaxLength', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{lyricMaxLengthWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <StyledCheckbox color={INPUT_COLOR} label="Show Lyrics" size="xs" {...register('isShowLyrics')} />
        </Row>
        <Row>
          <StyledCheckbox
            color={INPUT_COLOR}
            label="Always Show Lyrics"
            size="xs"
            {...register('isAlwaysShowLyrics')}
          />
        </Row>
        <Row>
          <Label>
            Font family
            <StyledTextInput size="xs" {...register('lyricsFont')} />
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
              defaultValue={DEFAULT_SETTINGS.lyricsFontSize}
              {...register('lyricsFontSize', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{lyricFontSizeWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <Label>
            Font color
            <ColorInput {...register('lyricsColor')} />
          </Label>
        </Row>
        <Row>
          <Label>
            Background color
            <ColorInput {...register('lyricsBackgroundColor')} />
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
              defaultValue={DEFAULT_SETTINGS.lyricsBackgroundOpacity}
              {...register('lyricsBackgroundOpacity', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{lyricsBackgroundOpacityWatch}</RangeValue>
          </Label>
        </Row>
        <Row>
          <Label>
            sp_dc token
            <HelpLink url={ApplicationUrl.FindLyricsToken} icon="fa-solid fa-question-circle" />
          </Label>
        </Row>
        <Row>
          <Label>
            <TextArea defaultValue={DEFAULT_SETTINGS.SPDCToken} {...register('SPDCToken')} />
          </Label>
        </Row>
      </FieldSet>
    </FormGroup>
  );
};
