jest.mock('../utils/handleEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

const request = require("supertest");
const app = require("../app"); // Asegúrate de que la ruta sea correcta
const dbConnect = require("../config/mongo");

let token;
let clientId;
let projectId;
let deliverynotesId;
let verificationCode;
let unfirmedDeliveryNoteId;

const timestamp = Date.now(); // milisegundos
const email = `test${timestamp}@example.com`;
const password = "test1234";

beforeAll(async () => {
  await dbConnect();
});

describe("Flujo completo API", () => {
  test("1. Registro de usuario", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      email,
      password,
      nombre: "Test",
      apellido: "User",
      nif: "12345678A"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("codigoValidacion");
    verificationCode = res.body.codigoValidacion;
  });

  test("2. Validación del usuario", async () => {
    const res = await request(app)
      .post("/api/auth/validacion")
      .send({ email, code: verificationCode });
    expect(res.statusCode).toBe(200);
  });

  test("3. Login y obtención de token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeDefined();
  });

  test("4. Crear cliente", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente de prueba",
        email: "cliente@empresa.com",
        telefono: "600000000",
        direccion: "Calle Test 123"
      });
    expect(res.statusCode).toBe(201);
    clientId = res.body._id;
  });
  

  test("5. Crear proyecto", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Proyecto Test",
        clientId
      });
    expect(res.statusCode).toBe(201);
    projectId = res.body._id;
  });

  test("6. Crear albarán", async () => {
    const res = await request(app)
      .post("/api/deliverynotes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        horas: [
          {
            trabajador: "Empleado1",
            descripcion: "Trabajo realizado",
            horas: 3
          }
        ],
        materiales: [
          {
            descripcion: "Material A",
            cantidad: 5,
            unidad: "kg"
          }
        ],
        observaciones: "Observación de prueba"
      });
    expect(res.statusCode).toBe(201);
    deliverynotesId = res.body._id;
  });

  test("7. Obtener albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynotes/${deliverynotesId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(deliverynotesId);
  });

  test("8. Firmar albarán (subida firma)", async () => {
    const res = await request(app)
      .post(`/api/deliverynotes/firmar/${deliverynotesId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("firma", Buffer.from("firma de prueba"), {
        filename: "firma.png",
        contentType: "image/png"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.firmado).toBe(true);
    expect(res.body.firmaUrl).toContain("ipfs");
  });

  test("9. Descargar PDF del albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynotes/pdf/${deliverynotesId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });
});
describe("Gestión de archivado y eliminación", () => {
  test("10. Archivar cliente (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.archivado).toBe(true);
  });

  test("11. Ver clientes archivados", async () => {
    const res = await request(app)
      .get("/api/client/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: clientId })])
    );
  });

  test("12. Restaurar cliente", async () => {
    const res = await request(app)
      .patch(`/api/client/restaurar/${clientId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("14. Archivar proyecto", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("15. Ver proyectos archivados", async () => {
    const res = await request(app)
      .get("/api/project/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.proyecto).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: projectId })])
    );    
  });

  test("16. Restaurar proyecto", async () => {
    const res = await request(app)
      .patch(`/api/project/restaurar/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("17. Clonar albarán sin firmar para tests de archivado", async () => {
    const res = await request(app)
      .post("/api/deliverynotes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        horas: [
          {
            trabajador: "Empleado2",
            descripcion: "Trabajo sin firmar",
            horas: 2
          }
        ],
        materiales: [
          {
            descripcion: "Material B",
            cantidad: 3,
            unidad: "kg"
          }
        ],
        observaciones: "Clonado sin firma"
      });
    expect(res.statusCode).toBe(201);
    unfirmedDeliveryNoteId = res.body._id;
  });

  test("18. Archivar albaran", async () => {
    const res = await request(app)
      .delete(`/api/deliverynotes/${unfirmedDeliveryNoteId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("19. Ver albaranes archivados", async () => {
    const res = await request(app)
      .get("/api/deliverynotes/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.albaranes).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: unfirmedDeliveryNoteId  })])
    );
  });

  test("20. Restaurar albaran", async () => {
    const res = await request(app)
      .patch(`/api/deliverynotes/restaurar/${unfirmedDeliveryNoteId }`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("21. Eliminar albaran (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/deliverynotes/${unfirmedDeliveryNoteId }?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("Albarán eliminado definitivamente");
  });

  test("17. Eliminar proyecto (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("Proyecto eliminado definitivamente");
  });

  test("13. Eliminar cliente (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("eliminado permanentemente");
  });
});

describe("Tests negativos y errores esperados", () => {
  test("22. Registro con email ya registrado", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      email,
      password,
      nombre: "Test",
      apellido: "Usuario",
      nif: "99999999A"
    });
    expect(res.statusCode).toBe(409);
  });

  test("23. Login con contraseña incorrecta", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "contramal"
    });
    expect(res.statusCode).toBe(400);
  });

  test("24. Crear cliente sin nombre", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "prueba@test.com",
        telefono: "123123123",
        direccion: "Calle sin nombre"
      });
    expect(res.statusCode).toBe(422);
  });

  test("25. Crear proyecto sin clientId", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Proyecto sin cliente" });
    expect(res.statusCode).toBe(422);
  });

  test("26. Crear albaran sin horas ni materiales", async () => {
    const res = await request(app)
      .post("/api/deliverynotes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        observaciones: "Sin datos reales"
      });
    expect(res.statusCode).toBe(422);
  });

  test("27. Firmar albaran inexistente", async () => {
    const res = await request(app)
      .post(`/api/deliverynotes/firmar/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`)
      .attach("firma", Buffer.from("FAKE_IMAGE"), {
        filename: "firma.png",
        contentType: "image/png"
      });
    expect(res.statusCode).toBe(404);
  });
});


