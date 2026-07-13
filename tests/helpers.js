import request from "supertest";

function extractCsrfToken(cookies) {
  const csrfCookie = cookies?.find((c) => c.startsWith("csrfToken="));
  return csrfCookie ? csrfCookie.split(";")[0].split("=")[1] : null;
}

export async function registerAndGetCookies(app, credentials) {
  const res = await request(app).post("/api/auth/register").send(credentials);
  return res.headers["set-cookie"];
}

export function authed(app, cookies) {
  const csrfToken = extractCsrfToken(cookies);
  const withCsrf = (req) =>
    csrfToken ? req.set("x-csrf-token", csrfToken) : req;

  return {
    get: (url) => request(app).get(url).set("Cookie", cookies),
    post: (url) => withCsrf(request(app).post(url).set("Cookie", cookies)),
    put: (url) => withCsrf(request(app).put(url).set("Cookie", cookies)),
    delete: (url) =>
      withCsrf(request(app).delete(url).set("Cookie", cookies)),
  };
}
