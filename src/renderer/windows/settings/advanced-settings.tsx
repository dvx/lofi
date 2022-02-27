import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { Settings } from '../../../models/settings';
import { FieldSet, FormGroup, Input, Label, Legend, Row } from '../../components/styled/form.styled';

export const AdvancedSettings: FunctionComponent = () => {
  const { register } = useFormContext<Settings>();
  return (
    <FieldSet>
      <Legend>Advanced</Legend>
      <FormGroup>
        <Row>
          <Label>
            <Input type="checkbox" {...register('isUsingHardwareAcceleration')} />
            Use hardware acceleration (requires restart)
          </Label>
        </Row>
        <Row>
          <Label>
            <Input type="checkbox" {...register('isDebug')} />
            Debug mode
          </Label>
        </Row>
      </FormGroup>
    </FieldSet>
  );
};
