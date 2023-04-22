import Store from 'electron-store';
import React, { createContext, Dispatch, FunctionComponent, useContext, useEffect, useMemo, useReducer } from 'react';

import { DEFAULT_SETTINGS, Settings } from '../../models/settings';
import { SettingsAction, useSettingsReducer } from '../reducers/settings.reducer';

interface SettingsContext {
  state: Settings;
  dispatch: Dispatch<SettingsAction>;
}

interface SettingsStorage {
  settings: Settings;
}

const Context = createContext<SettingsContext>({ state: null, dispatch: null });

export const SettingsProvider: FunctionComponent = ({ children }) => {
  const store = useMemo(
    () =>
      new Store<SettingsStorage>({
        clearInvalidConfig: true,
        defaults: { settings: DEFAULT_SETTINGS },
      }),
    []
  );
  const [state, dispatch] = useReducer(useSettingsReducer, store.get('settings'));

  useEffect(() => {
    store.set('settings', state || DEFAULT_SETTINGS);
  }, [state, store]);

  const ctx: SettingsContext = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export const useSettings = (): SettingsContext => useContext(Context);
