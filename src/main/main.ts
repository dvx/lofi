import { app, BrowserWindow, ipcMain, screen, shell, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { spawn } from 'child_process';
import { chmodSync } from 'fs';
import { fixPathForAsarUnpack }  from 'electron-util';
import { register } from 'electron-localshortcut';
import settings from 'electron-settings';
import { HEIGHT, MACOS, WINDOWS, CONTAINER, SETTINGS_CONTAINER, WIDTH, DEFAULT_SETTINGS } from '../constants';

// webpack imports
import '../../build/release/black-magic.node';
import '../../icon.square.png'
import '../../icon.png'
import '../../icon.ico'

// Visualizations look snappier on 60Hz refresh rate screens if we disable vsync
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendArgument("disable-gpu-vsync");
app.commandLine.appendSwitch('enable-transparent-visuals');

if (Boolean(settings.getSync('hardware_acceleration')) === false) {
  app.disableHardwareAcceleration()
}

let mainWindow: Electron.BrowserWindow;
let mousePoller: NodeJS.Timeout;

register('A', () => {
  mainWindow.webContents.send('prev-visualization');
});

register('D', () => {
  mainWindow.webContents.send('next-visualization');
});

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    x: settings.getSync('lofi.window.remember') ? Number(settings.getSync('lofi.window.x')) : 0 - CONTAINER.HORIZONTAL / 2 + screen.getPrimaryDisplay().size.width / 2,
    y: settings.getSync('lofi.window.remember') ? Number(settings.getSync('lofi.window.y')) : 0 - CONTAINER.VERTICAL / 2 + screen.getPrimaryDisplay().size.height / 2,
    height: CONTAINER.VERTICAL,
    width: CONTAINER.HORIZONTAL,
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: true,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  mainWindow.setAlwaysOnTop(true, "floating", 1);
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
        ix: b.x + ((CONTAINER.HORIZONTAL - WIDTH * settings.getSync('lofi.window.scale')) / 2) ,
        iy: b.y + ((CONTAINER.VERTICAL - HEIGHT * settings.getSync('lofi.window.scale')) / 2),
        ax: b.x + (WIDTH * settings.getSync('lofi.window.scale') + (CONTAINER.HORIZONTAL - WIDTH * settings.getSync('lofi.window.scale')) / 2),
        ay: b.y + (HEIGHT * settings.getSync('lofi.window.scale') + (CONTAINER.VERTICAL - HEIGHT * settings.getSync('lofi.window.scale')) / 2)
      }

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
    mainWindow.webContents.openDevTools({mode:"detach"});
  }

  ipcMain.on('windowMoving', (e: Event, { mouseX, mouseY }: { mouseX: number, mouseY: number }) => {
    const { x, y } = screen.getCursorScreenPoint();

    // Use setBounds instead of setPosition
    // See: https://github.com/electron/electron/issues/9477#issuecomment-406833003
    mainWindow.setBounds({
      height: CONTAINER.VERTICAL,
      width: CONTAINER.HORIZONTAL,
      x: x - mouseX,
      y: y - mouseY
    });

    // Ugly black transparency fix when dragging transparent window past screen edges
    // From what I understand, setting opacity forces a re-draw
    // TODO: only happens on Windows?
    if (WINDOWS) {
      // This breaks the UI if hardware acceleration is disabled
      if (Boolean(settings.getSync('hardware_acceleration')) === true) {
        mainWindow.setOpacity(1);
      }
    }
  });

  ipcMain.on('windowMoved', (e: Event, { mouseX, mouseY }: { mouseX: number, mouseY: number }) => {
    if (Boolean(settings.get('lofi.window.remember'))) {
      const { x, y } = screen.getCursorScreenPoint();
      settings.setSync('lofi.window.x', x - mouseX);
      settings.setSync('lofi.window.y', y - mouseY);
    }
  });

  ipcMain.on('windowIgnoreMouseEvents', () => {
    mainWindow.setIgnoreMouseEvents(true);
  });

  ipcMain.on('windowDontIgnoreMouseEvents', () => {
    mainWindow.setIgnoreMouseEvents(false);
  });

  mainWindow.webContents.on('new-window', function (event: Electron.NewWindowEvent, url: string, frameName: string, disposition: string, options: any) {
    event.preventDefault();
    if (frameName === 'help' || frameName === 'auth') {
      // Open help URL in default OS browser
      shell.openExternal(url);
    } else if(frameName === 'settings') {
      // Open settings window as modal
      Object.assign(options, {
        x: screen.getDisplayMatching(mainWindow.getBounds()).bounds.x - SETTINGS_CONTAINER.HORIZONTAL / 2 + screen.getDisplayMatching(mainWindow.getBounds()).bounds.width / 2,
        y: screen.getDisplayMatching(mainWindow.getBounds()).bounds.y - SETTINGS_CONTAINER.VERTICAL / 2 + screen.getDisplayMatching(mainWindow.getBounds()).bounds.height / 2,
        height: SETTINGS_CONTAINER.VERTICAL,
        width: SETTINGS_CONTAINER.HORIZONTAL,
        modal: false,
        parent: mainWindow,
        frame: false,
        resizable: false,
        maximizable: false,
        focusable: true,
        title: "Lofi Settings"
      });
      event.newGuest = new BrowserWindow(options);
      event.newGuest.setMenu(null);
      event.newGuest.setResizable(true);
      if (Boolean(settings.getSync('debug')) === true) {
        event.newGuest.webContents.openDevTools({mode:"detach"});
      }
    }
  });
}

// Needs to be global, see: https://www.electronjs.org/docs/faq#my-apps-windowtray-disappeared-after-a-few-minutes
let tray = null

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  settings.defaults(DEFAULT_SETTINGS)
  // If we have a settings version mismatch, nuke the settings
  if (!settings.hasSync('version') || (String(settings.getSync('version')) !== String(DEFAULT_SETTINGS.version))) {
    settings.resetToDefaultsSync()
  }
  
  createWindow();
  
  tray = new Tray(nativeImage.createFromPath(__dirname + '/icon.square.png').resize({height: 16}))
  const contextMenu = Menu.buildFromTemplate([
    { label: `lofi v${DEFAULT_SETTINGS.version}`, enabled: false, icon: nativeImage.createFromPath(__dirname + '/icon.square.png').resize({height: 16})},
    { type: 'separator' },
    { label: 'Settings', type: 'normal', click: () => {
      mainWindow.webContents.send('show-settings');
    }},
    { label: 'About', type: 'normal', click: () => {
      mainWindow.webContents.send('show-about');
    }},
    { label: 'Exit', type: 'normal', click: () => {
      app.quit();
    }},
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip(`lofi v${DEFAULT_SETTINGS.version}`)
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  clearTimeout(mousePoller);
  app.quit();
});

app.on('will-quit', () => {
  // any cleanup?
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createWindow();
  }
});
