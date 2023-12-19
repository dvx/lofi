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
  & .mantine-tabs-root {
    width: 100%;
  }

  & .mantine-tabs-tabsList {
    gap: 0;
  }

  & .mantine-tabs-tab {
    min-width: 80px;
    margin: 0;
    color: white;

    &[data-active] {
      background-color: #444444;
    }

    &:hover {
      background-color: #646464;
    }
  }

  & .mantine-tabs-tabLabel {
    color: white;
  }

  & .mantine-tabs-tabIcon {
    color: white;
  }

  & .mantine-tabs-panel {
    color: white;
    padding: 0 0.25rem;
    background-color: #444444;
    height: calc(100% - 36px);
    border-radius: 0 0 0.5rem 0.5rem;
  }
`;
