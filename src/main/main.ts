import { app, BrowserWindow, ipcMain, screen, shell, ipcRenderer } from 'electron';
import * as path from 'path';
import * as url from 'url';
import '../../build/release/black-magic.node';
import { spawn } from 'child_process';
import { fixPathForAsarUnpack }  from 'electron-util';
import { register } from 'electron-localshortcut';
import { HEIGHT, WIDTH_RATIO, MACOS, MACOS_MOJAVE, WINDOWS, CONTAINER, WIDTH } from '../constants'
import { nextVisualization, prevVisualization } from '../visualizations/visualizations.js';

// Visualizations look snappier on 60Hz refresh rate screens if we disable vsync
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendArgument("disable-gpu-vsync");

if (MACOS) {
  spawn(fixPathForAsarUnpack(__dirname + "/volume-capture-daemon"));
}

let mainWindow: Electron.BrowserWindow;
let mousePoller: NodeJS.Timeout;

register('A', () => {
  prevVisualization();
  mainWindow.webContents.send('prev-visualization');
});

register('D', () => {
  nextVisualization();
  mainWindow.webContents.send('next-visualization');
});

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    x: 0 - CONTAINER.HORIZONTAL / 2 + screen.getPrimaryDisplay().size.width / 2,
    y: 0 - CONTAINER.VERTICAL / 2 + screen.getPrimaryDisplay().size.height / 2,
    height: CONTAINER.VERTICAL,
    width: CONTAINER.HORIZONTAL,
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: true,
    hasShadow: false,
    // On MacOS, we get weird shadow artifacts if the window is focusable
    focusable: MACOS ? false : true,
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
    if (screen && mainWindow) {
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
    }
    
  }, 10);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools({mode:"detach"});

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

  ipcMain.on('windowMoved', () => {
    // Do somehting when dragging stop
  });

  ipcMain.on('windowIgnoreMouseEvents', () => {
    mainWindow.setIgnoreMouseEvents(true);
  });

  ipcMain.on('windowDontIgnoreMouseEvents', () => {
    mainWindow.setIgnoreMouseEvents(false);
  });

  // Open external URLs in default OS browser
  mainWindow.webContents.on('new-window', function (event: Electron.Event, url: string) {
    event.preventDefault();
    shell.openExternal(url);
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
