import styled from 'styled-components';

export const StyledWindow = styled.div`
  background-color: #333333;
  color: white;
  border: 1px solid #666666;
  font-size: 75%;
  margin: 0;
  padding: 0.5rem;
  height: calc(100% - 18px);
  width: calc(100% - 18px);

  button {
    margin: 0 0.25rem;

    &:hover {
      color: #979eff;
    }

    &:active {
      color: #50569e;
    }
  }
`;
