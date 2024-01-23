const { app: expressApp, server: expressServer } = require("../index");
const supertest = require("supertest");
const dbConnection = require("../dbConnection");
describe("API Testing", () => {
  beforeAll(async () => {
    const db = await dbConnection.getDB();
    await Promise.allSettled([
      db.collection("user").deleteOne({
        email: "testin123@test.com",
      }),
      db.collection("group").deleteMany({
        name: "testinggroup1",
      }),
    ]);
  });
  afterAll(async () => {
    expressServer.close();
  });
  describe("auth routes", () => {
    it("Should return 200 for login correct credentials", async () => {
      const response = await supertest(expressApp)
        .post("/auth/login")
        .send({ username: "test@test.com", password: "1234" });
      expect(response.status).toBe(200);
    });
    it("Should return 401 for login wrong password", async () => {
      const response = await supertest(expressApp)
        .post("/auth/login")
        .send({ username: "test@test.com", password: "12" });
      expect(response.status).toBe(401);
    });
    it("Should return 200 for logout", async () => {
      const response = await supertest(expressApp)
        .get("/auth/logout")
        .set("Cookie", "userToken=test");
      console.log(response);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out");
    });
  });
  describe("admin routes", () => {
    it("Should return 200 for admin", async () => {
      const response = await supertest(expressApp)
        .post("/admin/user")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWFlMjhmYjZjNzhjOGJiM2E3NjFhOTAiLCJmTmFtZSI6IkhhcmloYXJhbiIsImxOYW1lIjoiQmFsYWtyaXNobmFuIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA2MDQyODg4fQ.8dJK_H6Nhs-Q012xnTPouZUGmKmgm49BFuovw7wlUd0",
        )
        .send({
          fName: "testing",
          lName: "testing",
          email: "testin123@test.com",
          password: "1234",
        });
      expect(response.status).toBe(201);
    });
  });
  describe("group route", () => {
    it("Should return 200 for group", async () => {
      const response = await supertest(expressApp)
        .post("/group")
        .set(
          "Cookie",
          "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWFmYTE2ZjZlMjExMWM0NzQ1NzhiM2IiLCJmTmFtZSI6IlRlc3QiLCJsTmFtZSI6IlVzZXIiLCJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDYwMTk2NzB9.Nb2WWAgLA6-lTILgomTX1DBs_ZD1sCG543YH8cBqwEM",
        )
        .send({
          name: "testinggroup1",
        });
      console.log(response.body);
      expect(response.status).toBe(201);
    });
  });
});
