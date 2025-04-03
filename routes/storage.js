const express = require("express");
const { incluirImagen,incluirImagenNube } = require("../controllers/storage");
const {authMiddleware} = require("../utils/authMiddleware");
const { uploadMiddleware, uploadMiddlewareMemory } = require("../utils/handleStorage");
const router = express.Router()


router.patch("/local", authMiddleware ,uploadMiddleware.single("image"), incluirImagen);
router.patch("/", authMiddleware,uploadMiddlewareMemory.single("image"), incluirImagenNube);


const errorHandle =  (err,req,res, next) =>{
    if(res.headersSent){
        return next(err)

    }
    console.log("ERROR:::::::: File too large");
    res.status(400)
    res.send( {error: err})
}
router.use(errorHandle);

module.exports = router;