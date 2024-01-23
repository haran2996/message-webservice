const express = require("express");
const router = express.Router();
const dbConnection = require("../dbConnection");

router.get("/", async function (req, res) {
  const db = await dbConnection.getDB();
  const collection = db.collection("user");
  const userDetails = await collection.findOne({ _id: req.currentUser._id });
  res.status(200).send({ ...userDetails, password: undefined });
});

router.put("/", async function (req, res) {
  const db = await dbConnection.getDB();
  const { fName, lName, email, password, role } = req.body;
  const collection = db.collection("user");
  const userDetails = await collection.findOne({ _id: req.currentUser._id });
  if (!userDetails) {
    res.status(404).send({ message: "User not found" });
    return;
  }
  await collection.updateOne(
    { _id: req.currentUser._id },
    { $set: { fName, lName, email, password, role } },
  );
});

router.get("/all", async function (req, res) {
  const db = await dbConnection.getDB();
  const collection = db.collection("user");
  const users = await collection
    .find({
      _id: {
        $ne: req.currentUser._id,
      },
    })
    .toArray();
  res.status(200).send(users.map((val) => ({ ...val, password: undefined })));
});

module.exports = router;
