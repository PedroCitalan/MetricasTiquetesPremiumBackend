const express = require('express');
const router = express.Router()
const { getAllUsuarios, addUsuario, getUsuarioPorID, updateUser, deleteUser, authenticateUser, putUserRole } = require('../controllers/usuario.controller');
const { crearUsuario } = require('../controllers/usuario.controller');

const { checkRole } = require('../middleware/auth');

//Mostrar todos los usuarios de la aplicación
router.get('/usuarios', checkRole('admin'), getAllUsuarios);
//Creación de Usuarios
router.post('/usuario', addUsuario);
//Buscar un usuario específico
router.get('/usuario/:id', checkRole('user'), getUsuarioPorID);
//Actualizar Usuario
router.put('/usuario/:id', checkRole('admin'), updateUser);
//Borrar un Usuario
router.delete('/usuario/:id', checkRole('admin'), deleteUser);

router.post('/user-login/', authenticateUser);

router.put('/usuarioRol/:id', putUserRole);

module.exports = router;