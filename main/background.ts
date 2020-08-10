import { app, ipcMain } from "electron";
import serve from "electron-serve";
import * as Store from "electron-store";
import { createWindow } from "./helpers";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

// @ts-ignore
const store = new Store({ messages: [], categories: [] });

ipcMain.on("get-messages", (event, arg) => {
  event.returnValue = store.get("messages") || [];
});

ipcMain.on("add-message", (event, arg) => {
  const messages = store.get("messages") || [];
  messages.push(arg);
  store.set("messages", messages);
});

ipcMain.on("delete-message", (event, arg) => {
  const messages = store.get("messages") || [];
  store.set(
    "messages",
    messages.filter((_, key) => key !== arg)
  );
});

ipcMain.on("get-categories", (event, arg) => {
  event.returnValue = store.get("categories") || [];
});

ipcMain.on("add-category", (event, arg) => {
  const categories = store.get("categories", []) || [];
  if (arg) {
    categories.push(arg);
  }
  store.set("categories", categories);
});

ipcMain.on("read-message", (event, arg) => {
  const messages = store.get("messages") || [];

  const messageIndex = messages.findIndex(message =>
    message.title === arg.title &&
    message.subject === arg.subject
  );

  const newMessages = [...messages];
  newMessages[messageIndex] = arg;

  store.set("messages", newMessages);
});