describe("Cliente API", () => {
  test("1. Crear cliente válido", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente Test",
        email: "cliente@example.com",
        telefono: "600000000",
        direccion: "Calle Test"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    clientId = res.body._id;
  });

  test("2. Obtener cliente por ID", async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(clientId);
  });

  test("3. Actualizar cliente", async () => {
    const res = await request(app)
      .put(`/api/client/${clientId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Cliente actualizado", telefono: "699999999" });
    expect(res.statusCode).toBe(200);
    expect(res.body.telefono).toBe("699999999");
  });

  test("4. Archivar cliente (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("5. Ver clientes archivados", async () => {
    const res = await request(app)
      .get("/api/client/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: clientId })])
    );
  });

  test("6. Restaurar cliente", async () => {
    const res = await request(app)
      .patch(`/api/client/restaurar/${clientId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.nota?.archivado || false).toBe(false);
  });

  test("7. Eliminar cliente (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("eliminado");
  });

  test("8. Crear cliente sin nombre (error)", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "invalido@fail.com" });
    expect(res.statusCode).toBe(422);
  });

  test("9. Acceso sin token (error)", async () => {
    const res = await request(app).get("/api/client");
    expect(res.statusCode).toBe(401);
  });
});


describe("Project API", () => {
  test("1. Crear proyecto válido", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Proyecto Jest",
        clientId
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    projectId = res.body._id;
  });

  test("2. Crear proyecto duplicado (conflicto)", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Proyecto Jest",
        clientId
      });
    expect(res.statusCode).toBe(409);
  });

  test("3. Crear proyecto sin nombre (error 422)", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId
      });
    expect(res.statusCode).toBe(422);
  });

  test("4. Obtener proyecto válido por ID", async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(projectId);
  });

  test("5. Obtener proyecto inexistente (404)", async () => {
    const res = await request(app)
      .get(`/api/project/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test("6. Actualizar proyecto válido", async () => {
    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Proyecto actualizado", descripcion: "Editado con Jest", clientId });
    expect(res.statusCode).toBe(200);
    expect(res.body.descripcion).toBe("Editado con Jest");
  });

  test("7. Actualizar proyecto inexistente (404)", async () => {
    const res = await request(app)
      .put(`/api/project/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Nada", clientId });
    expect(res.statusCode).toBe(404);
  });

  test("8. Archivar proyecto (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("9. Ver proyectos archivados", async () => {
    const res = await request(app)
      .get("/api/project/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.proyecto).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: projectId })])
    );
  });

  test("10. Restaurar proyecto", async () => {
    const res = await request(app)
      .patch(`/api/project/restaurar/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("11. Restaurar proyecto inexistente (404)", async () => {
    const res = await request(app)
      .patch(`/api/project/restaurar/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test("12. Eliminar proyecto definitivamente (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("Proyecto eliminado definitivamente");
  });

  test("13. Eliminar proyecto inexistente (404)", async () => {
    const res = await request(app)
      .delete(`/api/project/000000000000000000000000?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test("14. Acceso sin token (401)", async () => {
    const res = await request(app).get("/api/project");
    expect(res.statusCode).toBe(401);
  });
});
describe("DeliveryNote API", () => {
  let deliveryNoteId;

  test("1. Crear albarán válido", async () => {
    const res = await request(app)
      .post("/api/deliverynotes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        horas: [{ trabajador: "Empleado A", descripcion: "Trabajo 1", horas: 5 }],
        materiales: [{ descripcion: "Material A", cantidad: 10, unidad: "kg" }]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    deliveryNoteId = res.body._id;
  });

  test("2. Obtener albarán por ID", async () => {
    const res = await request(app)
      .get(`/api/deliverynotes/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        horas: [{ trabajador: "Empleado B", descripcion: "Revisión", horas: 2 }],
        materiales: [],
        clientId,
        projectId
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(deliveryNoteId);
  });

  test("3. Actualizar albarán válido", async () => {
    const res = await request(app)
      .put(`/api/deliverynotes/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({         
        clientId,       
        projectId,   
        horas: [{ trabajador: "Empleado B", descripcion: "Trabajo editado", horas: 8 }],
        materiales: [{ descripcion: "Material B", cantidad: 5, unidad: "litros" }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.horas[0].trabajador).toBe("Empleado B");
  });

  test("4. Obtener albarán inexistente (404)", async () => {
    const res = await request(app)
      .get("/api/deliverynotes/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test("5. Archivar albarán (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/deliverynotes/${deliveryNoteId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("6. Ver albaranes archivados", async () => {
    const res = await request(app)
      .get("/api/deliverynotes/archivados")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.albaranes).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: deliveryNoteId })])
    );
  });

  test("7. Restaurar albarán", async () => {
    const res = await request(app)
      .patch(`/api/deliverynotes/restaurar/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("8. Firmar albarán", async () => {
    const res = await request(app)
      .post(`/api/deliverynotes/firmar/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("firma", Buffer.from("firma-falsa"), "firma.png");

    expect(res.statusCode).toBe(200);
    expect(res.body.firmado).toBe(true);
  });

  test("9. Descargar PDF del albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynotes/pdf/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  test("10. Eliminar albarán firmado (error 403)", async () => {
    const res = await request(app)
      .delete(`/api/deliverynotes/${deliveryNoteId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test("11. Acceso sin token (401)", async () => {
    const res = await request(app).get("/api/deliverynotes");
    expect(res.statusCode).toBe(401);
  });
});

