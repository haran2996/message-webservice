const express = require("express");
const router = express.Router();
const dbConnection = require("../dbConnection");
const adminValidator = require("../middleware/adminValidation");
router.use(adminValidator);

router.post("/user", async function (req, res) {
  const { fName, lName, email, password, role = "user" } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("user");
  const user = await collection.findOne({ email });
  if (user) {
    res.status(409).send({ message: "User already exists" });
    return;
  }
  const insertResult = await collection.insertOne({
    fName,
    lName,
    email,
    password,
    role,
  });
  const insertedUser = await collection.findOne({
    _id: insertResult.insertedId,
  });
  res.status(201).send({ ...insertedUser, password: undefined });
});

module.exports = router;
