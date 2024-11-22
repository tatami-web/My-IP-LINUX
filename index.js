const { app, BrowserWindow, ipcMain } = require('electron');
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
    height: 600, // Altura inicial
    resizable: false, // Evita redimensionar con el mouse
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Precarga
      contextIsolation: true, // Aislamiento de contexto
      nodeIntegration: false, // Sin integración de Node.js
    },
  });

  // Ocultar la barra superior (Archivo, Editar, Ver, etc.)
  mainWindow.setMenuBarVisibility(false); // Oculta la barra de menú
  mainWindow.setMenu(null); // Alternativa para eliminar el menú

  // Cargar el archivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'www/index.html'));

  // Manejo de eventos cuando la ventana es cerrada
  mainWindow.on('closed', () => {
    mainWindow = null;
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
