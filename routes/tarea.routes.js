const express = require('express'); 
const router = express.Router(); 
const {  
  crearTarea,  
  obtenerTareas,  
  actualizarTarea,  
  eliminarTarea,  
  agregarComentario  
} = require('../controllers/tarea.controller'); 

// Rutas sin autenticación
router.post('/tarea', crearTarea); 
router.get('/tareas', obtenerTareas); 
router.put('/tarea/:id', actualizarTarea); 
router.delete('/tarea/:id', eliminarTarea); 
router.post('/tarea/:id/comentarios', agregarComentario);

module.exports = router;
