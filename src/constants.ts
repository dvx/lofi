
import * as os from 'os'

export const MACOS = (os.platform() === "darwin");
export const MACOS_MOJAVE = (MACOS && parseInt(os.release().split('.')[0]) === 18);

export const HEIGHT = 150;
export const WIDTH_RATIO = 5; // has to be odd

export const PADDING = {
    VERTICAL: 800,
    HORIZONTAL: 800
};