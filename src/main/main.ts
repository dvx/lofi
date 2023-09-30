import '../../build/Release/black-magic.node';
import '../../icon.ico';
import '../../icon.png';
import '../../icon_liked.png';

import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  HandlerDetails,
  ipcMain,
  Menu,
  nativeImage,
  Rectangle,
  screen,
  shell,
  Tray,
} from 'electron';
import Store from 'electron-store';
import * as path from 'path';

import { version } from '../../version.generated';
import {
  ApplicationUrl,
  IpcMessage,
  MACOS,
  MAX_SIDE_LENGTH,
  MIN_SIDE_LENGTH,
  WindowName,
  WindowTitle,
} from '../constants';
import { MouseData } from '../models/ipc-messages.models';
import { DEFAULT_SETTINGS, Settings } from '../models/settings';
import {
  checkIfAppIsOnLeftSide,
  findWindow,
  getAboutWindowOptions,
  getFullscreenVisualizationWindowOptions,
  getFullscreenVizBounds,
  getSettingsWindowOptions,
  getTrackInfoWindowOptions,
  moveTrackInfo,
  setAlwaysOnTop,
  settingsSchema,
  showDevTool,
} from './main.utils';

const DEFAULT_SIZE = 150;

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendArgument('disable-gpu-vsync');
app.commandLine.appendSwitch('enable-transparent-visuals');

if (process.env.NODE_ENV === 'development') {
  app.commandLine.appendSwitch('trace-warnings');
  app.commandLine.appendSwitch('enable-logging', '1');
}

Store.initRenderer();
const store = new Store({ clearInvalidConfig: true });
const storeSettings = store.get('settings') as Settings;

let settings: Settings = null;
try {
  settingsSchema.parse(storeSettings);
  settings = storeSettings;
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(`Invalid settings file: ${error}`);
  settings = DEFAULT_SETTINGS;
}

let mainWindow: BrowserWindow | null = null;
let mousePoller: NodeJS.Timeout;
let initialBounds: Rectangle;

let tray: Tray = null;
Menu.setApplicationMenu(null);

const isSingleInstance: boolean = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
}

const icon = nativeImage.createFromPath(`${__dirname}/icon.png`).resize({ height: 16 });
const iconTrackLiked = nativeImage.createFromPath(`${__dirname}/icon_liked.png`).resize({ height: 16 });

const MAIN_WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
  x: settings.x ?? -1,
  y: settings.y ?? -1,
  height: settings.size ?? DEFAULT_SIZE,
  width: settings.size ?? DEFAULT_SIZE,
  minHeight: MIN_SIDE_LENGTH,
  minWidth: MIN_SIDE_LENGTH,
  maxHeight: MAX_SIDE_LENGTH,
  maxWidth: MAX_SIDE_LENGTH,
  movable: false,
  frame: false,
  resizable: true,
  maximizable: false,
  minimizable: true,
  transparent: true,
  hasShadow: false,
  skipTaskbar: !settings.isVisibleInTaskbar,
  focusable: settings.isVisibleInTaskbar,
  title: 'Lofi',
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
  backgroundColor: '#000000',
  roundedCorners: false,
};

