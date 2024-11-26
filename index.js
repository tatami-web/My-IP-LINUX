const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');

let mainWindow;

// Función para obtener la IP local
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const network = networkInterfaces[interfaceName];
    for (const net of network) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address; // Devuelve la primera IP encontrada
      }
    }
  }
  return 'IP no encontrada'; // Si no se encuentra ninguna IP válida
}

// Función para crear la ventana principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 350, // Ancho inicial
    height: 650, // Altura inicial
    resizable: false, // Evita redimensionar con el mouse
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Precarga
      contextIsolation: true, // Aislamiento de contexto
      nodeIntegration: false, // Sin integración de Node.js
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Cambia 'icon.png' por tu archivo
    show: false, // No mostrar la ventana al crearla
  });

  // Ocultar la barra superior (Archivo, Editar, Ver, etc.)
  mainWindow.setMenuBarVisibility(false); // Oculta la barra de menú
  mainWindow.setMenu(null); // Alternativa para eliminar el menú

  // Cargar el archivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'www/index.html'));

  // Mostrar la ventana cuando esté cargada
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Manejo de eventos cuando la ventana es cerrada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Interceptar intentos de abrir nuevas ventanas (target="_blank")
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Abrir el enlace en el navegador predeterminado
    shell.openExternal(url);
    return { action: 'deny' }; // Evita que Electron abra una nueva ventana
  });
}

// Comunicar la IP al frontend
ipcMain.handle('get-ip', () => getLocalIP());

// Eventos del ciclo de vida de la aplicación
app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
