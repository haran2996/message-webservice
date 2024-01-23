const jwt = require("jsonwebtoken");
const authValidator = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.userToken;
  if (token) {
    jwt.verify(token, "secretkey123", (err, decoded) => {
      if (err) {
        res.status(401).send({ message: "Invalid token" });
      } else {
        console.log("this is the decoded value===>>", decoded);
        req.currentUser = decoded;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Token is missing" });
  }
};
module.exports = authValidator;
