import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { registerAndGetCookies, authed } from "./helpers.js";

const credentials = {
  name: "Link Tester",
  email: "linktester@example.com",
  password: "testpass123",
};

async function loggedIn() {
  const cookies = await registerAndGetCookies(app, credentials);
  return authed(app, cookies);
}

describe("POST /api/links", () => {
  it("creates a link for the authenticated user", async () => {
    const client = await loggedIn();

    const res = await client
      .post("/api/links")
      .field("slug", "my-test-link")
      .field("destination", "https://example.com")
      .field("ogMode", "none");

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe("my-test-link");
    expect(res.body.data.destination).toBe("https://example.com");
    expect(res.body.data.clicks).toBe(0);
  });

  it("rejects a slug that is already taken", async () => {
    const client = await loggedIn();
    await client
      .post("/api/links")
      .field("slug", "taken-slug")
      .field("destination", "https://example.com/a")
      .field("ogMode", "none");

    const res = await client
      .post("/api/links")
      .field("slug", "taken-slug")
      .field("destination", "https://example.com/b")
      .field("ogMode", "none");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/links")
      .field("slug", "no-auth")
      .field("destination", "https://example.com")
      .field("ogMode", "none");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/links/redirect/:slug", () => {
  it("returns the link and increments clicks on each hit", async () => {
    const client = await loggedIn();
    await client
      .post("/api/links")
      .field("slug", "click-me")
      .field("destination", "https://example.com/target")
      .field("ogMode", "none");

    const first = await request(app).get("/api/links/redirect/click-me");
    expect(first.status).toBe(200);
    expect(first.body.data.destination).toBe("https://example.com/target");
    expect(first.body.data.clicks).toBe(1);

    const second = await request(app).get("/api/links/redirect/click-me");
    expect(second.body.data.clicks).toBe(2);
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await request(app).get(
      "/api/links/redirect/does-not-exist",
    );
    expect(res.status).toBe(404);
  });
});
