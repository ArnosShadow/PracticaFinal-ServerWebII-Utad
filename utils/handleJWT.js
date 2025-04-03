const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT;

const JWTSign=(user)=>{
    const sign = jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    },
    JWT_SECRET,
    {
        expiresIn: "2h"
    })
    return sign;
}
const verifyToken = (tokenJwt)=>{
    try{
        return jwt.verify(tokenJwt, JWT_SECRET);
    }catch(err){
        console.log(err);
    }
}
module.exports = {JWTSign, verifyToken} 