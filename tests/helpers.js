import request from "supertest";

export async function registerAndGetCookies(app, credentials) {
  const res = await request(app).post("/api/auth/register").send(credentials);
  return res.headers["set-cookie"];
}

export function authed(app, cookies) {
  return {
    get: (url) => request(app).get(url).set("Cookie", cookies),
    post: (url) => request(app).post(url).set("Cookie", cookies),
    put: (url) => request(app).put(url).set("Cookie", cookies),
    delete: (url) => request(app).delete(url).set("Cookie", cookies),
  };
}
