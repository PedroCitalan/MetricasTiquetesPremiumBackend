const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const express = require('express')
const app = express()
const port = 3001
const cors = require('cors')
const axios = require('axios')
const { spawn } = require('child_process')
const jwt = require('jsonwebtoken')
app.use(express.json())

app.use(cors());

let pythonProcess = null;
let keepRunning = false; // Controla si el script debe seguir ejecutándose

// Crear bandera de stop
function createStopFlag() {
  const stopPath = path.join(__dirname, 'navegador', 'stop.txt');
  fs.writeFileSync(stopPath, 'stop');
}

// Eliminar bandera al iniciar sesión
function clearStopFlag() {
  const stopPath = path.join(__dirname, 'navegador', 'stop.txt');
  if (fs.existsSync(stopPath)) {
    fs.unlinkSync(stopPath);
  }
}

// Función para iniciar y reiniciar el script
/*function startPythonScript(username, password) {
  if (!keepRunning) return; // Si la sesión está cerrada, no ejecutamos el script
  clearStopFlag();

  console.log('Iniciando Ticket.py...');
  const scriptPath = path.join(__dirname, './navegador/Ticket.py');

  pythonProcess = spawn('python', [scriptPath, username, password], { detached: true });

  pythonProcess.stdout.on('data', (data) => console.log(`Salida Python: ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`Error Python: ${data}`));

  // Reinicia el script cuando termine
  pythonProcess.on('close', (code) => {
    console.log(`Ticket.py terminó con código ${code}`);
    if (keepRunning) setTimeout(() => startPythonScript(username, password), 7200000); // Espera 2h y reinicia
  });
}*/

app.post('/api/solarwinds-login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' })
  }

  try {
    const url = `https://whdca.premium.sv/helpdesk/WebObjects/Helpdesk.woa/ra/Tickets/group/?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await axios.get(url, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: true }),
      headers: { Accept: 'application/json' },
      // Solo aceptar 200; 401/403 se irán al catch
      validateStatus: (status) => status === 200,
    });

    const contentType = String(response.headers['content-type'] || '');
    if (!contentType.includes('application/json')) {
      return res.status(401).json({ success: false, message: 'Autenticación fallida' });
    }

    const data = response.data;
    if (data == null) {
      return res.status(401).json({ success: false, message: 'Autenticación fallida' });
    }

    const secret = process.env.JWT_SECRET || 'change_me_in_env';
    const token = jwt.sign({ sub: username, iss: 'metricas-premium', type: 'login' }, secret, { expiresIn: '8h' });
    const role = 'user';

    keepRunning = true;
    // startPythonScript(username, password);

    return res.json({ success: true, token, role });
  } catch (error) {
    const status = error?.response?.status;
    console.error('Error en autenticación:', status, error.response?.data || error.message);
    return res.status(401).json({ success: false, message: 'Autenticación fallida' });
  }
});

// Endpoint para cerrar sesión y detener el script
app.post('/api/logout', (req, res) => {
  keepRunning = false; // Detiene el ciclo de reinicio
  if (pythonProcess) {
    createStopFlag();
    console.log('Proceso Python detenido.');
  }
  res.json({ success: true, message: 'Sesión cerrada y proceso detenido.' });
});

app.get('/api/tickets', (req, res) => {
  const filePath = path.join(__dirname, 'WHD_Tickets.tsv');

  fs.readFile(filePath, 'utf16le', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    // Elimina caracteres nulos y espacios en blanco extra
    const cleanedData = data.replace(/[\uFEFF\u200B\u00A0\u0000\u003C\u003E]/g, '').trim();

    // Parsea el archivo eliminando comillas dobles
    const parsedData = Papa.parse(cleanedData, {
      header: true,        // Usa la primera fila como nombres de columna
      delimiter: '\t',     // Asegura que el delimitador sea tabulador
      skipEmptyLines: true,
      transformHeader: header => header.replace(/"/g, '') // Elimina comillas de los encabezados
    });

    // Validación de datos
    if (!parsedData || !parsedData.data || parsedData.data.length === 0) {
      return res.status(400).json({ error: 'El archivo TSV no contiene datos válidos' });
    }

    res.json(parsedData.data); // Enviar los datos parseados al frontend
  });
});

/*app.get('/api/surveys', (req, res) => {
  const filePath = path.join(__dirname, 'surveys.txt');

  fs.readFile(filePath, 'utf16le', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    // Elimina caracteres nulos y espacios en blanco extra
    const cleanedData = data.replace(/\u0000/g, '').trim();

    // Parsea el archivo eliminando comillas dobles
    const parsedData = Papa.parse(cleanedData, {
      header: true,        // Usa la primera fila como nombres de columna
      delimiter: '\t',     // Asegura que el delimitador sea tabulador
      skipEmptyLines: true,
      transformHeader: header => header.replace(/"/g, '') // Elimina comillas de los encabezados
    });

    // Validación de datos
    if (!parsedData || !parsedData.data || parsedData.data.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene datos válidos' });
    }

    res.json(parsedData.data); // Enviar los datos parseados al frontend
  });
});*/

app.get('/api/encargados', (req, res) => {
  const filePath = path.join(__dirname, 'encargado.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }

    // Elimina caracteres nulos y espacios en blanco extra
    const cleanedData = data.replace(/[\uFEFF\u200B\u00A0\u0000\u003C\u003E]/g, '').trim();

    // Parsea el archivo eliminando comillas dobles
    const parsedData = Papa.parse(cleanedData, {
      header: true,        // Usa la primera fila como nombres de columna
      delimiter: '\t',     // Asegura que el delimitador sea tabulador
      skipEmptyLines: true,
      transformHeader: header => header.replace(/"/g, '') // Elimina comillas de los encabezados
    });

    // Validación de datos
    if (!parsedData || !parsedData.data || parsedData.data.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene datos válidos' });
    }

    res.json(parsedData.data); // Enviar los datos parseados al frontend
  });
});

app.listen(port, () =>{
    console.log('El servidor está listo')
});