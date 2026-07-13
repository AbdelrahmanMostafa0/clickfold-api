import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { registerAndGetCookies, authed } from "./helpers.js";

const credentials = {
  name: "Campaign Tester",
  email: "campaigntester@example.com",
  password: "testpass123",
};

async function loggedIn() {
  const cookies = await registerAndGetCookies(app, credentials);
  return authed(app, cookies);
}

describe("Campaigns", () => {
  it("creates a campaign and lists it with zeroed aggregates", async () => {
    const client = await loggedIn();

    const created = await client
      .post("/api/campaigns")
      .send({ name: "Launch", description: "Q3 launch" });

    expect(created.status).toBe(201);
    expect(created.body.data.name).toBe("Launch");

    const list = await client.get("/api/campaigns");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].linksCount).toBe(0);
    expect(list.body.data[0].totalClicks).toBe(0);
  });

  it("rejects creating a link with a campaign the user doesn't own", async () => {
    const client = await loggedIn();

    const res = await client
      .post("/api/links")
      .field("slug", "orphan-link")
      .field("destination", "https://example.com")
      .field("ogMode", "none")
      .field("campaignId", "000000000000000000000000");

    expect(res.status).toBe(400);
  });

  it("aggregates clicks across a campaign's links in stats", async () => {
    const client = await loggedIn();
    const campaign = await client
      .post("/api/campaigns")
      .send({ name: "Newsletter" });
    const campaignId = campaign.body.data._id;

    await client
      .post("/api/links")
      .field("slug", "camp-link-1")
      .field("destination", "https://example.com/1")
      .field("ogMode", "none")
      .field("campaignId", campaignId);

    await client
      .post("/api/links")
      .field("slug", "camp-link-2")
      .field("destination", "https://example.com/2")
      .field("ogMode", "none")
      .field("campaignId", campaignId);

    await request(app).get("/api/links/redirect/camp-link-1");
    await request(app).get("/api/links/redirect/camp-link-1");
    await request(app).get("/api/links/redirect/camp-link-2");

    const stats = await client.get(`/api/campaigns/${campaignId}/stats`);
    expect(stats.status).toBe(200);
    expect(stats.body.data.links).toHaveLength(2);
    expect(stats.body.data.analytics.totalClicks).toBe(3);

    const list = await client.get("/api/campaigns");
    expect(list.body.data[0].linksCount).toBe(2);
    expect(list.body.data[0].totalClicks).toBe(3);
  });

  it("unlinks a campaign's links when the campaign is deleted", async () => {
    const client = await loggedIn();
    const campaign = await client
      .post("/api/campaigns")
      .send({ name: "Temp Campaign" });
    const campaignId = campaign.body.data._id;

    await client
      .post("/api/links")
      .field("slug", "temp-link")
      .field("destination", "https://example.com")
      .field("ogMode", "none")
      .field("campaignId", campaignId);

    const del = await client.delete(`/api/campaigns/${campaignId}`);
    expect(del.status).toBe(200);

    const link = await client.get("/api/links/temp-link");
    expect(link.body.data.campaignId).toBeNull();
  });
});
