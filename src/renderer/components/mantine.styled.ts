import styled from '@emotion/styled';
import { Checkbox, Select, Tabs, TextInput } from '@mantine/core';

export const INPUT_COLOR = 'grape.6';

export const StyledCheckbox = styled(Checkbox)`
  .mantine-Checkbox-label {
    color: white;
    padding-left: 0.25rem;
  }
`;

export const StyledSelect = styled(Select)``;

export const StyledTextInput = styled(TextInput)`
  padding-left: 0.25rem;
`;

export const StyledTabs = styled(Tabs)`
  width: 100%;

  & .mantine-Tabs-root {
    width: 100%;
  }

  & .mantine-Tabs-tabsList {
    gap: 0;
    border-right: 0;
  }

  & .mantine-Tabs-tab {
    margin: 0;
    color: white;

    &[data-active] {
      background-color: #444444;
    }

    &:hover {
      background-color: #646464;
    }
  }

  & .mantine-Tabs-tabLabel {
    color: rgb(214, 146, 255);
    font-weight: 300;
    font-variant: all-petite-caps;
    text-shadow: #00000085 0 0 0.25rem;
  }

  & .mantine-Tabs-tabIcon {
    color: white;
  }

  & .mantine-Tabs-panel {
    color: white;
    padding: 0 0.25rem;
    background-color: #444444;
    border-radius: 0 0.5rem 0.5rem 0;
    width: 100%;
    min-height: 200px;
  }
`;
