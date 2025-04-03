const bcryptjs = require("bcryptjs");


const cifrar =async  (password) =>{
    const hash=await bcryptjs.hash(password, 10);
    return hash

}

const descrifrarComparar = async (password, hashedPassword) =>{
    const result = await bcryptjs.compare(password, hashedPassword);
    return result;
}

module.exports = {cifrar, descrifrarComparar};