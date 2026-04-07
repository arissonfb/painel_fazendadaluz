const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "painel-pecuario-secret-2026";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Pool error:", err.message);
});

app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "50mb" }));

function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Token não fornecido." });
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido." });
  }
}

app.get("/", (req, res) => res.json({ status: "ok", sistema: "Painel Pecuário API", versao: "1.0.0" }));

app.get("/api/health", async (req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok", db: "conectado" }); }
  catch (err) { res.status(503).json({ status: "degradado", error: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Login e senha obrigatórios." });
  try {
    const r = await pool.query("SELECT * FROM users WHERE username=$1", [username.trim()]);
    if (!r.rowCount) return res.status(401).json({ error: "Usuário ou senha incorretos." });
    const user = r.rows[0];
    if (!(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Usuário ou senha incorretos." });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, username: user.username, role: user.role });
  } catch (err) { console.error(err); res.status(500).json({ error: "Erro ao autenticar." }); }
});

app.get("/api/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
  try { res.json((await pool.query("SELECT id,username,role,created_at FROM users ORDER BY id")).rows); }
  catch (err) { res.status(500).json({ error: "Erro ao listar." }); }
});

app.post("/api/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
  const { username, password, role = "user" } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Campos obrigatórios." });
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query("INSERT INTO users(username,password_hash,role) VALUES($1,$2,$3) RETURNING id,username,role", [username.trim(), hash, role]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Usuário já existe." });
    res.status(500).json({ error: "Erro ao criar." });
  }
});

app.put("/api/users/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
  const { username, password } = req.body;
  try {
    if (password) { const h = await bcrypt.hash(password,10); await pool.query("UPDATE users SET username=$1,password_hash=$2 WHERE id=$3",[username.trim(),h,req.params.id]); }
    else { await pool.query("UPDATE users SET username=$1 WHERE id=$2",[username.trim(),req.params.id]); }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: "Erro ao atualizar." }); }
});

app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
  if (String(req.user.id) === String(req.params.id)) return res.status(400).json({ error: "Não pode remover próprio usuário." });
  try { await pool.query("DELETE FROM users WHERE id=$1",[req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "Erro ao remover." }); }
});

app.get("/api/data", authMiddleware, async (req, res) => {
  try {
    const r = await pool.query("SELECT payload,updated_at FROM farm_data WHERE id=1");
    res.json(r.rowCount ? { payload: r.rows[0].payload, updatedAt: r.rows[0].updated_at } : { payload: null });
  } catch (err) { console.error(err); res.status(500).json({ error: "Erro ao carregar." }); }
});

app.post("/api/data", authMiddleware, async (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(400).json({ error: "Payload obrigatório." });
  try {
    await pool.query("INSERT INTO farm_data(id,payload,updated_at,updated_by) VALUES(1,$1,NOW(),$2) ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,updated_at=NOW(),updated_by=EXCLUDED.updated_by",[payload,req.user.username]);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) { console.error(err); res.status(500).json({ error: "Erro ao salvar." }); }
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT DEFAULT 'user',created_at TIMESTAMPTZ DEFAULT NOW())`);
    await client.query(`CREATE TABLE IF NOT EXISTS farm_data(id INTEGER PRIMARY KEY DEFAULT 1,payload JSONB NOT NULL,updated_at TIMESTAMPTZ DEFAULT NOW(),updated_by TEXT)`);
    const ex = await client.query("SELECT id FROM users WHERE username=$1",["admin"]);
    if (!ex.rowCount) {
      const hash = await bcrypt.hash("daluz2026", 10);
      await client.query("INSERT INTO users(username,password_hash,role) VALUES($1,$2,$3)",["admin",hash,"admin"]);
      console.log("Admin criado: admin / daluz2026");
    }
    console.log("Banco inicializado.");
  } finally { client.release(); }
}

app.listen(PORT, () => {
  console.log(`Painel Pecuário API porta ${PORT}`);
  initDB().catch(err => console.error("DB init error:", err.message));
});
