const Usuario = require('../models/usuario.model')
const SECRET_KEY = 'mysecretkey';
const jwt = require('jsonwebtoken');

//Obtener lista de todos los usuarios
exports.getAllUsuarios = async(req, res) =>{
    const Usuarios = await Usuario.find();
    res.status(200).json(Usuarios);
};

exports.addUsuario = async (req, res) =>{
    try {
        const { nombre, apellido, direccion, telefono, correo, password, edad } = req.body;

        // Verificar si el correo ya existe
        const usuarioExistente = await Usuario.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).send('El correo ya está registrado');
        }

        // Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            direccion,
            telefono,
            correo,
            password: hashedPassword,
            edad,
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el usuario');
    }
}

exports.getUsuarioPorID = async (req, res) =>{

    const { idUsuario } = req.params.id;

    const usuario = await Usuario.findById(idUsuario);

    if (!usuario) {
        //Fallida
        return res.status(404).send({ mensaje: 'Usuario no encontrado' });
    }
    
    res.status(200).json(usuario);
}

exports.updateUser = async (req, res) =>{
    const idUsuario = req.params.id;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuario, req.body, { new: true, runValidators: true });

    if (!usuarioActualizado) {
        return res.status(404).send({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json(usuarioActualizado);
}

exports.deleteUser = async (req, res) =>{
    const idUsuario = req.params.id;

    const usuarioEliminado = await Usuario.findByIdAndDelete(idUsuario);

    if (!usuarioEliminado) {
        return res.status(404).send({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });
}

exports.authenticateUser = async (req, res) =>{
    const { correo, password } = req.body;
    
    const user = await Usuario.findOne({correo});

    if (!user) return res.status(400).send('Correo inválido'); //Pendiente

    if (user.password != password) return res.status(400).send('Contraseña inválida');

    const token = jwt.sign({ nombre: user.nombre, correo: user.correo, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    res.send(token);
}

exports.putUserRole = async (req, res) =>{
    const {role} = req.body;

    try{
        const user = await Usuario.findByIdAndUpdate(req.params.id, {role}, { new: true });

        if (!user) return res.status(404).send('Usuario no encontrado');

        res.status(200).json(user);
    } catch (error){
        res.status(500).send('Algo salió mal');
    }
}