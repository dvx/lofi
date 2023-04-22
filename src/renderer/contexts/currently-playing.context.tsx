import React, { createContext, Dispatch, FunctionComponent, useContext, useMemo, useReducer } from 'react';

import {
  CurrentlyPlaying,
  CurrentlyPlayingAction,
  INITIAL_STATE,
  useCurrentlyPlayingReducer,
} from '../reducers/currently-playing.reducer';

interface CurrentlyPlayingContext {
  state: CurrentlyPlaying;
  dispatch: Dispatch<CurrentlyPlayingAction>;
}

const Context = createContext<CurrentlyPlayingContext>({ state: null, dispatch: null });

export const CurrentlyPlayingProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(useCurrentlyPlayingReducer, INITIAL_STATE);

  const ctx: CurrentlyPlayingContext = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export const useCurrentlyPlaying = (): CurrentlyPlayingContext => useContext(Context);
