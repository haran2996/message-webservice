const { MongoClient } = require("mongodb");

class DbConnection {
  static db = null;
  static async getDB() {
    try {
      const username = encodeURIComponent("testuser123");
      const password = encodeURIComponent("testuser123");
      const mongoURI = `mongodb+srv://${username}:${password}@cluster0.5kjvbpv.mongodb.net/`;
      if (this.db === null) {
        const client = new MongoClient(mongoURI);
        await client.connect();
        this.db = client.db("message_app");
        await this.db.command({ ping: 1 });
      }
      return this.db;
    } catch (err) {
      console.log("error has been caught in dbconnection", err);
      throw err;
    }
  }
}
module.exports = DbConnection;
