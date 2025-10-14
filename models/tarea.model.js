const mongoose = require('mongoose'); 
 
const tareaSchema = new mongoose.Schema({ 
  nombre: { type: String}, 
  descripcion: { type: String }, 
  fechaLimite: { type: Date }, 
  estado: {  
    type: String,  
    enum: ['pendiente', 'en progreso', 'completada'],  
    default: 'pendiente'  
  }, 
  asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}, 
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto'}, 
  comentarios: [{  
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },  
    mensaje: String,  
    fecha: { type: Date, default: Date.now } 
  }] 
}); 
 
module.exports = mongoose.model('Tarea', tareaSchema);