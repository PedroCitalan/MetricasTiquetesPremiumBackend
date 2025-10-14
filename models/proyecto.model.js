const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
    nombre: { type: String},
    descripcion: { type: String},
    fechaInicio: { type: Date},
    fechaFin: { type: Date },
    estado: {
        type: String,
        enum: ['Planeado', 'En progreso', 'Completado', 'No planeado'],
        default: 'Planeado'
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    tareas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tarea' }]
});

module.exports = mongoose.model('Proyecto', proyectoSchema);