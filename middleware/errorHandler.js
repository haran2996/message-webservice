const errorHandler = (err, req, res, next) => {
  console.log("unhandledRejection", err.message, err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send({ message: err.message });
};
module.exports = errorHandler;
