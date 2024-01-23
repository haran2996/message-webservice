const express = require("express");
const dbConnection = require("./dbConnection");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const messageRouter = require("./routes/message");
const groupRouter = require("./routes/group");
const cookieParser = require("cookie-parser");
const authValidator = require("./middleware/authValidation");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const port = 3000;

dbConnection.getDB();
app.use(express.json());
app.use(cookieParser());
app.use("*", (req, res, next) => {
  const skipPath = [
    { path: "/", type: "get" },
    { path: "", type: "get" },
    { path: "/auth/login", type: "post" },
  ];
  if (
    skipPath.filter(
      (val) => val.path == req.baseUrl && val.type == req.method.toLowerCase(),
    ).length > 0
  ) {
    next();
  } else {
    authValidator(req, res, next);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.use("/user", usersRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/message", messageRouter);
app.use("/group", groupRouter);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
