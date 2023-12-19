import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { Settings } from '../../../models/settings';
import { FieldSet, FormGroup, Legend, Row, StyledCheckbox } from '../../components';
import { INPUT_COLOR } from '../../components/mantine.styled';

export const AdvancedSettings: FunctionComponent = () => {
  const { register } = useFormContext<Settings>();
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
      </FieldSet>
    </FormGroup>
  );
};
