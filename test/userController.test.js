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

//Test para eliminar datos de un usuario soft = true.
test('eliminarDato elimina los datos de un usuario', async()=>{
    const mockUser={
        email: 'test@example.com',
        deleted: true
    };
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser);

    const res = await request()
    .delete('/test@example.com')
    .query({ soft: 'true' }); 

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Usuario desactivado (soft delete)');
})

//Test para eliminar un usuario soft = false
test('eliminarDato realiza un hard delete correctamente', async () => {
    UserModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
  
    const res = await request(app)
      .delete('/test@example.com')
      .query({ soft: 'false' });
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Usuario eliminado permanentemente');
});

//Test para recuperar la cuenta del usuario.
test('recuperarCuenta restaura correctamente la cuenta del usuario', async () => {
    const mockUser = {
      email: "test@example.com",
      deleted: false
    };
  
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser);
  
    const res = await request(app)
      .put('/recoverAccount/test@example.com');
  
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.deleted).toBe(false);
});

//Test para invitar a un usuario a formar parte de la compañia
test('invitar crea e invita correctamente a un nuevo usuario a la compañía', async () => {
    const mockCompany = {
      _id: 'company123',
      nombre: 'Empresa Ejemplo',
      cif: 'B12345678',
      direccion: 'Dirección Ejemplo',
      provincia: 'Provincia Ejemplo',
      pais: 'País Ejemplo'
    };
  
    const mockNuevoUsuario = {
      email: "test@example.com",
      estadoValidacion: "noValidado",
      role: ["guest"],
      companyId: mockCompany._id
    };
  
    UserModel.findOne.mockResolvedValue(null);
    CompanyModel.findOne.mockResolvedValue(mockCompany);
    UserModel.create.mockResolvedValue(mockNuevoUsuario);
  
    const res = await request(app)
      .post('/invite')
      .send({
        email: "test@example.com",
        password: "contraseñaSegura123",
        company: {
          nombre: "Empresa Ejemplo",
          cif: "B12345678",
          direccion: "Dirección Ejemplo",
          provincia: "Provincia Ejemplo",
          pais: "País Ejemplo"
        }
      });
  
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.role).toContain('guest');
    expect(res.body.Verificado).toBe('noValidado');
    expect(res.body.company).toBe(mockCompany._id);
    expect(res.body.token).toBeDefined();
  });
  
//Test para enviar peticion para la restauracion de la contraseña.
test('enviarPeticion genera y devuelve un código de recuperación', async () => {
  const mockUser = {
    email: 'test@example.com',
    codigoVerificacion: 'abc12345'
  };

  UserModel.findOneAndUpdate.mockResolvedValue(mockUser);

  const res = await request(app)
    .get('/solicitar/test@example.com');

  expect(res.status).toBe(200);
  expect(res.text).toContain('Codigo para test@example.com');
});


test('confirmarPeticion cambia la contraseña correctamente si el código es válido', async () => {
  const nuevaPasswordCifrada = 'hashedPassword123';

  const mockUser = {
    email: 'test@example.com',
    password: nuevaPasswordCifrada,
    codigoVerificacion: 'abc12345'
  };

  // Mock de `cifrar`
  cifrar.mockResolvedValue(nuevaPasswordCifrada);

  // Este usuario tiene el mismo código que el que vamos a pasar en el test
  UserModel.findOneAndUpdate.mockResolvedValue({ ...mockUser, codigoVerificacion: 'abc12345' });

  const res = await request(app)
    .post('/confirmar')
    .send({
      email: 'test@example.com',
      codigo: 'abc12345',
      nuevaContraseña: 'nueva123'
    });

  expect(res.status).toBe(200);
  expect(res.text).toContain(`La contraseña para test@example.com`);
});
