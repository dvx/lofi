
import * as os from 'os'

export const WINDOWS = (os.platform() === "win32");
export const MACOS = (os.platform() === "darwin");
export const MACOS_MOJAVE = (MACOS && parseInt(os.release().split('.')[0]) === 18);

export const HEIGHT = 150;
export const WIDTH_RATIO = 5; // has to be odd

// Native shadows are buggy, so just make the main (transparent) window big enough so it can hold the shadow as well
// On Mojave, we want to do away with the ugly white bar on top, so we simply move up the window (way) past the top screen edge
// See: https://github.com/electron/electron/issues/13164
// NOTE: This only works because we're using some black magic to return our own ConstrainFrameRect
export const CONTAINER = {
    VERTICAL: MACOS_MOJAVE ? 4000 : 800,
    HORIZONTAL: 800
};