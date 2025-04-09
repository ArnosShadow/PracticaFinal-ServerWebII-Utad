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
      .put('/register')
      .send({
        email: 'test@example.com',
        nombre: 'Nuevo',
        apellido: 'Nombre',
        nif: '12345678A'
        });
  
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo');
});

//Test para incluir usuario
test('incluirItem incluye los datos del usuario correctamente', async() =>{
    const mockCompany = {
        _id: 'comp123',
        nombre: 'Empresa Ejemplo',
        cif: 'B12345678',
        direccion: 'Dirección Ejemplo',
        provincia: 'Provincia Ejemplo',
        pais: 'País Ejemplo'
    };

    const mockUser = {
        _id: '1',
        email: 'test@example.com',
        nombre: 'Nuevo',
        apellido: 'Nombre',
        nif: '12345678A',
        estadoValidacion: 'validado',
        role: ['user'],
        companyId: mockCompany._id
    };

    UserModel.findOne.mockResolvedValue(mockUser);
    CompanyModel.create.mockResolvedValue(mockCompany);
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser)
    
    const res = await request(app)
    .patch('/company')
    .send({
        email: 'test@example.com',
        esAutonomo: false,
        company: {
          nombre: 'Empresa Ejemplo',
          cif: 'B12345678',
          direccion: 'Dirección Ejemplo',
          provincia: 'Provincia Ejemplo',
          pais: 'País Ejemplo'
        }
    });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.company.nombre).toBe('Empresa Ejemplo');
})

//Test para obtener los datos del usuario

test('obtenerDatos muestra los datos de los usuarios', async() =>{
    test('obtenerDatos muestra los datos de los usuarios', async () => {
        const mockUsers = [
          { email: 'test@example.com', nombre: 'Usuario Test 1' },
          { email: 'otro@example.com', nombre: 'Usuario Test 2' }
        ];
      
        UserModel.find.mockResolvedValue(mockUsers);
      
        const res = await request(app)
          .get('/');
      
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].email).toBe('test@example.com');
        expect(res.body[1].email).toBe('otro@example.com');
      });
});

//Test para obtener los datos de un usuario

test('obtenerDato muestra los datos de un usuario', async()=>{
    const mockUser = {
        email: 'test@example.com',
        nombre: 'Usuario Test 1',
        apellido: 'Apellido Test'
      };
    
    UserModel.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
    .get("/test@example.com");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.nombre).toBe('Usuario Test 1');

});