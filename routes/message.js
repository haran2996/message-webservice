const express = require("express");
const router = express.Router();
const dbConnection = require("../dbConnection");
const { ObjectId } = require("mongodb");

router.post("/user", async function (req, res) {
  const { message, to } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("message");
  const insertResult = await collection.insertOne({
    message,
    to: new ObjectId(to),
    from: new ObjectId(req.currentUser._id),
    sentAt: new Date(),
  });
  res.status(201).send({ insertResult });
});

router.post("/group", async function (req, res) {
  const { message, to } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("message");
  const insertResult = await collection.insertOne({
    message,
    to: new ObjectId(to),
    from: new ObjectId(req.currentUser._id),
    sentAt: new Date(),
  });
  res.status(201).send({ insertResult });
});

router.get("/group/(:id)?", async function (req, res) {
  const db = await dbConnection.getDB();
  const { id } = req.params;
  const collection = db.collection("message");
  let groups;
  if (!id) {
    const groupCollection = db.collection("group");
    groups = await groupCollection
      .find({
        members: {
          $elementMatch: {
            $eq: new ObjectId(req.currentUser._id),
          },
        },
      })
      .toArray()
      .map((val) => val._id);
  } else {
    groups = [new ObjectId(id)];
  }
  const messages = await collection
    .aggregate([
      {
        $match: {
          $or: [{ to: { $in: groups } }],
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "from",
          foreignField: "_id",
          as: "fromUser",
        },
      },
      ,
      {
        $sort: {
          sentAt: -1,
        },
      },
    ])
    .toArray();
  res.status(200).send({ messages });
});

router.get("/user/(:id)?", async function (req, res) {
  const { id } = req.params;
  const db = await dbConnection.getDB();
  const collection = db.collection("message");
  console.log("this is the req", id || req.currentUser._id);
  const messages = await collection
    .aggregate([
      {
        $match: {
          $or: [
            { to: new ObjectId(id || req.currentUser._id) },
            { from: new ObjectId(id || req.currentUser._id) },
          ],
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "from",
          foreignField: "_id",
          as: "fromUser",
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "to",
          foreignField: "_id",
          as: "toUser",
        },
      },
      {
        $sort: {
          sentAt: -1,
        },
      },
    ])
    .toArray();
  const messageObj = {};
  messages.map((val) => {
    const fromUser = val.from.toString() == req.currentUser._id.toString();
    const id = fromUser ? val.to.toString() : val.from.toString();
    if (!messageObj[id]) {
      messageObj[id] = [];
    }
    const { fName, lName } = val.fromUser[0];
    messageObj[id].push(
      `${fromUser ? "You" : `${fName} ${lName}`}: ${val.message}`,
    );
  });
  res.status(200).send(messageObj);
});

router.put("/:id", async function (req, res) {
  const { id } = req.params;
  const { message } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("message");
  const updateResult = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { message } },
  );
  res.status(200).send({ updateResult });
});

router.post("/:id/like", async function (req, res) {
  const { id } = req.params;
  const db = await dbConnection.getDB();
  const collection = db.collection("message");
  const message = await collection.findOne({ _id: new ObjectId(id) });
  if (message.likes?.includes(req.currentUser._id)) {
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { likes: req.currentUser._id }, $inc: { totalLikes: -1 } },
    );
    res.status(200).send({ updateResult });
    return;
  }
  const updateResult = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $push: { likes: req.currentUser._id }, $inc: { totalLikes: 1 } },
  );
  res.status(200).send({ updateResult });
});
module.exports = router;
