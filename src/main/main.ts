import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import settings from 'electron-settings';
import {
  MACOS,
  WINDOWS,
  LINUX,
  CONTAINER,
  SETTINGS_CONTAINER,
  DEFAULT_SETTINGS,
} from '../constants';

// Webpack imports
import '../../build/Release/black-magic.node';
import '../../icon.png';
import '../../icon.ico';

// Visualizations look snappier on 60Hz refresh rate screens if we disable vsync
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendArgument('disable-gpu-vsync');
app.commandLine.appendSwitch('enable-transparent-visuals');

// Settings bootstrap
const HARDWARE_ACCELERATION: boolean = Boolean(
  settings.getSync('hardware_acceleration')
);
const windowConfig: any = {};

if (!HARDWARE_ACCELERATION) {
  app.disableHardwareAcceleration();
}

let mainWindow: Electron.BrowserWindow | null = null;
let mousePoller: NodeJS.Timeout;

// Only allow a single instance
let isSingleInstance: boolean = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    x: windowConfig.x,
    y: windowConfig.y,
    height: CONTAINER.VERTICAL,
    width: CONTAINER.HORIZONTAL,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: true,
    transparent: true,
    hasShadow: false,
    skipTaskbar: !windowConfig.show_in_taskbar,
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true,
      enableRemoteModule: true,
    },
    backgroundColor: '#00000000',
  });

  // Workaround to make setSkipTaskbar behave
  // cf. https://github.com/electron/electron/issues/18378
  mainWindow.on('focus', () => {
    mainWindow.setSkipTaskbar(!windowConfig.show_in_taskbar);
  });

  mainWindow.setAlwaysOnTop(windowConfig.always_on_top, 'floating', 1);
  mainWindow.setFocusable(windowConfig.show_in_taskbar);
  mainWindow.setVisibleOnAllWorkspaces(true);

  // And load the index.html of the app
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Every 10 milliseconds, poll to see if we should ignore mouse events or not
  mousePoller = setInterval(() => {
    try {
      let p = screen.getCursorScreenPoint();
      let b = mainWindow.getBounds();
      // Bounding box for the area that's "clickable" -- e.g. main player square
      let bb = {
        ix: b.x + (CONTAINER.HORIZONTAL - windowConfig.side) / 2,
        iy: b.y + (CONTAINER.VERTICAL - windowConfig.side) / 2,
        ax:
          b.x +
          (windowConfig.side + (CONTAINER.HORIZONTAL - windowConfig.side) / 2),
        ay:
          b.y +
          (windowConfig.side + (CONTAINER.VERTICAL - windowConfig.side) / 2),
      };

      if (bb.ix <= p.x && p.x <= bb.ax && bb.iy <= p.y && p.y <= bb.ay) {
        mainWindow.setIgnoreMouseEvents(false);
      } else {
        mainWindow.setIgnoreMouseEvents(true);
      }
    } catch (e) {
      // FIXME: Sometimes the visualization window gets destroyed before the main window
      //        This causes an error to briefly pop up, so suppress it here. How should this be fixed?
      //        Only happens when using OS-y ways of closing windows (e.g. OSX "File->Quit" menu)
    }
  }, 10);

  // Open the DevTools.
  if (Boolean(settings.getSync('debug')) === true) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  ipcMain.on(
    'windowMoving',
    (e: Event, { mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
      const { x, y } = screen.getCursorScreenPoint();

      // Use setBounds instead of setPosition
      // See: https://github.com/electron/electron/issues/9477#issuecomment-406833003
      mainWindow.setBounds({
        height: mainWindow.getSize()[0],
        width: mainWindow.getSize()[1],
        x: x - mouseX,
        y: y - mouseY,
      });

      // Ugly black transparency fix when dragging transparent window past screen edges
      // From what I understand, setting opacity forces a re-draw
      // TODO: only happens on Windows?
      if (WINDOWS) {
        // This breaks the UI if hardware acceleration is disabled
        if (HARDWARE_ACCELERATION) {
          mainWindow.setOpacity(1);
        }
      }
    }
  );

  ipcMain.on(
    'windowMoved',
    (e: Event, { mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
      const { x, y } = screen.getCursorScreenPoint();
      windowConfig.x = x - mouseX;
      windowConfig.y = y - mouseY;
    }
  );

  ipcMain.on('windowResizing', (e: Event, length: number) => {
    windowConfig.side = length;
  });

  mainWindow.webContents.on('new-window', function (
    event: Electron.NewWindowEvent,
    url: string,
    frameName: string,
    disposition: string,
    options: any
  ) {
    event.preventDefault();

    switch (frameName) {
      case 'settings': {
        createSettingsWindow(event, options);
        break;
      }
      case 'about': {
        createAboutWindow(event, options);
        break;
      }
      default: {
        shell.openExternal(url);
      }
    }
  });
}

function createSettingsWindow(event: Electron.NewWindowWebContentsEvent, options: any) {
  // Open settings window as modal
  Object.assign(options, {
    x:
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.x -
      SETTINGS_CONTAINER.HORIZONTAL / 2 +
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.width / 2,
    y:
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.y -
      SETTINGS_CONTAINER.VERTICAL / 2 +
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.height / 2,
    height: SETTINGS_CONTAINER.VERTICAL,
    width: SETTINGS_CONTAINER.HORIZONTAL,
    modal: false,
    parent: mainWindow,
    frame: false,
    resizable: true,
    maximizable: false,
    focusable: true,
    title: 'Lofi Settings',
  });
  event.newGuest = new BrowserWindow(options);
  event.newGuest.setMenu(null);
  event.newGuest.setResizable(true);
  if (Boolean(settings.getSync('debug')) === true) {
    event.newGuest.webContents.openDevTools({ mode: 'detach' });
  }
}

function createAboutWindow(event: Electron.NewWindowWebContentsEvent, options: any) {
  Object.assign(options, {
    x:
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.x -
      400 / 2 +
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.width / 2,
    y:
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.y -
      400 / 2 +
      screen.getDisplayMatching(mainWindow.getBounds()).bounds.height / 2,
    height: 400,
    width: 400,
    modal: false,
    parent: mainWindow,
    frame: false,
    resizable: false,
    maximizable: false,
    focusable: true,
    title: 'About Lofi',
  });
  event.newGuest = new BrowserWindow(options);
  event.newGuest.setMenu(null);
  event.newGuest.setResizable(true);
  if (Boolean(settings.getSync('debug')) === true) {
    event.newGuest.webContents.openDevTools({ mode: 'detach' });
  }
}

// Needs to be global, see: https://www.electronjs.org/docs/faq#my-apps-windowtray-disappeared-after-a-few-minutes
let tray = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  settings.defaults(DEFAULT_SETTINGS);
  // If we have a settings version mismatch, nuke the settings
  if (
    !settings.hasSync('version') ||
    String(settings.getSync('version')) !== String(DEFAULT_SETTINGS.version)
  ) {
    settings.resetToDefaultsSync();

    // Default position is based on OS; (0,0) sometimes breaks
    settings.setSync(
      'lofi.window.x',
      0 - CONTAINER.HORIZONTAL / 2 + screen.getPrimaryDisplay().size.width / 2
    );
    settings.setSync(
      'lofi.window.y',
      0 - CONTAINER.VERTICAL / 2 + screen.getPrimaryDisplay().size.height / 2
    );
  }

  Object.assign(windowConfig, {
    x: Number(settings.getSync('lofi.window.x')),
    y: Number(settings.getSync('lofi.window.y')),
    always_on_top: Boolean(settings.getSync('lofi.window.always_on_top')),
    show_in_taskbar: Boolean(settings.getSync('lofi.window.show_in_taskbar')),
    side: Number(settings.getSync('lofi.window.side')),
  });

  if (LINUX) {
    // Linux transparency fix, delay launch by 1s
    setTimeout(createWindow, 1000);
  } else {
    createWindow();
  }

  tray = new Tray(
    nativeImage.createFromPath(__dirname + '/icon.png').resize({ height: 16 })
  );
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `lofi v${DEFAULT_SETTINGS.version}`,
      enabled: false,
      icon: nativeImage
        .createFromPath(__dirname + '/icon.png')
        .resize({ height: 16 }),
    },
    { type: 'separator' },
    {
      label: 'Settings',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('show-settings');
      },
    },
    {
      label: 'About',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('show-about');
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
  tray.setToolTip(`lofi v${DEFAULT_SETTINGS.version}`);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  clearTimeout(mousePoller);
  app.quit();
});

app.on('will-quit', () => {
  // Save window position for next launch
  settings.setSync('lofi.window.x', windowConfig.x);
  settings.setSync('lofi.window.y', windowConfig.y);
  settings.setSync('lofi.window.side', windowConfig.side);
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createWindow();
  }
});
