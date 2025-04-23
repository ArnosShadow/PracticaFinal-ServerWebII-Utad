const request = require('supertest');
const express = require('express');
const multer = require('multer');
const app = express();

app.use(express.json());

const { incluirImagen, incluirImagenNube } = require('../controllers/storageController');

jest.mock('../models/storage');
jest.mock('../models/users');
jest.mock('../utils/handleStorageIPFS');
jest.mock('../utils/handleError');

const StorageModel = require('../models/storage');
const UserModel = require('../models/users');
const { uploadToPinata } = require('../utils/handleStorageIPFS');

// Middleware para simular subida de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas simuladas para test
app.post('/upload/local', upload.single('file'), incluirImagen);
app.post('/upload/ipfs/:id', upload.single('file'), incluirImagenNube);

beforeEach(() => {
  jest.clearAllMocks();
  process.env.PUBLIC_URL = 'http://localhost:3000';
  process.env.PINATA_GATEWAY_URL = 'gateway.pinata.cloud';
});

test('incluirImagen guarda imagen localmente y la asocia al usuario', async () => {
    const mockStorage = {
      _id: 'img123',
      filename: 'test.png',
      url: 'http://localhost:3000/test.png'
    };
  
    const mockUser = {
      _id: 'user123',
      mediaId: 'img123'
    };
  
    StorageModel.create.mockResolvedValue(mockStorage);
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser);
  
    const res = await request(app)
      .post('/upload/local')
      .field('email', 'test@example.com')
      .attach('file', Buffer.from('contenido-de-prueba'), 'test.png');
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Imagen subida correctamente');
    expect(res.body.image.url).toBe('http://localhost:3000/test.png');
});
test('incluirImagenNube sube imagen a IPFS y la asocia al usuario', async () => {
    const mockIPFS = {
      IpfsHash: 'QmTestHash123'
    };
  
    const mockStorage = {
      _id: 'ipfs123',
      filename: 'test-ipfs.png',
      url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
      ipfs: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
      new: true
    };
  
    const mockUser = {
      _id: 'user456',
      mediaId: 'ipfs123'
    };
  
    uploadToPinata.mockResolvedValue(mockIPFS);
    StorageModel.create.mockResolvedValue(mockStorage);
    UserModel.findOneAndUpdate.mockResolvedValue(mockUser);
  
    const res = await request(app)
      .post('/upload/ipfs/user456')
      .field('email', 'test@example.com')
      .attach('file', Buffer.from('contenido-ipfs'), 'test-ipfs.png');
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Imagen subida correctamente');
    expect(res.body.image.url).toContain('https://gateway.pinata.cloud/ipfs/');
});