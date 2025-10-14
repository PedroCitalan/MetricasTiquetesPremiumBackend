const express = require('express');
const router = express.Router();
const {
    crearProyecto,
    obtenerProyectos,
    actualizarProyecto,
    eliminarProyecto
} = require('../controllers/proyecto.controller');

// Rutas sin autenticación
router.post('/proyecto', crearProyecto);
router.get('/proyectos', obtenerProyectos);
router.put('/proyecto/:id', actualizarProyecto);
router.delete('/proyecto/:id', eliminarProyecto);

module.exports = router;
