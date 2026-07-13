import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeAll, afterAll, afterEach } from "vitest";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "clickfold-test" });
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
