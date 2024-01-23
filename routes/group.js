const express = require("express");
const router = express.Router();
const dbConnection = require("../dbConnection");

router.get("/(:id)?", async function (req, res) {
  const { id } = req.params;
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  let groups;
  if (!id) {
    groups = await collection
      .aggregate([
        {
          $match: {
            members: {
              $elemMatch: {
                $eq: req.currentUser._id,
              },
            },
          },
          $lookup: {
            from: "user",
            localField: "members",
            foreignField: "_id",
            as: "membersArray",
          },
        },
      ])
      .toArray();
  } else {
    groups = [await collection.findOne({ _id: id })];
  }
  res.status(200).send({ groups });
});

router.post("/", async function (req, res) {
  const { name, members } = req.body;
  if (members && !members.find((val) => val === req.currentUser._id)) {
    members.push(req.currentUser._id);
  }
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  const insertResult = await collection.insertOne({
    name,
    members: members ? members : [req.currentUser._id],
  });
  const insertedGroup = await collection.findOne({
    _id: insertResult.insertedId,
  });
  res.status(201).send(insertedGroup);
});

router.post("/:id/member", async function (req, res) {
  const { id } = req.params;
  const { members } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  const group = await collection.findOne({ _id: id });
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }
  if (group.members.find((val) => members.includes(val))) {
    res.status(409).send({ message: "One or more user already in group" });
  } else {
    await collection.updateOne(
      { _id: id },
      {
        $push: {
          members: {
            $each: members,
          },
        },
      },
    );
    res.status(200).send({ message: "User added to group" });
  }
});

router.delete("/:id/member", async function (req, res) {
  const { id } = req.params;
  const { members } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  const group = await collection.findOne({ _id: id });
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }
  if (group.members.find((val) => members.includes(val))) {
    res
      .status(409)
      .send({ message: "One or more user already is not present in group" });
  } else {
    await collection.updateOne(
      { _id: id },
      {
        $pull: {
          members: {
            $elemMatch: {
              $in: members,
            },
          },
        },
      },
    );

    res.status(200).send({ message: "User added to group" });
  }
});

router.delete("/:id", async function (req, res) {
  const { id } = req.params;
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  const group = await collection.findOne({ _id: id });
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }
  const result = await group.deleteOne({ _id: id });
  res.status(200).send({ message: "Group deleted" });
});

router.put("/:id", async function (req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const db = await dbConnection.getDB();
  const collection = db.collection("group");
  const group = await collection.findOne({ _id: id });
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }
  await collection.updateOne({ _id: id }, { $set: { name } });
  res.status(200).send({ message: "Group updated" });
});

module.exports = router;