const createMainWindow = (): void => {
  mainWindow = new BrowserWindow(MAIN_WINDOW_OPTIONS);

  mainWindow.setVisibleOnAllWorkspaces(true);

  mainWindow.loadURL(`file://${path.join(__dirname, './index.html')}`);

  showDevTool(mainWindow, !!settings?.isDebug);

  ipcMain.on(IpcMessage.WindowMoving, (_: Event, { mouseX, mouseY }: MouseData) => {
    const { x, y } = screen.getCursorScreenPoint();

    const bounds: Partial<Rectangle> = {
      x: x - mouseX,
      y: y - mouseY,
    };

    // Bounds increase even when set to the same value, this is a quirk of the setBounds function
    // We must keep the bounds constant to keep the window where it should be
    // See: https://github.com/dvx/lofi/issues/118
    if (!initialBounds) {
      initialBounds = mainWindow.getBounds();
    } else {
      bounds.width = initialBounds.width;
      bounds.height = initialBounds.height;
    }

    // Use setBounds instead of setPosition
    // See: https://github.com/electron/electron/issues/9477#issuecomment-406833003
    mainWindow.setBounds(bounds);
    moveTrackInfo(mainWindow, screen);

    mainWindow.webContents.send(IpcMessage.WindowMoved, bounds);
  });

  ipcMain.on(IpcMessage.WindowMoved, (_: Event) => {
    initialBounds = null;
  });

  ipcMain.on(IpcMessage.ScreenSize, (_: Event) => {
    const bounds = mainWindow.getBounds();
    const { bounds: displayBounds } = screen.getDisplayMatching(bounds);

    mainWindow.webContents.send(IpcMessage.ScreenSize, {
      height: displayBounds.height,
      width: displayBounds.width,
    });
  });

  mainWindow.on('resize', () => {
    moveTrackInfo(mainWindow, screen);
  });

  mainWindow.on('resized', () => {
    const size = mainWindow.getSize();
    const [width, height] = size;
    const newSize = Math.min(width, height);
    mainWindow.setSize(newSize, newSize, true);
    mainWindow.webContents.send(IpcMessage.WindowResized, newSize);
  });

  ipcMain.on(
    IpcMessage.SettingsChanged,
    (_: Event, { x, y, size, isAlwaysOnTop, isDebug, isVisibleInTaskbar, visualizationScreenId }: Settings) => {
      setAlwaysOnTop({ window: mainWindow, isAlwaysOnTop });
      mainWindow.setSkipTaskbar(!isVisibleInTaskbar);
      showDevTool(mainWindow, isDebug);

      mainWindow.setBounds({ x, y, height: size, width: size });
      if (x === -1 && y === -1) {
        mainWindow.center();
      }
      moveTrackInfo(mainWindow, screen);

      const fullscreenVizWindow = findWindow(WindowTitle.FullscreenViz);
      if (fullscreenVizWindow) {
        const fullscreenVizBounds = getFullscreenVizBounds(mainWindow.getBounds(), screen, visualizationScreenId);
        fullscreenVizWindow.setBounds(fullscreenVizBounds);
      }
    }
  );

  ipcMain.on(IpcMessage.CloseApp, () => {
    clearTimeout(mousePoller);
    app.quit();
  });

  ipcMain.on(IpcMessage.OpenLink, (_: Event, url: ApplicationUrl) => {
    if (!Object.values(ApplicationUrl).includes(url)) {
      // eslint-disable-next-line no-console
      console.error(`Invalid url ${url}`);
      return;
    }
    shell.openExternal(url);
  });

  ipcMain.on(IpcMessage.ShowAbout, (_: Event) => {
    mainWindow.webContents.send(IpcMessage.ShowAbout);
  });

  ipcMain.on(IpcMessage.ShowFullscreenVizualizer, (_: Event) => {
    mainWindow.webContents.send(IpcMessage.ShowFullscreenVizualizer);
  });

  ipcMain.on(IpcMessage.ShowSettings, (_: Event) => {
    mainWindow.webContents.send(IpcMessage.ShowSettings);
  });

  ipcMain.on(IpcMessage.TrackLiked, (_: Event, isTrackLiked: boolean) => {
    if (tray) {
      tray.setImage(isTrackLiked ? iconTrackLiked : icon);
    }
  });

  const windowOpenHandler = (
    details: HandlerDetails
  ): { action: 'allow' | 'deny'; overrideBrowserWindowOptions?: BrowserWindowConstructorOptions } => {
    switch (details.frameName) {
      case WindowName.About: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getAboutWindowOptions(),
        };
      }

      case WindowName.FullscreenViz: {
        const fullscreenVizBounds = getFullscreenVizBounds(
          mainWindow.getBounds(),
          screen,
          settings.visualizationScreenId
        );
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getFullscreenVisualizationWindowOptions(fullscreenVizBounds),
        };
      }

      case WindowName.Settings: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getSettingsWindowOptions(),
        };
      }

      case WindowName.TrackInfo: {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: getTrackInfoWindowOptions(mainWindow, settings.isAlwaysOnTop),
        };
      }

      case WindowName.Auth: {
        shell.openExternal(details.url);
        break;
      }

      default: {
        throw new Error(`Invalid frame name: ${details.frameName}`);
      }
    }

    return { action: 'deny' };
  };

  mainWindow.webContents.on('did-create-window', (childWindow, { frameName }) => {
    switch (frameName) {
      case WindowName.About: {
        if (MACOS) {
          childWindow.setWindowButtonVisibility(false);
        }
        childWindow.center();
        break;
      }

      case WindowName.FullscreenViz: {
        childWindow.setAlwaysOnTop(true, 'pop-up-menu');
        childWindow.setIgnoreMouseEvents(true);
        const sourceId = childWindow.getMediaSourceId();
        mainWindow.moveAbove(sourceId);

        childWindow.on('focus', () => {
          setAlwaysOnTop({ window: mainWindow, isAlwaysOnTop: true });
        });

        childWindow.on('blur', () => {
          setAlwaysOnTop({ window: mainWindow, isAlwaysOnTop: true });
        });

        childWindow.on('close', () => {
          setAlwaysOnTop({ window: mainWindow, isAlwaysOnTop: settings.isAlwaysOnTop });
        });
        break;
      }

      case WindowName.Settings: {
        childWindow.webContents.setWindowOpenHandler(windowOpenHandler);
        if (MACOS) {
          childWindow.setWindowButtonVisibility(false);
        }
        childWindow.center();
        break;
      }

      case WindowName.TrackInfo: {
        moveTrackInfo(mainWindow, screen);
        childWindow.setIgnoreMouseEvents(true);
        setAlwaysOnTop({ window: childWindow, isAlwaysOnTop: settings.isAlwaysOnTop });
        if (MACOS) {
          childWindow.setWindowButtonVisibility(false);
        }
        break;
      }

      default: {
        break;
      }
    }

    showDevTool(childWindow, settings.isDebug);
  });

  mainWindow.webContents.setWindowOpenHandler(windowOpenHandler);
};

