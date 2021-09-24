/** @format */

const { app, BrowserWindow, ipcMain, autoUpdater } = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * --------------------
 * Autoupdater
 * --------------------
 */
const deployServer = "https://mathspanel-updater.vercel.app/"
const url = `${deployServer}/update/${process.platform}/${app.getVersion()}/`
console.log(process.platform)

autoUpdater.setFeedURL({ url })

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
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

    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.maximize();
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
