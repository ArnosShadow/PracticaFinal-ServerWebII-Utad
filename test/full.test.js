const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

let token;
let clientId;
let projectId;
let deliveryNoteId;
let verificationCode;
let email = `test${Date.now()}@mail.com`;
let password = "TestPass123";

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Flujo completo API", () => {
  test("1. Registro de usuario", async () => {
    const res = await request(app).post("/api/auth/register").send({
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
    const res = await request(app).post("/api/auth/validate").send({
      email,
      code: verificationCode
    });
    expect(res.statusCode).toBe(200);
  });

  test("3. Login y obtención de token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email,
      password
    });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeDefined();
  });

  test("4. Crear cliente", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente Test",
        nif: "11111111A",
        email: "cliente@mail.com",
        telefono: "612345678",
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
        descripcion: "Descripción",
        clientId
      });
    expect(res.statusCode).toBe(201);
    projectId = res.body._id;
  });

  test("6. Crear albarán", async () => {
    const res = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        horas: [{ trabajador: "Trabajador Test", descripcion: "Trabajo", horas: 5 }],
        materiales: [],
        observaciones: "Observación de prueba"
      });
    expect(res.statusCode).toBe(201);
    deliveryNoteId = res.body._id;
  });

  test("7. Obtener albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(deliveryNoteId);
  });

  test("8. Firmar albarán (subida firma)", async () => {
    const res = await request(app)
      .post(`/api/deliverynote/firmar/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("firma", Buffer.from("fake-image-content"), {
        filename: "firma.png",
        contentType: "image/png"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.firmado).toBe(true);
    expect(res.body.firmaUrl).toContain("ipfs");
  });

  test("9. Descargar PDF del albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
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
    expect(res.body.message).toContain("archivado");
  });

  test("11. Ver clientes archivados", async () => {
    const res = await request(app)
      .get("/api/client/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: clientId })
    ]));
  });

  test("12. Restaurar cliente", async () => {
    const res = await request(app)
      .patch(`/api/client/restaurar/${clientId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("13. Eliminar cliente (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("eliminado permanentemente");
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
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: projectId })
    ]));
  });

  test("16. Restaurar proyecto", async () => {
    const res = await request(app)
      .patch(`/api/project/restaurar/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("17. Eliminar proyecto (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("eliminado permanentemente");
  });

  test("18. Archivar albarán", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("archivado");
  });

  test("19. Ver albaranes archivados", async () => {
    const res = await request(app)
      .get("/api/deliverynote/archivados")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: deliveryNoteId })
    ]));
  });

  test("20. Restaurar albarán", async () => {
    const res = await request(app)
      .patch(`/api/deliverynote/restaurar/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(false);
  });

  test("21. Eliminar albarán (hard delete)", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("eliminado permanentemente");
  });
});


describe("Tests negativos y errores esperados", () => {
    test("22. Registro con email ya registrado", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email,
        password,
        nombre: "Repetido",
        apellido: "Email",
        nif: "99999999A"
      });
      expect(res.statusCode).toBe(409);
    });
  
    test("23. Login con contraseña incorrecta", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email,
        password: "ContraseñaIncorrecta123"
      });
      expect(res.statusCode).toBe(400);
    });
  
    test("24. Crear cliente sin nombre", async () => {
      const res = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nif: "22222222B"
        });
      expect(res.statusCode).toBe(422);
    });
  
    test("25. Crear proyecto sin clientId", async () => {
      const res = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre: "Proyecto sin cliente"
        });
      expect(res.statusCode).toBe(422);
    });
  
    test("26. Crear albarán sin horas ni materiales", async () => {
      const res = await request(app)
        .post("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`)
        .send({
          observaciones: "Sin datos reales"
        });
      expect(res.statusCode).toBe(422);
    });
  
    test("27. Firmar albarán inexistente", async () => {
      const res = await request(app)
        .post("/api/deliverynote/firmar/000000000000000000000000")
        .set("Authorization", `Bearer ${token}`)
        .attach("firma", Buffer.from("fake"), {
          filename: "firma.png",
          contentType: "image/png"
        });
      expect(res.statusCode).toBe(404);
    });
});
  


