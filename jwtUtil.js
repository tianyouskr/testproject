const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const { resolve } = require('path');
const { rejects } = require('assert');

/*function generateRandomString(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
}*/
const secreKey = "d094eb7a7be96e484cbd3ee0f15aaff9"//generateRandomString(32);
console.log(`secreKey: ${secreKey}`)
function generateToken(payload){
    return jwt.sign(payload,secreKey);
}

function verifyToken(token){
    return new Promise((resolve,reject)=>{
        jwt.verify(token,secreKey,(err,decoded)=>{
            if(err){
                reject(err);
            }else{
                resolve(decoded);
            }
        });
    });
}
function signToken(payload){
    const options={expiresIn:'100m'};
    return jwt.sign(payload,secreKey,options);
}

async function authenticateToken(req,res,next){
    const bearerHeader =req.headers.authorization;

    if(typeof bearerHeader!=="undefined"){
        const bearer=bearerHeader.split(" ");
        const token=bearer[1];

        try{
            const decodedToken=await verifyToken(token);
            req.authData=decodedToken;
            next();
        }catch(err){
            res.sendStatus(401);
        }
    }else{
        res.sendStatus(401);
    }
}

module.exports={
    generateToken,
    verifyToken,
    authenticateToken,
    signToken
};