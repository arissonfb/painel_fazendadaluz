const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "painel-pecuario-secret-2026";

// ─── Banco de dados ───────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "50mb" }));

// ─── Auth middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Token não fornecido." });
  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

// ─── Inicialização do banco ───────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS farm_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      updated_by TEXT
    );
  `);

  // Usuário admin padrão se não existir
  const exists = await pool.query("SELECT id FROM users WHERE username = $1", ["admin"]);
  if (exists.rowCount === 0) {
    const hash = await bcrypt.hash("daluz2026", 10);
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
      ["admin", hash, "admin"]
    );
    console.log("Usuário admin criado: admin / daluz2026");
  }

  console.log("Banco de dados inicializado.");
}

// ─── Rotas de saúde ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", sistema: "Painel Pecuário API", versao: "1.0.0" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Login e senha são obrigatórios." });

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1", [username.trim()]
    );
    if (result.rowCount === 0)
      return res.status(401).json({ error: "Usuário ou senha incorretos." });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Usuário ou senha incorretos." });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao autenticar." });
  }
});

// ─── Usuários ─────────────────────────────────────────────────────────────────
app.get("/api/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Acesso negado." });
  try {
    const result = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
});

app.post("/api/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Acesso negado." });
  const { username, password, role = "user" } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Login e senha são obrigatórios." });
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username.trim(), hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Usuário já existe." });
    console.error(err);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

app.put("/api/users/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Acesso negado." });
  const { username, password } = req.body;
  const { id } = req.params;
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET username=$1, password_hash=$2 WHERE id=$3",
        [username.trim(), hash, id]
      );
    } else {
      await pool.query("UPDATE users SET username=$1 WHERE id=$2", [username.trim(), id]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Acesso negado." });
  const { id } = req.params;
  if (String(req.user.id) === String(id))
    return res.status(400).json({ error: "Não é possível remover o próprio usuário." });
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover usuário." });
  }
});

// ─── Dados das fazendas ───────────────────────────────────────────────────────
app.get("/api/data", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT payload, updated_at FROM farm_data WHERE id=1");
    if (result.rowCount === 0) return res.json({ payload: null });
    res.json({
      payload: result.rows[0].payload,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar dados." });
  }
});

app.post("/api/data", authMiddleware, async (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(400).json({ error: "Payload não fornecido." });
  try {
    await pool.query(`
      INSERT INTO farm_data (id, payload, updated_at, updated_by)
      VALUES (1, $1, NOW(), $2)
      ON CONFLICT (id) DO UPDATE
        SET payload = EXCLUDED.payload,
            updated_at = NOW(),
            updated_by = EXCLUDED.updated_by
    `, [payload, req.user.username]);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar dados." });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Painel Pecuário API rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao inicializar banco:", err);
    process.exit(1);
  });
