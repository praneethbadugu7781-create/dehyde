import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { Resolver } from "dns/promises";
import { env } from "./env.js";

async function resolveSrvHosts(hostname: string): Promise<string[]> {
  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);
  const records = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`);
  return records.map((r) => `${r.name}:${r.port}`);
}

function buildUri(user: string, pass: string, host: string, dbPath: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({
    ssl: "true",
    authSource: "admin",
    retryWrites: "true",
    w: "majority",
    directConnection: "true",
    ...extra,
  });
  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}${dbPath}?${params}`;
}

/** Find primary node and connect (works around SRV / replica-set discovery issues on some networks). */
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully via native driver.");
    return;
  } catch (err) {
    console.warn("Direct MongoDB connection failed, falling back to SRV host probe...", err);
  }

  const parsed = new URL(env.mongoUri.replace("mongodb+srv://", "https://"));
  const user = decodeURIComponent(parsed.username);
  const pass = decodeURIComponent(parsed.password);
  const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/dehyde";

  const hosts = await resolveSrvHosts(parsed.hostname);
  let primaryHost = hosts[0];

  // Probe any host to discover the current primary
  for (const host of hosts) {
    const probe = new MongoClient(buildUri(user, pass, host, dbPath));
    try {
      await probe.connect();
      const hello = (await probe.db("admin").command({ hello: 1 })) as {
        isWritablePrimary?: boolean;
        primary?: string;
      };
      if (hello.isWritablePrimary) {
        primaryHost = host;
        break;
      }
      if (hello.primary) {
        primaryHost = hello.primary;
        break;
      }
    } catch {
      /* try next host */
    } finally {
      await probe.close();
    }
  }

  const uri = buildUri(user, pass, primaryHost, dbPath);
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log(`MongoDB connected (primary: ${primaryHost})`);
}
