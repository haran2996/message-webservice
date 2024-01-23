const adminValidator = (req, res, next) => {
  if (req.currentUser?.role == "admin") {
    next();
  } else if (req.currentUser?.role == "user") {
    res.status(403).send({ message: "Unauthorized" });
  } else {
    res.status(401).send({ message: "User details not present" });
  }
};
module.exports = adminValidator;
