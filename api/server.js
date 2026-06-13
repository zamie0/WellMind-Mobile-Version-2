import express from "express";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./user/user.routes.js";
import counselorRoutes from "./counselor/counselor.routes.js";
import chatRoutes from "./chat/chat.routes.js";
import appointmentRoutes from "./appointment/appointment.routes.js";
import { loadEnv } from "./utils/loadEnv.js";

loadEnv();

const app = express();
const port = process.env.PORT || 5001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);
app.locals.onlineCounselors = new Set();
app.locals.counselorSocketCounts = new Map();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "wellmind-mobile-api" });
});

app.use("/api/user", userRoutes);
app.use("/api/counselor", counselorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);

const broadcastCounselorPresence = () => {
  io.emit("counselor:presence", {
    onlineCounselorIds: Array.from(app.locals.onlineCounselors),
  });
};

const addCounselorSocket = (counselorId) => {
  const id = String(counselorId);
  const currentCount = app.locals.counselorSocketCounts.get(id) || 0;
  app.locals.counselorSocketCounts.set(id, currentCount + 1);
  app.locals.onlineCounselors.add(id);
};

const removeCounselorSocket = (counselorId) => {
  const id = String(counselorId);
  const nextCount = Math.max((app.locals.counselorSocketCounts.get(id) || 1) - 1, 0);
  if (nextCount === 0) {
    app.locals.counselorSocketCounts.delete(id);
    app.locals.onlineCounselors.delete(id);
  } else {
    app.locals.counselorSocketCounts.set(id, nextCount);
  }
};

io.on("connection", (socket) => {
  socket.on("chat:identify", ({ role, participantId } = {}) => {
    if ((role === "user" || role === "counselor") && participantId) {
      socket.join(`${role}:${participantId}`);

      if (
        socket.data.role === role &&
        socket.data.participantId === String(participantId)
      ) {
        socket.emit("counselor:presence", {
          onlineCounselorIds: Array.from(app.locals.onlineCounselors),
        });
        return;
      }

      if (socket.data.role === "counselor" && socket.data.participantId) {
        removeCounselorSocket(socket.data.participantId);
      }

      socket.data.role = role;
      socket.data.participantId = String(participantId);

      if (role === "counselor") {
        addCounselorSocket(participantId);
        broadcastCounselorPresence();
      } else {
        socket.emit("counselor:presence", {
          onlineCounselorIds: Array.from(app.locals.onlineCounselors),
        });
      }
    }
  });

  socket.on("conversation:join", ({ conversationId } = {}) => {
    if (conversationId) socket.join(`conversation:${conversationId}`);
  });

  socket.on("conversation:leave", ({ conversationId } = {}) => {
    if (conversationId) socket.leave(`conversation:${conversationId}`);
  });

  socket.on("call:offer", (payload) => {
    if (payload?.conversationId) {
      const targetRoom =
        payload.targetRole && payload.targetId
          ? `${payload.targetRole}:${payload.targetId}`
          : null;

      if (targetRoom) {
        socket.to(`conversation:${payload.conversationId}`).to(targetRoom).emit("call:offer", payload);
      } else {
        socket.to(`conversation:${payload.conversationId}`).emit("call:offer", payload);
      }
    }
  });

  socket.on("call:answer", (payload) => {
    if (payload?.conversationId) {
      socket.to(`conversation:${payload.conversationId}`).emit("call:answer", payload);
    }
  });

  socket.on("call:candidate", (payload) => {
    if (payload?.conversationId) {
      socket.to(`conversation:${payload.conversationId}`).emit("call:candidate", payload);
    }
  });

  socket.on("call:end", (payload) => {
    if (payload?.conversationId) {
      socket.to(`conversation:${payload.conversationId}`).emit("call:end", payload);
    }
  });

  socket.on("disconnect", () => {
    if (socket.data.role !== "counselor" || !socket.data.participantId) return;

    removeCounselorSocket(socket.data.participantId);
    broadcastCounselorPresence();
  });
});

server.listen(port, () => {
  console.log(`WellMind Mobile API running on http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start WellMind Mobile API:", error);
  process.exitCode = 1;
});
