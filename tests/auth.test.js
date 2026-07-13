import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const credentials = {
  name: "Test User",
  email: "test@example.com",
  password: "testpass123",
};

describe("POST /api/auth/register", () => {
  it("registers a new user and sets auth cookies", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(credentials.email);
    expect(res.body.data.password).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(credentials);
    const res = await request(app)
      .post("/api/auth/register")
      .send(credentials);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials, email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app).post("/api/auth/login").send({
      email: credentials.email,
      password: credentials.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app).post("/api/auth/login").send({
      email: credentials.email,
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("rejects a nonexistent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "whatever123",
    });

    expect(res.status).toBe(404);
  });
});
