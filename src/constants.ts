import * as os from 'os';

export const WINDOWS = os.platform() === 'win32';
export const LINUX = os.platform() === 'linux';
export const MACOS = os.platform() === 'darwin';
export const MACOS_MOJAVE = MACOS && parseInt(os.release().split('.')[0]) >= 18;

export const HEIGHT = 150;
export const WIDTH = 150;

export const MIN_SIDE_LENGTH = 150;
export const MAX_SIDE_LENGTH = 300;

export const AUTH_BACKEND_PORT = 41419;

export const LOFI_SHUFFLED_PLAYLIST_NAME = 'Shuffled by Lofi';

// Native shadows are buggy, so just make the main (transparent) window big enough so it can hold the shadow as well
// On Mojave, we want to do away with the ugly white bar on top, so we simply move up the window (way) past the top screen edge
// See: https://github.com/electron/electron/issues/13164
// NOTE: This only works because we're using some black magic to return our own ConstrainFrameRect
export const CONTAINER = {
  VERTICAL: MACOS_MOJAVE ? 4000 : 800,
  HORIZONTAL: 800,
};

export const SETTINGS_CONTAINER = {
  VERTICAL: 500,
  HORIZONTAL: 500,
};

export const DEFAULT_SETTINGS = {
  version: '1.5.0',
  debug: false,
  hardware_acceleration: true,
  lofi: {
    visualization: 0,
    window: {
      always_on_top: true,
      x: 0,
      y: 0,
      remember: true,
      hide: false,
      metadata: false,
      scale: 1,
      side: 150,
    },
    audio: {
      volume_increment: 10,
    },
  },
  spotify: {
    access_token: '',
    refresh_token: '',
  },
};
