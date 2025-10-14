const Proyecto = require('../models/proyecto.model');

const crearProyecto = async (req, res) => {
    try {
        const proyecto = new Proyecto(req.body);
        await proyecto.save();
        res.status(201).json(proyecto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const obtenerProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.find().populate('creadoPor').populate('tareas');
        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProyecto = async (req, res) => {
    try {
        const proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(proyecto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const eliminarProyecto = async (req, res) => {
    try {
        await Proyecto.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearProyecto,
    obtenerProyectos,
    actualizarProyecto,
    eliminarProyecto
};