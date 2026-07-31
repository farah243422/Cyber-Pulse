import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/session";

const app: Express = express();

// Trust the Replit / reverse-proxy X-Forwarded-* headers so that
// req.protocol and req.ip are correct, and secure cookies work.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// CORS — allow same-origin requests with credentials (for session cookies)
app.use(
  cors({
    origin: true,          // reflect the request origin (same-origin in Replit)
    credentials: true,     // allow cookies to be sent / received
  }),
);

// Session middleware must come before any route that needs req.session
app.use(sessionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
