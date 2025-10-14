const Tarea = require('../models/tarea.model'); 
 
// nueva tarea 
const crearTarea = async (req, res) => { 
  try { 
    const tarea = new Tarea(req.body); 
    await tarea.save(); 
    res.status(201).json(tarea); 
  } catch (error) { 
    res.status(400).json({ error: error.message }); 
  } 
}; 
 
// Obtener todas las tareas (con comentarios)
const obtenerTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find().populate('asignadoA proyectoId comentarios.usuario');
    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
// actualizar tarea, cambio de estado y comentarios 
const actualizarTarea = async (req, res) => { 
  try { 
    const tarea = await Tarea.findByIdAndUpdate(req.params.id, req.body, { new: true }); 
    res.status(200).json(tarea); 
  } catch (error) { 
    res.status(400).json({ error: error.message }); 
  } 
}; 
 
// eliminar tarea 
const eliminarTarea = async (req, res) => { 
  try { 
    await Tarea.findByIdAndDelete(req.params.id); 
    res.status(204).end(); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
}; 
 
// añadir comentario a una tarea 
const agregarComentario = async (req, res) => { 
  try { 
    const tarea = await Tarea.findById(req.params.id); 
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' }); 
 
    tarea.comentarios.push({ usuario: req.usuarioId, mensaje: req.body.mensaje }); 
    await tarea.save(); 
    res.status(201).json(tarea); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
}; 
 
module.exports = {  
crearTarea,  
obtenerTareas,  
actualizarTarea,  
eliminarTarea,  
agregarComentario  
}; 