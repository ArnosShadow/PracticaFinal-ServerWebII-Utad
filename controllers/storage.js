const StorageModel = require("../models/storage")
const UserModel = require("../models/users")
const { handleHttpError } = require("../utils/handleError")
const {uploadToPinata} = require("../utils/handleStorageIPFS")

const incluirImagen = async (req, res) =>{
    const {body, file} = req
    console.log(body);
    const fileData = {
        filename:file.filename,
        url: process.env.PUBLIC_URL + "/"+file.filename
    }

    const data = await StorageModel.create(fileData);
    await incluirImagenesAlUser(req,res, data);
}

const incluirImagenNube = async (req, res) => {
    try {
        const id = req.params.id
        const fileBuffer = req.file.buffer
        const fileName = req.file.originalname
        
        const pinataResponse = await uploadToPinata(fileBuffer, fileName)
        const ipfsFile = pinataResponse.IpfsHash
        const fileData = {
            _id: id,
            filename:fileName,
            url: `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`,
            ipfs: `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`,
            new :true
        }

        //const data = await UserModel.create({_id: id }, {image: ipfs}, { new: true })
        const data = await StorageModel.create(fileData)
        await incluirImagenesAlUser(req, res, data);
    }catch(err) {
        handleHttpError(res,"ERROR_UPLOAD_COMPANY_IMAGE" +err, 500);
    }
}

const incluirImagenesAlUser= async (req, res, data) => {
    const email = req.body.email;
    const user= await UserModel.findOneAndUpdate({email: email}, {mediaId: data._id});
    
    res.status(200).json({
        message: "Imagen subida correctamente",
        image: data,
        user: {
          _id: user._id,
          mediaId: data._id,
          url: data.url
        }
      });
}
module.exports = {incluirImagen,incluirImagenNube};