const PDFDocument = require("pdfkit");
const stream = require("stream");
const axios = require("axios");

const generarBufferPDF = async (nota) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];
    const bufferStream = new stream.PassThrough();

    doc.pipe(bufferStream);
    bufferStream.on("data", chunk => chunks.push(chunk));
    bufferStream.on("end", () => resolve(Buffer.concat(chunks)));
    bufferStream.on("error", reject);

    doc.fontSize(18).text("ALBARAN", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`ID: ${nota._id}`);
    doc.text(`Usuario: ${nota.userId?.email || nota.userId}`);
    doc.text(`Cliente: ${nota.clientId?.nombre || nota.clientId}`);
    doc.text(`Proyecto: ${nota.projectId?.nombre || nota.projectId}`);
    doc.text(`Firmado: ${nota.firmado ? "Sí" : "No"}`);
    doc.moveDown();

    if (nota.horas?.length > 0) {
      doc.fontSize(14).text("Horas:", { underline: true });
      nota.horas.forEach(h => {
        doc.text(`- ${h.trabajador} - ${h.descripcion} (${h.horas}h)`);
      });
      doc.moveDown();
    }

    if (nota.materiales?.length > 0) {
      doc.fontSize(14).text("Materiales:", { underline: true });
      nota.materiales.forEach(m => {
        doc.text(`- ${m.descripcion} - ${m.cantidad} ${m.unidad}`);
      });
      doc.moveDown();
    }

    if (nota.observaciones) {
      doc.fontSize(12).text("Observaciones:");
      doc.text(nota.observaciones);
      doc.moveDown();
    }

    if (nota.firmaUrl && nota.firmaUrl.startsWith("http")) {
      try {
        const response = await axios.get(nota.firmaUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");
        doc.image(imageBuffer, { width: 150 });
      } catch (err) {
        doc.text("Error al cargar la imagen de la firma.");
        console.error("Error cargando imagen:", err.message);
      }
    } else {
      doc.text("Firma no disponible.");
    }

    doc.end();
  });
};


module.exports = { generarBufferPDF };
