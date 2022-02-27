import styled, { css } from 'styled-components';

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FieldSet = styled.fieldset`
  border-color: #717171;
  border-width: 2px;
`;

export const Legend = styled.legend`
  font-size: 130%;
  color: rgb(214, 146, 255);
  font-weight: 300;
  font-variant: all-petite-caps;
  text-shadow: #00000085 0 0 0.25rem;
`;

export const Row = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
`;

export const BaseSettingsInputStyle = css`
  display: flex;
  align-items: center;
`;

export const Label = styled.label`
  ${BaseSettingsInputStyle}
  width: 100%;
  white-space: nowrap;
`;

export const Input = styled.input`
  ${BaseSettingsInputStyle}
`;

export const ColorInput = styled(Input).attrs({
  type: 'color',
})`
  width: 1.5rem;
  height: 1.5rem;
  margin-left: 0.25rem;
`;

export const RangeInput = styled(Input).attrs({
  type: 'range',
})`
  margin-left: 0.25rem;
  width: 100%;
`;

export const RangeValue = styled.div`
  width: 1rem;
`;

export const Select = styled.select`
  ${BaseSettingsInputStyle}
  margin-left: 0.25rem;
`;
