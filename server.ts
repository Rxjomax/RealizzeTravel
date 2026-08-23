import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { createServer as createViteServer } from "vite";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security: Trust proxy since we are behind a reverse proxy (essential for rate limiting)
  app.set("trust proxy", 1);

  // Security: Helmet for HTTP headers including Content Security Policy (CSP) and HSTS (forces HTTPS)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Security: CORS configuration
  app.use(cors({ origin: "*" })); // Adjust origin in production

  // Middleware to parse JSON
  app.use(express.json());

  // Security: Rate limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Muitas requisições desta IP, por favor tente novamente mais tarde." },
  });

  app.use("/api/", apiLimiter);

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example of Server-side validation using express-validator
  // Prevent SQL injection / NoSQL injection by strictly validating inputs
  app.post(
    "/api/clients",
    [
      body("name").trim().notEmpty().withMessage("Nome é obrigatório").escape(),
      body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    ],
    (req: express.Request, res: express.Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Here you would normally save to the database safely (e.g., using parameterized queries or an ORM)
      const { name, email } = req.body;
      res.status(201).json({ message: "Cliente criado com sucesso (mock)", data: { name, email } });
    }
  );

  // Example: secure search endpoint (preventing injection)
  app.get(
    "/api/search",
    [
      body("query").trim().escape() // Sanitize input
    ],
    (req: express.Request, res: express.Response) => {
      const query = req.query.query;
      res.json({ results: [], message: "Busca segura (mock)" });
    }
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
