import { app, BrowserWindow, Tray, Menu, screen, Notification, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
const electron = require('electron');
const ipc = electron.ipcMain;
const { autoUpdater } = require('electron-updater');

// Initialize remote module
require('@electron/remote/main').initialize();

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {

    win.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {

    win.loadURL(url.format({
      pathname: path.join(__dirname, '/dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  let tray = null;
  win.on('minimize', function (event) {
    event.preventDefault();
    win.hide();
    tray = createTray();

});

  win.on('restore', function (event) {
    win.show();
    tray.destroy();
});

function createTray() {
  let appIcon = new Tray(path.join(__dirname, "/img/tivit-log.jpg"));
  const contextMenu = Menu.buildFromTemplate([
      {
          label: 'Abrir', click: function () {
            win.show();
          }
      },
      {
          label: 'Fechar', click: function () {
             /// app.isQuiting = true;
              app.quit();
          }
      }
  ]);

  appIcon.on('double-click', function (event) {
    win.show();
  });
  appIcon.setToolTip('EDI CLIENT');
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipc.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });


  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

} catch (e) {
  // Catch Error
  // throw e;
}
var Datastore = require('nedb');
var db = new Datastore({ filename: 'data.db', autoload: true });

ipc.on('insert-nedb', function (event, args) {
    db.insert(args[0], function (err, newrec) {
      console.log('----inserindo registro----')

    });

});

ipc.on('findonebyentity-nedb', function (event, args) {
  let entityNameValue = args[0];
  db.findOne({ entityName:  entityNameValue}, function (err, docs) {
    console.log('-buscando registros- entityname = '+entityNameValue)
    console.log(docs);
    event.returnValue= docs;
  });
});

ipc.on('update-nedb', function (event, args) {
  let entityNameValue = args[0];
  db.update({entityName: entityNameValue},args[1],{}, function (err, numReplaced) {
    console.log('-ATUALIZANDO REGISTRO-')
  });
});

ipc.on('remove-nedb', function (event, args) {
  let entityNameValue = args[0]
  db.remove({entityName: entityNameValue},{}, function (err, numRemoved){

  });
});

ipc.on('show-notification', function (event, args) {
  // Para chamar o método show-notification:
  // this._electronService.ipcRenderer.send('show-notification', ['Título da notificação', 'Corpo da notificação']);
  let titulo = args[0];
  let corpo = args[1];
  new Notification({
    title: titulo,
    body: corpo,
    icon: path.join(__dirname, "/img/tivit-log.jpg"),
  }).show();
});

// Auto-updater from electron
//
//

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});

ipc.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
