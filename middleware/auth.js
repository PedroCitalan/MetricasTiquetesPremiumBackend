const jwt = require('jsonwebtoken');
const SECRET_KEY = 'mysecretkey';
const Usuario = require('../models/usuario.model');
const Tarea = require('../models/tarea.model');
const Proyecto = require('../models/proyecto.model');

function checkRole(role) {
    return function (req, res, next) {
        const token = req.headers['authorization'];

        if (!token) return res.status(401).send('Acceso denegado. No TOKEN');

        try {
            const decoded = jwt.verify(token, SECRET_KEY);

            if (decoded.role != role) return res.status(403).send('Acceso denegado.');

            req.user = decoded;
            next();
        } catch (error) {
            res.status(400).send('Petición inválida');
        }
    }
}

// es el middleware para verificar el token 
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Acceso denegado' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.usuarioId = decoded.id;
        next();
    });
};

// middleware para validar si es administrador o usuario asignado 
const esAdminOAsignado = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId);
        if (usuario.rol === 'admin') return next();

        const tarea = await Tarea.findById(req.params.id);
        if (tarea && tarea.asignadoA.equals(req.usuarioId)) return next();

        const proyecto = await Proyecto.findById(req.params.id);
        if (proyecto && proyecto.creadoPor.equals(req.usuarioId)) return next();

        res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    checkRole,
    verificarToken,
    esAdminOAsignado
};