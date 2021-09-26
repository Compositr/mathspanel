/** @format */
/**
 * @author Jim Ke
 * @copyright Copyright © 2021 Jim Ke.
 * @license GPL-3.0-or-later
 * @file Main file which controls app startup, app close and auto updates
 */

const {
  app,
  BrowserWindow,
  ipcMain,
  autoUpdater,
  dialog,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

/**
 * --------------------
 * Autoupdater
 * --------------------
 */
const deployServer = "https://mathspanel-updater.vercel.app";
const url = `${deployServer}/update/${process.platform}/${app.getVersion()}`;

if (process.execPath.match(/[\\\/]electron-prebuilt/)) {
  autoUpdater.setFeedURL({ url });
  autoUpdater.checkForUpdates();
  autoUpdater.on("update-downloaded", (_event, releaseNotes, _releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart App & Install", "Maybe Later"],
      message: releaseNotes,
      detail:
        "A new version of Maths Panel is avaliable. Press Restart App & Install to begin installation",
    };
    dialog.showMessageBox(dialogOpts).then((r) => {
      if (r.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // Hide top menu
    autoHideMenuBar: true,
    // Set node integration to true (we want to access nodejs stuff in front end DOM code)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webgl: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.maximize();
  /**
   * New window handler
   */
  mainWindow.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * ------------------------------
 * ipcMain auto handler
 * ------------------------------
 */
const ipcs = {};
const ipcFiles = fs
  .readdirSync(path.join(__dirname, "./ipc"))
  .filter((f) => f.endsWith(".js"));
for (const file of ipcFiles) {
  const ipc = require(path.join(__dirname, `./ipc/${file}`));
  ipcs[ipc.event] = ipc;
}
for (const ipc in ipcs) {
  if (Object.hasOwnProperty.call(ipcs, ipc)) {
    const element = ipcs[ipc];
    ipcMain.on(element.channel, (event, data) => {
      if (data.event !== element.event) return;
      element.execute(event, data);
    });
  }
}
