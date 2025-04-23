const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

const { createItem, validateItem, loginItem } = require('../controllers/authController');

jest.mock('../models/users');
jest.mock('../utils/handlePassword');
jest.mock('../utils/handleJWT');
jest.mock('../utils/handleVerificador');
jest.mock('../utils/handleError');

const AuthModel = require('../models/users');
const { cifrar, descrifrarComparar } = require('../utils/handlePassword');
const { JWTSign } = require('../utils/handleJWT');
const { comprobarVerificadoEmail } = require('../utils/handleVerificador');

// Rutas para testear directamente
app.post('/auth/register', createItem);
app.post('/auth/validate', validateItem);
app.post('/auth/login', loginItem);

beforeEach(() => {
  jest.clearAllMocks();
});

test('createItem registra un usuario nuevo correctamente', async () => {
    const mockUser = {
      email: 'nuevo@example.com',
      password: 'hashedpass',
      role: ['user'],
      estadoValidacion: 'noValidado',
      codigoValidacion: 123456
    };
  
    comprobarVerificadoEmail.mockResolvedValue(false);
    cifrar.mockResolvedValue('hashedpass');
    AuthModel.create.mockResolvedValue(mockUser);
    JWTSign.mockResolvedValue('mockedtoken');
  
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'nuevo@example.com',
        password: 'password123',
        role: ['user'],
        estadoValidacion: 'noValidado'
      });
  
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('nuevo@example.com');
    expect(res.body.token).toBe('mockedtoken');
    expect(res.body.codigoValidacion).toBeDefined();
});
test('validateItem valida el email correctamente con el código', async () => {
    const mockUser = {
        email: 'validar@example.com',
        codigoValidacion: '123456'
    };

    AuthModel.findOne.mockResolvedValue(mockUser);
    AuthModel.findOneAndUpdate.mockResolvedValue(mockUser);

    const res = await request(app)
        .post('/auth/validate')
        .send({
        email: 'validar@example.com',
        code: '123456'
        });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Usuario valido');
});
test('loginItem permite login con credenciales válidas', async () => {
    const mockUser = {
        _id: '1',
        email: 'login@example.com',
        password: 'hashedpass',
        role: ['user'],
        estadoValidacion: 'validado'
    };

    AuthModel.findOne.mockResolvedValue(mockUser);
    descrifrarComparar.mockReturnValue(true);
    JWTSign.mockResolvedValue('mockedtoken');

    const res = await request(app)
        .post('/auth/login')
        .send({
        email: 'login@example.com',
        password: 'password123'
        });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('login@example.com');
    expect(res.body.token).toBe('mockedtoken');
});


        