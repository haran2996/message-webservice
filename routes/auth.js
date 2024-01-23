const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dbConnection = require("../dbConnection");
/* GET users listing. */
router.post("/login", async function (req, res, next) {
  const collection = (await dbConnection.getDB()).collection("user");
  await collection
    .findOne({ email: req.body.username })
    .then((result) => {
      if (result?.password == req.body.password) {
        const userDetails = { ...result, password: undefined };
        const token = jwt.sign(userDetails, "secretkey123");
        res.cookie("userToken", token);
        res.status(200).send(userDetails);
      } else {
        res.status(401).send({ message: "Invalid credentials" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).send({ message: "Invalid credentials" });
    });
});

router.get("/logout", (req, res) => {
  res.clearCookie("userToken");
  res.status(200).send({ message: "Logged out" });
});
module.exports = router;
