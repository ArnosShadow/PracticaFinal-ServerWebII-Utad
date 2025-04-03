const request = require("supertest");
const express = require("express");
const app = express();


app.use(express.json());


const {
    actualizarItem,incluirItem,obtenerDatos,
    obtenerDato,eliminarDato,recuperarCuenta,
    invitar,enviarPeticion,confirmarPeticion} = require('../controllers/userController');


//Realizamos los mock
jest.mock('../models/users');
jest.mock('../models/company');
jest.mock('../utils/handlePassword');
jest.mock('../utils/handleJWT');
jest.mock('../utils/handleError');

const UserModel = require('../models/users');
const CompanyModel = require('../models/company');
const { cifrar } = require('../utils/handlePassword');
const { JWTSign } = require('../utils/handleJWT');


//Añadimos las rutas
app.post('/actualizar', actualizarItem);
app.post('/incluir', incluirItem);
app.get('/usuarios', obtenerDatos);
app.get('/usuario/:email', obtenerDato);
app.delete('/usuario/:email', eliminarDato);
app.post('/recuperar/:email', recuperarCuenta);
app.post('/invitar', invitar);
app.get('/solicitar/:email', enviarPeticion);
app.post('/confirmar', confirmarPeticion);

beforeEach(() => {
    jest.clearAllMocks();
});


//Test para actualizacion de usuario
test('actualizarItem actualiza los datos del usuario correctamente', async () => {
    const mockUser = {
      _id: '1',
      email: 'test@example.com',
      estadoValidacion: 'validado',
      role: ['user']
    };
  
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser);
  
    const res = await request(app)
      .post('/actualizar')
      .send({
        email: 'test@example.com',
        nombre: 'Nuevo',
        apellido: 'Nombre',
        nif: '12345678A'
        });
  
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo');
});

  