app.on('ready', () => {
  if (settings?.version === null || settings.version !== String(version)) {
    store.clear();
    settings = store.get('settings') as Settings;
  }

  createMainWindow();

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `lofi v${version}`,
      enabled: false,
      icon,
    },
    { type: 'separator' },
    {
      label: 'Settings',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send(IpcMessage.ShowSettings);
      },
    },
    {
      label: 'About',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send(IpcMessage.ShowAbout);
      },
    },
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(`lofi v${version}`);

  mainWindow.once('ready-to-show', () => {
    const displays = screen.getAllDisplays();
    const isAppVisible = displays.reduce(
      (isOutOfScreen, { workArea: { x: areaX, y: areaY, width, height } }) =>
        isOutOfScreen ||
        (settings.x >= areaX && settings.y >= areaY && settings.x < width + areaX && settings.y < height + areaY),
      false
    );

    if (!isAppVisible || (settings.x === -1 && settings.y === -1)) {
      mainWindow.center();
    }

    setAlwaysOnTop({ window: mainWindow, isAlwaysOnTop: settings.isAlwaysOnTop });

    const bounds = mainWindow.getBounds();
    const currentDisplay = screen.getDisplayMatching(bounds);
    const isOnLeft = checkIfAppIsOnLeftSide(currentDisplay, bounds.x, bounds.width);
    mainWindow.webContents.send(IpcMessage.WindowReady, { isOnLeft, displays });
    moveTrackInfo(mainWindow, screen);
  });
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createMainWindow();
  }
});
