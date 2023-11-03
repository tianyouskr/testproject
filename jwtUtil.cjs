/* eslint-disable require-jsdoc */
const jwt = require('jsonwebtoken');

/* function generateRandomString(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
}*/
const secreKey = 'd094eb7a7be96e484cbd3ee0f15aaff9';
console.log(`secreKey: ${secreKey}`);

// 生成token
function generateToken(payload) {
  return jwt.sign(payload, secreKey);
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secreKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

function signToken(payload) {
  const options = {expiresIn: '100m'};
  return jwt.sign(payload, secreKey, options);
}
// bug: 当顾问与用户id相同时，一个人登陆获得的token可以获得两个人的信息，
// 解决办法是将顾问id与用户id区分开，比如顾问id全以1开头，用户id全以2开头。
async function authenticateToken(req, res, next) {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    try {
      const decodedToken = await verifyToken(token);
      req.authData = decodedToken;
      next();
    } catch (err) {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  signToken,
};
