import express from "express";
import userRoutes from "./user/user.routes.js";
import counselorRoutes from "./counselor/counselor.routes.js";
import peerRoutes from "./counselor/counselor.routes.js";
import { loadEnv } from "./utils/loadEnv.js";
import { seedPeers } from "./utils/seedPeers.js";

loadEnv();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "wellmind-mobile-api" }));
app.use("/api/user", userRoutes);
app.use("/api/counselor", counselorRoutes);
app.use("/api/counselor", peerRoutes);

app.listen(port, () => {
  console.log(`WellMind Mobile API running on http://localhost:${port}`);
  seedPeers();
});
