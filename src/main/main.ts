import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { spawn } from 'child_process';
import { chmodSync } from 'fs';
import { fixPathForAsarUnpack }  from 'electron-util';
import { register } from 'electron-localshortcut';
import * as settings from 'electron-settings';
import { HEIGHT, MACOS, WINDOWS, CONTAINER, SETTINGS_CONTAINER, WIDTH } from '../constants';

// binaries
import '../../build/release/black-magic.node';

// Visualizations look snappier on 60Hz refresh rate screens if we disable vsync
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendArgument("disable-gpu-vsync");

if (MACOS) {
  // FIXME: Probably a better way of doing this
  chmodSync(fixPathForAsarUnpack(__dirname + "/volume-capture-daemon"), '555');
  spawn(fixPathForAsarUnpack(__dirname + "/volume-capture-daemon"));
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
  if (!settings.has('lofi.window')) {
    settings.set('lofi.window', {
      x: 0 - CONTAINER.HORIZONTAL / 2 + screen.getPrimaryDisplay().size.width / 2,
      y: 0 - CONTAINER.VERTICAL / 2 + screen.getPrimaryDisplay().size.height / 2,
      remember: true
    });
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    x: Number(settings.get('lofi.window.x')),
    y: Number(settings.get('lofi.window.y')),
    height: CONTAINER.VERTICAL,
    width: CONTAINER.HORIZONTAL,
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: true,
    hasShadow: false,
    focusable: true,
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
        ix: b.x + (CONTAINER.HORIZONTAL - WIDTH) / 2,
        iy: b.y + (CONTAINER.VERTICAL - HEIGHT) / 2,
        ax: b.x + WIDTH + (CONTAINER.HORIZONTAL - WIDTH) / 2,
        ay: b.y + HEIGHT + (CONTAINER.VERTICAL - HEIGHT) / 2
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
  mainWindow.webContents.openDevTools({mode:"detach"});

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
      mainWindow.setOpacity(1);
    }
  });

  ipcMain.on('windowMoved', (e: Event, { mouseX, mouseY }: { mouseX: number, mouseY: number }) => {
    if (Boolean(settings.get('lofi.window.remember'))) {
      const { x, y } = screen.getCursorScreenPoint();
      settings.set('lofi.window', {
        x: x - mouseX,
        y: y - mouseY,
        remember: true
      });
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
        x: 0 - SETTINGS_CONTAINER.HORIZONTAL / 2 + screen.getPrimaryDisplay().size.width / 2,
        y: 0 - SETTINGS_CONTAINER.VERTICAL / 2 + screen.getPrimaryDisplay().size.height / 2,
        height: SETTINGS_CONTAINER.VERTICAL,
        width: SETTINGS_CONTAINER.HORIZONTAL,
        modal: false,
        parent: mainWindow,
        frame: true,
        resizable: true,
        maximizable: true,
        title: "Lofi Settings"
      });
      //@ts-ignore
      event.newGuest = new BrowserWindow(options);
      //@ts-ignore
      event.newGuest.setMenu(null);
      //@ts-ignore
      event.newGuest.setResizable(true);
      //@ts-ignore
      event.newGuest.webContents.openDevTools({mode:"detach"});
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  clearTimeout(mousePoller);
  app.quit();
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createWindow();
  }
});
