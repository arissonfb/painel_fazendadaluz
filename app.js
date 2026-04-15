const STORAGE_KEY = "painelPecuario.v2";
const API_URL = "https://painel-pecuario-api.onrender.com";

const FARM_CODE_PREFIXES = {
  "arapey":          "A",
  "colorado":        "C",
  "sarandi":         "S",
  "passa-da-guarda": "PG",
  "chiquita":        "CH",
};

function getFarmCodePrefix(farmId) {
  if (FARM_CODE_PREFIXES[farmId]) return FARM_CODE_PREFIXES[farmId];
  return (farmId || "X").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "X";
}

function generateMovementCode(farm) {
  farm.movementCodeSequence = (farm.movementCodeSequence || 0) + 1;
  const prefix = getFarmCodePrefix(farm.id);
  return prefix + String(farm.movementCodeSequence).padStart(5, "0");
}

function generateSanitaryCode(farm) {
  farm.sanitaryCodeSequence = (farm.sanitaryCodeSequence || 0) + 1;
  const prefix = getFarmCodePrefix(farm.id);
  return `SAN-${prefix}-${String(farm.sanitaryCodeSequence).padStart(5, "0")}`;
}

function extractMovementCodeSequence(code, farmId) {
  if (typeof code !== "string" || !code.trim()) return 0;
  const prefix = getFarmCodePrefix(farmId);
  const normalized = code.trim().toUpperCase();
  const prefixMatch = normalized.startsWith(prefix)
    ? normalized.slice(prefix.length).match(/(\d+)$/)
    : null;
  if (prefixMatch) {
    return Number(prefixMatch[1] || 0);
  }
  const fallbackMatch = normalized.match(/(\d+)$/);
  return fallbackMatch ? Number(fallbackMatch[1] || 0) : 0;
}

function compareMovementOrder(a, b) {
  const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
  if (dateCompare !== 0) return dateCompare;

  const sourceCompare = String(a.sourceId || "").localeCompare(String(b.sourceId || ""));
  if (sourceCompare !== 0) return sourceCompare;

  return String(a.id || "").localeCompare(String(b.id || ""));
}

function ensureMovementCodesForFarm(farm) {
  const prefix = getFarmCodePrefix(farm.id);
  const ordered = [...farm.movements].sort(compareMovementOrder);

  ordered.forEach((movement, index) => {
    movement.code = prefix + String(index + 1).padStart(5, "0");
  });

  farm.movementCodeSequence = ordered.length;
}

function ensureSanitaryCodesForFarm(farm) {
  const prefix = getFarmCodePrefix(farm.id);
  const ordered = [...farm.sanitaryRecords].sort(compareMovementOrder);

  ordered.forEach((record, index) => {
    record.code = `SAN-${prefix}-${String(index + 1).padStart(5, "0")}`;
  });

  farm.sanitaryCodeSequence = ordered.length;
}

const MOVEMENT_TYPES = [
  { value: "compra", label: "Compra", direction: 1 },
  { value: "venda", label: "Venda", direction: -1 },
  { value: "consumo", label: "Consumo", direction: -1 },
  { value: "nascimento", label: "Nascimento", direction: 1 },
  { value: "morte", label: "Morte", direction: -1 },
  { value: "ajuste", label: "Ajuste manual", direction: 0 },
  { value: "transferencia", label: "Transferência entre potreiros", direction: 0 }
];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const COLORS = [
  "#335c43",
  "#d39b5c",
  "#8a4b38",
  "#6f5f4d",
  "#7b9b6d",
  "#9d745f",
  "#517a60",
  "#bf7e42",
  "#5a4536"
];

const CATEGORY_VISUALS = {
  vaca: "./assets/cow.svg",
  terneiro: "./assets/calf.svg",
  touro: "./assets/bull.svg",
  rebanho: "./assets/herd.svg"
};

const STANDARD_FARM_CATEGORIES = [
  { id: "vacas-cria", name: "Vacas de cria" },
  { id: "terneiros-machos", name: "Terneiros 1 a 2 anos - machos" },
  { id: "terneiros-femeas", name: "Terneiros 1 a 2 anos - fêmeas" },
  { id: "bois-abate", name: "Bois de abate" },
  { id: "novilhas-entouradas", name: "Novilhas entouradas" },
  { id: "touros", name: "Touros" },
  { id: "vacas-invernar", name: "Vacas de invernar" },
  { id: "vacas-entouradas", name: "Vacas entouradas" }
];

const MONTHLY_REPORT_CATEGORIES = [
  { value: "estoque", label: "Controle de estoque animal" },
  { value: "sanitario", label: "Atividades sanitárias" },
  { value: "comercial", label: "Compra e venda" },
  { value: "operacional", label: "Operacional" },
  { value: "outros", label: "Outros" }
];

const DEFAULT_SANITARY_PRODUCTS = ["Vacina aftosa", "Vermífugo", "Ivermectina"];
const DEFAULT_POTREIROS = [];
const LEGACY_POTREIRO_PLACEHOLDERS = ["Potreiro 1", "Potreiro 2", "Potreiro Norte"];
const PREMIUM_SALE_FARMS = new Set(["arapey", "chiquita"]);
// Farms that operate in USD (Uruguay-based); all others use BRL
const FARM_CURRENCY_MAP = { arapey: "USD", chiquita: "USD" };
const TOTAL_FARM_ID = "total";
const UNALLOCATED_POTREIRO_KEY = "__unallocated__";
const ARAPEY_PRIMARY_GEO_KEYS = new Set([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "tapera",
  "pedreira",
  "costa",
  "molino",
  "chacra 10",
  "las pampas",
  "cerrillada",
  "piq rincon",
  "prad 7",
  "prad 8"
]);
const PDF_LOGO_PATH = "./assets/logo-da-luz-transp.png";
const TECHNICAL_MANAGER_NAME = "Hugo Fabricio Fernandes Balbuena";
const MOVEMENT_PHOTO_TYPES = new Set(["compra", "venda", "morte"]);
const MAX_MOVEMENT_PHOTOS = 6;
const MOVEMENT_PHOTO_MAX_DIMENSION = 1280;
const MOVEMENT_PHOTO_QUALITY = 0.82;
const CLOUDINARY_CLOUD_NAME = "dsmpclqqa";
const CLOUDINARY_UPLOAD_PRESET = "m6pymz4w";
const BACKUP_DATE_KEY = "painelPecuario.lastBackup";
const BACKUP_WARN_DAYS = 7;
const DEFAULT_USERS = [
  { id: "user-da-luz", login: "Hugo Balbuena", password: "hugo123", role: "admin" }
];

const IMPORTED_SANITARY_RECORDS = {
  arapey: [
    { sourceId: "xls-san-2026-03-31-arapey-campo-3-vacas-solteira", date: "2026-03-31", quantity: 162, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 3", product: "Potenty", notes: "" },
    { sourceId: "xls-san-2026-03-31-arapey-campo-10-vaquillonas", date: "2026-03-31", quantity: 405, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Campo 10", product: "Potenty", notes: "" },
    { sourceId: "xls-san-2026-03-31-arapey-campo-2-terneiros-0-1", date: "2026-03-31", quantity: 181, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Campo 2", product: "Dueto + Clostridiose+potenty", notes: "" },
    { sourceId: "xls-san-2026-03-31-arapey-campo-8-vacas-de-cria", date: "2026-03-31", quantity: 231, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 8", product: "Abamectina + Potenty", notes: "ESTAO NO CAMPO 5" },
    { sourceId: "xls-san-2026-03-31-arapey-cerrillada-terneiros-e-no", date: "2026-03-31", quantity: 551, categoryId: "terneiros-e-novillos", categoryName: "Terneiros E Novillos", potreiro: "Cerrillada", product: "Exolt", notes: "427 TERNEIROS - 117 NOVILLOS" },
    { sourceId: "xls-san-2026-03-26-arapey-campo-2-terneiros-0-1", date: "2026-03-26", quantity: 251, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Campo 2", product: "Dueto + Clostridiose+potenty", notes: "" },
    { sourceId: "xls-san-2026-03-25-arapey-campo-10-vaquillonas", date: "2026-03-25", quantity: 405, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Campo 10", product: "Potenty + Flok", notes: "" },
    { sourceId: "xls-san-2026-03-25-arapey-campo-5-vacas-de-cria", date: "2026-03-25", quantity: 313, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Potenty", notes: "ESTAO CAMPOS 5 E 3 JUNTOS" },
    { sourceId: "xls-san-2026-03-15-arapey-campo-8-vacas-de-cria", date: "2026-03-15", quantity: 274, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 8", product: "Potenty + Iver 1%", notes: "203 TERNEIROS / HAVIA MUITAS VAQUILLONAS JUNTO" },
    { sourceId: "xls-san-2026-03-13-arapey-campo-3-comida-bois", date: "2026-03-13", quantity: 115, categoryId: "bois", categoryName: "Bois", potreiro: "Campo 3 / Comida", product: "Fluron Gold + Iver 1% + Closantel", notes: "TOTAL 548 / FALTOU 3" },
    { sourceId: "xls-san-2026-03-13-arapey-campo-7-terneiros", date: "2026-03-13", quantity: 433, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Campo 7", product: "Fluron Gold + Iver 1% + Closantel", notes: "" },
    { sourceId: "xls-san-2026-03-09-arapey-chacra-do-10-touros", date: "2026-03-09", quantity: 126, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra Do 10", product: "Potenty + Iver 1%", notes: "" },
    { sourceId: "xls-san-2026-03-05-arapey-campo-2-vacas-solteira", date: "2026-03-05", quantity: 162, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 2", product: "Potenty + Iver 1%", notes: "" },
    { sourceId: "xls-san-2026-03-05-arapey-campo-5-vacas-de-cria", date: "2026-03-05", quantity: 141, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Potenty + Iver 1%", notes: "141 VC 118 TER" },
    { sourceId: "xls-san-2026-02-24-arapey-campo-7-vacas-de-cria", date: "2026-02-24", quantity: 267, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 7", product: "Exolt", notes: "267 VC 231 TER // CERTAMENTE TEM VACA DO 5" },
    { sourceId: "xls-san-2026-02-24-arapey-campo-6-vacas-de-cria", date: "2026-02-24", quantity: 90, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 6", product: "Potenty + Injetavel", notes: "90 VC 69 TER" },
    { sourceId: "xls-san-2026-02-23-arapey-campo-3-vacas-de-cria", date: "2026-02-23", quantity: 193, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 3", product: "Potenty + Injetavel", notes: "193 VC 151 TER(NOS TERNEIROS MOXIDECTINA E INSEMAx)" },
    { sourceId: "xls-san-2026-02-11-arapey-campo-7-vacas-de-cria", date: "2026-02-11", quantity: 256, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 7", product: "Potenty + Flok", notes: "256 VC 226 TER 10 TOR" },
    { sourceId: "xls-san-2026-02-11-arapey-campo-5-vacas-de-cria", date: "2026-02-11", quantity: 150, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Potenty + Flok", notes: "150 VC 118 TER 9 TOR" },
    { sourceId: "xls-san-2026-02-11-arapey-cerrillada-novillos", date: "2026-02-11", quantity: 153, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fortik 4 + Flok", notes: "NOVILLOS COLA CORTA" },
    { sourceId: "xls-san-2026-02-09-arapey-cerrillada-novillos", date: "2026-02-09", quantity: 529, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fortik 4 + Flok", notes: "Novillos cola larga  e TERNEIROS" },
    { sourceId: "xls-san-2026-02-05-arapey-chacra-do-10-toros", date: "2026-02-05", quantity: 46, categoryId: "toros", categoryName: "Toros", potreiro: "Chacra Do 10", product: "Pontenty + Iver", notes: "" },
    { sourceId: "xls-san-2026-02-05-arapey-campo-1-terneiros-m", date: "2026-02-05", quantity: 28, categoryId: "terneiros-m", categoryName: "Terneiros M", potreiro: "Campo 1", product: "Moxedectina + Potenty", notes: "" },
    { sourceId: "xls-san-2026-02-05-arapey-campo-2-vacas-solteira", date: "2026-02-05", quantity: 164, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 2", product: "Potenty + Flok", notes: "164 VC 6 TOUR" },
    { sourceId: "xls-san-2026-02-03-arapey-campo-8-vacas-de-cria", date: "2026-02-03", quantity: 230, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 8", product: "Potenty + Flok", notes: "230 VC 209 TER 21 TOR" },
    { sourceId: "xls-san-2026-02-03-arapey-campo-10-vacas-de-cria", date: "2026-02-03", quantity: 173, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 10", product: "Potenty + Flok", notes: "173 VC 141 TER 13 TOR" },
    { sourceId: "xls-san-2026-02-03-arapey-campo-6-vacas-de-cria", date: "2026-02-03", quantity: 90, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 6", product: "Moxedectina + Potenty", notes: "90 VC 70 TER 3 TOR" },
    { sourceId: "xls-san-2026-01-30-arapey-campo-3-vacas-solteira", date: "2026-01-30", quantity: 393, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 3", product: "Potenty + Flok", notes: "393 VC 21 TOR" },
    { sourceId: "xls-san-2026-01-29-arapey-campo-9-terneiras-1-2", date: "2026-01-29", quantity: null, categoryId: "terneiras-1-2", categoryName: "Terneiras 1-2", potreiro: "Campo 9", product: "Potenty", notes: "VER QUANTIDADE" },
    { sourceId: "xls-san-2026-01-28-arapey-campo-7-vacas-de-cria", date: "2026-01-28", quantity: 257, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 7", product: "Potenty", notes: "SAIRAM 5 VACAS E 5 TERNEIROS - FICARAM 252 VC 214 TER 12 TOR" },
    { sourceId: "xls-san-2026-01-21-arapey-campo-5-vacas-de-cria", date: "2026-01-21", quantity: 153, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Potenty", notes: "SAIRAM 11 VACAS E 8 TERNEIROS - FICARAM 142 VC 117 TER 6 TOR" },
    { sourceId: "xls-san-2026-01-21-arapey-campo-4-novillos", date: "2026-01-21", quantity: 109, categoryId: "novillos", categoryName: "Novillos", potreiro: "Campo 4", product: "Nexlander", notes: "107+2 RENGOS" },
    { sourceId: "xls-san-2026-01-21-arapey-cerrillada-novillos", date: "2026-01-21", quantity: 144, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fipronil", notes: "" },
    { sourceId: "xls-san-2026-01-21-arapey-cerrillada-terneiros", date: "2026-01-21", quantity: 381, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Fipronil", notes: "TOTAL CERRILLADA 682 COM A VACA" },
    { sourceId: "xls-san-2026-01-20-arapey-cerrillada-novillos", date: "2026-01-20", quantity: 156, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fipronil + Nexlaner Em 50", notes: "" },
    { sourceId: "xls-san-2026-01-19-arapey-campo-8-vaca-de-cria", date: "2026-01-19", quantity: 225, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 8", product: "Potenty + Iver 3,15", notes: "SAIRAM 35 VACAS TOTAL 155 VACAS 154 TERNEIROS" },
    { sourceId: "xls-san-2026-01-19-arapey-campo-2-vacas-solteira", date: "2026-01-19", quantity: 190, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 2", product: "Potenty + Iver 3,15", notes: "" },
    { sourceId: "xls-san-2026-01-17-arapey-campo-3-vaquillona", date: "2026-01-17", quantity: 384, categoryId: "vaquillona", categoryName: "Vaquillona", potreiro: "Campo 3", product: "Potenty + Iver 3,15", notes: "" },
    { sourceId: "xls-san-2026-01-13-arapey-campo-10-vaca-de-cria", date: "2026-01-13", quantity: null, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 10", product: "Potenty + Iver 3,15", notes: "" },
    { sourceId: "xls-san-2026-01-13-arapey-campo-5-vaca-de-cria", date: "2026-01-13", quantity: 146, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 5", product: "Potenty + Iver 3,15", notes: "146 VC 123 TER 6 TOUR" },
    { sourceId: "xls-san-2026-01-08-arapey-campo-6-vaca-de-cria", date: "2026-01-08", quantity: 90, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 6", product: "Potenty + Iver 3,15", notes: "90 VC 69 TER 3 TOR" },
    { sourceId: "xls-san-2026-01-08-arapey-campo-7-vaca-de-cria", date: "2026-01-08", quantity: 270, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 7", product: "Potenty + Iver 3,15", notes: "270VC 245 TER 4 TOR" },
    { sourceId: "xls-san-2026-01-08-arapey-cerrillada-novillos", date: "2026-01-08", quantity: 314, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fc30 + Closantel + Fluazuron", notes: "684 TOTAL -OK" },
    { sourceId: "xls-san-2026-01-07-arapey-cerrillada-terneiros", date: "2026-01-07", quantity: 370, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Fc30 + Closantel + Fluazuron", notes: "" },
    { sourceId: "xls-san-2025-12-26-arapey-tapera-campo-9-terneiras", date: "2025-12-26", quantity: 384, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Tapera-> Campo 9", product: "Potenty + Closantel + Iver 3,15", notes: "382 FORAM PRA O 9 , TERIA QUE SER 388" },
    { sourceId: "xls-san-2025-12-26-arapey-campo-1-las-pampa-vaca-ivernar", date: "2025-12-26", quantity: 66, categoryId: "vaca-ivernar", categoryName: "Vaca Ivernar", potreiro: "Campo 1 -> Las Pampa", product: "Nexlander", notes: "VAI FICAR MENOS PORQUE TEM UMAS DE CRIA" },
    { sourceId: "xls-san-2025-12-22-arapey-campo-7-vaca-primipara", date: "2025-12-22", quantity: 270, categoryId: "vaca-primipara", categoryName: "Vaca Primipara", potreiro: "Campo 7", product: "Potenty", notes: "240 TERNEIRO, 8 TOURO" },
    { sourceId: "xls-san-2025-12-22-arapey-campo-4-bois-gordo", date: "2025-12-22", quantity: 149, categoryId: "bois-gordo", categoryName: "Bois Gordo", potreiro: "Campo 4", product: "Nexlander", notes: "141 SÃO BOIS , RESTO TOURINHOS" },
    { sourceId: "xls-san-2025-12-19-arapey-campo-6-vacas-de-cria", date: "2025-12-19", quantity: 86, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 6", product: "Potenty", notes: "72 TERNEIRO , 5 TOUROS" },
    { sourceId: "xls-san-2025-12-19-arapey-campo-5-vacas-de-cria", date: "2025-12-19", quantity: 147, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Potenty", notes: "117 TERNEIRO 6 TOUROS" },
    { sourceId: "xls-san-2025-12-19-arapey-campo-3-vacas-solteira", date: "2025-12-19", quantity: 344, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 3", product: "Potenty", notes: "FALTA VACA DOS 2 LOTES - CONFERIR - 9 TOURO" },
    { sourceId: "xls-san-2025-12-18-arapey-campo-2-vacas-solteira", date: "2025-12-18", quantity: 206, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 2", product: "Potenty", notes: "6 TOUROS" },
    { sourceId: "xls-san-2025-12-15-arapey-campo-8-vacas-de-cria", date: "2025-12-15", quantity: 257, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 8", product: "Potenty", notes: "ESTA NA COSTA , NÃO TENHO CERTEZA A QUANTIDADA, TERNEIROS 247" },
    { sourceId: "xls-san-2025-12-14-arapey-campo-3-vacas-solteira", date: "2025-12-14", quantity: 216, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 3", product: "Fc 30 + Amitraz + Aba 1%", notes: "VAQUILLONAS JUNTO" },
    { sourceId: "xls-san-2025-12-01-arapey-campo-2-vacas-solteira", date: "2025-12-01", quantity: 350, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Campo 2", product: "Fc 30 + Amitraz + Aba 1%", notes: "VAQUILLONAS JUNTO" },
    { sourceId: "xls-san-2025-11-29-arapey-chacra-do-10-touros", date: "2025-11-29", quantity: 75, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra Do 10", product: "Nexlander", notes: "" },
    { sourceId: "xls-san-2025-11-27-arapey-las-pampas-terneiras", date: "2025-11-27", quantity: 74, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Las Pampas", product: "Fluron Gold", notes: "" },
    { sourceId: "xls-san-2025-11-27-arapey-molino-bois-pr-gordo", date: "2025-11-27", quantity: 66, categoryId: "bois-pr-gordo", categoryName: "Bois Pré Gordo", potreiro: "Molino", product: "Insemax", notes: "" },
    { sourceId: "xls-san-2025-11-27-arapey-tapera-terneiras", date: "2025-11-27", quantity: null, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Tapera", product: "Carbeson", notes: "FALTOU CONTA" },
    { sourceId: "xls-san-2025-10-26-arapey-campo-7-vaca-primipara", date: "2025-10-26", quantity: null, categoryId: "vaca-primipara", categoryName: "Vaca Primipara", potreiro: "Campo 7", product: "Carbeson", notes: "FALTOU CONTA" },
    { sourceId: "xls-san-2025-11-20-arapey-campo-8-vacas-cria", date: "2025-11-20", quantity: 253, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 8", product: "Fc 30 + Amitraz + Aba 1%", notes: "238 TERNEIROS + 9 TOUROS" },
    { sourceId: "xls-san-2025-11-17-arapey-campo-7-vacas-cria", date: "2025-11-17", quantity: 111, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 7", product: "Fc 30 + Amitraz + Aba 1%", notes: "92 TERNEIROS" },
    { sourceId: "xls-san-2025-11-17-arapey-cerrillada-terneiros", date: "2025-11-17", quantity: 392, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Nexlander", notes: "685 TOTAL + 1 VACA CRIA" },
    { sourceId: "xls-san-2025-11-17-arapey-cerrillada-novillos", date: "2025-11-17", quantity: 294, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Nexlander", notes: "" },
    { sourceId: "xls-san-2025-11-17-arapey-campo-6-vaca-de-cria", date: "2025-11-17", quantity: 109, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Campo 6", product: "Fc 30 + Amitraz + Aba 1%", notes: "48 terneiros 3 touros" },
    { sourceId: "xls-san-2025-11-13-arapey-campo-5-vaca-plantel", date: "2025-11-13", quantity: 138, categoryId: "vaca-plantel", categoryName: "Vaca Plantel", potreiro: "Campo 5", product: "Fc 30 + Amitraz + Aba 1%", notes: "146 terneiro 5 touro" },
    { sourceId: "xls-san-2025-11-11-arapey-chacra-10-touros", date: "2025-11-11", quantity: 75, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra 10", product: "Fluron Gold + Iver 4%", notes: "" },
    { sourceId: "xls-san-2025-11-11-arapey-campo-2-terneiras", date: "2025-11-11", quantity: 372, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Campo 2", product: "Fc 30 + Abamectina 1% + Levamisol", notes: "FORAM PARA TAPERA / FALTOU 2" },
    { sourceId: "xls-san-2025-11-10-arapey-costa-vacas-solteira", date: "2025-11-10", quantity: 211, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Costa", product: "Fc 30", notes: "TOQUE / SAIRAM 12 PRENHA" },
    { sourceId: "xls-san-2025-11-04-arapey-pedreira-vaquillons", date: "2025-11-04", quantity: 361, categoryId: "vaquillons", categoryName: "Vaquillons", potreiro: "Pedreira", product: "Fc 30", notes: "TOQUE / TODAS VAZIAS" },
    { sourceId: "xls-san-2025-11-04-arapey-cerrillada-novillos", date: "2025-11-04", quantity: 283, categoryId: "novillos", categoryName: "Novillos", potreiro: "Cerrillada", product: "Fc 30 + Levamisol + Flok 1%", notes: "TOTAL 681 - FALTAM 2" },
    { sourceId: "xls-san-2025-11-04-arapey-cerrillada-terneiros", date: "2025-11-04", quantity: 398, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Fc 30 + Levamisol + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-10-31-arapey-pedreira-rincon-vaquillonas", date: "2025-10-31", quantity: 396, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Pedreira (rincon)", product: "Furius + Flok 1%", notes: "FALTARIA 1" },
    { sourceId: "xls-san-2025-10-30-arapey-costa-rincon-vacas-solteira", date: "2025-10-30", quantity: 186, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Costa (rincon)", product: "Furius + Flok 1%", notes: "2 A MAIS DO LOTE" },
    { sourceId: "xls-san-2025-10-30-arapey-tapera-rincon-vacas-invernad", date: "2025-10-30", quantity: 60, categoryId: "vacas-invernada", categoryName: "Vacas Invernada", potreiro: "Tapera (rincon)", product: "Maximo", notes: "3 ESTA COM CRIA AO PÉ 2 SÃO ARRENA" },
    { sourceId: "xls-san-2025-10-30-arapey-molino-rincon-bois-pr-gordo", date: "2025-10-30", quantity: 66, categoryId: "bois-pr-gordo", categoryName: "Bois Pré Gordo", potreiro: "Molino (rincon)", product: "Maximo + Moxidectina", notes: "3 ESTAO NO 4" },
    { sourceId: "xls-san-2025-10-20-arapey-las-pampas-terneiros-0-1", date: "2025-10-20", quantity: 74, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Las Pampas", product: "Furius + Flok 1%", notes: "MORREU 1" },
    { sourceId: "xls-san-2025-10-15-arapey-cerrillada-terneiros-0-1", date: "2025-10-15", quantity: 396, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Cerrillada", product: "Furius + Iver + Nitroxinil", notes: "" },
    { sourceId: "xls-san-2025-10-15-arapey-campo-2-terneiras-0-1", date: "2025-10-15", quantity: 373, categoryId: "terneiras-0-1", categoryName: "Terneiras 0-1", potreiro: "Campo 2", product: "Furius + Iver + Nitroxinil", notes: "FALTOU 1" },
    { sourceId: "xls-san-2025-10-14-arapey-chacra-10-touros", date: "2025-10-14", quantity: 115, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra 10", product: "Furius + Iver + Nitroxinil", notes: "FALTOU 1 QUE ESTA NO 4" },
    { sourceId: "xls-san-2025-10-13-arapey-campo-10-vacas-cria", date: "2025-10-13", quantity: 139, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 10", product: "Supratick + Flok 1%", notes: "135 TERNEIROS - TREO" },
    { sourceId: "xls-san-2025-10-07-arapey-campo-3-vacas-cria", date: "2025-10-07", quantity: 154, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 3", product: "Supratick + Flok 1%", notes: "145 TERNEIROS - TREO" },
    { sourceId: "xls-san-2025-10-07-arapey-campo-1-vacas-cria", date: "2025-10-07", quantity: 59, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 1", product: "Supratick + Flok 1%", notes: "57 VACA 1 VAQ 1 TERNEIRA" },
    { sourceId: "xls-san-2025-10-02-arapey-campo-8-vacas-cria", date: "2025-10-02", quantity: 250, categoryId: "vacas-cria", categoryName: "Vacas Cria", potreiro: "Campo 8", product: "Supratick + Flok 1%", notes: "210 TERNEIROS - TREO" },
    { sourceId: "xls-san-2025-10-01-arapey-las-pampas-terneiros-0-1", date: "2025-10-01", quantity: 75, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Las Pampas", product: "Supratick + Iver + Nitroxinil", notes: "FALTOU 2" },
    { sourceId: "xls-san-2025-09-30-arapey-campo-5-vacas-prenha", date: "2025-09-30", quantity: 146, categoryId: "vacas-prenha", categoryName: "Vacas Prenha", potreiro: "Campo 5", product: "Supratick + Flok 1%", notes: "76 TERNEIROS - TREO" },
    { sourceId: "xls-san-2025-09-30-arapey-pedreira-p-rincon-vacas-solteira", date: "2025-09-30", quantity: 192, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Pedreira - P. Rincon", product: "Reprodutiva", notes: "" },
    { sourceId: "xls-san-2025-09-27-arapey-campo-6-vacas-pre-adas", date: "2025-09-27", quantity: 109, categoryId: "vacas-pre-adas", categoryName: "Vacas Preñadas", potreiro: "Campo 6", product: "Supratick + Flok", notes: "" },
    { sourceId: "xls-san-2025-09-27-arapey-moinho-posto-rinco-noviilos", date: "2025-09-27", quantity: 69, categoryId: "noviilos", categoryName: "Noviilos", potreiro: "Moinho (posto Rincon)", product: "Maximo + Albendazole", notes: "" },
    { sourceId: "xls-san-2025-09-24-arapey-cerrillada-288-novillos", date: "2025-09-24", quantity: 288, categoryId: "288-novillos", categoryName: "288 Novillos", potreiro: "Cerrillada", product: "Maximo + Albendazole", notes: "1 VACA COM CRIA" },
    { sourceId: "xls-san-2025-09-24-arapey-campo-4-1-touro-15-tor", date: "2025-09-24", quantity: null, categoryId: "1-touro-15-torinhos", categoryName: "1 Touro 15 Torinhos", potreiro: "Campo 4", product: "Maximo + Iver + Nitroxi", notes: "" },
    { sourceId: "xls-san-2025-09-23-arapey-campo-4-novillos", date: "2025-09-23", quantity: 134, categoryId: "novillos", categoryName: "Novillos", potreiro: "Campo 4", product: "Maximo + Iver + Nitroxi", notes: "" },
    { sourceId: "xls-san-2025-09-17-arapey-pradeira-7-novillos-gordo", date: "2025-09-17", quantity: 93, categoryId: "novillos-gordo", categoryName: "Novillos Gordo", potreiro: "Pradeira 7", product: "Maximo", notes: "TOTAL 95 COM 2 MANUFA" },
    { sourceId: "xls-san-2025-09-10-arapey-campo-9-vaquillonas-2-", date: "2025-09-10", quantity: 399, categoryId: "vaquillonas-2-anos", categoryName: "Vaquillonas 2 Anos", potreiro: "Campo 9", product: "Insemax+iver+nitrox+ Reprodutiva", notes: "sairam 2 descarte ficaram 397" },
    { sourceId: "xls-san-2025-09-11-arapey-chacra-do-8-geral", date: "2025-09-11", quantity: 30, categoryId: "geral", categoryName: "Geral", potreiro: "Chacra Do 8", product: "Vacas De Invernar", notes: "" },
    { sourceId: "xls-san-2025-09-10-arapey-chacra-do-8-geral", date: "2025-09-10", quantity: 77, categoryId: "geral", categoryName: "Geral", potreiro: "Chacra Do 8", product: "Terneiros", notes: "SE AGREGOU 12 , FICOU 77 TOTAL" },
    { sourceId: "xls-san-2025-09-09-arapey-campo-2-cerrillada-terneiros", date: "2025-09-09", quantity: 396, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Campo 2 --> Cerrillada", product: "Sem Produto", notes: "" },
    { sourceId: "xls-san-2025-09-09-arapey-cerrillada-terneiros", date: "2025-09-09", quantity: 396, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Evol + Insemax", notes: "MACHO" },
    { sourceId: "xls-san-2025-08-28-arapey-campo-2-terneiras", date: "2025-08-28", quantity: 376, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Campo 2", product: "Evol + Insemax", notes: "HEMBRA" },
    { sourceId: "xls-san-2025-08-28-arapey-tapera-vaca-invernar", date: "2025-08-28", quantity: 62, categoryId: "vaca-invernar", categoryName: "Vaca Invernar", potreiro: "Tapera", product: "Insemax + Contratack", notes: "1 PARIDA" },
    { sourceId: "xls-san-2025-08-27-arapey-costa-vacas-vazias", date: "2025-08-27", quantity: 192, categoryId: "vacas-vazias", categoryName: "Vacas Vazias", potreiro: "Costa", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-27-arapey-campo-10-vaca-prenha", date: "2025-08-27", quantity: 164, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 10", product: "Insemax + Contratack", notes: "ENTROU VACAS CERRILLADA TOTAL 122 DIA 28/8" },
    { sourceId: "xls-san-2025-08-27-arapey-campo-3-vaca-prenha", date: "2025-08-27", quantity: 151, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 3", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-27-arapey-cerrillada-las-pam-bois", date: "2025-08-27", quantity: 114, categoryId: "bois", categoryName: "Bois", potreiro: "Cerrillada --> Las Pampa", product: "-", notes: "" },
    { sourceId: "xls-san-2025-08-26-arapey-campo-8-vaca-prenha", date: "2025-08-26", quantity: 278, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 8", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-26-arapey-campo-7-vaca-prenha", date: "2025-08-26", quantity: 143, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 7", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-26-arapey-campo-6-vaca-prenha", date: "2025-08-26", quantity: 109, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 6", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-09-arapey-campo-5-vaca-prenha", date: "2025-08-09", quantity: 149, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Campo 5", product: "Insemax + Contratack", notes: "" },
    { sourceId: "xls-san-2025-08-09-arapey-campo-2-terneros", date: "2025-08-09", quantity: 24, categoryId: "terneros", categoryName: "Terneros", potreiro: "Campo 2", product: "Evol", notes: "TERNEIROS PEQUENOS QUE FICARAM NA CHACRA 8" },
    { sourceId: "xls-san-2025-07-30-arapey-campo-2-terneros", date: "2025-07-30", quantity: 123, categoryId: "terneros", categoryName: "Terneros", potreiro: "Campo 2", product: "Evol", notes: "TERNEIROS GRANDE QUE SAIRAM DA CHACRA 8" },
    { sourceId: "xls-san-2025-07-30-arapey-cerrillada-vacas-pre-adas", date: "2025-07-30", quantity: 123, categoryId: "vacas-pre-adas", categoryName: "Vacas Preñadas", potreiro: "Cerrillada", product: "Insemax + Iver 3,15", notes: "120 VACAS 1 VAQ 2 TERNEIRA" },
    { sourceId: "xls-san-2025-07-30-arapey-cerrillada-novillos-1-2", date: "2025-07-30", quantity: 109, categoryId: "novillos-1-2", categoryName: "Novillos 1-2", potreiro: "Cerrillada", product: "Furius + Iver 3,15", notes: "109 VAI PARA MOLINO - POSTO RINCON" },
    { sourceId: "xls-san-2025-07-30-arapey-cerrillada-novillos-1-2-1", date: "2025-07-30", quantity: 293, categoryId: "novillos-1-2", categoryName: "Novillos 1-2", potreiro: "Cerrillada", product: "Insemax + Iver 3,15", notes: "109 Grande - 293 Pequeno monte - 1 rengo" },
    { sourceId: "xls-san-2025-07-30-arapey-pradeira-7-vacas-invernad", date: "2025-07-30", quantity: 94, categoryId: "vacas-invernada", categoryName: "Vacas Invernada", potreiro: "Pradeira 7", product: "Amitraz", notes: "91 VACA INVERNA 2 Nov rengo 1 Vaq" },
    { sourceId: "xls-san-2025-07-30-arapey-molino-novillos", date: "2025-07-30", quantity: 89, categoryId: "novillos", categoryName: "Novillos", potreiro: "Molino", product: "Insemax + Levamisol", notes: "Novillos menor" },
  ],
  chiquita: [
    { sourceId: "xls-san-2026-04-02-chiquita-4-e-5-do-bido-terneiras-1-2", date: "2026-04-02", quantity: null, categoryId: "terneiras-1-2", categoryName: "Terneiras 1-2", potreiro: "4 E 5 Do Bido", product: "Carbazol + Potenty", notes: "" },
    { sourceId: "xls-san-2026-03-26-chiquita-5-do-posto-vacas-de-cria", date: "2026-03-26", quantity: 126, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "5 Do Posto", product: "Fc 30 + Iver 1%", notes: "" },
    { sourceId: "xls-san-2026-03-27-chiquita-campo-5-vacas-de-cria", date: "2026-03-27", quantity: 170, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 5", product: "Fc 30 + Iver 1%", notes: "" },
    { sourceId: "xls-san-2026-03-27-chiquita-campo-4-vacas-de-cria", date: "2026-03-27", quantity: 86, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo 4", product: "Fc 30 + Iver 1%", notes: "84 TERNEIRO" },
    { sourceId: "xls-san-2026-03-25-chiquita-2-do-bido-terneiros-0-1", date: "2026-03-25", quantity: 241, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "2 Do Bido", product: "Fc 30 + Iver 1%", notes: "" },
    { sourceId: "xls-san-2026-03-24-chiquita-3-do-caminho-touros", date: "2026-03-24", quantity: 70, categoryId: "touros", categoryName: "Touros", potreiro: "3 Do Caminho", product: "Biopersol", notes: "" },
    { sourceId: "xls-san-2026-03-21-chiquita--cut", date: "2026-03-21", quantity: 134, categoryId: "cut", categoryName: "Cut", potreiro: "-", product: "Biopersol", notes: "VACAS FRACA SE FEZ BIOPERSOL" },
    { sourceId: "xls-san-2026-03-18-chiquita-6-do-posto-vacas-de-cria", date: "2026-03-18", quantity: 126, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "6 Do Posto", product: "Fc 30 + Iver 1%", notes: "120 TERNEIROS" },
    { sourceId: "xls-san-2026-03-11-chiquita-4-do-posto-vacas-de-cria", date: "2026-03-11", quantity: 86, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "4 Do Posto", product: "Fc 30 + Iver 1%", notes: "84 TERNEIRO" },
    { sourceId: "xls-san-2026-03-11-chiquita-5-do-posto-vacas-de-cria", date: "2026-03-11", quantity: 170, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "5 Do Posto", product: "Fc 30 + Iver 1%", notes: "163 TERNEIRO" },
    { sourceId: "xls-san-2026-03-03-chiquita-campo-9-roffus-vaquillonas-1-", date: "2026-03-03", quantity: 70, categoryId: "vaquillonas-1-2-ano", categoryName: "Vaquillonas 1-2 Ano", potreiro: "Campo 9 Roffus", product: "Potenty + Iver 1% + Closantel", notes: "DE VENDA" },
    { sourceId: "xls-san-2026-03-03-chiquita-4-5-do-bido-vaquillonas-1-", date: "2026-03-03", quantity: 567, categoryId: "vaquillonas-1-2-ano", categoryName: "Vaquillonas 1-2 Ano", potreiro: "4/5 Do Bido", product: "Potenty + Iver 1% + Closantel", notes: "" },
    { sourceId: "xls-san-2026-03-03-chiquita-pradeira-do-6-novillos-1-2-a", date: "2026-03-03", quantity: 100, categoryId: "novillos-1-2-anos", categoryName: "Novillos 1-2 Anos", potreiro: "Pradeira Do 6", product: "Exolt + Levamisol", notes: "DE VENDA" },
    { sourceId: "xls-san-2026-03-03-chiquita-pradeira-do-6-novillos-1-2-a-1", date: "2026-03-03", quantity: 506, categoryId: "novillos-1-2-anos", categoryName: "Novillos 1-2 Anos", potreiro: "Pradeira Do 6", product: "Fc 30 + Levamisol", notes: "FALTARAM 9 , MAS  SE ACHOU" },
    { sourceId: "xls-san-2026-02-26-chiquita-3-do-caminho-touros", date: "2026-02-26", quantity: 149, categoryId: "touros", categoryName: "Touros", potreiro: "3 Do Caminho", product: "Potenty + Iver 2%", notes: "" },
    { sourceId: "xls-san-2026-02-25-chiquita-4-do-bom-retiro-vaca-de-cria", date: "2026-02-25", quantity: 72, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "4 Do Bom Retiro", product: "Potenty + Iver 2%", notes: "72 VC 36 TER" },
    { sourceId: "xls-san-2026-02-25-chiquita-telmo-vaca-de-cria", date: "2026-02-25", quantity: 59, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Telmo", product: "Potenty + Iver 2%", notes: "59 VC 52 TER" },
    { sourceId: "xls-san-2026-02-24-chiquita-alamo-vaca-de-cria", date: "2026-02-24", quantity: 146, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Alamo", product: "Potenty + Iver 2%", notes: "146 VC 141 TER" },
    { sourceId: "xls-san-2026-02-25-chiquita-bido-de-cima-terneiros", date: "2026-02-25", quantity: 119, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Bido De Cima", product: "Clostrid/ Ivomec F /", notes: "JÁ ESTAVAM COM EXOLT" },
    { sourceId: "xls-san-2026-02-21-chiquita-quiroga-vacas-de-cria", date: "2026-02-21", quantity: 199, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Quiroga", product: "Potenty + Iver 2%", notes: "199 VC 195 TER" },
    { sourceId: "xls-san-2026-02-20-chiquita-roffus-frente-terneiros", date: "2026-02-20", quantity: 78, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Roffus - Frente", product: "Exolt/clostrid/ Onix/antibiot", notes: "TERNEIROS COMPRADOS CAPADOS" },
    { sourceId: "xls-san-2026-02-20-chiquita-charrua-vacas-de-cria", date: "2026-02-20", quantity: 67, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Charrua", product: "Potenty + Iver 2%", notes: "67 VC 64 TER 3 TOR" },
    { sourceId: "xls-san-2026-02-18-chiquita-8-do-bido-vacas-de-cria", date: "2026-02-18", quantity: 144, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "8 Do Bido", product: "Potenty + Iver 2%", notes: "144 VC 143 TER" },
    { sourceId: "xls-san-2026-02-18-chiquita-roffus-pelado-novillos-n4", date: "2026-02-18", quantity: null, categoryId: "novillos-n4", categoryName: "Novillos N4", potreiro: "Roffus Pelado", product: "Carbazol", notes: "315+ 17 FALTARAM" },
    { sourceId: "xls-san-2026-02-17-chiquita-pradeira-do-6-novillos-n4", date: "2026-02-17", quantity: null, categoryId: "novillos-n4", categoryName: "Novillos N4", potreiro: "Pradeira Do 6", product: "Carbazol", notes: "281 + 1 FICOU +1 MORREU" },
    { sourceId: "xls-san-2026-02-15-chiquita-1-do-bido-vacas-de-cria", date: "2026-02-15", quantity: 96, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "1 Do Bido", product: "Potenty + Iver 2%", notes: "96 VC 93 TER" },
    { sourceId: "xls-san-2026-02-15-chiquita-2-do-bido-vacas-solteira", date: "2026-02-15", quantity: 96, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "2 Do Bido", product: "Potenty + Iver 2%", notes: "" },
    { sourceId: "xls-san-2026-02-14-chiquita-campo-novo-vacas-cut", date: "2026-02-14", quantity: 132, categoryId: "vacas-cut", categoryName: "Vacas Cut", potreiro: "Campo Novo", product: "Potenty + Iver 2%", notes: "132 VC 130 TER" },
    { sourceId: "xls-san-2026-02-10-chiquita-6-7-do-bido-terneiras-h-1-", date: "2026-02-10", quantity: 621, categoryId: "terneiras-h-1-2", categoryName: "Terneiras (h) 1-2", potreiro: "6/7 Do Bido", product: "Pontenty + Carbazol", notes: "FALTAM 4 ( OU MAIS VER BEM)" },
    { sourceId: "xls-san-2026-02-07-chiquita-telmo-vaca-de-1-cria", date: "2026-02-07", quantity: 51, categoryId: "vaca-de-1-cria", categoryName: "Vaca De 1 Cria", potreiro: "Telmo", product: "Potenty + Iver 2%", notes: "51 VC 48 TER 2 TOR" },
    { sourceId: "xls-san-2026-02-06-chiquita-3-da-estancia-vaquillonas", date: "2026-02-06", quantity: 284, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "3 Da Estancia", product: "Potenty + Iver 2%", notes: "FALTAM 11" },
    { sourceId: "xls-san-2026-02-05-chiquita-4-5-do-bido-terneiras-h-0-", date: "2026-02-05", quantity: 631, categoryId: "terneiras-h-0-1", categoryName: "Terneiras (h) 0-1", potreiro: "4/5 Do Bido", product: "Potenty + Closantel", notes: "FALTOU 12 E 1 MORREU" },
    { sourceId: "xls-san-2026-01-27-chiquita-3-do-caminho-toros", date: "2026-01-27", quantity: 93, categoryId: "toros", categoryName: "Toros", potreiro: "3 Do Caminho", product: "Potenty", notes: "71 DE 2 ANOS E 22 ADULTOS" },
    { sourceId: "xls-san-2026-01-24-chiquita-telmo-vaca-de-1-cria", date: "2026-01-24", quantity: 51, categoryId: "vaca-de-1-cria", categoryName: "Vaca De 1 Cria", potreiro: "Telmo", product: "Potenty", notes: "51 VC 49 TER 2 TOR" },
    { sourceId: "xls-san-2026-01-22-chiquita-charrua-vaca-de-cria-c", date: "2026-01-22", quantity: 67, categoryId: "vaca-de-cria-cola", categoryName: "Vaca De Cria / Cola", potreiro: "Charrua", product: "Potenty", notes: "67 VC 64 TER 3 TOR" },
    { sourceId: "xls-san-2026-01-22-chiquita-quiroga-vaca-de-cria", date: "2026-01-22", quantity: 200, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Quiroga", product: "Potenty", notes: "200 VC 197 TER 7 TOR" },
    { sourceId: "xls-san-2026-01-21-chiquita-alamo-vaca-de-1-cria", date: "2026-01-21", quantity: 149, categoryId: "vaca-de-1-cria", categoryName: "Vaca De 1 Cria", potreiro: "Alamo", product: "Potenty", notes: "149 VC 145 TER 5 TOR" },
    { sourceId: "xls-san-2026-01-20-chiquita-8-do-bido-vaca-de-cria", date: "2026-01-20", quantity: 145, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "8 Do Bido", product: "Potenty", notes: "145 VC 142 TER 4 TOR" },
    { sourceId: "xls-san-2026-01-19-chiquita-2-do-bido-vaca-solteira", date: "2026-01-19", quantity: 93, categoryId: "vaca-solteira", categoryName: "Vaca Solteira?", potreiro: "2 Do Bido", product: "Potenty", notes: "93 VACA 3 TORO" },
    { sourceId: "xls-san-2026-01-14-chiquita-pradeira-4-grande-terneiros-dest", date: "2026-01-14", quantity: 109, categoryId: "terneiros-destetado", categoryName: "Terneiros Destetado", potreiro: "Pradeira 4 Grande", product: "Potenty", notes: "MAIS 9 QUE ESTAO NA CHACRINHA/TOTAL 118" },
    { sourceId: "xls-san-2026-01-14-chiquita-4-do-posto-vaca-de-cria", date: "2026-01-14", quantity: 88, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "4 Do Posto", product: "Fc 30", notes: "88VC 85 TER 3 TOR" },
    { sourceId: "xls-san-2026-01-14-chiquita-5-do-posto-vaca-de-cria", date: "2026-01-14", quantity: 167, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "5 Do Posto", product: "Fc 30", notes: "167 VC 160 TER 5 TOR" },
    { sourceId: "xls-san-2026-01-13-chiquita-6-do-posto-vaca-de-1-cria", date: "2026-01-13", quantity: 127, categoryId: "vaca-de-1-cria", categoryName: "Vaca De 1 Cria", potreiro: "6 Do Posto", product: "Fc 30", notes: "127VC 124 TER 4 TOR" },
    { sourceId: "xls-san-2026-01-12-chiquita-4-5-do-bido-terneiras-h-0-", date: "2026-01-12", quantity: 646, categoryId: "terneiras-h-0-1", categoryName: "Terneiras (h) 0-1", potreiro: "4/5 Do Bido", product: "Potenty", notes: "" },
    { sourceId: "xls-san-2026-01-12-chiquita-6-7-do-bido-terneiros", date: "2026-01-12", quantity: 614, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "6/7 Do Bido", product: "Potenty", notes: "" },
    { sourceId: "xls-san-2026-12-30-chiquita-3-da-estancia-vaquillonas", date: "2026-12-30", quantity: 297, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "3 Da Estancia", product: "Potenty", notes: "297 VAQ 5 TOR" },
    { sourceId: "xls-san-2026-12-29-chiquita-nuevo-vaca-de-cria", date: "2026-12-29", quantity: 163, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Nuevo", product: "Potenty", notes: "163 VAC 162 TER" },
    { sourceId: "xls-san-2026-12-29-chiquita-telmo-vaca-de-cria", date: "2026-12-29", quantity: 35, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Telmo", product: "Potenty", notes: "35 VAC 34 TER 1 TOR" },
    { sourceId: "xls-san-2026-12-19-chiquita-alamo-vaca-de-cria", date: "2026-12-19", quantity: 160, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Alamo", product: "Potenty", notes: "160 VAC 155 TER 6 TOR" },
    { sourceId: "xls-san-2026-12-19-chiquita-quiroga-vaca-de-cria", date: "2026-12-19", quantity: 200, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Quiroga", product: "Potenty", notes: "200 VAC 197 TER 6 TOR" },
    { sourceId: "xls-san-2026-12-18-chiquita-2-do-bido-vaca-de-cria", date: "2026-12-18", quantity: 95, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "2 Do Bido", product: "Potenty", notes: "95 VAC 92 TER 3 TOR" },
    { sourceId: "xls-san-2026-12-17-chiquita-campo-9-novillos", date: "2026-12-17", quantity: 70, categoryId: "novillos", categoryName: "Novillos", potreiro: "Campo 9", product: "Insemax + Iver 1% + Nitroxinil", notes: "FALTOU 2" },
    { sourceId: "xls-san-2026-12-17-chiquita-bido-de-cima-novillos", date: "2026-12-17", quantity: 34, categoryId: "novillos", categoryName: "Novillos", potreiro: "Bido De Cima", product: "Insemax + Iver 1% + Nitroxinil", notes: "OK" },
    { sourceId: "xls-san-2026-12-17-chiquita-pelado-novillos", date: "2026-12-17", quantity: 222, categoryId: "novillos", categoryName: "Novillos", potreiro: "Pelado", product: "Insemax + Iver 1% + Nitroxinil", notes: "FALTOU 1 / SE ACHOU" },
    { sourceId: "xls-san-2026-12-17-chiquita-8-do-bido-vacas-de-cria", date: "2026-12-17", quantity: 145, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "8 Do Bido", product: "Potenty", notes: "145 VAC 141 TER 4 TOR + 4 TERNERO" },
    { sourceId: "xls-san-2026-12-12-chiquita-3-do-bido-vaca-de-cria", date: "2026-12-12", quantity: 94, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "3 Do Bido", product: "Potenty", notes: "94 VACA 91 TERN 3 TORO" },
    { sourceId: "xls-san-2026-12-11-chiquita-6-7-do-bido-terneiros", date: "2026-12-11", quantity: 627, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "6/7 Do Bido", product: "Potenty + Ricobendazole", notes: "" },
    { sourceId: "xls-san-2026-12-10-chiquita-cerrito-vaquillonas", date: "2026-12-10", quantity: 19, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Cerrito", product: "Potenty + Iver 1% + Closantel", notes: "19 VAQ 2 TORO" },
    { sourceId: "xls-san-2026-12-10-chiquita-campo-4-e-5-bido-terneiras-h-0-", date: "2026-12-10", quantity: 648, categoryId: "terneiras-h-0-1", categoryName: "Terneiras (h) 0-1", potreiro: "Campo 4 E 5 Bido", product: "Potenty + Ricobendazole", notes: "" },
    { sourceId: "xls-san-2026-12-10-chiquita-3-da-estancia-vaquillonas", date: "2026-12-10", quantity: 298, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "3 Da Estancia", product: "Potenty + Iver 1% + Closantel", notes: "298 VAQ 6 TOR" },
    { sourceId: "xls-san-2025-11-28-chiquita-campo-2-bois-gordo", date: "2025-11-28", quantity: 147, categoryId: "bois-gordo", categoryName: "Bois Gordo", potreiro: "Campo 2", product: "Insemax", notes: "MOXIDEC NOS ABAIXO DE 450 KG" },
    { sourceId: "xls-san-2025-11-22-chiquita-costa-touros-adultos", date: "2025-11-22", quantity: 83, categoryId: "touros-adultos", categoryName: "Touros Adultos", potreiro: "Costa", product: "Insemax + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-11-13-chiquita-charrua-tourinhos-1-2", date: "2025-11-13", quantity: 49, categoryId: "tourinhos-1-2", categoryName: "Tourinhos 1-2", potreiro: "Charrua", product: "Insemax + Biopersol", notes: "" },
    { sourceId: "xls-san-2025-11-12-chiquita-pradeira-4-grande-primiparas", date: "2025-11-12", quantity: 34, categoryId: "primiparas", categoryName: "Primiparas", potreiro: "Pradeira 4 Grande", product: "Insemax + Abamectina 1%", notes: "33 TERNEIROS" },
    { sourceId: "xls-san-2025-11-12-chiquita-6-posto-primiparas", date: "2025-11-12", quantity: 129, categoryId: "primiparas", categoryName: "Primiparas", potreiro: "6 Posto", product: "Insemax + Abamectina 1%", notes: "123 TERNEIROS" },
    { sourceId: "xls-san-2025-11-11-chiquita-quiroga-vacas-paridas", date: "2025-11-11", quantity: 202, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Quiroga", product: "Insemax + Abamectina 1%", notes: "198 TERNEIROS 6 TOUROS" },
    { sourceId: "xls-san-2025-11-10-chiquita-alamo-vacas-paridas", date: "2025-11-10", quantity: 147, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Alamo", product: "Insemax + Abamectina 1%", notes: "148 TERNEIROS 5 TOUROS" },
    { sourceId: "xls-san-2025-11-08-chiquita-5-posto-vacas-paridas", date: "2025-11-08", quantity: 164, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "5 Posto", product: "Insemax + Abamectina 1%", notes: "162 TERNEIROS" },
    { sourceId: "xls-san-2025-11-04-chiquita-campo-novo-vacas-paridas", date: "2025-11-04", quantity: 89, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Campo Novo", product: "Insemax + Abamectina 1%", notes: "87 TERNEIROS 3 TOUROS" },
    { sourceId: "xls-san-2025-11-03-chiquita-4-do-bom-retiro-parindo", date: "2025-11-03", quantity: 91, categoryId: "parindo", categoryName: "Parindo", potreiro: "4 Do Bom Retiro", product: "Insemax + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-11-03-chiquita-3-do-caminho-vacas-numero-0", date: "2025-11-03", quantity: 121, categoryId: "vacas-numero-0", categoryName: "Vacas Numero 0", potreiro: "3 Do Caminho", product: "Insemax + Abamectina 1%", notes: "120 TERNEIROS" },
    { sourceId: "xls-san-2025-11-03-chiquita-4-posto-vacas-paridas", date: "2025-11-03", quantity: 75, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "4 Posto", product: "Insemax + Abamectina 1%", notes: "73 TERNEIROS" },
    { sourceId: "xls-san-2025-10-31-chiquita-campo-5-vacas-paridas", date: "2025-10-31", quantity: 145, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Campo 5", product: "Insemax + Abamectina 1%", notes: "144 TERNEIROS" },
    { sourceId: "xls-san-2025-10-30-chiquita-2-do-bido-vaca-e-vaq-pre", date: "2025-10-30", quantity: 66, categoryId: "vaca-e-vaq-prenha", categoryName: "Vaca E Vaq Prenha", potreiro: "2 Do Bido", product: "Insemax + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-10-30-chiquita-piquete-bido-vacas-solteira", date: "2025-10-30", quantity: 134, categoryId: "vacas-solteiras", categoryName: "Vacas Solteiras", potreiro: "Piquete Bido", product: "Insemax + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-10-30-chiquita-1-do-bido-vaquillonas-2-", date: "2025-10-30", quantity: 183, categoryId: "vaquillonas-2-anos", categoryName: "Vaquillonas 2 Anos", potreiro: "1 Do Bido", product: "Insemax + Abamectina 1%", notes: "3 NO CERRITO / 186 TOTAL" },
    { sourceId: "xls-san-2025-10-28-chiquita-6-7-bido-terneiros-m-0-", date: "2025-10-28", quantity: 618, categoryId: "terneiros-m-0-1", categoryName: "Terneiros (m) 0-1", potreiro: "6/7 Bido", product: "Insemax + Biopersol", notes: "TEM 5 NO CERRITO / TOTAL SÃO 630" },
    { sourceId: "xls-san-2025-10-27-chiquita-4-5-bido-terneiras-h-0-", date: "2025-10-27", quantity: 648, categoryId: "terneiras-h-0-1", categoryName: "Terneiras (h) 0-1", potreiro: "4/5 Bido", product: "Insemax + Biopersol", notes: "TEM MAIS 5 PRADEIRA / TOTAL 653" },
    { sourceId: "xls-san-2025-09-30-chiquita-7-do-roffus-vaquillonas-1-", date: "2025-09-30", quantity: 88, categoryId: "vaquillonas-1-cria", categoryName: "Vaquillonas 1 Cria", potreiro: "7 Do Roffus", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-29-chiquita-costa-touros", date: "2025-09-29", quantity: 102, categoryId: "touros", categoryName: "Touros", potreiro: "Costa", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-29-chiquita-cerrito-touros-2-anos", date: "2025-09-29", quantity: 24, categoryId: "touros-2-anos", categoryName: "Touros 2 Anos", potreiro: "Cerrito", product: "Contratack", notes: "FALTOU 1" },
    { sourceId: "xls-san-2025-09-29-chiquita-pradeira-6-touros-velhos", date: "2025-09-29", quantity: 19, categoryId: "touros-velhos", categoryName: "Touros Velhos", potreiro: "Pradeira 6", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-17-chiquita-lamadrid-vaca-prenha", date: "2025-09-17", quantity: 125, categoryId: "vaca-prenha", categoryName: "Vaca Prenha", potreiro: "Lamadrid", product: "Contratack", notes: "118 TERNEIROS" },
    { sourceId: "xls-san-2025-09-16-chiquita-pelado-novillos", date: "2025-09-16", quantity: 220, categoryId: "novillos", categoryName: "Novillos", potreiro: "Pelado", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-09-16-chiquita-campo-bido-de-cima-bois-fernando", date: "2025-09-16", quantity: 55, categoryId: "bois-fernando", categoryName: "Bois Fernando", potreiro: "Campo Bido De Cima", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-09-12-chiquita-campo-2-novillos", date: "2025-09-12", quantity: null, categoryId: "novillos", categoryName: "Novillos", potreiro: "Campo 2", product: "Maximo + Ricobendazole", notes: "104 NOVILLO 3 TOURO" },
    { sourceId: "xls-san-2025-09-12-chiquita-pradeira-6-novillos-grand", date: "2025-09-12", quantity: 150, categoryId: "novillos-grande", categoryName: "Novillos Grande", potreiro: "Pradeira 6", product: "Maximo + Ricobendazole", notes: "" },
    { sourceId: "xls-san-2025-09-12-chiquita-pradeira-6-novillos-ferna", date: "2025-09-12", quantity: 31, categoryId: "novillos-fernando", categoryName: "Novillos Fernando", potreiro: "Pradeira 6", product: "Maximo + Ricobendazole", notes: "" },
    { sourceId: "xls-san-2025-09-12-chiquita-piquete-bido-vacas-parindo", date: "2025-09-12", quantity: 13, categoryId: "vacas-parindo", categoryName: "Vacas Parindo", potreiro: "Piquete Bido", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-11-chiquita-4-5-bido-terneiras-h-0-", date: "2025-09-11", quantity: 664, categoryId: "terneiras-h-0-1", categoryName: "Terneiras (h) 0-1", potreiro: "4/5 Bido", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-09-11-chiquita-pradeira-4-vaquillonas-1-", date: "2025-09-11", quantity: 56, categoryId: "vaquillonas-1-cria", categoryName: "Vaquillonas 1 Cria", potreiro: "Pradeira 4", product: "Contratack", notes: "38 TERNEIROS" },
    { sourceId: "xls-san-2025-09-10-chiquita-costa-touro-adulto", date: "2025-09-10", quantity: 102, categoryId: "touro-adulto", categoryName: "Touro Adulto", potreiro: "Costa", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-09-chiquita-pradeira-3-chica-tourinhos-1-2", date: "2025-09-09", quantity: 49, categoryId: "tourinhos-1-2", categoryName: "Tourinhos 1-2", potreiro: "Pradeira 3 Chica", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-09-09-chiquita-charrua-toros-descarte", date: "2025-09-09", quantity: 20, categoryId: "toros-descarte", categoryName: "Toros Descarte", potreiro: "Charrua", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-08-chiquita-3-do-bido-vacas-paridas", date: "2025-09-08", quantity: 141, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "3 Do Bido", product: "Contratack", notes: "141 TERNEIROS" },
    { sourceId: "xls-san-2025-09-07-chiquita-8-do-bido-vaquillonas-1-", date: "2025-09-07", quantity: 244, categoryId: "vaquillonas-1-2", categoryName: "Vaquillonas 1-2", potreiro: "8 Do Bido", product: "Insemax+nitromic", notes: "226 VAQUILLONA 18 VACAS VAZIAS" },
    { sourceId: "xls-san-2025-09-07-chiquita-8-do-bido-vaquillonas-1--1", date: "2025-09-07", quantity: 244, categoryId: "vaquillonas-1-2", categoryName: "Vaquillonas 1-2", potreiro: "8 Do Bido", product: "Reprodutiva", notes: "226 VAQUILLONA 18 VACAS VAZIAS" },
    { sourceId: "xls-san-2025-09-07-chiquita-2-do-bido-vacas-parindo", date: "2025-09-07", quantity: 27, categoryId: "vacas-parindo", categoryName: "Vacas Parindo", potreiro: "2 Do Bido", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-06-chiquita-6-7-bido-terneiros-m-0-", date: "2025-09-06", quantity: 630, categoryId: "terneiros-m-0-1", categoryName: "Terneiros (m) 0-1", potreiro: "6/7 Bido", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-09-06-chiquita-pradeira-3-terneiros-m-0-", date: "2025-09-06", quantity: 49, categoryId: "terneiros-m-0-1", categoryName: "Terneiros (m) 0-1", potreiro: "Pradeira 3", product: "Insemax + Evol", notes: "TOURINHOS" },
    { sourceId: "xls-san-2025-09-06-chiquita-novo-vacas-paridas", date: "2025-09-06", quantity: 74, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Novo", product: "Contratack", notes: "73 TERNEIROS" },
    { sourceId: "xls-san-2025-09-05-chiquita-3-da-estancia-vacas-parindo", date: "2025-09-05", quantity: 197, categoryId: "vacas-parindo", categoryName: "Vacas Parindo", potreiro: "3 Da Estancia", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-04-chiquita-4-do-bom-retiro-vacas-parindo", date: "2025-09-04", quantity: 82, categoryId: "vacas-parindo", categoryName: "Vacas Parindo", potreiro: "4 Do Bom Retiro", product: "Contratack", notes: "" },
    { sourceId: "xls-san-2025-09-03-chiquita-quiroga-vacas-paridas", date: "2025-09-03", quantity: 92, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Quiroga", product: "Contratack", notes: "92 TERNEIRO" },
    { sourceId: "xls-san-2025-09-02-chiquita-alamo-vacas-paridas", date: "2025-09-02", quantity: 147, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Alamo", product: "Contratack", notes: "148 TERNEIROS" },
    { sourceId: "xls-san-2025-09-01-chiquita-campo-5-vaquillonas-1-", date: "2025-09-01", quantity: 55, categoryId: "vaquillonas-1-cria", categoryName: "Vaquillonas 1 Cria", potreiro: "Campo 5", product: "Contratack", notes: "55 TERNEIROS" },
    { sourceId: "xls-san-2025-09-01-chiquita-telmo-vacas-paridas", date: "2025-09-01", quantity: 142, categoryId: "vacas-paridas", categoryName: "Vacas Paridas", potreiro: "Telmo", product: "Contratack", notes: "116 TERNEIROS" },
    { sourceId: "xls-san-2025-09-02-chiquita-1-do-bido-vacas-solteira", date: "2025-09-02", quantity: 93, categoryId: "vacas-solteiras-novas", categoryName: "Vacas Solteiras Novas", potreiro: "1 Do Bido", product: "Contratack", notes: "" },
  ],
  "passa-da-guarda": [
    { sourceId: "xls-san-2026-03-27-passa-da-guarda-campo-invernadinha-vacas-de-cria", date: "2026-03-27", quantity: 109, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Campo Invernadinha", product: "Fc30 + Flok", notes: "FALTOU 2" },
    { sourceId: "xls-san-2026-03-27-passa-da-guarda-campo-cerro-terneiros-0-1", date: "2026-03-27", quantity: 93, categoryId: "terneiros-0-1", categoryName: "Terneiros 0 - 1", potreiro: "Campo Cerro", product: "Clostridiose + Dueto + Fc30", notes: "" },
    { sourceId: "xls-san-2026-03-27-passa-da-guarda-campo-cerro-terneiros-0-1-1", date: "2026-03-27", quantity: 250, categoryId: "terneiros-0-1", categoryName: "Terneiros 0 - 1", potreiro: "Campo Cerro", product: "Clostridiose + Dueto + Fc30", notes: "" },
    { sourceId: "xls-san-2026-03-27-passa-da-guarda-boqueir-o-vacas-de-inver", date: "2026-03-27", quantity: 82, categoryId: "vacas-de-invernar", categoryName: "Vacas De Invernar", potreiro: "Boqueirão", product: "Fc30 + Flok", notes: "FALTOU 3" },
    { sourceId: "xls-san-2026-02-26-passa-da-guarda-cemiterio-vacas-de-cria", date: "2026-02-26", quantity: 104, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Cemiterio", product: "Fc 30 + Abamectina", notes: "90 TERNEIROS" },
    { sourceId: "xls-san-2026-02-26-passa-da-guarda-cambara-vacas-de-cria", date: "2026-02-26", quantity: 66, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Cambara", product: "Fc 30 + Abamectina", notes: "66 TERNEIRO" },
    { sourceId: "xls-san-2026-02-25-passa-da-guarda-boqueir-o-cut", date: "2026-02-25", quantity: 67, categoryId: "cut", categoryName: "Cut", potreiro: "Boqueirão", product: "Fc 30 + Abamectina", notes: "65 TERNEIROS" },
    { sourceId: "xls-san-2026-02-12-passa-da-guarda-frente-terneiros", date: "2026-02-12", quantity: 528, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Frente", product: "Fc 30 + Flok", notes: "FALTOU SÃO 540" },
    { sourceId: "xls-san-2026-02-11-passa-da-guarda-invernadinha-vacas-de-cria", date: "2026-02-11", quantity: 110, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Invernadinha", product: "Fc 30 + Flok", notes: "110 VC 103 TER" },
    { sourceId: "xls-san-2026-02-11-passa-da-guarda-cemiterio-vacas-de-cria", date: "2026-02-11", quantity: 119, categoryId: "vacas-de-cria", categoryName: "Vacas De Cria", potreiro: "Cemiterio", product: "Fc 30 + Abamectina", notes: "119 VC 112 TER" },
    { sourceId: "xls-san-2026-02-10-passa-da-guarda-cambar-vaquillonas", date: "2026-02-10", quantity: 69, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Cambará", product: "Fc 30 + Abamectina", notes: "69 VC 65 TER" },
    { sourceId: "xls-san-2026-02-10-passa-da-guarda-antena-vaquillonas", date: "2026-02-10", quantity: 259, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Antena", product: "Fc 30 + Abamectina", notes: "259 VC 9 TOR" },
    { sourceId: "xls-san-2026-02-07-passa-da-guarda-mimosa-vacas-cut", date: "2026-02-07", quantity: null, categoryId: "vacas-cut", categoryName: "Vacas Cut", potreiro: "Mimosa", product: "Fc 30", notes: "" },
    { sourceId: "xls-san-2026-02-05-passa-da-guarda-invernadinha-vaca-de-cria", date: "2026-02-05", quantity: 110, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Invernadinha", product: "Fc 30", notes: "110 VC 102 TER" },
    { sourceId: "xls-san-2026-02-05-passa-da-guarda-umbu-vaca-de-cria", date: "2026-02-05", quantity: 160, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Umbu", product: "Fc 30", notes: "160 VC 148 TER" },
    { sourceId: "xls-san-2026-01-15-passa-da-guarda-umbu-vaca-de-cria", date: "2026-01-15", quantity: 189, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Umbu", product: "Fc 30 + Abamectina", notes: "189 VC 181 TER 7 TOR" },
    { sourceId: "xls-san-2026-01-14-passa-da-guarda-boqueir-o-vaca-de-cria", date: "2026-01-14", quantity: 95, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Boqueirão", product: "Fc 30 + Abamectina", notes: "FICARAM NA MIMOSA" },
    { sourceId: "xls-san-2026-01-13-passa-da-guarda-invernadinha-vaca-de-cria", date: "2026-01-13", quantity: 110, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Invernadinha", product: "Fc 30 + Abamectina", notes: "110 VC 103 TER 1 TOUR / FALTO 2" },
    { sourceId: "xls-san-2026-01-09-passa-da-guarda-cemiterio-vaca-de-cria", date: "2026-01-09", quantity: 89, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Cemiterio", product: "Fc 30 + Abamectina", notes: "89 VC 83 TER" },
    { sourceId: "xls-san-2026-01-05-passa-da-guarda-cambara-vaca-de-cria", date: "2026-01-05", quantity: 65, categoryId: "vaca-de-cria", categoryName: "Vaca De Cria", potreiro: "Cambara", product: "Fc 30 + Abamectina", notes: "65 VC 60 TER 4 TOU" },
    { sourceId: "xls-san-2026-01-05-passa-da-guarda-delmar-bois-engorde", date: "2026-01-05", quantity: 101, categoryId: "bois-engorde", categoryName: "Bois Engorde", potreiro: "Delmar", product: "Banho Fc 30", notes: "" },
    { sourceId: "xls-san-2026-01-05-passa-da-guarda-cerro-terneiras", date: "2026-01-05", quantity: 255, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Cerro", product: "Fc 30 + Albendazole", notes: "TEM 2 MACHO / 253 H" },
    { sourceId: "xls-san-2026-01-05-passa-da-guarda-frente-terneiros", date: "2026-01-05", quantity: 280, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Frente", product: "Fc 30 + Albendazole", notes: "TEM 1 BOI" },
    { sourceId: "xls-san-2025-11-25-passa-da-guarda-todos-vacas-e-ternei", date: "2025-11-25", quantity: null, categoryId: "vacas-e-terneiros", categoryName: "Vacas E Terneiros", potreiro: "Todos", product: "Fc 30", notes: "" },
    { sourceId: "xls-san-2025-12-04-passa-da-guarda-espinilho-bois-pequeno", date: "2025-12-04", quantity: 37, categoryId: "bois-pequeno", categoryName: "Bois Pequeno", potreiro: "Espinilho", product: "Falta Fazer", notes: "" },
    { sourceId: "xls-san-2025-12-04-passa-da-guarda-cerro-vaca-parindo", date: "2025-12-04", quantity: 100, categoryId: "vaca-parindo", categoryName: "Vaca Parindo", potreiro: "Cerro", product: "Falta Fazer", notes: "" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-delmar-terneiros", date: "2025-11-11", quantity: 136, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Delmar", product: "Fc 30 + Dueto", notes: "" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-frente-terneiros", date: "2025-11-11", quantity: 404, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Frente", product: "Fc 30 + Dueto", notes: "" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-boqueir-o-vacas-velhas-n", date: "2025-11-11", quantity: 75, categoryId: "vacas-velhas-n-0", categoryName: "Vacas Velhas Nº0", potreiro: "Boqueirão", product: "Fc 30", notes: "" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-invernadinha-primiparas", date: "2025-11-11", quantity: 110, categoryId: "primiparas", categoryName: "Primiparas", potreiro: "Invernadinha", product: "Fc 30", notes: "4 TOURO" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-cemiterio-vaca-parida", date: "2025-11-11", quantity: 90, categoryId: "vaca-parida", categoryName: "Vaca Parida", potreiro: "Cemiterio", product: "Fc 30", notes: "3 TOURO" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-antena-vaca-parida", date: "2025-11-11", quantity: 224, categoryId: "vaca-parida", categoryName: "Vaca Parida", potreiro: "Antena", product: "Fc 30", notes: "5 TOURO" },
    { sourceId: "xls-san-2025-11-11-passa-da-guarda-umbu-vaca-parida", date: "2025-11-11", quantity: 193, categoryId: "vaca-parida", categoryName: "Vaca Parida", potreiro: "Umbu", product: "Fc 30", notes: "7 TOURO" },
    { sourceId: "xls-san-2025-10-06-passa-da-guarda-delmar-terneiros-0-1", date: "2025-10-06", quantity: 136, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Delmar", product: "Levamisol", notes: "" },
    { sourceId: "xls-san-2025-10-02-passa-da-guarda-frente-terneiros-0-1", date: "2025-10-02", quantity: 407, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Frente", product: "Levamisol", notes: "" },
    { sourceId: "xls-san-2025-09-05-passa-da-guarda-boqueir-o-vacas-vazias-i", date: "2025-09-05", quantity: 82, categoryId: "vacas-vazias-invernar", categoryName: "Vacas Vazias / Invernar", potreiro: "Boqueirão", product: "Insemax + Flok 1%", notes: "34 INVERNAR 48 ENTORE" },
    { sourceId: "xls-san-2025-09-05-passa-da-guarda-antena-vaquillonas-1-", date: "2025-09-05", quantity: 168, categoryId: "vaquillonas-1-2-e-2-3", categoryName: "Vaquillonas 1-2 E 2-3", potreiro: "Antena", product: "Insemax + Nitromic + Reprodutiva", notes: "VAI ENTRAR PARA ENTORE" },
    { sourceId: "xls-san-2025-09-05-passa-da-guarda-espinilho-vaquillonas-1-", date: "2025-09-05", quantity: 20, categoryId: "vaquillonas-1-2", categoryName: "Vaquillonas 1-2", potreiro: "Espinilho", product: "Insemax + Nitromic", notes: "NÃO CHEGA PARA ENTORE" },
    { sourceId: "xls-san-2025-08-20-passa-da-guarda-colorado-pg-bois-seu-luiz", date: "2025-08-20", quantity: 70, categoryId: "bois-seu-luiz", categoryName: "Bois Seu Luiz", potreiro: "Colorado --> Pg", product: "Sem Produto", notes: "" },
    { sourceId: "xls-san-2025-08-12-passa-da-guarda-cemiterio-vacas-prenha", date: "2025-08-12", quantity: 107, categoryId: "vacas-prenha", categoryName: "Vacas Prenha", potreiro: "Cemiterio", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-12-passa-da-guarda-molino-vaquillona-pre", date: "2025-08-12", quantity: 72, categoryId: "vaquillona-prenha", categoryName: "Vaquillona Prenha", potreiro: "Molino", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-12-passa-da-guarda-cambar-vaquillona-pre", date: "2025-08-12", quantity: 47, categoryId: "vaquillona-prenha", categoryName: "Vaquillona Prenha", potreiro: "Cambará", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-11-passa-da-guarda-frente-terneiros-0-1-", date: "2025-08-11", quantity: 402, categoryId: "terneiros-0-1-ano", categoryName: "Terneiros 0-1 Ano", potreiro: "Frente", product: "Insemax + Dueto", notes: "" },
    { sourceId: "xls-san-2025-08-11-passa-da-guarda-delmar-terneiros-0-1-", date: "2025-08-11", quantity: 131, categoryId: "terneiros-0-1-ano", categoryName: "Terneiros 0-1 Ano", potreiro: "Delmar", product: "Insemax + Dueto", notes: "PEQUENOS" },
    { sourceId: "xls-san-2025-08-09-passa-da-guarda-invernadinha-vacas-prenha", date: "2025-08-09", quantity: 109, categoryId: "vacas-prenha", categoryName: "Vacas Prenha", potreiro: "Invernadinha", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-09-passa-da-guarda-bico-touros", date: "2025-08-09", quantity: 28, categoryId: "touros", categoryName: "Touros", potreiro: "Bico", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-09-passa-da-guarda-bico-boi-sobreano", date: "2025-08-09", quantity: 3, categoryId: "boi-sobreano", categoryName: "Boi Sobreano", potreiro: "Bico", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-09-passa-da-guarda-cerro-vacas-prenha", date: "2025-08-09", quantity: 74, categoryId: "vacas-prenha", categoryName: "Vacas Prenha", potreiro: "Cerro", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-08-passa-da-guarda-umbu-vacas-prenha", date: "2025-08-08", quantity: 163, categoryId: "vacas-prenha", categoryName: "Vacas Prenha", potreiro: "Umbu", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-08-passa-da-guarda-cambara-prad-umbu-vaquillonas", date: "2025-08-08", quantity: 15, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Cambara--> Prad. Umbu", product: "-", notes: "" },
    { sourceId: "xls-san-2025-08-08-passa-da-guarda-cambara-espinilho-vaquillonas", date: "2025-08-08", quantity: 15, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Cambara--> Espinilho", product: "-", notes: "" },
  ],
  colorado: [
    { sourceId: "xls-san-2025-08-28-colorado-estrada-bois", date: "2025-08-28", quantity: 80, categoryId: "bois", categoryName: "Bois", potreiro: "Estrada", product: "Insemax + Evol", notes: "LA 66 LF14" },
    { sourceId: "xls-san-2025-08-28-colorado-estrada-touro", date: "2025-08-28", quantity: 7, categoryId: "touro", categoryName: "Touro", potreiro: "Estrada", product: "Insemax + Evol", notes: "LA 43 LF 17" },
    { sourceId: "xls-san-2025-08-28-colorado-cemit-rio-bois", date: "2025-08-28", quantity: 60, categoryId: "bois", categoryName: "Bois", potreiro: "Cemitério", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-28-colorado-meio-bois", date: "2025-08-28", quantity: 101, categoryId: "bois", categoryName: "Bois", potreiro: "Meio", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-28-colorado-novo-bois", date: "2025-08-28", quantity: 127, categoryId: "bois", categoryName: "Bois", potreiro: "Novo", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-29-colorado-campo-touros-vacas", date: "2025-08-29", quantity: 45, categoryId: "vacas", categoryName: "Vacas", potreiro: "Campo Touros", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-29-colorado-eucaliptos-vacas", date: "2025-08-29", quantity: 58, categoryId: "vacas", categoryName: "Vacas", potreiro: "Eucaliptos", product: "Insemax + Flok 1%", notes: "" },
    { sourceId: "xls-san-2025-08-27-colorado-colorado-pg-bois", date: "2025-08-27", quantity: 70, categoryId: "bois", categoryName: "Bois", potreiro: "Colorado --> Pg", product: "Sem Produto", notes: "TRANSLADO" },
    { sourceId: "xls-san-2025-11-15-colorado-estrada-bois", date: "2025-11-15", quantity: 78, categoryId: "bois", categoryName: "Bois", potreiro: "Estrada", product: "Fc 30 + Agebendazole", notes: "" },
    { sourceId: "xls-san-2025-11-15-colorado-cemit-rio-vacas", date: "2025-11-15", quantity: 92, categoryId: "vacas", categoryName: "Vacas", potreiro: "Cemitério", product: "Fc 30", notes: "VACAS ENTORADAS" },
    { sourceId: "xls-san-2025-11-15-colorado-meio-bois", date: "2025-11-15", quantity: 117, categoryId: "bois", categoryName: "Bois", potreiro: "Meio", product: "Fc 30 + Agebendazole", notes: "" },
    { sourceId: "xls-san-2025-11-15-colorado-novo-bois", date: "2025-11-15", quantity: 115, categoryId: "bois", categoryName: "Bois", potreiro: "Novo", product: "Fc 30 + Agebendazole", notes: "" },
    { sourceId: "xls-san-2025-11-15-colorado-campo-touros-vacas", date: "2025-11-15", quantity: 16, categoryId: "vacas", categoryName: "Vacas", potreiro: "Campo Touros", product: "Fc 30", notes: "VACAS VELHAS" },
    { sourceId: "xls-san-2025-11-15-colorado-eucaliptos-bois", date: "2025-11-15", quantity: 65, categoryId: "bois", categoryName: "Bois", potreiro: "Eucaliptos", product: "Fc 30 + Agebendazole", notes: "" },
    { sourceId: "xls-san-2025-12-05-colorado-estrada-boi", date: "2025-12-05", quantity: 78, categoryId: "boi", categoryName: "Boi", potreiro: "Estrada", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-12-05-colorado-meio-boi", date: "2025-12-05", quantity: 117, categoryId: "boi", categoryName: "Boi", potreiro: "Meio", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-12-11-colorado-eucalipto-boi", date: "2025-12-11", quantity: 65, categoryId: "boi", categoryName: "Boi", potreiro: "Eucalipto", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-12-11-colorado-novo-boi", date: "2025-12-11", quantity: 115, categoryId: "boi", categoryName: "Boi", potreiro: "Novo", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-12-13-colorado-cemiterio-vaca", date: "2025-12-13", quantity: 93, categoryId: "vaca", categoryName: "Vaca", potreiro: "Cemiterio", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2025-12-13-colorado-piquete-toro-vaca", date: "2025-12-13", quantity: 15, categoryId: "vaca", categoryName: "Vaca", potreiro: "Piquete Toro", product: "Fc 30 + Abamectina 1%", notes: "" },
    { sourceId: "xls-san-2026-01-22-colorado-estrada-geral", date: "2026-01-22", quantity: 63, categoryId: "geral", categoryName: "Geral", potreiro: "Estrada", product: "Fipronil", notes: "" },
    { sourceId: "xls-san-2026-01-22-colorado-meio-geral", date: "2026-01-22", quantity: null, categoryId: "geral", categoryName: "Geral", potreiro: "Meio", product: "Fipronil", notes: "145 BOI 15 VC VELHA 1 ARRENO" },
    { sourceId: "xls-san-2026-01-22-colorado-eucalipto-geral", date: "2026-01-22", quantity: null, categoryId: "geral", categoryName: "Geral", potreiro: "Eucalipto", product: "Fipronil", notes: "78 VAQ 2 VACA" },
    { sourceId: "xls-san-2026-01-22-colorado-novo-geral", date: "2026-01-22", quantity: 69, categoryId: "geral", categoryName: "Geral", potreiro: "Novo", product: "Fipronil", notes: "" },
    { sourceId: "xls-san-2026-01-22-colorado-cemiterio-geral", date: "2026-01-22", quantity: null, categoryId: "geral", categoryName: "Geral", potreiro: "Cemiterio", product: "Fipronil", notes: "89 VC 7 TORO / + 3 VACA" },
    { sourceId: "xls-san-2026-01-22-colorado-piquete-toro-geral", date: "2026-01-22", quantity: null, categoryId: "geral", categoryName: "Geral", potreiro: "Piquete Toro", product: "Fipronil", notes: "" },
    { sourceId: "xls-san-2026-02-06-colorado-estrada-geral", date: "2026-02-06", quantity: 63, categoryId: "geral", categoryName: "Geral", potreiro: "Estrada", product: "Fc 30 + Flok", notes: "" },
    { sourceId: "xls-san-2026-02-06-colorado-meio-geral", date: "2026-02-06", quantity: 161, categoryId: "geral", categoryName: "Geral", potreiro: "Meio", product: "Fc 30 + Flok", notes: "" },
    { sourceId: "xls-san-2026-03-05-colorado-cemiterio-geral", date: "2026-03-05", quantity: 89, categoryId: "geral", categoryName: "Geral", potreiro: "Cemiterio", product: "Fc 30 + Altis", notes: "ALTIS NOS TERNEIROS" },
    { sourceId: "xls-san-2026-03-06-colorado-campo-novo-geral", date: "2026-03-06", quantity: 103, categoryId: "geral", categoryName: "Geral", potreiro: "Campo Novo", product: "Fc 30 + Altis", notes: "" },
    { sourceId: "xls-san-2026-03-06-colorado-meio-geral", date: "2026-03-06", quantity: 109, categoryId: "geral", categoryName: "Geral", potreiro: "Meio", product: "Fc 30 + Altis", notes: "MAIS 16 VACAS" },
    { sourceId: "xls-san-2026-03-06-colorado-estrada-geral", date: "2026-03-06", quantity: 65, categoryId: "geral", categoryName: "Geral", potreiro: "Estrada", product: "Fc 30 + Altis", notes: "65 + 4 TOUROS - FALTOU 1 BOI" },
    { sourceId: "xls-san-2026-03-06-colorado-eucalipto-geral", date: "2026-03-06", quantity: 78, categoryId: "geral", categoryName: "Geral", potreiro: "Eucalipto", product: "Fc 30 + Altis", notes: "MAIS 2 VACAS E  3 TOURO" },
  ],
  sarandi: [
    { sourceId: "xls-san-2026-03-20-sarandi-campo-4-bois-tico-tern", date: "2026-03-20", quantity: 85, categoryId: "bois-tico-terneiros", categoryName: "Bois Tico / Terneiros", potreiro: "Campo 4", product: "Colosso Pour On + Agebendazole", notes: "" },
    { sourceId: "xls-san-2026-03-20-sarandi-campo-3-bois-medio", date: "2026-03-20", quantity: 145, categoryId: "bois-medio", categoryName: "Bois Medio", potreiro: "Campo 3", product: "Colosso Pour On + Agebendazole", notes: "" },
    { sourceId: "xls-san-2026-03-20-sarandi-campo-2-bois-grande", date: "2026-03-20", quantity: 82, categoryId: "bois-grande", categoryName: "Bois Grande", potreiro: "Campo 2", product: "Colosso Pour On + Agebendazole", notes: "" },
    { sourceId: "xls-san-2026-02-09-sarandi-campo-1-terneiros-comp", date: "2026-02-09", quantity: null, categoryId: "terneiros-comprados", categoryName: "Terneiros Comprados", potreiro: "Campo 1", product: "Levamisol + Insemax", notes: "" },
    { sourceId: "xls-san-2026-02-09-sarandi-campo-2-bois-420-kg", date: "2026-02-09", quantity: 60, categoryId: "bois-420-kg", categoryName: "Bois + 420 Kg", potreiro: "Campo 2", product: "Levamisol + Insemax", notes: "" },
    { sourceId: "xls-san-2026-02-09-sarandi-campo-4-bois-420-kg", date: "2026-02-09", quantity: 55, categoryId: "bois-420-kg", categoryName: "Bois -420 Kg", potreiro: "Campo 4", product: "Clausuron + Insemax", notes: "" },
    { sourceId: "xls-san-2026-02-09-sarandi-campo-3-bois-menores", date: "2026-02-09", quantity: 96, categoryId: "bois-menores", categoryName: "Bois Menores", potreiro: "Campo 3", product: "Clausuron + Insemax", notes: "" },
    { sourceId: "xls-san-2026-12-20-sarandi-campo-2-geral", date: "2026-12-20", quantity: 99, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 2", product: "Insemax + Iver 3,15%", notes: "" },
    { sourceId: "xls-san-2026-12-20-sarandi-campo-3-geral", date: "2026-12-20", quantity: 165, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 3", product: "Insemax + Iver 3,15%", notes: "" },
    { sourceId: "xls-san-2025-11-28-sarandi-campo-1-e-2-geral", date: "2025-11-28", quantity: 96, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 1 E 2", product: "Insemax + Bioperosol", notes: "" },
    { sourceId: "xls-san-2025-11-28-sarandi-campo-4-e-3-geral", date: "2025-11-28", quantity: 168, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 4 E 3", product: "Insemax + Bioperosol", notes: "" },
    { sourceId: "xls-san-2025-10-21-sarandi-pradeira-bois-gordo", date: "2025-10-21", quantity: 60, categoryId: "bois-gordo", categoryName: "Bois Gordo", potreiro: "Pradeira", product: "Nitroxinil + Maximo", notes: "" },
    { sourceId: "xls-san-2025-10-21-sarandi-campo-3-boi-comprado", date: "2025-10-21", quantity: 10, categoryId: "boi-comprado", categoryName: "Boi Comprado", potreiro: "Campo 3", product: "Evol", notes: "" },
    { sourceId: "xls-san-2025-10-21-sarandi-campo-3-boi-comprado-1", date: "2025-10-21", quantity: 21, categoryId: "boi-comprado", categoryName: "Boi Comprado", potreiro: "Campo 3", product: "Nitroxinil", notes: "" },
    { sourceId: "xls-san-2025-09-24-sarandi-pradeira-geral", date: "2025-09-24", quantity: 70, categoryId: "geral", categoryName: "Geral", potreiro: "Pradeira", product: "Moxidectina + Insemax", notes: "" },
    { sourceId: "xls-san-2025-09-24-sarandi-campo-2-geral", date: "2025-09-24", quantity: 50, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 2", product: "Moxidectina", notes: "" },
    { sourceId: "xls-san-2025-09-24-sarandi-campo-4-geral", date: "2025-09-24", quantity: 98, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 4", product: "Moxidectina", notes: "" },
    { sourceId: "xls-san-2025-09-24-sarandi-campo-3-35-terneiro-52", date: "2025-09-24", quantity: null, categoryId: "35-terneiro-52-boi", categoryName: "35 Terneiro + 52 Boi", potreiro: "Campo 3", product: "Moxidectina", notes: "" },
    { sourceId: "xls-san-2025-08-16-sarandi-campo-4-geral", date: "2025-08-16", quantity: 105, categoryId: "geral", categoryName: "Geral", potreiro: "Campo 4", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-16-sarandi-campo-3-boi-grande", date: "2025-08-16", quantity: 150, categoryId: "boi-grande", categoryName: "Boi Grande", potreiro: "Campo 3", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-16-sarandi-campo-3-boi-pequeno", date: "2025-08-16", quantity: 40, categoryId: "boi-pequeno", categoryName: "Boi Pequeno", potreiro: "Campo 3", product: "Insemax + Evol", notes: "" },
    { sourceId: "xls-san-2025-08-16-sarandi-campo-2-boi-gordo", date: "2025-08-16", quantity: 14, categoryId: "boi-gordo", categoryName: "Boi Gordo", potreiro: "Campo 2", product: "Insemax + Evol", notes: "" },
  ],
};

const IMPORTED_FARM_BASELINE_VERSION = 1;
const IMPORTED_FARM_BASELINES = {
  chiquita: {
    declaredTotal: 3667,
    note: "Inventário bovino importado do relatório de novembro/2025. Os saldos ovinos, valores comerciais e notas operacionais foram levados para os dados mensais.",
    categories: [
      { id: "vaca-prenha", name: "Vaca prenha", quantity: 1481 },
      { id: "vaca-invernar", name: "Vaca invernar", quantity: 1 },
      { id: "terneiros-0-a-1-machos", name: "Terneiros 0 a 1 - machos", quantity: 630 },
      { id: "terneiras-0-a-1-femeas", name: "Terneiras 0 a 1 - femeas", quantity: 653 },
      { id: "novilho-1-a-2", name: "Novilho 1 a 2", quantity: 225 },
      { id: "novilhos-2-a-3", name: "Novilhos 2 a 3", quantity: 44 },
      { id: "vaquilona-1-a-2", name: "Vaquilona 1 a 2", quantity: 167 },
      { id: "vacas-solteiras", name: "Vacas solteiras", quantity: 162 },
      { id: "bois-do-fernando", name: "Bois do Fernando", quantity: 72 },
      { id: "terneiros-do-fernando", name: "Terneiros do Fernando", quantity: 34 },
      { id: "touros", name: "Touros", quantity: 116 },
      { id: "touros-2-ano", name: "Touros 2 ano", quantity: 24 },
      { id: "touro-1-ano", name: "Touro 1 ano", quantity: 49 },
      { id: "touro-refugo", name: "Touro refugo", quantity: 9 }
    ]
  },
  "passa-da-guarda": {
    declaredTotal: 1532,
    note: "Inventário bovino importado do relatório de novembro/2025. Os saldos ovinos, valores comerciais e notas operacionais foram levados para os dados mensais.",
    categories: [
      { id: "vaca-prenha", name: "Vaca prenha", quantity: 571 },
      { id: "vaca-invernar", name: "Vaca invernar", quantity: 44 },
      { id: "terneiros-0-a-1-machos", name: "Terneiros 0 a 1 - machos", quantity: 542 },
      { id: "vacas-solteiras", name: "Vacas solteiras", quantity: 104 },
      { id: "vaquilona-1-a-2", name: "Vaquilona 1 a 2", quantity: 159 },
      { id: "bois", name: "Bois", quantity: 72 },
      { id: "touros", name: "Touros", quantity: 27 },
      { id: "refugos-rengos", name: "Refugos / Rengos", quantity: 13 }
    ]
  },
  colorado: {
    declaredTotal: 490,
    note: "Inventário bovino importado do relatório de novembro/2025. Os saldos ovinos e valores comerciais foram levados para os dados mensais quando identificados no PDF.",
    categories: [
      { id: "bois", name: "Bois", quantity: 375 },
      { id: "vacas-solteiras", name: "Vacas solteiras", quantity: 108 },
      { id: "vaquillonas", name: "Vaquillonas", quantity: 0 },
      { id: "terneiros", name: "Terneiros", quantity: 0 },
      { id: "touros", name: "Touros", quantity: 7 }
    ]
  },
  sarandi: {
    declaredTotal: 269,
    note: "Inventário bovino importado do relatório de novembro/2025. Os saldos ovinos e as movimentações comerciais do PDF foram levados para os dados mensais.",
    categories: [
      { id: "bois", name: "Bois", quantity: 269 }
    ]
  }
};

const IMPORTED_MONTHLY_RECORDS = {
  arapey: [
    { sourceId: "pdf-2025-10-arapey-estoque-bovino", period: "2025-10", category: "estoque", title: "Saldo bovino do relatório", quantity: 3015, value: 0, notes: "Outubro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-arapey-estoque-ovino", period: "2025-10", category: "estoque", title: "Saldo ovino do relatório", quantity: 3730, value: 0, notes: "Outubro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-arapey-operacional-esquila", period: "2025-10", category: "operacional", title: "Esquila de borregos", quantity: 357, value: 0, notes: "Apontamento operacional do relatório: ESQUILA BORREGOS - 357." },
    { sourceId: "pdf-2025-11-arapey-estoque-bovino", period: "2025-11", category: "estoque", title: "Saldo bovino do relatório", quantity: 2974, value: 0, notes: "Novembro/2025: soma das categorias bovinas listadas no PDF. O inventário da fazenda segue com total declarado de 3015 cabeças." },
    { sourceId: "pdf-2025-11-arapey-estoque-ovino", period: "2025-11", category: "estoque", title: "Saldo ovino do relatório", quantity: 3730, value: 0, notes: "Novembro/2025: saldo ovino consolidado do relatório mensal." }
  ],
  chiquita: [
    { sourceId: "pdf-2025-10-chiquita-estoque-bovino", period: "2025-10", category: "estoque", title: "Saldo bovino do relatório", quantity: 3778, value: 0, notes: "Outubro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-chiquita-estoque-ovino", period: "2025-10", category: "estoque", title: "Saldo ovino do relatório", quantity: 2889, value: 0, notes: "Outubro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-chiquita-comercial-compras", period: "2025-10", category: "comercial", title: "Compras registradas no relatório", quantity: 54, value: 48450, notes: "23/10: 28 terneiros (19031) e 26 novilhos (29419)." },
    { sourceId: "pdf-2025-11-chiquita-estoque-bovino", period: "2025-11", category: "estoque", title: "Saldo bovino do relatório", quantity: 3667, value: 0, notes: "Novembro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-11-chiquita-estoque-ovino", period: "2025-11", category: "estoque", title: "Saldo ovino do relatório", quantity: 2498, value: 0, notes: "Novembro/2025: saldo ovino consolidado do relatório mensal." }
  ],
  "passa-da-guarda": [
    { sourceId: "pdf-2025-10-passa-da-guarda-estoque-bovino", period: "2025-10", category: "estoque", title: "Saldo bovino do relatório", quantity: 1592, value: 0, notes: "Outubro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-passa-da-guarda-estoque-ovino", period: "2025-10", category: "estoque", title: "Saldo ovino do relatório", quantity: 672, value: 0, notes: "Outubro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-passa-da-guarda-comercial-vendas", period: "2025-10", category: "comercial", title: "Vendas registradas no relatório", quantity: 49, value: 238275.5, notes: "06/10: 22 vacas (97092) e 12 bois (61646). 21/10: 15 bois (79537,50)." },
    { sourceId: "pdf-2025-10-passa-da-guarda-operacional-esquila", period: "2025-10", category: "operacional", title: "Esquila de ovinos", quantity: 670, value: 0, notes: "Relatório operacional: 658 ovelhas e borregas + 12 carneiros; 15 pelegos apontados à parte." },
    { sourceId: "pdf-2025-11-passa-da-guarda-estoque-bovino", period: "2025-11", category: "estoque", title: "Saldo bovino do relatório", quantity: 1532, value: 0, notes: "Novembro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-11-passa-da-guarda-estoque-ovino", period: "2025-11", category: "estoque", title: "Saldo ovino do relatório", quantity: 673, value: 0, notes: "Novembro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-11-passa-da-guarda-comercial-vendas", period: "2025-11", category: "comercial", title: "Vendas registradas no relatório", quantity: 45, value: 196665, notes: "04/11: 10 bois (47670) e 35 vacas (148995)." }
  ],
  colorado: [
    { sourceId: "pdf-2025-10-colorado-estoque-bovino", period: "2025-10", category: "estoque", title: "Saldo bovino do relatório", quantity: 478, value: 0, notes: "Outubro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-colorado-comercial-compras", period: "2025-10", category: "comercial", title: "Compras registradas no relatório", quantity: 20, value: 69747, notes: "17/10: compra de 20 bois de 1 ano." },
    { sourceId: "pdf-2025-11-colorado-estoque-bovino", period: "2025-11", category: "estoque", title: "Saldo bovino do relatório", quantity: 490, value: 0, notes: "Novembro/2025: saldo bovino consolidado do relatório mensal." }
  ],
  sarandi: [
    { sourceId: "pdf-2025-08-sarandi-comercial-vendas", period: "2025-08", category: "comercial", title: "Vendas registradas no relatório", quantity: 50, value: 255904, notes: "25/08: venda de 50 bois." },
    { sourceId: "pdf-2025-10-sarandi-estoque-bovino", period: "2025-10", category: "estoque", title: "Saldo bovino do relatório", quantity: 370, value: 0, notes: "Outubro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-sarandi-estoque-ovino", period: "2025-10", category: "estoque", title: "Saldo ovino do relatório", quantity: 156, value: 0, notes: "Outubro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-10-sarandi-comercial-compras", period: "2025-10", category: "comercial", title: "Compras registradas no relatório", quantity: 74, value: 242155.3, notes: "09/10: 23 bois (71112,50). 21/10: 20 bois (73371,90), 21 bois (73371,90) e 10 terneiros (24299)." },
    { sourceId: "pdf-2025-10-sarandi-comercial-vendas", period: "2025-10", category: "comercial", title: "Vendas registradas no relatório", quantity: 16, value: 91077, notes: "21/10: venda de 16 bois." },
    { sourceId: "pdf-2025-11-sarandi-estoque-bovino", period: "2025-11", category: "estoque", title: "Saldo bovino do relatório", quantity: 269, value: 0, notes: "Novembro/2025: saldo bovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-11-sarandi-estoque-ovino", period: "2025-11", category: "estoque", title: "Saldo ovino do relatório", quantity: 156, value: 0, notes: "Novembro/2025: saldo ovino consolidado do relatório mensal." },
    { sourceId: "pdf-2025-12-sarandi-estoque-bovino", period: "2025-12", category: "estoque", title: "Saldo bovino do relatório", quantity: 348, value: 0, notes: "Dezembro/2025: bois (348). Compra 80 cabeças no mês." },
    { sourceId: "pdf-2025-12-sarandi-comercial-compras", period: "2025-12", category: "comercial", title: "Compras registradas no relatório", quantity: 80, value: 0, notes: "Dez/2025: compra de 80 bois." },
    { sourceId: "pdf-2026-01-sarandi-estoque-bovino", period: "2026-01", category: "estoque", title: "Saldo bovino do relatório", quantity: 229, value: 0, notes: "Janeiro/2026: bois (229). Venda 119 cabeças." },
    { sourceId: "pdf-2026-01-sarandi-comercial-vendas", period: "2026-01", category: "comercial", title: "Vendas registradas no relatório", quantity: 119, value: 0, notes: "Jan/2026: venda de 119 bois." },
    { sourceId: "pdf-2026-02-sarandi-estoque-bovino", period: "2026-02", category: "estoque", title: "Saldo bovino do relatório", quantity: 298, value: 0, notes: "Fevereiro/2026: bois (298). Venda 61, compra 130." },
    { sourceId: "pdf-2026-02-sarandi-comercial-vendas", period: "2026-02", category: "comercial", title: "Vendas registradas no relatório", quantity: 61, value: 0, notes: "Fev/2026: venda de 61 bois." },
    { sourceId: "pdf-2026-02-sarandi-comercial-compras", period: "2026-02", category: "comercial", title: "Compras registradas no relatório", quantity: 130, value: 0, notes: "Fev/2026: compra de 130 bois." },
    { sourceId: "pdf-2026-03-sarandi-estoque-bovino", period: "2026-03", category: "estoque", title: "Saldo bovino do relatório", quantity: 310, value: 0, notes: "Março/2026: bois (310). Compra 12 cabeças." },
    { sourceId: "pdf-2026-03-sarandi-comercial-compras", period: "2026-03", category: "comercial", title: "Compras registradas no relatório", quantity: 12, value: 0, notes: "Mar/2026: compra de 12 bois." }
  ]
};

// Registros mensais estendidos dez/25 a mar/26 (todos inseridos no array de cada fazenda acima por spread)
const EXTENDED_MONTHLY_RECORDS = {
  arapey: [
    { sourceId: "pdf-2025-12-arapey-estoque-bovino", period: "2025-12", category: "estoque", title: "Saldo bovino do relatório", quantity: 3968, value: 0, notes: "Dezembro/2025: saldo bovino consolidado. Compra 857 terneiros 0-1 e 25 touros novos." },
    { sourceId: "pdf-2025-12-arapey-comercial-compras", period: "2025-12", category: "comercial", title: "Compras registradas", quantity: 882, value: 0, notes: "Dez/2025: 857 terneiros 0-1 + 25 touros." },
    { sourceId: "pdf-2026-01-arapey-estoque-bovino", period: "2026-01", category: "estoque", title: "Saldo bovino do relatório", quantity: 3960, value: 0, notes: "Janeiro/2026: saldo 3960. Venda 100 bois." },
    { sourceId: "pdf-2026-01-arapey-comercial-vendas", period: "2026-01", category: "comercial", title: "Vendas registradas", quantity: 100, value: 0, notes: "Jan/2026: venda de 100 bois." },
    { sourceId: "pdf-2026-02-arapey-estoque-bovino", period: "2026-02", category: "estoque", title: "Saldo bovino do relatório", quantity: 3852, value: 0, notes: "Fevereiro/2026: saldo 3852. Venda 58 bois. Mortes: 2 vacas prenhas, 2 terneiros machos, 1 touro." },
    { sourceId: "pdf-2026-02-arapey-comercial-vendas", period: "2026-02", category: "comercial", title: "Vendas registradas", quantity: 58, value: 0, notes: "Fev/2026: venda de 58 bois." },
    { sourceId: "pdf-2026-03-arapey-estoque-bovino", period: "2026-03", category: "estoque", title: "Saldo bovino do relatório", quantity: 3789, value: 0, notes: "Março/2026: saldo 3789. Sem vendas. Sem compras." }
  ],
  chiquita: [
    { sourceId: "pdf-2025-12-chiquita-estoque-bovino", period: "2025-12", category: "estoque", title: "Saldo bovino do relatório", quantity: 3562, value: 0, notes: "Dezembro/2025: saldo 3562. Vendas: 130 novilhos, 26 bois Fernando. Compra: 52 terneiros Fernando." },
    { sourceId: "pdf-2025-12-chiquita-comercial-vendas", period: "2025-12", category: "comercial", title: "Vendas registradas", quantity: 156, value: 0, notes: "Dez/2025: 130 novilhos + 26 bois Fernando." },
    { sourceId: "pdf-2025-12-chiquita-comercial-compras", period: "2025-12", category: "comercial", title: "Compras registradas", quantity: 52, value: 0, notes: "Dez/2025: 52 terneiros Fernando." },
    { sourceId: "pdf-2026-01-chiquita-estoque-bovino", period: "2026-01", category: "estoque", title: "Saldo bovino do relatório", quantity: 3403, value: 0, notes: "Janeiro/2026: saldo 3403. Vendas: 126 novilhos 1-2, 30 bois Fernando, 86 terneiros Fernando." },
    { sourceId: "pdf-2026-01-chiquita-comercial-vendas", period: "2026-01", category: "comercial", title: "Vendas registradas", quantity: 242, value: 0, notes: "Jan/2026: 126 novilhos + 30 bois Fernando + 86 terneiros Fernando." },
    { sourceId: "pdf-2026-02-chiquita-estoque-bovino", period: "2026-02", category: "estoque", title: "Saldo bovino do relatório", quantity: 3743, value: 0, notes: "Fevereiro/2026: saldo 3743. Mortes: 5 terneiros machos, 5 terneiras, 3 novilhos. Compras: 78 bois Fernando, 119 terneiros Fernando." },
    { sourceId: "pdf-2026-02-chiquita-comercial-compras", period: "2026-02", category: "comercial", title: "Compras registradas", quantity: 197, value: 0, notes: "Fev/2026: 78 bois Fernando + 119 terneiros Fernando." },
    { sourceId: "pdf-2026-03-chiquita-estoque-bovino", period: "2026-03", category: "estoque", title: "Saldo bovino do relatório", quantity: 3743, value: 0, notes: "Março/2026: saldo 3743. Sem movimentações." }
  ],
  "passa-da-guarda": [
    { sourceId: "pdf-2025-12-passa-da-guarda-estoque-bovino", period: "2025-12", category: "estoque", title: "Saldo bovino do relatório", quantity: 1524, value: 0, notes: "Dezembro/2025: saldo 1524. Vendas: 38 vacas invernar, 15 bois. Compra 45 bois." },
    { sourceId: "pdf-2025-12-passa-da-guarda-comercial-vendas", period: "2025-12", category: "comercial", title: "Vendas registradas", quantity: 53, value: 0, notes: "Dez/2025: 38 vacas invernar + 15 bois." },
    { sourceId: "pdf-2025-12-passa-da-guarda-comercial-compras", period: "2025-12", category: "comercial", title: "Compras registradas", quantity: 45, value: 0, notes: "Dez/2025: 45 bois." },
    { sourceId: "pdf-2026-01-passa-da-guarda-estoque-bovino", period: "2026-01", category: "estoque", title: "Saldo bovino do relatório", quantity: 1499, value: 0, notes: "Janeiro/2026: saldo 1499. Vendas: 10 vacas prenhas, 5 vacas invernar, 10 bois." },
    { sourceId: "pdf-2026-01-passa-da-guarda-comercial-vendas", period: "2026-01", category: "comercial", title: "Vendas registradas", quantity: 25, value: 0, notes: "Jan/2026: 10 vacas prenhas + 5 vacas invernar + 10 bois." },
    { sourceId: "pdf-2026-02-passa-da-guarda-estoque-bovino", period: "2026-02", category: "estoque", title: "Saldo bovino do relatório", quantity: 1499, value: 0, notes: "Fevereiro/2026: saldo 1499. Sem movimentações." },
    { sourceId: "pdf-2026-03-passa-da-guarda-estoque-bovino", period: "2026-03", category: "estoque", title: "Saldo bovino do relatório", quantity: 1498, value: 0, notes: "Março/2026: saldo 1498. Morte: 1 vaquillona 1-2." }
  ],
  colorado: [
    { sourceId: "pdf-2025-12-colorado-estoque-bovino", period: "2025-12", category: "estoque", title: "Saldo bovino do relatório", quantity: 467, value: 0, notes: "Dezembro/2025: saldo 467. Vendas: 125 bois. Compras: 25 bois, 78 vaquillonas. Morte: 1 vaca solteira." },
    { sourceId: "pdf-2025-12-colorado-comercial-vendas", period: "2025-12", category: "comercial", title: "Vendas registradas", quantity: 125, value: 0, notes: "Dez/2025: 125 bois." },
    { sourceId: "pdf-2025-12-colorado-comercial-compras", period: "2025-12", category: "comercial", title: "Compras registradas", quantity: 103, value: 0, notes: "Dez/2025: 25 bois + 78 vaquillonas." },
    { sourceId: "pdf-2026-01-colorado-estoque-bovino", period: "2026-01", category: "estoque", title: "Saldo bovino do relatório", quantity: 467, value: 0, notes: "Janeiro/2026: saldo 467. Sem movimentações." },
    { sourceId: "pdf-2026-02-colorado-estoque-bovino", period: "2026-02", category: "estoque", title: "Saldo bovino do relatório", quantity: 467, value: 0, notes: "Fevereiro/2026: saldo 467. Sem movimentações. Vacas solteiras aumentaram (185)." },
    { sourceId: "pdf-2026-03-colorado-estoque-bovino", period: "2026-03", category: "estoque", title: "Saldo bovino do relatório", quantity: 467, value: 0, notes: "Março/2026: saldo 467. Sem movimentações." }
  ]
};

// Versão 2: todos os valores convertidos para R$ (USD × cotação aproximada por mês)
const COMMERCIAL_MOVEMENTS_VERSION = 2;

const IMPORTED_COMMERCIAL_MOVEMENTS = {
  arapey: [
    // Vendas — USD convertido para R$ (set/out-25 ×5,55 | nov/25 ×5,75 | dez/25 ×6,00 | jan/26 ×6,10 | fev/26 ×5,90 | mar-abr/26 ×5,85)
    { sourceId: "pdf-mov-2025-09-24-arapey-venda-novillo-marfrig", type: "venda", date: "2025-09-24", categoryId: "pdf-novillo", categoryName: "Novillo", quantity: 11, delta: -11, value: 82113, saleDetails: { mode: "carcaca", pricePerKg: 30.36, weightKg: 2740.4 }, notes: "MARFRIG | Carcaça 2740kg | US$5,47/kg (×5,55) = R$30,36/kg | R$7465/animal" },
    { sourceId: "pdf-mov-2025-09-24-arapey-venda-vacas-marfrig", type: "venda", date: "2025-09-24", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 58, delta: -58, value: 383221, saleDetails: { mode: "carcaca", pricePerKg: 28.42, weightKg: 13486.1 }, notes: "MARFRIG | Carcaça 13486kg | US$5,12/kg (×5,55) = R$28,42/kg | R$6607/animal" },
    { sourceId: "pdf-mov-2025-09-24-arapey-venda-touro-marfrig", type: "venda", date: "2025-09-24", categoryId: "pdf-touros", categoryName: "Touros", quantity: 2, delta: -2, value: 12837, saleDetails: { mode: "carcaca", pricePerKg: 19.43, weightKg: 661 }, notes: "MARFRIG | Carcaça 661kg | US$3,50/kg (×5,55) = R$19,43/kg | R$6419/animal" },
    { sourceId: "pdf-mov-2025-11-04-arapey-venda-novillo-marfrig", type: "venda", date: "2025-11-04", categoryId: "pdf-novillo", categoryName: "Novillo", quantity: 88, delta: -88, value: 663924, saleDetails: { mode: "carcaca", pricePerKg: 30.42, weightKg: 21826 }, notes: "MARFRIG | Carcaça 21826kg | US$5,29/kg (×5,75) = R$30,42/kg | R$7544/animal" },
    { sourceId: "pdf-mov-2025-11-04-arapey-venda-vacas-marfrig", type: "venda", date: "2025-11-04", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 23, delta: -23, value: 159465, saleDetails: { mode: "carcaca", pricePerKg: 28.35, weightKg: 5624 }, notes: "MARFRIG | Carcaça 5624kg | US$4,93/kg (×5,75) = R$28,35/kg | R$6933/animal" },
    { sourceId: "pdf-mov-2025-11-04-arapey-venda-borregos-titinho", type: "venda", date: "2025-11-04", categoryId: "pdf-borregos", categoryName: "Borregos", quantity: 320, delta: -320, value: 173403, saleDetails: { mode: "carcaca", pricePerKg: 32.95, weightKg: 5263 }, notes: "TITINHO | Carcaça 5263kg (16,4kg/cab) | US$5,73/kg (×5,75) = R$32,95/kg | R$542/animal" },
    { sourceId: "pdf-mov-2025-11-20-arapey-venda-vacas-marfrig", type: "venda", date: "2025-11-20", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 38, delta: -38, value: 206373, saleDetails: { mode: "carcaca", pricePerKg: 27.60, weightKg: 7475 }, notes: "MARFRIG | Carcaça 7475kg | US$4,80/kg (×5,75) = R$27,60/kg | R$5431/animal" },
    { sourceId: "pdf-mov-2025-12-15-arapey-venda-cordeiros-titinho", type: "venda", date: "2025-12-15", categoryId: "pdf-cordeiros", categoryName: "Cordeiros", quantity: 369, delta: -369, value: 157748, saleDetails: { mode: "carcaca", pricePerKg: 34.20, weightKg: 4615.3 }, notes: "TITINHO | Carcaça 4615kg (12,5kg/cab) | US$5,70/kg (×6,00) = R$34,20/kg | R$427/animal" },
    { sourceId: "pdf-mov-2026-01-17-arapey-venda-novillo-feedlot", type: "venda", date: "2026-01-17", categoryId: "pdf-novillo", categoryName: "Novillo", quantity: 100, delta: -100, value: 799033, saleDetails: { mode: "vivo", pricePerKg: 17.39, weightKg: 45961 }, notes: "FEEDLOT | Peso médio 459,61kg | US$2,85/kg (×6,10) = R$17,39/kg | R$7990/animal" },
    { sourceId: "pdf-mov-2026-02-23-arapey-venda-novillo-feedlot", type: "venda", date: "2026-02-23", categoryId: "pdf-novillo", categoryName: "Novillo", quantity: 58, delta: -58, value: 523890, saleDetails: { mode: "vivo", pricePerKg: 19.77, weightKg: 26506 }, notes: "FEEDLOT | Peso médio 457kg | US$3,35/kg (×5,90) = R$19,77/kg | R$9032/animal" },
    { sourceId: "pdf-mov-2026-03-13-arapey-venda-novillo-agrooriental", type: "venda", date: "2026-03-13", categoryId: "pdf-novillo", categoryName: "Novillo", quantity: 70, delta: -70, value: 540000, saleDetails: { mode: "carcaca", pricePerKg: 19.19, weightKg: 28140 }, notes: "AGROORIENTAL | Carcaça 28140kg (402kg/cab) | US$3,28/kg (×5,85) = R$19,19/kg | R$7714/animal" },
    { sourceId: "pdf-mov-2026-03-14-arapey-venda-vacas-agrooriental", type: "venda", date: "2026-03-14", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 51, delta: -51, value: 335865, saleDetails: { mode: "carcaca", pricePerKg: 13.92, weightKg: 24123 }, notes: "AGROORIENTAL | Carcaça 24123kg (473kg/cab) | US$2,38/kg (×5,85) = R$13,92/kg | R$6585/animal" },
    // Compras
    { sourceId: "pdf-mov-2025-11-13-arapey-compra-touros", type: "compra", date: "2025-11-13", categoryId: "pdf-touros", categoryName: "Touros", quantity: 4, delta: 4, value: 0, saleDetails: null, notes: "Compra de 4 touros (valor não informado no PDF)" }
  ],
  chiquita: [
    // Vendas — USD convertido para R$ (mesmas taxas acima)
    { sourceId: "pdf-mov-2025-09-01-chiquita-venda-boi-marfrig", type: "venda", date: "2025-09-01", categoryId: "pdf-bois", categoryName: "Bois", quantity: 80, delta: -80, value: 575734, saleDetails: { mode: "carcaca", pricePerKg: 29.14, weightKg: 16948.3 }, notes: "MARFRIG | Carcaça 16948kg | US$5,25/kg (×5,55) = R$29,14/kg | R$7197/animal" },
    { sourceId: "pdf-mov-2025-09-01-chiquita-venda-vaca-marfrig", type: "venda", date: "2025-09-01", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 30, delta: -30, value: 183422, saleDetails: { mode: "carcaca", pricePerKg: 27.42, weightKg: 5571.5 }, notes: "MARFRIG | Carcaça 5571kg | US$4,94/kg (×5,55) = R$27,42/kg | R$6114/animal" },
    { sourceId: "pdf-mov-2025-09-01-chiquita-venda-touro-marfrig", type: "venda", date: "2025-09-01", categoryId: "pdf-touros", categoryName: "Touros", quantity: 1, delta: -1, value: 7152, saleDetails: { mode: "carcaca", pricePerKg: 18.87, weightKg: 379 }, notes: "MARFRIG | Carcaça 379kg | US$3,40/kg (×5,55) = R$18,87/kg | R$7152/animal" },
    { sourceId: "pdf-mov-2025-10-13-chiquita-venda-boi-marfrig", type: "venda", date: "2025-10-13", categoryId: "pdf-bois", categoryName: "Bois", quantity: 67, delta: -67, value: 526464, saleDetails: { mode: "carcaca", pricePerKg: 31.63, weightKg: 31691 }, notes: "MARFRIG | Carcaça 31691kg | US$5,50/kg (×5,75) = R$31,63/kg | R$7857/animal" },
    { sourceId: "pdf-mov-2025-10-13-chiquita-venda-vaca-marfrig", type: "venda", date: "2025-10-13", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 57, delta: -57, value: 382208, saleDetails: { mode: "carcaca", pricePerKg: 29.67, weightKg: 25935 }, notes: "MARFRIG | Carcaça 25935kg | US$5,16/kg (×5,75) = R$29,67/kg | R$6705/animal" },
    { sourceId: "pdf-mov-2025-11-21-chiquita-venda-vacas-marfrig", type: "venda", date: "2025-11-21", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 39, delta: -39, value: 229589, saleDetails: { mode: "carcaca", pricePerKg: 27.03, weightKg: 8456 }, notes: "MARFRIG | Carcaça 8456kg | US$4,70/kg (×5,75) = R$27,03/kg | R$5887/animal" },
    { sourceId: "pdf-mov-2025-11-21-chiquita-venda-boi-marfrig", type: "venda", date: "2025-11-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 70, delta: -70, value: 483132, saleDetails: { mode: "carcaca", pricePerKg: 29.90, weightKg: 16158.5 }, notes: "MARFRIG | Carcaça 16158kg | US$5,20/kg (×5,75) = R$29,90/kg | R$6902/animal" },
    { sourceId: "pdf-mov-2025-12-02-chiquita-venda-cordeiro-artigas", type: "venda", date: "2025-12-02", categoryId: "pdf-cordeiros", categoryName: "Cordeiros", quantity: 203, delta: -203, value: 93601, saleDetails: { mode: "carcaca", pricePerKg: 34.68, weightKg: 2699 }, notes: "ARTIGAS | Carcaça 2699kg (13,3kg/cab) | US$5,78/kg (×6,00) = R$34,68/kg | R$461/animal" },
    { sourceId: "pdf-mov-2025-12-04-chiquita-venda-borrego-durazno", type: "venda", date: "2025-12-04", categoryId: "pdf-borregos", categoryName: "Borregos", quantity: 150, delta: -150, value: 101120, saleDetails: { mode: "carcaca", pricePerKg: 34.50, weightKg: 6135 }, notes: "DURAZNO | Carcaça 6135kg (19,5kg/cab) | US$5,75/kg (×6,00) = R$34,50/kg | R$674/animal" },
    { sourceId: "pdf-mov-2026-01-27-chiquita-venda-novillos-agrooriental", type: "venda", date: "2026-01-27", categoryId: "pdf-novillos", categoryName: "Novillos", quantity: 156, delta: -156, value: 1267336, saleDetails: { mode: "vivo", pricePerKg: 18.06, weightKg: 70188 }, notes: "AGROORIENTAL | Peso médio 449,93kg | US$2,96/kg (×6,10) = R$18,06/kg | R$8124/animal" },
    { sourceId: "pdf-mov-2026-03-30-chiquita-venda-novillos", type: "venda", date: "2026-03-30", categoryId: "pdf-novillos", categoryName: "Novillos", quantity: 46, delta: -46, value: 424681, saleDetails: { mode: "vivo", pricePerKg: 19.60, weightKg: 21666 }, notes: "Peso médio 471kg | US$3,35/kg (×5,85) = R$19,60/kg | R$9232/animal" },
    // Compras (valores já em R$)
    { sourceId: "pdf-mov-2025-10-23-chiquita-compra-terneiros", type: "compra", date: "2025-10-23", categoryId: "pdf-terneiros", categoryName: "Terneiros", quantity: 28, delta: 28, value: 19031, saleDetails: null, notes: "Ganadeira | P.médio 185kg | R$3,65/kg | R$680/animal" },
    { sourceId: "pdf-mov-2025-10-23-chiquita-compra-novilhos", type: "compra", date: "2025-10-23", categoryId: "pdf-novilhos", categoryName: "Novilhos", quantity: 26, delta: 26, value: 29419, saleDetails: null, notes: "Ganadeira | P.médio 365kg | R$3,10/kg | R$1132/animal" },
    { sourceId: "pdf-mov-2025-10-13-chiquita-compra-touros", type: "compra", date: "2025-10-13", categoryId: "pdf-touros", categoryName: "Touros", quantity: 6, delta: 6, value: 0, saleDetails: null, notes: "Compra de 6 touros (valor não informado)" },
    { sourceId: "pdf-mov-2026-01-02-chiquita-compra-novillos", type: "compra", date: "2026-01-02", categoryId: "pdf-novillos", categoryName: "Novillos", quantity: 52, delta: 52, value: 53704, saleDetails: null, notes: "Ganadeira | P.médio 243kg | R$679,80/animal" },
    { sourceId: "pdf-mov-2026-02-18-chiquita-compra-terneiros", type: "compra", date: "2026-02-18", categoryId: "pdf-terneiros", categoryName: "Terneiros", quantity: 79, delta: 79, value: 0, saleDetails: null, notes: "Ganadeira | P.médio 165kg | 13035kg total | R$4,12/kg" },
    { sourceId: "pdf-mov-2026-02-25-chiquita-compra-terneiros", type: "compra", date: "2026-02-25", categoryId: "pdf-terneiros", categoryName: "Terneiros", quantity: 119, delta: 119, value: 92280, saleDetails: null, notes: "Ganadeira | P.médio 203kg | 24157kg total | R$3,82/kg | R$775,46/animal" }
  ],
  "passa-da-guarda": [
    // Vendas já existentes
    { sourceId: "pdf-mov-2025-10-06-passa-da-guarda-venda-vacas", type: "venda", date: "2025-10-06", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 22, delta: -22, value: 97092, saleDetails: { mode: "vivo", pricePerKg: 9, weightKg: 10788 }, notes: "KROT | P.médio 490,4kg | R$9,00/kg | R$4413/animal" },
    { sourceId: "pdf-mov-2025-10-06-passa-da-guarda-venda-bois", type: "venda", date: "2025-10-06", categoryId: "pdf-bois", categoryName: "Bois", quantity: 12, delta: -12, value: 61646, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 5871 }, notes: "KROT | P.médio 489,3kg | R$10,50/kg | R$5137/animal" },
    { sourceId: "pdf-mov-2025-08-11-passa-da-guarda-venda-bois", type: "venda", date: "2025-08-11", categoryId: "pdf-bois", categoryName: "Bois", quantity: 23, delta: -23, value: 121569, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 11578 }, notes: "P.médio 503,4kg | R$10,50/kg | R$5286/animal" },
    { sourceId: "pdf-mov-2025-08-11-passa-da-guarda-venda-vacas", type: "venda", date: "2025-08-11", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 23, delta: -23, value: 97974, saleDetails: { mode: "vivo", pricePerKg: 9, weightKg: 10886 }, notes: "P.médio 473,3kg | R$9,00/kg | R$4260/animal" },
    { sourceId: "pdf-mov-2025-10-21-passa-da-guarda-venda-bois", type: "venda", date: "2025-10-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 15, delta: -15, value: 79537.5, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 7575 }, notes: "FRIGOVALE | P.médio 505kg | R$10,50/kg | R$5303/animal" },
    { sourceId: "pdf-mov-2025-11-04-passa-da-guarda-venda-bois", type: "venda", date: "2025-11-04", categoryId: "pdf-bois", categoryName: "Bois", quantity: 10, delta: -10, value: 47670, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 4540 }, notes: "P.médio 454kg | R$10,50/kg | R$4767/animal" },
    { sourceId: "pdf-mov-2025-11-04-passa-da-guarda-venda-vacas", type: "venda", date: "2025-11-04", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 35, delta: -35, value: 148995, saleDetails: { mode: "vivo", pricePerKg: 9, weightKg: 16555 }, notes: "P.médio 473kg | R$9,00/kg | R$4257/animal" },
    { sourceId: "pdf-mov-2025-12-17-passa-da-guarda-venda-cordeiros", type: "venda", date: "2025-12-17", categoryId: "pdf-cordeiros", categoryName: "Cordeiros", quantity: 50, delta: -50, value: 20450, saleDetails: { mode: "vivo", pricePerKg: 12.5, weightKg: 1636 }, notes: "Cordeiros | P.médio 32,72kg | R$12,50/kg | R$409/animal" },
    { sourceId: "pdf-mov-2026-01-22-passa-da-guarda-venda-vacas", type: "venda", date: "2026-01-22", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 15, delta: -15, value: 74551.4, saleDetails: { mode: "vivo", pricePerKg: 10.3, weightKg: 7238 }, notes: "P.médio 471kg | R$10,30/kg | R$4970/animal" },
    { sourceId: "pdf-mov-2026-01-22-passa-da-guarda-venda-bois", type: "venda", date: "2026-01-22", categoryId: "pdf-bois", categoryName: "Bois", quantity: 10, delta: -10, value: 49714.5, saleDetails: { mode: "vivo", pricePerKg: 11.5, weightKg: 4323 }, notes: "P.médio 432kg | R$11,50/kg | R$4971/animal" },
    { sourceId: "pdf-mov-2026-03-04-passa-da-guarda-venda-bois", type: "venda", date: "2026-03-04", categoryId: "pdf-bois", categoryName: "Bois", quantity: 25, delta: -25, value: 140388, saleDetails: { mode: "vivo", pricePerKg: 12, weightKg: 11699 }, notes: "P.médio 467kg | R$12,00/kg | R$5616/animal" },
    { sourceId: "pdf-mov-2026-03-07-passa-da-guarda-venda-vacas", type: "venda", date: "2026-03-07", categoryId: "pdf-vacas", categoryName: "Vacas", quantity: 32, delta: -32, value: 162613, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 15487 }, notes: "P.médio 484kg | R$10,50/kg | R$5082/animal" },
    { sourceId: "pdf-mov-2026-03-17-passa-da-guarda-venda-vaquillonas-navio", type: "venda", date: "2026-03-17", categoryId: "pdf-vaquillonas", categoryName: "Vaquillonas", quantity: 41, delta: -41, value: 202419, saleDetails: { mode: "vivo", pricePerKg: 13.5, weightKg: 14994 }, notes: "NAVIO | P.médio 365,7kg | R$13,50/kg | R$4937/animal" },
    { sourceId: "pdf-mov-2026-04-04-passa-da-guarda-venda-bois-navio", type: "venda", date: "2026-04-04", categoryId: "pdf-bois", categoryName: "Bois", quantity: 25, delta: -25, value: 133137.5, saleDetails: { mode: "vivo", pricePerKg: 12.5, weightKg: 10651 }, notes: "NAVIO | P.médio 426kg | R$12,50/kg | R$5326/animal" }
  ],
  colorado: [
    { sourceId: "pdf-mov-2025-10-17-colorado-compra-boi-1-ano", type: "compra", date: "2025-10-17", categoryId: "pdf-boi-1-ano", categoryName: "Boi 1 ano", quantity: 20, delta: 20, value: 69747, saleDetails: null, notes: "Importado do PDF mensal: compra de 20 bois de 1 ano." }
  ],
  sarandi: [
    { sourceId: "pdf-mov-2025-08-25-sarandi-venda-bois", type: "venda", date: "2025-08-25", categoryId: "pdf-bois", categoryName: "Bois", quantity: 50, delta: -50, value: 255904, saleDetails: { mode: "vivo", pricePerKg: 11, weightKg: 23264 }, notes: "TCHARLIE | P.médio 465kg | R$11,00/kg | R$5118/animal" },
    { sourceId: "pdf-mov-2025-10-09-sarandi-compra-bois", type: "compra", date: "2025-10-09", categoryId: "pdf-bois", categoryName: "Bois", quantity: 23, delta: 23, value: 71112.5, saleDetails: null, notes: "LUCAS | P.médio 247,35kg | R$12,50/kg | R$3092/animal" },
    { sourceId: "pdf-mov-2025-10-21-sarandi-compra-bois-lote-20", type: "compra", date: "2025-10-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 20, delta: 20, value: 73371.9, saleDetails: null, notes: "PUJOL | P.médio 311kg | R$11,25/kg | R$3493,90/animal" },
    { sourceId: "pdf-mov-2025-10-21-sarandi-compra-bois-lote-21", type: "compra", date: "2025-10-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 21, delta: 21, value: 73371.9, saleDetails: null, notes: "PUJOL | R$3493,90/animal" },
    { sourceId: "pdf-mov-2025-10-21-sarandi-compra-terneiros", type: "compra", date: "2025-10-21", categoryId: "pdf-terneiros", categoryName: "Terneiros", quantity: 10, delta: 10, value: 24299, saleDetails: null, notes: "NELZA QUADROS | P.médio 221kg | R$11,00/kg | R$2429,90/animal" },
    { sourceId: "pdf-mov-2025-10-21-sarandi-venda-bois", type: "venda", date: "2025-10-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 16, delta: -16, value: 91077, saleDetails: { mode: "vivo", pricePerKg: 10.5, weightKg: 8674 }, notes: "FRIGOVALE | P.médio 542kg | R$10,50/kg | R$5692/animal" },
    { sourceId: "pdf-mov-2025-11-24-sarandi-venda-bois-tcharlie", type: "venda", date: "2025-11-24", categoryId: "pdf-bois", categoryName: "Bois", quantity: 100, delta: -100, value: 509008.2, saleDetails: { mode: "vivo", pricePerKg: 10.9, weightKg: 46698 }, notes: "TCHARLIE | P.médio 467kg | R$10,90/kg | R$5090/animal" },
    { sourceId: "pdf-mov-2026-01-14-sarandi-venda-bois-renan", type: "venda", date: "2026-01-14", categoryId: "pdf-bois", categoryName: "Bois", quantity: 44, delta: -44, value: 244752, saleDetails: { mode: "vivo", pricePerKg: 12, weightKg: 20396 }, notes: "RENAN SALD | P.médio 463,5kg | R$12,00/kg | R$5563/animal" },
    { sourceId: "pdf-mov-2026-01-19-sarandi-venda-bois-tcharlie", type: "venda", date: "2026-01-19", categoryId: "pdf-bois", categoryName: "Bois", quantity: 75, delta: -75, value: 400716, saleDetails: { mode: "vivo", pricePerKg: 12, weightKg: 33393 }, notes: "TCHARLIE | P.médio 445kg | R$12,00/kg | R$5342,88/animal" },
    { sourceId: "pdf-mov-2026-03-01-sarandi-venda-bois-frigovale", type: "venda", date: "2026-03-01", categoryId: "pdf-bois", categoryName: "Bois", quantity: 16, delta: -16, value: 91816, saleDetails: { mode: "vivo", pricePerKg: 11.5, weightKg: 7984 }, notes: "FRIGOVALE | P.médio 499kg | R$11,50/kg | R$5738,50/animal" },
    { sourceId: "pdf-mov-2026-02-21-sarandi-venda-bois-confinamento", type: "venda", date: "2026-02-21", categoryId: "pdf-bois", categoryName: "Bois", quantity: 45, delta: -45, value: 253260, saleDetails: { mode: "vivo", pricePerKg: 12, weightKg: 21105 }, notes: "CONFINAMENTO | P.médio 469kg | R$12,00/kg | R$5628/animal" }
  ]
};

const seedData = {
  selectedFarmId: TOTAL_FARM_ID,
  auth: {
    sessionUserId: "",
    users: DEFAULT_USERS.map((user) => ({ ...user }))
  },
  farms: {
    arapey: {
      id: "arapey",
      name: "Arapey",
      declaredTotal: 3015,
      note: "Controle inicial carregado com os grupos informados e ajuste de conferência para manter o total declarado.",
      sanitaryProducts: ["Vacina aftosa", "Vermifugo", "Ivermectina"],
      potreiros: [],
      categories: [
        { id: "vacas-cria", name: "Vacas de cria", quantity: 990 },
        { id: "terneiros-machos", name: "Terneiros 1 a 2 anos - machos", quantity: 425 },
        { id: "terneiros-femeas", name: "Terneiros 1 a 2 anos - femeas", quantity: 420 },
        { id: "bois-abate", name: "Bois de abate", quantity: 400 },
        { id: "novilhas-entouradas", name: "Novilhas entouradas", quantity: 400 },
        { id: "touros", name: "Touros", quantity: 140 },
        { id: "vacas-invernar", name: "Vacas de invernar", quantity: 30 },
        { id: "vacas-entouradas", name: "Vacas entouradas", quantity: 190 },
        { id: "ajuste-inicial", name: "Ajuste inicial de conferência", quantity: 20 }
      ],
      movements: [],
      sanitaryRecords: [],
      monthlyRecords: []
    },
    chiquita: {
      ...createStandardFarm("chiquita", "Chiquita")
    },
    "passa-da-guarda": {
      ...createStandardFarm("passa-da-guarda", "Passo da Guarda")
    },
    colorado: {
      ...createStandardFarm("colorado", "Colorado")
    },
    sarandi: {
      ...createStandardFarm("sarandi", "Sarandi")
    }
  }
};

const runtime = {
  storageEnabled: true,
  appInitialized: false,
  splashDismissed: false,
  movementPhotoDrafts: [],
  editStockContextFarmId: TOTAL_FARM_ID,
  pdfContextFarmId: TOTAL_FARM_ID,
  arapeyKmlData: null,
  arapeyKmlPromise: null,
  georefDraft: null,
  cloudToken: null,
  cloudSyncing: false,
  cloudEnabled: true,
  editingMovement: null,  // { farmId, movementId } when editing an existing movement
  potrManej: { farmId: null, potreirosId: null, type: "transferencia", photoDrafts: [] },
  movementsSearch: "",
  movementsPage: 0,
  movementsFarmFilter: "all",
  movementsCategoryFilter: "all",
  movementsOperationFilter: "all",
  movementsYearFilter: "all",
  sanitarySearch: "",
  sanitaryPage: 0,
};

const today = new Date();
const state = {
  data: loadData(),
  filters: {
    year: String(today.getFullYear()),
    month: "all"
  },
  activeView: "dashboard",
  charts: {
    inventory: null,
    movement: null,
    ranking: null,
    monthlyEvolution: null,
    monthlyCategory: null
  },
  userEditingId: null,
  userEditingMode: null,
  monthlyEditingId: null
};

const elements = {
  splashShell: document.getElementById("splashShell"),
  authShell: document.getElementById("authShell"),
  pageShell: document.getElementById("pageShell"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginFeedback: document.getElementById("loginFeedback"),
  farmSwitch: document.getElementById("farmSwitch"),
  sanitaryShortcut: document.getElementById("sanitaryShortcut"),
  quickComprasBtn: document.getElementById("quickComprasBtn"),
  quickVendasBtn: document.getElementById("quickVendasBtn"),
  dashboardFarmLabel: document.getElementById("dashboardFarmLabel"),
  dashboardView: document.getElementById("dashboardView"),
  sanitaryView: document.getElementById("sanitaryView"),
  heroMetrics: document.getElementById("heroMetrics"),
  visualHerdGrid: document.getElementById("visualHerdGrid"),
  globalSummaryGrid: document.getElementById("globalSummaryGrid"),
  globalFarmBreakdown: document.getElementById("globalFarmBreakdown"),
  globalCategoryBreakdown: document.getElementById("globalCategoryBreakdown"),
  globalPanelKicker: document.getElementById("globalPanelKicker"),
  globalPanelTitle: document.getElementById("globalPanelTitle"),
  globalPanelChip: document.getElementById("globalPanelChip"),
  monthlySummaryGrid: document.getElementById("monthlySummaryGrid"),
  monthlyProtocolList: document.getElementById("monthlyProtocolList"),
  monthlyProtocolCount: document.getElementById("monthlyProtocolCount"),
  monthlyProtocolSection: document.getElementById("monthlyProtocolSection"),
  monthlySummarySection: document.getElementById("monthlySummarySection"),
  summaryGrid: document.getElementById("summaryGrid"),
  periodSummary: document.getElementById("periodSummary"),
  salesSummarySection: document.getElementById("salesSummary")?.closest("section") || null,
  salesSummary: document.getElementById("salesSummary"),
  salesTimelinePanel: document.getElementById("salesTableBody")?.closest("article") || null,
  salesTableBody: document.getElementById("salesTableBody"),
  monthlyCategoryPanel: document.getElementById("monthlyCategoryChart")?.closest("article") || null,
  movementsTableBody: document.getElementById("movementsTableBody"),
  movementsTableHead: document.getElementById("movementsTableHead"),
  discrepancyNote: document.getElementById("discrepancyNote"),
  insightList: document.getElementById("insightList"),
  heroFarmName: document.getElementById("heroFarmName"),
  heroFarmNote: document.getElementById("heroFarmNote"),
  yearFilter: document.getElementById("yearFilter"),
  monthFilter: document.getElementById("monthFilter"),
  movementDialog: document.getElementById("movementDialog"),
  movementDialogTitle: document.getElementById("movementDialogTitle"),
  movementForm: document.getElementById("movementForm"),
  movementFarm: document.getElementById("movementFarm"),
  movementFarmWrap: document.getElementById("movementFarmWrap"),
  movementType: document.getElementById("movementType"),
  movementDate: document.getElementById("movementDate"),
  movementCategory: document.getElementById("movementCategory"),
  movementQuantity: document.getElementById("movementQuantity"),
  movementPotreiroWrap: document.getElementById("movementPotreiroWrap"),
  movementPotreiroLabel: document.getElementById("movementPotreiroLabel"),
  movementPotreiro: document.getElementById("movementPotreiro"),
  movementPotreirowDestWrap: document.getElementById("movementPotreirowDestWrap"),
  movementPotreiroDest: document.getElementById("movementPotreiroDest"),
  adjustDirectionWrap: document.getElementById("adjustDirectionWrap"),
  adjustDirection: document.getElementById("adjustDirection"),
  movementSaleModeWrap: document.getElementById("movementSaleModeWrap"),
  movementSaleMode: document.getElementById("movementSaleMode"),
  movementLiveFields: document.getElementById("movementLiveFields"),
  movementLivePrice: document.getElementById("movementLivePrice"),
  movementLiveKg: document.getElementById("movementLiveKg"),
  movementCarcassFields: document.getElementById("movementCarcassFields"),
  movementCarcassPrice: document.getElementById("movementCarcassPrice"),
  movementCarcassKg: document.getElementById("movementCarcassKg"),
  movementSaleHint: document.getElementById("movementSaleHint"),
  movSaleExtraWrap: document.getElementById("movSaleExtraWrap"),
  movSaleBuyer: document.getElementById("movSaleBuyer"),
  movSaleYieldPct: document.getElementById("movSaleYieldPct"),
  movPurchaseSection: document.getElementById("movPurchaseSection"),
  movPurchaseSource: document.getElementById("movPurchaseSource"),
  movPurchaseAvgWeight: document.getElementById("movPurchaseAvgWeight"),
  movPurchaseTotalWeight: document.getElementById("movPurchaseTotalWeight"),
  movPurchasePricePerKg: document.getElementById("movPurchasePricePerKg"),
  movPurchaseValuePerHead: document.getElementById("movPurchaseValuePerHead"),
  movCommercialDashboard: document.getElementById("movCommercialDashboard"),
  movementValueWrap: document.getElementById("movementValueWrap"),
  movementValueLabel: document.getElementById("movementValueLabel"),
  movementValue: document.getElementById("movementValue"),
  movementNotes: document.getElementById("movementNotes"),
  movementPhotoWrap: document.getElementById("movementPhotoWrap"),
  movementPhotos: document.getElementById("movementPhotos"),
  movementPhotoPanel: document.getElementById("movementPhotoPanel"),
  movementPhotoCounter: document.getElementById("movementPhotoCounter"),
  movementPhotoPreview: document.getElementById("movementPhotoPreview"),
  categoryDialog: document.getElementById("categoryDialog"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  categoryInitialQuantity: document.getElementById("categoryInitialQuantity"),
  sanitaryForm: document.getElementById("sanitaryForm"),
  sanitaryEditingId: document.getElementById("sanitaryEditingId"),
  sanitaryDate: document.getElementById("sanitaryDate"),
  sanitaryQuantity: document.getElementById("sanitaryQuantity"),
  sanitaryCategory: document.getElementById("sanitaryCategory"),
  sanitaryProduct: document.getElementById("sanitaryProduct"),
  newProductWrap: document.getElementById("newProductWrap"),
  newProductName: document.getElementById("newProductName"),
  sanitaryNotes: document.getElementById("sanitaryNotes"),
  sanitaryPotrero: document.getElementById("sanitaryPotrero"),
  newPotreroWrap: document.getElementById("newPotreroWrap"),
  newPotreroName: document.getElementById("newPotreroName"),
  sanitarySubmitButton: document.getElementById("sanitarySubmitButton"),
  sanitarySummary: document.getElementById("sanitarySummary"),
  sanitaryTableBody: document.getElementById("sanitaryTableBody"),
  sanitaryFarmSwitch: document.getElementById("sanitaryFarmSwitch"),
  sanitaryViewNote: document.getElementById("sanitaryViewNote"),
  sanitaryFormPanel: document.getElementById("sanitaryFormPanel"),
  potreirosShortcut: document.getElementById("potreirosShortcut"),
  potreirosView: document.getElementById("potreirosView"),
  potreirosAccordion: document.getElementById("potreirosAccordion"),
  movTypeRecordsDlg: document.getElementById("movTypeRecordsDlg"),
  closeMovTypeRecordsDlg: document.getElementById("closeMovTypeRecordsDlg"),
  movTypeRecordsKicker: document.getElementById("movTypeRecordsKicker"),
  movTypeRecordsTitle: document.getElementById("movTypeRecordsTitle"),
  movTypeRecordsSearch: document.getElementById("movTypeRecordsSearch"),
  movTypeRecordsNewBtn: document.getElementById("movTypeRecordsNewBtn"),
  movTypeRecordsHead: document.getElementById("movTypeRecordsHead"),
  movTypeRecordsBody: document.getElementById("movTypeRecordsBody"),
  movTypeRecordsFooter: document.getElementById("movTypeRecordsFooter"),
  potrManejoDlg: document.getElementById("potrManejoDlg"),
  closePotrManejDlg: document.getElementById("closePotrManejDlg"),
  potrManejFarmKicker: document.getElementById("potrManejFarmKicker"),
  potrManejDlgTitle: document.getElementById("potrManejDlgTitle"),
  potrManejFarmTotal: document.getElementById("potrManejFarmTotal"),
  potrManejPotrTotal: document.getElementById("potrManejPotrTotal"),
  potrManejUnallocated: document.getElementById("potrManejUnallocated"),
  potrActionTabs: document.getElementById("potrActionTabs"),
  potrManejForm: document.getElementById("potrManejForm"),
  potrManejDate: document.getElementById("potrManejDate"),
  potrManejCategory: document.getElementById("potrManejCategory"),
  potrManejQty: document.getElementById("potrManejQty"),
  potrManejDestPotrWrap: document.getElementById("potrManejDestPotrWrap"),
  potrManejDestPotrLabel: document.getElementById("potrManejDestPotrLabel"),
  potrManejDestPotr: document.getElementById("potrManejDestPotr"),
  potrManejDestFarmWrap: document.getElementById("potrManejDestFarmWrap"),
  potrManejDestFarm: document.getElementById("potrManejDestFarm"),
  potrManejDestFarmPotrWrap: document.getElementById("potrManejDestFarmPotrWrap"),
  potrManejDestFarmPotr: document.getElementById("potrManejDestFarmPotr"),
  potrManejValueWrap: document.getElementById("potrManejValueWrap"),
  potrManejValue: document.getElementById("potrManejValue"),
  potrManejNotes: document.getElementById("potrManejNotes"),
  potrManejPhotoWrap: document.getElementById("potrManejPhotoWrap"),
  potrManejPhotos: document.getElementById("potrManejPhotos"),
  potrManejPhotoPanel: document.getElementById("potrManejPhotoPanel"),
  potrManejPhotoCounter: document.getElementById("potrManejPhotoCounter"),
  potrManejPhotoPreview: document.getElementById("potrManejPhotoPreview"),
  potrManejSubmit: document.getElementById("potrManejSubmit"),
  editStockDialog: document.getElementById("editStockDialog"),
  editStockButton: document.getElementById("editStockButton"),
  closeEditStockDialog: document.getElementById("closeEditStockDialog"),
  georefButton: document.getElementById("georefButton"),
  georefDialog: document.getElementById("georefDialog"),
  georefSaveButton: document.getElementById("georefSaveButton"),
  closeGeorefDialog: document.getElementById("closeGeorefDialog"),
  georefStatus: document.getElementById("georefStatus"),
  georefMap: document.getElementById("georefMap"),
  georefLegend: document.getElementById("georefLegend"),
  exportPdfButton: document.getElementById("exportPdfButton"),
  registerGoldBtn: document.getElementById("registerGoldBtn"),
  registerMenu: document.getElementById("registerMenu"),
  currentUserLabel: document.getElementById("currentUserLabel"),
  manageUsersButton: document.getElementById("manageUsersButton"),
  backupButton: document.getElementById("backupButton"),
  restoreButton: document.getElementById("restoreButton"),
  restoreFileInput: document.getElementById("restoreFileInput"),
  backupWarningDialog: document.getElementById("backupWarningDialog"),
  backupWarningTitle: document.getElementById("backupWarningTitle"),
  backupWarningMessage: document.getElementById("backupWarningMessage"),
  backupWarningDoNow: document.getElementById("backupWarningDoNow"),
  backupWarningDismiss: document.getElementById("backupWarningDismiss"),
  logoutButton: document.getElementById("logoutButton"),
  closeMovementDialog: document.getElementById("closeMovementDialog"),
  closeCategoryDialog: document.getElementById("closeCategoryDialog"),
  manageUsersDialog: document.getElementById("manageUsersDialog"),
  userEditorPanel: document.getElementById("userEditorPanel"),
  userEditorTitle: document.getElementById("userEditorTitle"),
  userEditorKicker: document.getElementById("userEditorKicker"),
  editUserPasswordLabel: document.getElementById("editUserPasswordLabel"),
  editUserRoleWrap: document.getElementById("editUserRoleWrap"),
  editUserLogin: document.getElementById("editUserLogin"),
  editUserPassword: document.getElementById("editUserPassword"),
  editUserRole: document.getElementById("editUserRole"),
  saveUserEditsButton: document.getElementById("saveUserEditsButton"),
  cancelUserEditButton: document.getElementById("cancelUserEditButton"),
  manageUsersForm: document.getElementById("manageUsersForm"),
  closeManageUsersDialog: document.getElementById("closeManageUsersDialog"),
  newUserLogin: document.getElementById("newUserLogin"),
  newUserPassword: document.getElementById("newUserPassword"),
  newUserRole: document.getElementById("newUserRole"),
  userList: document.getElementById("userList"),
  pdfOptionsDialog: document.getElementById("pdfOptionsDialog"),
  pdfOptionsForm: document.getElementById("pdfOptionsForm"),
  closePdfOptionsDialog: document.getElementById("closePdfOptionsDialog"),
  pdfFarmList: document.getElementById("pdfFarmList"),
  pdfYearFilter: document.getElementById("pdfYearFilter"),
  pdfMonthFilter: document.getElementById("pdfMonthFilter"),
  monthlyDataDialog: document.getElementById("monthlyDataDialog"),
  monthlyDataForm: document.getElementById("monthlyDataForm"),
  closeMonthlyDataDialog: document.getElementById("closeMonthlyDataDialog"),
  monthlyDataDialogTitle: document.getElementById("monthlyDataDialogTitle"),
  monthlyDataEditingId: document.getElementById("monthlyDataEditingId"),
  monthlyDataFarm: document.getElementById("monthlyDataFarm"),
  monthlyDataPeriod: document.getElementById("monthlyDataPeriod"),
  monthlyDataCategory: document.getElementById("monthlyDataCategory"),
  monthlyDataTitle: document.getElementById("monthlyDataTitle"),
  monthlyDataQuantity: document.getElementById("monthlyDataQuantity"),
  monthlyDataValue: document.getElementById("monthlyDataValue"),
  monthlyDataNotes: document.getElementById("monthlyDataNotes"),
  monthlyDataSubmitButton: document.getElementById("monthlyDataSubmitButton"),
  mobileBottomNav: document.getElementById("mobileBottomNav"),
  mobileNavDashboard: document.getElementById("mobileNavDashboard"),
  mobileNavSanitary: document.getElementById("mobileNavSanitary"),
  mobileNavPotreiros: document.getElementById("mobileNavPotreiros"),
  mobileNavFarms: document.getElementById("mobileNavFarms"),
  mobileFarmDrawer: document.getElementById("mobileFarmDrawer"),
  mobileFarmSwitchList: document.getElementById("mobileFarmSwitchList"),
  closeMobileFarmDrawer: document.getElementById("closeMobileFarmDrawer")
};

function collapseDashboardSection(section) {
  if (!section) {
  }

  const remainingPanels = [...section.children].filter((child) => child.matches("article"));
  if (!remainingPanels.length) {
    section.remove();
    return;
  }

  if (remainingPanels.length === 1) {
    section.classList.add("single-panel-grid");
  }
}

function removeDashboardPanel(panel, options = {}) {
  if (!panel) {
    return;
  }

  const section = panel.closest("section");
  panel.remove();

  if (options.removeSection) {
    section?.remove();
    return;
  }

  collapseDashboardSection(section);
}

removeDashboardPanel(elements.salesSummarySection, { removeSection: true });
removeDashboardPanel(elements.salesTimelinePanel);
removeDashboardPanel(elements.monthlyCategoryPanel);

if (elements.salesSummary) {
  elements.salesSummary.innerHTML = "";
}

boot();

function boot() {
  try {
    bindEvents();
    renderAuthState();
    startSplashExperience();
    if (isAuthenticated()) {
      initializeAppShell();
      render();
      cloudPull();
    }
  } catch (error) {
    console.error("Falha na inicialização do painel:", error);
    showStartupError(error);
  }
}

function initializeAppShell() {
  if (!runtime.appInitialized) {
    populateMonthFilter();
    runtime.appInitialized = true;
  }

  syncFilterYearForFarm(getFarm(), true);
  populateYearFilter();
  populatePdfPeriodFilters();
}

function loadData() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const freshData = ensureDataShape(cloneSeedData());
      freshData.selectedFarmId = TOTAL_FARM_ID;
      freshData.auth.sessionUserId = "";
      return freshData;
    }

    const rawData = JSON.parse(stored);
    const parsedData = ensureDataShape(rawData);
    parsedData.selectedFarmId = TOTAL_FARM_ID;
    parsedData.auth.sessionUserId = "";
    const normalizedSnapshot = JSON.stringify(parsedData);
    if (normalizedSnapshot !== stored) {
      window.localStorage.setItem(STORAGE_KEY, normalizedSnapshot);
    }
    return parsedData;
  } catch (error) {
    runtime.storageEnabled = false;
    console.warn("Armazenamento local indisponível. O painel vai funcionar sem persistência.", error);
    const fallbackData = ensureDataShape(cloneSeedData());
    fallbackData.selectedFarmId = TOTAL_FARM_ID;
    fallbackData.auth.sessionUserId = "";
    return fallbackData;
  }
}

function saveData() {
  if (runtime.storageEnabled) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (error) {
      runtime.storageEnabled = false;
      console.warn("Não foi possível salvar localmente. A sessão segue sem persistência.", error);
    }
  }
  cloudPush();
}

// ─── Cloud Sync ───────────────────────────────────────────────────────────────

async function cloudGetToken() {
  if (runtime.cloudToken) return runtime.cloudToken;
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "daluz2026" })
    });
    if (!res.ok) return null;
    const data = await res.json();
    runtime.cloudToken = data.token || null;
    return runtime.cloudToken;
  } catch {
    return null;
  }
}

async function cloudPush() {
  if (!runtime.cloudEnabled || runtime.cloudSyncing) return;
  runtime.cloudSyncing = true;
  try {
    const token = await cloudGetToken();
    if (!token) return;
    const pushPayload = JSON.parse(JSON.stringify(state.data));
    pushPayload.auth = { ...pushPayload.auth, sessionUserId: "" };
    const res = await fetch(`${API_URL}/api/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ payload: pushPayload })
    });
    if (res.status === 401) runtime.cloudToken = null;
  } catch {
    // sync silenciosa — não bloqueia a UI
  } finally {
    runtime.cloudSyncing = false;
  }
}

async function cloudPull() {
  if (!runtime.cloudEnabled) return;
  try {
    const token = await cloudGetToken();
    if (!token) return;
    const res = await fetch(`${API_URL}/api/data`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return;
    const { payload } = await res.json();
    if (!payload) return;
    const currentSessionUserId = state.data.auth.sessionUserId;
    const currentFarmId = state.data.selectedFarmId;
    const merged = ensureDataShape(payload, { preserveSnapshot: true });
    merged.selectedFarmId = currentFarmId || TOTAL_FARM_ID;
    merged.auth.sessionUserId = currentSessionUserId;
    const localJson = JSON.stringify(state.data.farms);
    const cloudJson = JSON.stringify(merged.farms);
    if (localJson !== cloudJson) {
      state.data = merged;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
      if (isAuthenticated()) {
        render();
      }
    }
  } catch {
    // sync silenciosa
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function getCurrentUser() {
  return state.data.auth.users.find((user) => user.id === state.data.auth.sessionUserId) || null;
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrador" : "Usuário";
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  const showSplash = !runtime.splashDismissed && !currentUser;
  elements.splashShell.hidden = !showSplash;
  elements.authShell.hidden = showSplash || Boolean(currentUser);
  elements.pageShell.hidden = showSplash || !currentUser;
  if (elements.mobileBottomNav) elements.mobileBottomNav.hidden = showSplash || !currentUser;
  document.body.classList.toggle("login-mode", !currentUser && !showSplash);
  document.body.classList.toggle("splash-mode", showSplash);
  if (currentUser) {
    elements.currentUserLabel.textContent = currentUser.login;
    // show role badge
    let roleBadge = document.getElementById("currentUserRoleBadge");
    if (!roleBadge) {
      roleBadge = document.createElement("span");
      roleBadge.id = "currentUserRoleBadge";
      elements.currentUserLabel.parentElement.appendChild(roleBadge);
    }
    roleBadge.className = `role-badge role-${currentUser.role || "usuario"}`;
    roleBadge.textContent = getRoleLabel(currentUser.role);
  } else {
    elements.currentUserLabel.textContent = "Usuário";
    const roleBadge = document.getElementById("currentUserRoleBadge");
    if (roleBadge) roleBadge.remove();
  }
  if (elements.manageUsersButton) {
    elements.manageUsersButton.hidden = !isAdmin();
  }
}

function startSplashExperience() {
  if (!elements.splashShell || isAuthenticated()) {
    runtime.splashDismissed = true;
    renderAuthState();
    return;
  }

  runtime.splashDismissed = false;
  renderAuthState();
}

function dismissSplash() {
  if (runtime.splashDismissed) {
    return;
  }

  runtime.splashDismissed = true;
  renderAuthState();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const login = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;
  const user = state.data.auth.users.find((item) => normalizeText(item.login) === normalizeText(login) && item.password === password);

  if (!user) {
    elements.loginFeedback.hidden = false;
    elements.loginFeedback.textContent = "Login ou senha incorretos. Tente novamente.";
    return;
  }

  elements.loginFeedback.hidden = true;
  elements.loginFeedback.textContent = "";
  elements.loginForm.reset();
  state.data.auth.sessionUserId = user.id;
  saveData();
  renderAuthState();
  initializeAppShell();
  render();
  checkBackupWarning();
  cloudPull();
}

function handleLogout() {
  state.data.auth.sessionUserId = "";
  saveData();
  if (elements.manageUsersDialog.open) {
    elements.manageUsersDialog.close();
  }
  elements.loginFeedback.hidden = true;
  elements.loginFeedback.textContent = "";
  renderAuthState();
  startSplashExperience();
}

function openManageUsersDialog() {
  if (!isAdmin()) return;
  renderUserList();
  elements.newUserLogin.value = "";
  elements.newUserPassword.value = "";
  if (elements.newUserRole) elements.newUserRole.value = "usuario";
  elements.manageUsersDialog.showModal();
}

function renderUserList() {
  const currentUser = getCurrentUser();
  const adminCount = state.data.auth.users.filter((u) => u.role === "admin").length;

  elements.userList.innerHTML = state.data.auth.users.map((user) => {
    const isSelf = user.id === currentUser?.id;
    const isLastAdmin = user.role === "admin" && adminCount === 1;
    const canDelete = !isSelf && !isLastAdmin;
    return `
      <article class="user-row">
        <div class="user-row-info">
          <div class="user-row-identity">
            <strong>${escapeHtml(user.login)}</strong>
            ${isSelf ? `<span class="user-self-tag">você</span>` : ""}
          </div>
          <span class="role-badge role-${user.role || "usuario"}">${getRoleLabel(user.role)}</span>
        </div>
        <div class="user-row-actions">
          <button type="button" class="user-action-btn" data-edit-user-id="${user.id}" title="Editar login e perfil">Editar</button>
          <button type="button" class="user-action-btn" data-reset-user-id="${user.id}" title="Redefinir senha">Resetar senha</button>
          ${canDelete
            ? `<button type="button" class="user-action-btn user-action-danger" data-delete-user-id="${user.id}" title="Excluir usuário">Excluir</button>`
            : `<button type="button" class="user-action-btn user-action-disabled" disabled title="${isSelf ? "Não é possível excluir sua própria conta" : "O sistema precisa de ao menos um administrador"}">${isSelf ? "—" : "Excluir"}</button>`
          }
        </div>
      </article>
    `;
  }).join("");
  closeUserEditor();
}

function handleUserListInteraction(event) {
  const editTrigger = event.target.closest("[data-edit-user-id]");
  if (editTrigger) {
    openUserEditor(editTrigger.dataset.editUserId, "edit");
    return;
  }

  const resetTrigger = event.target.closest("[data-reset-user-id]");
  if (resetTrigger) {
    openUserEditor(resetTrigger.dataset.resetUserId, "reset");
    return;
  }

  const deleteTrigger = event.target.closest("[data-delete-user-id]");
  if (deleteTrigger) {
    const userId = deleteTrigger.dataset.deleteUserId;
    const user = state.data.auth.users.find((u) => u.id === userId);
    if (!user) return;
    if (!confirm(`Excluir o usuário "${user.login}"? Esta ação não pode ser desfeita.`)) return;
    const adminCount = state.data.auth.users.filter((u) => u.role === "admin").length;
    if (user.role === "admin" && adminCount <= 1) {
      alert("Não é possível excluir o último administrador do sistema.");
      return;
    }
    if (user.id === state.data.auth.sessionUserId) {
      alert("Você não pode excluir sua própria conta enquanto está conectado.");
      return;
    }
    state.data.auth.users = state.data.auth.users.filter((u) => u.id !== userId);
    saveData();
    renderUserList();
    return;
  }
}

function openUserEditor(userId, mode = "edit") {
  const user = state.data.auth.users.find((item) => item.id === userId);
  if (!user) return;

  state.userEditingId = userId;
  state.userEditingMode = mode;

  const isReset = mode === "reset";
  elements.userEditorPanel.hidden = false;
  if (elements.userEditorKicker) elements.userEditorKicker.textContent = isReset ? "Redefinir senha" : "Editar usuário";
  elements.userEditorTitle.textContent = user.login;

  elements.editUserLogin.value = user.login;
  elements.editUserLogin.readOnly = isReset;

  elements.editUserPassword.value = "";
  elements.editUserPassword.placeholder = isReset ? "Nova senha obrigatória" : "Deixe vazio para manter a senha atual";
  elements.editUserPassword.required = isReset;
  if (elements.editUserPasswordLabel) {
    elements.editUserPasswordLabel.textContent = isReset ? "Nova senha" : "Senha (deixe vazio para manter)";
  }

  if (elements.editUserRole) elements.editUserRole.value = user.role || "usuario";
  if (elements.editUserRoleWrap) elements.editUserRoleWrap.hidden = isReset;

  // Scroll editor into view
  elements.userEditorPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeUserEditor() {
  state.userEditingId = null;
  state.userEditingMode = null;
  elements.userEditorPanel.hidden = true;
  elements.editUserLogin.value = "";
  elements.editUserLogin.readOnly = false;
  elements.editUserPassword.value = "";
  elements.editUserPassword.required = false;
  if (elements.editUserRoleWrap) elements.editUserRoleWrap.hidden = false;
}

function handleUserEditSave() {
  if (!state.userEditingId) return;

  const user = state.data.auth.users.find((item) => item.id === state.userEditingId);
  if (!user) return;

  const isReset = state.userEditingMode === "reset";
  const nextLogin = isReset ? user.login : elements.editUserLogin.value.trim();
  const nextPassword = elements.editUserPassword.value;

  if (!nextLogin) {
    alert("O login não pode ficar vazio.");
    return;
  }

  if (state.data.auth.users.some((item) => item.id !== user.id && normalizeText(item.login) === normalizeText(nextLogin))) {
    alert("Já existe outro usuário com esse login.");
    return;
  }

  if (isReset && !nextPassword) {
    alert("Digite a nova senha para redefinir.");
    return;
  }

  // Protect: can't downgrade the last admin
  if (!isReset) {
    const newRole = elements.editUserRole ? elements.editUserRole.value : user.role;
    const adminCount = state.data.auth.users.filter((u) => u.role === "admin").length;
    if (user.role === "admin" && newRole !== "admin" && adminCount <= 1) {
      alert("Não é possível rebaixar o último administrador do sistema.");
      return;
    }
    user.login = nextLogin;
    user.role = newRole;
  }

  if (nextPassword) {
    user.password = nextPassword;
  }

  saveData();
  renderUserList();
  renderAuthState();
  closeUserEditor();

  if (isReset) {
    alert(`Senha de "${user.login}" redefinida com sucesso.`);
  }
}

function handleManageUsersSubmit(event) {
  event.preventDefault();
  const login = elements.newUserLogin.value.trim();
  const password = elements.newUserPassword.value;

  if (!login || !password) return;

  if (password.length < 4) {
    alert("A senha precisa ter pelo menos 4 caracteres.");
    return;
  }

  if (state.data.auth.users.some((user) => normalizeText(user.login) === normalizeText(login))) {
    alert("Já existe um usuário com esse login.");
    return;
  }

  const role = elements.newUserRole?.value || "usuario";
  state.data.auth.users.push({
    id: slugify(`${login}-${Date.now()}`),
    login,
    password,
    role
  });

  saveData();
  elements.newUserLogin.value = "";
  elements.newUserPassword.value = "";
  renderUserList();
}

function openChangeMyPasswordDialog() {
  const dlg = document.getElementById("changeMyPasswordDlg");
  if (!dlg) return;
  document.getElementById("changeMyPasswordCurrent").value = "";
  document.getElementById("changeMyPasswordNew").value = "";
  document.getElementById("changeMyPasswordConfirm").value = "";
  document.getElementById("changeMyPasswordFeedback").hidden = true;
  dlg.showModal();
}

function handleChangeMyPasswordSubmit(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const current = document.getElementById("changeMyPasswordCurrent").value;
  const next = document.getElementById("changeMyPasswordNew").value;
  const confirm = document.getElementById("changeMyPasswordConfirm").value;
  const feedback = document.getElementById("changeMyPasswordFeedback");

  if (user.password !== current) {
    feedback.hidden = false;
    feedback.textContent = "Senha atual incorreta.";
    return;
  }
  if (next.length < 4) {
    feedback.hidden = false;
    feedback.textContent = "A nova senha deve ter pelo menos 4 caracteres.";
    return;
  }
  if (next !== confirm) {
    feedback.hidden = false;
    feedback.textContent = "A confirmação não confere com a nova senha.";
    return;
  }
  user.password = next;
  saveData();
  document.getElementById("changeMyPasswordDlg").close();
  alert("Senha alterada com sucesso!");
}

function getFarm() {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    return getAggregateFarm();
  }

  return state.data.farms[state.data.selectedFarmId];
}

function getAggregateFarm() {
  const farms = getAllFarms();
  const categoryMap = new Map();
  const sanitaryProducts = new Set();
  const potreroMap = new Map();
  let declaredTotal = 0;
  const movements = [];
  const sanitaryRecords = [];
  const monthlyRecords = [];

  farms.forEach((farm) => {
    declaredTotal += Number(farm.declaredTotal || 0);
    farm.categories.forEach((category) => {
      const existing = categoryMap.get(category.id);
      if (existing) {
        existing.quantity += Number(category.quantity || 0);
      } else {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          quantity: Number(category.quantity || 0)
        });
      }
    });
    farm.movements.forEach((movement) => {
      movements.push({ ...movement, farmId: farm.id, farmName: farm.name });
    });
    farm.sanitaryRecords.forEach((record) => {
      sanitaryRecords.push({ ...record, farmId: farm.id, farmName: farm.name });
    });
    farm.monthlyRecords.forEach((record) => {
      monthlyRecords.push({ ...record, farmId: farm.id, farmName: farm.name });
    });
    farm.sanitaryProducts.forEach((product) => sanitaryProducts.add(product));
    getPotreroEntries(farm).forEach((potrero) => {
      const normalizedName = `${farm.id}::${normalizeText(potrero.name)}`;
      const existing = potreroMap.get(normalizedName);
      if (existing) {
        existing.quantity += Number(potrero.quantity || 0);
      } else {
        potreroMap.set(normalizedName, {
          id: potrero.id || createPotreroId(potrero.name),
          name: potrero.name,
          quantity: Number(potrero.quantity || 0),
          farmId: farm.id,
          farmName: farm.name
        });
      }
    });
  });

  return {
    id: TOTAL_FARM_ID,
    name: "Total",
    declaredTotal,
    note: "Visão consolidada de todas as fazendas.",
    sanitaryProducts: [...sanitaryProducts],
    potreiros: [...potreroMap.values()].sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name)),
    categories: [...categoryMap.values()],
    movements,
    sanitaryRecords,
    monthlyRecords
  };
}

function getAllFarms() {
  return Object.values(state.data.farms);
}

function createPotreroId(name = "potreiro") {
  const base = slugify(name) || "potreiro";
  return `pot-${base}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizePotreroQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return 0;
  }

  return Math.round(quantity);
}

function getPotreroEntries(farm) {
  return Array.isArray(farm?.potreiros) ? farm.potreiros : [];
}

function normalizePotreroEntries(entries, fallbackNames = []) {
  const normalizedEntries = Array.isArray(entries) && entries.length
    ? entries
    : fallbackNames.map((name) => ({ name, quantity: 0 }));
  const registry = new Map();

  normalizedEntries.forEach((entry) => {
    const name = typeof entry === "string" ? entry.trim() : String(entry?.name || "").trim();
    if (!name) {
      return;
    }

    const key = normalizeText(name);
    const quantity = typeof entry === "string" ? 0 : normalizePotreroQuantity(entry.quantity);
    const existing = registry.get(key);
    if (existing) {
      existing.quantity += quantity;
      return;
    }

    registry.set(key, {
      id: typeof entry === "string" ? createPotreroId(name) : entry.id || createPotreroId(name),
      name,
      quantity
    });
  });

  return [...registry.values()];
}

function clonePotreroEntries(entries = []) {
  return normalizePotreroEntries(entries).map((entry) => ({
    id: entry.id || createPotreroId(entry.name),
    name: String(entry.name || "").trim(),
    quantity: normalizePotreroQuantity(entry.quantity)
  }));
}

function clearGeorefDraft() {
  runtime.georefDraft = null;
}

function ensureGeorefDraft(farm, forceReset = false) {
  if (farm?.id !== "arapey") {
    clearGeorefDraft();
    return [];
  }

  if (forceReset || !runtime.georefDraft || runtime.georefDraft.farmId !== farm.id) {
    const potreiros = clonePotreroEntries(getPotreroEntries(farm));
    runtime.georefDraft = {
      farmId: farm.id,
      potreiros,
      selectedId: potreiros[0]?.id || ""
    };
  }

  if (!runtime.georefDraft.selectedId && runtime.georefDraft.potreiros.length) {
    runtime.georefDraft.selectedId = runtime.georefDraft.potreiros[0].id;
  }

  return runtime.georefDraft.potreiros;
}

function getGeorefDraftPotreiros(farm) {
  return ensureGeorefDraft(farm);
}

function pruneLegacyPotreiros(farm) {
  const referencedPotreiros = new Set(farm.sanitaryRecords.map((record) => normalizeText(record.potreiro || "")));
  farm.potreiros = getPotreroEntries(farm).filter((potrero) => {
    const isLegacyPlaceholder = LEGACY_POTREIRO_PLACEHOLDERS.includes(potrero.name);
    if (!isLegacyPlaceholder) {
      return true;
    }

    return normalizePotreroQuantity(potrero.quantity) > 0 || referencedPotreiros.has(normalizeText(potrero.name));
  });
}

function getRegisteredPotreroAnimals(farm) {
  return getPotreroEntries(farm).reduce((sum, potrero) => sum + normalizePotreroQuantity(potrero.quantity), 0);
}

function getPotreroBalance(farm) {
  return getFarmTotal(farm) - getRegisteredPotreroAnimals(farm);
}

function getMonthlyRecords(farm) {
  return Array.isArray(farm?.monthlyRecords) ? farm.monthlyRecords : [];
}

function getMonthlyCategoryLabel(value) {
  return MONTHLY_REPORT_CATEGORIES.find((category) => category.value === value)?.label || "Outros";
}

function getFilteredMonthlyRecords(farm, year = state.filters.year, month = state.filters.month) {
  return getMonthlyRecords(farm).filter((record) => {
    const period = String(record.period || "");
    const recordYear = period.slice(0, 4);
    const recordMonth = period.slice(5, 7);
    const matchesYear = recordYear === String(year);
    const matchesMonth = month === "all" || recordMonth === month;
    return matchesYear && matchesMonth;
  });
}

function getMonthlySummary(farm, year = state.filters.year, month = state.filters.month) {
  const records = getFilteredMonthlyRecords(farm, year, month);
  const byCategory = new Map();

  records.forEach((record) => {
    const key = record.category || "outros";
    const existing = byCategory.get(key) || { category: key, label: getMonthlyCategoryLabel(key), count: 0, quantity: 0, value: 0 };
    existing.count += 1;
    existing.quantity += Number(record.quantity || 0);
    existing.value += Number(record.value || 0);
    byCategory.set(key, existing);
  });

  return {
    records,
    count: records.length,
    totalQuantity: records.reduce((sum, record) => sum + Number(record.quantity || 0), 0),
    totalValue: records.reduce((sum, record) => sum + Number(record.value || 0), 0),
    activeCategories: byCategory.size,
    byCategory: [...byCategory.values()].sort((a, b) => b.value - a.value || b.quantity - a.quantity || b.count - a.count)
  };
}

function getMonthlyEvolution(farm, year = state.filters.year) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const summary = getMonthlySummary(farm, year, month);
    return {
      label: MONTH_NAMES[index].slice(0, 3),
      quantity: summary.totalQuantity,
      value: summary.totalValue,
      count: summary.count
    };
  });
}

function hasPositiveData(values = []) {
  return values.some((value) => Number(value || 0) > 0);
}

function hasMeaningfulMonthlyData(summary) {
  return Boolean(summary?.count || summary?.totalQuantity || summary?.totalValue);
}

function getFarmTotal(farm) {
  return farm.categories.reduce((sum, category) => sum + Number(category.quantity || 0), 0);
}

function getDominantCategory(farm) {
  return [...farm.categories].sort((a, b) => b.quantity - a.quantity)[0];
}

function getDiscrepancy(farm) {
  return Number(farm.declaredTotal || 0) - getFarmTotal(farm);
}

function getPreferredYearForFarm(farm) {
  const years = [...getAvailableYearsForFarm(farm)];

  return years.length ? Math.max(...years) : today.getFullYear();
}

function getAvailableYearsForFarm(farm) {
  return new Set([
    ...farm.movements.map((movement) => new Date(movement.date).getFullYear()),
    ...farm.sanitaryRecords.map((record) => new Date(record.date).getFullYear()),
    ...farm.monthlyRecords.map((record) => Number(String(record.period || "").slice(0, 4)))
  ].filter((year) => Number.isFinite(year)));
}

function syncFilterYearForFarm(farm, force = false) {
  if (!farm) {
    return;
  }

  const years = getAvailableYearsForFarm(farm);
  if (force || !years.has(Number(state.filters.year))) {
    state.filters.year = String(getPreferredYearForFarm(farm));
  }
}

function isPremiumSaleFarm(farm) {
  return PREMIUM_SALE_FARMS.has(farm.id);
}

function getFarmCurrency(farmId) {
  return FARM_CURRENCY_MAP[farmId] || "BRL";
}

function getFarmCurrencySymbol(farmId) {
  return getFarmCurrency(farmId) === "USD" ? "US$" : "R$";
}

function formatFarmCurrencyValue(value, farmId) {
  const num = Number(value || 0);
  if (getFarmCurrency(farmId) === "USD") {
    return `US$ ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  }
  return formatCurrency(num);
}

function createStandardFarm(id, name) {
  return {
    id,
    name,
    declaredTotal: 0,
    note: "Estrutura pronta para receber o inventario inicial e futuras mudancas de manejo.",
    importedBaselineVersion: 0,
    sanitaryProducts: [...DEFAULT_SANITARY_PRODUCTS],
    potreiros: normalizePotreroEntries([], DEFAULT_POTREIROS),
    categories: STANDARD_FARM_CATEGORIES.map((category) => ({
      ...category,
      quantity: 0
    })),
    movements: [],
    sanitaryRecords: [],
    monthlyRecords: []
  };
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.manageUsersButton.addEventListener("click", openManageUsersDialog);
  elements.backupButton.addEventListener("click", exportBackup);
  elements.restoreButton.addEventListener("click", () => elements.restoreFileInput.click());
  elements.restoreFileInput.addEventListener("change", handleRestoreFile);
  elements.backupWarningDoNow.addEventListener("click", () => { elements.backupWarningDialog.close(); exportBackup(); });
  elements.backupWarningDismiss.addEventListener("click", () => elements.backupWarningDialog.close());
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.splashShell.addEventListener("click", dismissSplash);
  elements.manageUsersForm.addEventListener("submit", handleManageUsersSubmit);
  elements.userList.addEventListener("click", handleUserListInteraction);
  elements.saveUserEditsButton.addEventListener("click", handleUserEditSave);
  elements.cancelUserEditButton.addEventListener("click", closeUserEditor);
  elements.closeManageUsersDialog.addEventListener("click", () => elements.manageUsersDialog.close());
  document.getElementById("myAccountBtn")?.addEventListener("click", openChangeMyPasswordDialog);
  document.getElementById("changeMyPasswordForm")?.addEventListener("submit", handleChangeMyPasswordSubmit);
  document.getElementById("closeChangeMyPasswordDlg")?.addEventListener("click", () => {
    document.getElementById("changeMyPasswordDlg").close();
  });
  elements.sanitaryShortcut.addEventListener("click", () => {
    state.activeView = "sanitary";
    render();
  });

  elements.quickComprasBtn?.addEventListener("click", () => {
    state.activeView = "dashboard";
    render();
    openMovTypeRecordsDlg("compra");
  });

  elements.quickVendasBtn?.addEventListener("click", () => {
    state.activeView = "dashboard";
    render();
    openMovTypeRecordsDlg("venda");
  });

  document.getElementById("exportSanitaryPdfBtn")?.addEventListener("click", exportSanitaryPdfReport);

  elements.potreirosShortcut.addEventListener("click", () => {
    state.activeView = "potreiros";
    render();
  });

  // Mobile bottom nav
  if (elements.mobileNavDashboard) {
    elements.mobileNavDashboard.addEventListener("click", () => {
      state.activeView = "dashboard";
      render();
    });
    elements.mobileNavSanitary.addEventListener("click", () => {
      state.activeView = "sanitary";
      render();
    });
    elements.mobileNavPotreiros.addEventListener("click", () => {
      state.activeView = "potreiros";
      render();
    });
    elements.mobileNavFarms.addEventListener("click", () => {
      renderMobileFarmDrawer();
      elements.mobileFarmDrawer.hidden = false;
    });
    elements.closeMobileFarmDrawer.addEventListener("click", () => {
      elements.mobileFarmDrawer.hidden = true;
    });
    elements.mobileFarmDrawer.addEventListener("click", (event) => {
      if (event.target === elements.mobileFarmDrawer) {
        elements.mobileFarmDrawer.hidden = true;
      }
    });
  }

  elements.potreirosAccordion.addEventListener("click", (event) => {
    // Check if it's a manejo button — handle separately, don't bubble to accordion
    const manBtn = event.target.closest("[data-potr-manej-farm]");
    if (manBtn) {
      openPotrManejDialog(manBtn.dataset.potrManejFarm, manBtn.dataset.potrManejId);
      return;
    }
    const header = event.target.closest("[data-toggle-farm]");
    if (!header) return;
    const farmId = header.dataset.toggleFarm;
    const body = document.getElementById(`potreiros-body-${farmId}`);
    if (!body) return;
    body.hidden = !body.hidden;
    header.classList.toggle("open", !body.hidden);
  });

  elements.yearFilter.addEventListener("change", (event) => {
    state.filters.year = event.target.value;
    render();
  });

  elements.monthFilter.addEventListener("change", (event) => {
    state.filters.month = event.target.value;
    render();
  });

  elements.movementFarm.addEventListener("change", () => {
    syncMovementCategoryOptionsForFarm(getMovementDialogFarm());
    syncMovementPotreirosOptions();
    updateSaleFieldVisibility();
  });
  elements.movementCategory.addEventListener("change", () => {
    syncMovementPotreirosOptions();
  });

  elements.movementType.addEventListener("change", () => {
    updateMovementFormForType(elements.movementType.value);
  });
  elements.movementPhotos.addEventListener("change", handleMovementPhotosChange);
  elements.movementPhotoPreview.addEventListener("click", handleMovementPhotoPreviewClick);

  elements.movementSaleMode.addEventListener("change", updateSaleFieldVisibility);
  [
    elements.movementLivePrice,
    elements.movementLiveKg,
    elements.movementCarcassPrice,
    elements.movementCarcassKg
  ].forEach((input) => {
    input.addEventListener("input", updateSaleComputedValue);
  });

  // Purchase auto-calc listeners
  [elements.movPurchaseAvgWeight, elements.movPurchasePricePerKg].forEach((input) => {
    input?.addEventListener("input", updatePurchaseComputedValues);
  });
  elements.movPurchaseTotalWeight?.addEventListener("input", () => {
    elements.movPurchaseTotalWeight.dataset.manualEdit = "1";
    updatePurchaseComputedValues();
  });
  elements.movementQuantity?.addEventListener("input", () => {
    updatePurchaseComputedValues();
    updateSaleComputedValue();
  });
  elements.movementValue?.addEventListener("input", () => {
    if (elements.movementType.value === "compra") {
      const qty = Number(elements.movementQuantity?.value || 0);
      const total = Number(elements.movementValue.value || 0);
      if (qty > 0 && total > 0 && elements.movPurchaseValuePerHead) {
        elements.movPurchaseValuePerHead.value = +(total / qty).toFixed(2);
      }
    }
  });

  elements.sanitaryProduct.addEventListener("change", () => {
    updateSanitaryProductMode();
  });

  elements.sanitaryPotrero.addEventListener("change", () => {
    updateSanitaryPotreroMode();
  });

  elements.sanitaryTableBody.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-edit-sanitary-id]");
    if (!trigger) {
      return;
    }

    openSanitaryEditor(trigger.dataset.editSanitaryId);
  });

  // Gold register button — toggle menu
  elements.registerGoldBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !elements.registerMenu.hidden;
    elements.registerMenu.hidden = isOpen;
    elements.registerGoldBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  // Register menu items
  document.getElementById("registerMenu").querySelectorAll("[data-mov]").forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.registerMenu.hidden = true;
      elements.registerGoldBtn.setAttribute("aria-expanded", "false");
      handleRegisterAction(btn.dataset.mov);
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!document.getElementById("registerLauncher").contains(e.target)) {
      elements.registerMenu.hidden = true;
      elements.registerGoldBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Visual herd grid — click card to open records dialog for that type
  elements.visualHerdGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-mov]");
    if (!card) return;
    openMovTypeRecordsDlg(card.dataset.mov);
  });
  elements.visualHerdGrid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const card = e.target.closest("[data-mov]");
      if (!card) return;
      e.preventDefault();
      openMovTypeRecordsDlg(card.dataset.mov);
    }
  });

  elements.editStockButton.addEventListener("click", openEditStockDialog);
  elements.georefButton.addEventListener("click", openGeorefDialog);
  elements.closeEditStockDialog.addEventListener("click", () => elements.editStockDialog.close());
  document.getElementById("cancelStockEditBtn").addEventListener("click", () => elements.editStockDialog.close());
  document.getElementById("saveStockEditBtn").addEventListener("click", handleSaveStockEdit);
  document.getElementById("stockCategoryAccordion").addEventListener("click", handleStockCategoryAccordionClick);
  document.getElementById("stockPotreirosAccordion").addEventListener("click", handleStockPotreirosAccordionClick);
  document.querySelectorAll(".stock-tab").forEach((btn) => {
    btn.addEventListener("click", () => setStockEditorTab(btn.dataset.stockTab));
  });
  if (elements.monthlyProtocolList) {
    elements.monthlyProtocolList.addEventListener("click", handleMonthlyTableInteraction);
  }
  elements.closeMovementDialog.addEventListener("click", () => { runtime.editingMovement = null; elements.movementDialog.close(); });
  elements.closeMovTypeRecordsDlg.addEventListener("click", () => elements.movTypeRecordsDlg.close());
  elements.closePotrManejDlg.addEventListener("click", () => elements.potrManejoDlg.close());
  elements.potrActionTabs?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-manej]");
    if (!tab) return;
    const type = tab.dataset.manej;
    runtime.potrManej.type = type;
    elements.potrActionTabs.querySelectorAll(".potr-action-tab").forEach((t) => t.classList.toggle("active", t.dataset.manej === type));
    syncPotrManejForm();
  });
  elements.potrManejDestFarm.addEventListener("change", syncPotrManejDestFarmPotreiros);
  elements.potrManejForm.addEventListener("submit", handlePotrManejSubmit);
  elements.potrManejPhotos?.addEventListener("change", handlePotrManejPhotosChange);
  elements.closeCategoryDialog.addEventListener("click", () => elements.categoryDialog.close());
  elements.closeEditStockDialog.addEventListener("click", () => elements.editStockDialog.close());
  elements.georefSaveButton.addEventListener("click", handleGeorefSave);
  elements.georefLegend.addEventListener("click", handleGeorefLegendInteraction);
  elements.georefLegend.addEventListener("change", handleGeorefLegendChange);
  elements.closeGeorefDialog.addEventListener("click", () => elements.georefDialog.close());
  elements.georefDialog.addEventListener("close", clearGeorefDraft);
  elements.closeMonthlyDataDialog.addEventListener("click", () => elements.monthlyDataDialog.close());
  elements.exportPdfButton.addEventListener("click", openPdfOptionsDialog);
  elements.closePdfOptionsDialog.addEventListener("click", () => elements.pdfOptionsDialog.close());
  elements.pdfOptionsForm.addEventListener("submit", handlePdfOptionsSubmit);
  elements.pdfOptionsForm.querySelectorAll('input[name="pdfScope"]').forEach((input) => {
    input.addEventListener("change", updatePdfScopeMode);
  });

  elements.movementForm.addEventListener("submit", handleMovementSubmit);
  elements.categoryForm.addEventListener("submit", handleCategorySubmit);
  elements.sanitaryForm.addEventListener("submit", handleSanitarySubmit);
  // editStockForm replaced by button-driven stock editor
  elements.monthlyDataForm.addEventListener("submit", handleMonthlyDataSubmit);
}

function populateMonthFilter() {
  elements.monthFilter.innerHTML = '<option value="all">Ano inteiro</option>';
  MONTH_NAMES.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1).padStart(2, "0");
    option.textContent = name;
    elements.monthFilter.appendChild(option);
  });
}

function populateYearFilter() {
  const years = new Set([today.getFullYear()]);
  Object.values(state.data.farms).forEach((farm) => {
    farm.movements.forEach((movement) => {
      years.add(new Date(movement.date).getFullYear());
    });
    farm.sanitaryRecords.forEach((record) => {
      years.add(new Date(record.date).getFullYear());
    });
    farm.monthlyRecords.forEach((record) => {
      const year = Number(String(record.period || "").slice(0, 4));
      if (Number.isFinite(year)) {
        years.add(year);
      }
    });
  });

  elements.yearFilter.innerHTML = "";
  [...years].sort((a, b) => a - b).forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    if (String(year) === state.filters.year) {
      option.selected = true;
    }
    elements.yearFilter.appendChild(option);
  });
}

function populatePdfPeriodFilters() {
  elements.pdfYearFilter.innerHTML = elements.yearFilter.innerHTML;
  [...elements.pdfYearFilter.options].forEach((option) => {
    option.selected = option.value === String(state.filters.year);
  });

  elements.pdfMonthFilter.innerHTML = elements.monthFilter.innerHTML;
  [...elements.pdfMonthFilter.options].forEach((option) => {
    option.selected = option.value === state.filters.month;
  });
}

function render() {
  if (!isAuthenticated()) {
    return;
  }

  const farm = getFarm();
  syncFilterYearForFarm(farm);
  populateYearFilter();
  populatePdfPeriodFilters();
  renderFarmSwitch();
  renderOverviewPanel();
  syncMovementTypeOptions();
  syncCategoryOptions();
  syncSanitaryFormOptions();
  syncMonthlyDataFarmOptions();
  syncMonthlyDataCategoryOptions();
  renderHero(farm);
  renderHeadlineMetrics(farm);
  renderPrimarySummaryCards(farm);
  renderDashboardVisualHerdGrid(farm);
  renderPeriodSummary(farm);
  renderSalesAnalysis(farm);
  renderMovementsTable(farm);
  renderSanitarySummary(farm);
  renderSanitaryTable(farm);
  renderSanitaryFarmSwitch();
  renderSanitaryComposerState(farm);
  renderMonthlySummary(farm);
  renderMonthlyProtocol(farm);
  renderCharts(farm);
  renderActiveView();
  renderGeorefState(farm);
  renderActionButtonsState();
}

function renderOverviewPanel() {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const farms = isTotalView ? getAllFarms() : [state.data.farms[state.data.selectedFarmId]].filter(Boolean);
  const selectedFarm = farms[0];
  const totals = farms.reduce((accumulator, farm) => {
    accumulator.stock += getFarmTotal(farm);
    accumulator.declared += Number(farm.declaredTotal || 0);
    accumulator.monthly += getFilteredMonthlyRecords(farm).length;
    return accumulator;
  }, { stock: 0, declared: 0, monthly: 0 });
  const difference = totals.declared - totals.stock;

  elements.globalPanelKicker.textContent = isTotalView ? "Painel inicial" : "Fazenda selecionada";
  elements.globalPanelTitle.textContent = isTotalView ? "Consolidado das fazendas" : `Resumo de ${selectedFarm?.name || "fazenda"}`;
  elements.globalPanelChip.textContent = isTotalView ? "Grupo Da Luz" : selectedFarm?.name || "Fazenda";

  const cards = [
    {
      title: isTotalView ? "Estoque consolidado" : "Estoque atual",
      value: formatInteger(totals.stock),
      detail: isTotalView ? "rebanho somado das fazendas ativas" : `rebanho atual de ${selectedFarm?.name || "fazenda"}`
    },
    {
      title: "Total declarado",
      value: formatInteger(totals.declared),
      detail: difference === 0 ? "estoque alinhado ao total declarado" : `${formatInteger(difference)} animais de diferenca`
    },
    {
      title: "Dados mensais",
      value: formatInteger(totals.monthly),
      detail: isTotalView ? "registros mensais do recorte filtrado" : `registros mensais de ${selectedFarm?.name || "fazenda"}`
    }
  ];

  elements.globalSummaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  elements.globalFarmBreakdown.innerHTML = farms.map((farm) => {
    const movements = summarizePeriod(farm, state.filters.year, state.filters.month);
    const total = getFarmTotal(farm);
    return `
      <article class="global-farm-card">
        <div class="farm-card-header">
          <div>
            <p class="panel-kicker">${escapeHtml(farm.name)}</p>
            <strong class="farm-card-total">${formatInteger(total)}</strong>
          </div>
          <div class="farm-card-chips">
            <span class="chip chip-entry">+${formatInteger(movements.byType.compra + movements.byType.nascimento)} ent.</span>
            <span class="chip chip-exit">-${formatInteger(movements.byType.venda + movements.byType.morte + movements.byType.consumo)} saí.</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  renderConsolidatedCategories(farms, isTotalView);
  renderFinancialPanel(farms, isTotalView);
}

function renderConsolidatedCategories(farms, isTotalView) {
  if (!elements.globalCategoryBreakdown) return;
  elements.globalCategoryBreakdown.hidden = !isTotalView;
  if (!isTotalView) return;

  const categoryMap = new Map();
  farms.forEach((farm) => {
    farm.categories.forEach((cat) => {
      const key = cat.name.trim().toLowerCase();
      const existing = categoryMap.get(key);
      if (existing) {
        existing.quantity += Number(cat.quantity || 0);
        existing.farms.add(farm.name);
      } else {
        categoryMap.set(key, { name: cat.name, quantity: Number(cat.quantity || 0), farms: new Set([farm.name]) });
      }
    });
  });

  const sorted = [...categoryMap.values()].filter((c) => c.quantity > 0).sort((a, b) => b.quantity - a.quantity);
  const grandTotal = sorted.reduce((s, c) => s + c.quantity, 0);

  if (!sorted.length) {
    elements.globalCategoryBreakdown.innerHTML = `<p class="field-note" style="padding:12px 0">Nenhuma categoria com animais no estoque.</p>`;
    return;
  }

  elements.globalCategoryBreakdown.innerHTML = `
    <div class="consolidated-categories-header">
      <p class="panel-kicker">Estoque por categoria</p>
      <h3>Consolidado do rebanho — todas as fazendas</h3>
      <span class="chip">${formatInteger(grandTotal)} animais</span>
    </div>
    <div class="consolidated-categories-table">
      <div class="cat-table-head">
        <span>Categoria</span>
        <span>Fazendas</span>
        <span>Animais</span>
        <span>% do rebanho</span>
      </div>
      ${sorted.map((cat) => {
        const pct = grandTotal > 0 ? (cat.quantity / grandTotal * 100) : 0;
        return `
          <div class="cat-table-row">
            <span class="cat-name">${escapeHtml(cat.name)}</span>
            <span class="cat-farms">${[...cat.farms].map(escapeHtml).join(", ")}</span>
            <strong class="cat-qty">${formatInteger(cat.quantity)}</strong>
            <span class="cat-pct">
              <span class="cat-pct-bar" style="width:${Math.min(pct, 100).toFixed(1)}%"></span>
              <span class="cat-pct-label">${pct.toFixed(1)}%</span>
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderFinancialPanel(farms, isTotalView) {
  const container = document.getElementById("financialPanel");
  if (!container) return;

  const year = state.filters.year;
  const month = state.filters.month;

  // Per-farm financial summary
  const farmData = farms.map((farm) => {
    const movements = farm.movements.filter((m) => {
      if (m.type !== "venda" && m.type !== "compra") return false;
      const d = new Date(m.date);
      const matchYear = String(d.getFullYear()) === String(year);
      const matchMonth = month === "all" || String(d.getMonth() + 1).padStart(2, "0") === month;
      return matchYear && matchMonth;
    });
    const vendas = movements.filter((m) => m.type === "venda");
    const compras = movements.filter((m) => m.type === "compra");
    const totalVendas = vendas.reduce((s, m) => s + Number(m.value || 0), 0);
    const totalCompras = compras.reduce((s, m) => s + Number(m.value || 0), 0);
    const qtdVendas = vendas.reduce((s, m) => s + Number(m.quantity || 0), 0);
    const qtdCompras = compras.reduce((s, m) => s + Number(m.quantity || 0), 0);
    return { name: farm.name, totalVendas, totalCompras, qtdVendas, qtdCompras, saldo: totalVendas - totalCompras };
  }).filter((f) => f.totalVendas > 0 || f.totalCompras > 0);

  if (!farmData.length) {
    container.innerHTML = "";
    return;
  }

  const grandVendas = farmData.reduce((s, f) => s + f.totalVendas, 0);
  const grandCompras = farmData.reduce((s, f) => s + f.totalCompras, 0);
  const grandSaldo = grandVendas - grandCompras;
  const periodLabel = month === "all" ? `Ano ${year}` : `${MONTH_NAMES[Number(month) - 1]}/${year}`;

  const farmRows = farmData.map((f) => {
    const saldoClass = f.saldo > 0 ? "fin-positive" : f.saldo < 0 ? "fin-negative" : "";
    return `
      <div class="fin-farm-row">
        <span class="fin-farm-name">${escapeHtml(f.name)}</span>
        <span class="fin-cell">${f.qtdVendas > 0 ? `${formatInteger(f.qtdVendas)} cab` : "—"}</span>
        <span class="fin-cell fin-vendas">${f.totalVendas > 0 ? formatCurrency(f.totalVendas) : "—"}</span>
        <span class="fin-cell">${f.qtdCompras > 0 ? `${formatInteger(f.qtdCompras)} cab` : "—"}</span>
        <span class="fin-cell fin-compras">${f.totalCompras > 0 ? formatCurrency(f.totalCompras) : "—"}</span>
        <strong class="fin-cell fin-saldo ${saldoClass}">${f.saldo !== 0 ? (f.saldo > 0 ? "+" : "") + formatCurrency(f.saldo) : "—"}</strong>
      </div>
    `;
  }).join("");

  const saldoClass = grandSaldo > 0 ? "fin-positive" : grandSaldo < 0 ? "fin-negative" : "";

  container.innerHTML = `
    <div class="fin-panel-header">
      <div>
        <p class="panel-kicker">Financeiro — ${periodLabel}</p>
        <h3>Compras e vendas${isTotalView ? " por fazenda" : ""}</h3>
      </div>
      <span class="chip ${grandSaldo > 0 ? "chip-success" : grandSaldo < 0 ? "chip-alert" : ""}">
        Saldo ${grandSaldo > 0 ? "+" : ""}${formatCurrency(grandSaldo)}
      </span>
    </div>
    <div class="fin-table">
      <div class="fin-table-head">
        <span>Fazenda</span>
        <span>Cab. vendidas</span>
        <span>Receita vendas</span>
        <span>Cab. compradas</span>
        <span>Custo compras</span>
        <span>Saldo</span>
      </div>
      ${farmRows}
      ${farmData.length > 1 ? `
        <div class="fin-farm-row fin-total-row">
          <span class="fin-farm-name">Total</span>
          <span class="fin-cell">${formatInteger(farmData.reduce((s,f)=>s+f.qtdVendas,0))} cab</span>
          <span class="fin-cell fin-vendas">${formatCurrency(grandVendas)}</span>
          <span class="fin-cell">${formatInteger(farmData.reduce((s,f)=>s+f.qtdCompras,0))} cab</span>
          <span class="fin-cell fin-compras">${formatCurrency(grandCompras)}</span>
          <strong class="fin-cell fin-saldo ${saldoClass}">${grandSaldo > 0 ? "+" : ""}${formatCurrency(grandSaldo)}</strong>
        </div>
      ` : ""}
    </div>
    <p class="fin-note">* Todos os valores em R$ (reais)</p>
  `;
}

function renderHeadlineMetrics(farm) {
  const totalAnimals = getFarmTotal(farm);
  const discrepancy = getDiscrepancy(farm);
  const registeredAnimals = getRegisteredPotreroAnimals(farm);
  const metrics = [
    {
      label: state.data.selectedFarmId === TOTAL_FARM_ID ? "Grupo" : "Rebanho",
      value: formatInteger(totalAnimals),
      text: state.data.selectedFarmId === TOTAL_FARM_ID ? "animais consolidados no grupo" : "animais no estoque atual"
    },
    {
      label: "Declarado",
      value: formatInteger(Number(farm.declaredTotal || 0)),
      text: discrepancy === 0 ? "total conferido com o estoque" : `${formatInteger(discrepancy)} animais de diferenca`
    },
    {
      label: "Potreiros",
      value: formatInteger(registeredAnimals),
      text: registeredAnimals === totalAnimals ? "alocacao completa nos campos" : `${formatInteger(Math.abs(totalAnimals - registeredAnimals))} ainda fora dos potreiros`
    }
  ];

  elements.heroMetrics.innerHTML = metrics.map((metric) => `
    <article class="hero-metric">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
      <p>${metric.text}</p>
    </article>
  `).join("");
}

function renderPrimarySummaryCards(farm) {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const annualData = summarizePeriod(farm, state.filters.year, "all");
  const filteredData = summarizePeriod(farm, state.filters.year, state.filters.month);
  const monthlySummary = getMonthlySummary(farm);
  const cards = [
    {
      title: isTotalView ? "Fazendas ativas" : "Movimentacoes no ano",
      value: isTotalView ? formatInteger(getAllFarms().length) : formatInteger(annualData.totalMovements),
      detail: isTotalView ? "fazendas somadas no consolidado" : `lancamentos registrados em ${state.filters.year}`
    },
    {
      title: "Entradas no periodo",
      value: formatInteger(filteredData.byType.compra + filteredData.byType.nascimento + filteredData.adjustPositive),
      detail: "compras, nascimentos e ajustes positivos"
    },
    {
      title: "Saidas no periodo",
      value: formatInteger(filteredData.byType.venda + filteredData.byType.consumo + filteredData.byType.morte + filteredData.adjustNegative),
      detail: "vendas, consumo, mortes e ajustes negativos"
    },
    {
      title: "Saldo líquido do período",
      value: filteredData.saldo,
      detail: filteredData.saldo > 0 ? "rebanho cresceu no período filtrado" : filteredData.saldo < 0 ? "rebanho reduziu no período filtrado" : "rebanho estável no período filtrado",
      trend: filteredData.saldo > 0 ? "up" : filteredData.saldo < 0 ? "down" : "flat"
    }
  ];

  elements.summaryGrid.innerHTML = cards.map((card) => {
    const trendBadge = card.trend
      ? `<span class="trend-badge trend-${card.trend}">${card.trend === "up" ? "▲" : card.trend === "down" ? "▼" : "—"} ${formatInteger(Math.abs(card.value))}</span>`
      : "";
    const displayValue = card.trend ? formatInteger(Math.abs(card.value)) : card.value;
    return `
      <article class="summary-card${card.trend ? ` summary-card-${card.trend}` : ""}">
        <p class="panel-kicker">${card.title}</p>
        <strong>${displayValue}${trendBadge}</strong>
        <p>${card.detail}</p>
      </article>
    `;
  }).join("");
}

function renderDashboardVisualHerdGrid(farm) {
  if (!elements.visualHerdGrid) return;

  const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const periodLabel = state.filters.month === "all"
    ? `Ano ${state.filters.year}`
    : `${MONTH_NAMES[Number(state.filters.month) - 1]}/${state.filters.year}`;

  const stats = [
    { label: "Nascimento", value: monthly.byType.nascimento, img: "./assets/calf.svg",        detail: "nascidos no período",       movType: "nascimento" },
    { label: "Venda",    value: monthly.byType.venda,   img: "./assets/angus-login.svg", detail: "animais vendidos",        movType: "venda"   },
    { label: "Morte",    value: monthly.byType.morte,   img: "./assets/cow.svg",         detail: "mortes registradas",      movType: "morte"   },
    { label: "Abate",    value: monthly.byType.consumo, img: "./assets/bull.svg",        detail: "abates e consumo interno",movType: "consumo" },
    { label: "Compras",  value: monthly.byType.compra,  img: "./assets/herd.svg",        detail: "animais comprados",       movType: "compra"  },
  ];

  elements.visualHerdGrid.innerHTML = stats.map((stat) => `
    <button type="button" class="visual-card visual-card-action visual-card-button" data-mov="${stat.movType}" title="Registrar ${stat.label}" aria-label="Abrir registro de ${stat.label}${isTotalView ? " no total" : ` em ${escapeHtml(farm.name)}`}">
      <div class="visual-card-image">
        <img src="${stat.img}" alt="${escapeHtml(stat.label)}">
      </div>
      <div class="visual-card-copy">
        <div class="visual-card-topline">
          <div>
            <p class="panel-kicker">${periodLabel}</p>
            <strong>${escapeHtml(stat.label)}</strong>
          </div>
          <span class="visual-card-share visual-card-count">${formatInteger(stat.value)}</span>
        </div>
        <p>${stat.value === 0 ? "Nenhum registro no período." : `${formatInteger(stat.value)} ${stat.detail}.`}</p>
        <span class="visual-card-cta">Abrir registro</span>
      </div>
    </button>
  `).join("");
}

// ── Movement Type Records Dialog ─────────────────────────────────────────

const MOV_TYPE_RECORDS_PAGE = 50;

function openMovTypeRecordsDlg(movType) {
  const typeMeta = MOVEMENT_TYPES.find((t) => t.value === movType);
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const farm = isTotalView ? null : getFarm();
  const farmLabel = isTotalView ? "Todas as fazendas" : farm?.name || "";

  elements.movTypeRecordsKicker.textContent = farmLabel;
  elements.movTypeRecordsTitle.textContent = typeMeta ? typeMeta.label : capitalize(movType);
  elements.movTypeRecordsSearch.value = "";
  elements.movTypeRecordsNewBtn.onclick = () => {
    elements.movTypeRecordsDlg.close();
    openMovementDialog(movType);
  };
  elements.movTypeRecordsSearch.oninput = () => renderMovTypeRecordsBody(movType, 0);

  const isCommercial = movType === "compra" || movType === "venda";
  if (isCommercial) {
    renderCommercialDashboard(movType);
  } else if (elements.movCommercialDashboard) {
    elements.movCommercialDashboard.hidden = true;
    elements.movCommercialDashboard.innerHTML = "";
  }

  runtime._movTypeRecordsPage = 0;
  renderMovTypeRecordsBody(movType, 0);
  elements.movTypeRecordsDlg.showModal();
}

function renderMovTypeRecordsBody(movType, page) {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const query = (elements.movTypeRecordsSearch.value || "").trim().toLowerCase();
  const isCompra = movType === "compra";
  const isVenda = movType === "venda";
  const isCommercial = isCompra || isVenda;

  let all;
  if (isTotalView) {
    all = getAllFarms().flatMap((f) => f.movements.map((m) => ({ ...m, _farmId: f.id, _farmName: f.name })));
  } else {
    const farm = getFarm();
    all = (farm?.movements || []).map((m) => ({ ...m, _farmId: farm.id, _farmName: farm.name }));
  }

  let filtered = all
    .filter((m) => m.type === movType)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (query) {
    filtered = filtered.filter((m) => {
      const base = [m.code, m.categoryName, m.notes, m._farmName].join(" ").toLowerCase();
      const pDetail = isCompra ? (m.purchaseDetails?.sourceProperty || "") : "";
      const vDetail = isVenda ? (m.saleDetails?.buyer || "") : "";
      return base.includes(query) || pDetail.toLowerCase().includes(query) || vDetail.toLowerCase().includes(query);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / MOV_TYPE_RECORDS_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = filtered.slice(safePage * MOV_TYPE_RECORDS_PAGE, (safePage + 1) * MOV_TYPE_RECORDS_PAGE);

  // Build header columns
  if (isCompra) {
    elements.movTypeRecordsHead.innerHTML = `<tr>
      <th>Código</th>
      ${isTotalView ? "<th>Fazenda</th>" : ""}
      <th>Data</th>
      <th>Categoria</th>
      <th class="num-col">Cabeças</th>
      <th>Origem / Propriedade</th>
      <th class="num-col">Peso Total (kg)</th>
      <th class="num-col">Valor/kg</th>
      <th class="num-col">Valor Total</th>
      <th class="num-col">Valor/Animal</th>
      <th class="num-col">Moeda</th>
      <th></th>
    </tr>`;
  } else if (isVenda) {
    elements.movTypeRecordsHead.innerHTML = `<tr>
      <th>Código</th>
      ${isTotalView ? "<th>Fazenda</th>" : ""}
      <th>Data</th>
      <th>Categoria</th>
      <th class="num-col">Cabeças</th>
      <th>Frigorífico / Comprador</th>
      <th class="num-col">Kg Negociados</th>
      <th class="num-col">Rend.%</th>
      <th class="num-col">Valor/kg</th>
      <th class="num-col">Valor Total</th>
      <th class="num-col">Valor/Animal</th>
      <th class="num-col">Moeda</th>
      <th></th>
    </tr>`;
  } else {
    elements.movTypeRecordsHead.innerHTML = `<tr>
      <th>Código</th>
      ${isTotalView ? "<th>Fazenda</th>" : ""}
      <th>Data</th>
      <th>Categoria</th>
      <th>Qtd.</th>
      <th>Obs.</th>
      <th></th>
    </tr>`;
  }

  // Build body rows
  const colCount = isCommercial ? (isTotalView ? 13 : 12) : (isTotalView ? 7 : 6);

  if (!slice.length) {
    elements.movTypeRecordsBody.innerHTML = `<tr><td colspan="${colCount}" class="table-empty-cell">${query ? "Nenhum registro encontrado." : "Nenhum lançamento deste tipo ainda."}</td></tr>`;
  } else {
    elements.movTypeRecordsBody.innerHTML = slice.map((m) => {
      const code = m.code
        ? `<span class="movement-code">${escapeHtml(m.code)}</span>`
        : `<span class="movement-code movement-code-legacy">—</span>`;
      const farmCell = isTotalView ? `<td><span class="sanitary-origin manual">${escapeHtml(m._farmName)}</span></td>` : "";
      const currency = m.currency || getFarmCurrency(m._farmId);
      const sym = currency === "USD" ? "US$" : "R$";
      const currencyBadge = `<span class="currency-badge ${currency === "USD" ? "usd" : "brl"}">${currency}</span>`;
      const fmtVal = (v) => v > 0 ? `${sym} ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}` : "—";
      const fmtKg = (v) => v > 0 ? `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(v)} kg` : "—";
      const actionsCell = `<td class="movement-actions-cell">
        <button class="movement-action-btn edit-btn" title="Editar" data-farm-id="${escapeHtml(m._farmId)}" data-movement-id="${escapeHtml(m.id)}">✏️</button>
        <button class="movement-action-btn delete-btn" title="Excluir" data-farm-id="${escapeHtml(m._farmId)}" data-movement-id="${escapeHtml(m.id)}">🗑️</button>
      </td>`;

      if (isCompra) {
        const p = m.purchaseDetails || {};
        const totalW = p.totalWeight || 0;
        const priceKg = p.pricePerKg || 0;
        const vph = p.valuePerHead || (m.quantity > 0 && m.value > 0 ? m.value / m.quantity : 0);
        return `<tr>
          <td>${code}</td>
          ${farmCell}
          <td>${formatDate(m.date)}</td>
          <td>${escapeHtml(m.categoryName)}</td>
          <td class="num-col"><strong>${formatInteger(m.quantity)}</strong></td>
          <td>${escapeHtml(p.sourceProperty || m.notes || "—")}</td>
          <td class="num-col">${fmtKg(totalW)}</td>
          <td class="num-col">${priceKg > 0 ? fmtVal(priceKg) : "—"}</td>
          <td class="num-col fin-value">${fmtVal(m.value)}</td>
          <td class="num-col">${fmtVal(vph)}</td>
          <td class="num-col">${currencyBadge}</td>
          ${actionsCell}
        </tr>`;
      }

      if (isVenda) {
        const d = m.saleDetails || {};
        const weightKg = d.weightKg || 0;
        const priceKg = d.pricePerKg || 0;
        const yieldPct = d.yieldPct || null;
        const buyer = d.buyer || extractBuyerFromNotes(m.notes);
        const vph = d.valuePerHead || (m.quantity > 0 && m.value > 0 ? m.value / m.quantity : 0);
        const yieldCell = yieldPct ? `${yieldPct}%` : (d.mode === "carcaca" ? extractYieldFromNotes(m.notes) : "—");
        return `<tr>
          <td>${code}</td>
          ${farmCell}
          <td>${formatDate(m.date)}</td>
          <td>${escapeHtml(m.categoryName)}</td>
          <td class="num-col"><strong>${formatInteger(m.quantity)}</strong></td>
          <td>${escapeHtml(buyer || "—")}${getMovementPhotoFlagMarkup(m)}</td>
          <td class="num-col">${fmtKg(weightKg)}</td>
          <td class="num-col">${yieldCell}</td>
          <td class="num-col">${priceKg > 0 ? fmtVal(priceKg) : "—"}</td>
          <td class="num-col fin-value">${fmtVal(m.value)}</td>
          <td class="num-col">${fmtVal(vph)}</td>
          <td class="num-col">${currencyBadge}</td>
          ${actionsCell}
        </tr>`;
      }

      // Generic types
      const deltaSign = m.delta > 0 ? "+" : "";
      return `<tr>
        <td>${code}</td>
        ${farmCell}
        <td>${formatDate(m.date)}</td>
        <td>${escapeHtml(m.categoryName)}</td>
        <td>${deltaSign}${formatInteger(m.quantity)}</td>
        <td>${escapeHtml(getMovementNotes(m))}${getMovementPhotoFlagMarkup(m)}</td>
        ${actionsCell}
      </tr>`;
    }).join("");

    elements.movTypeRecordsBody.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        elements.movTypeRecordsDlg.close();
        openEditMovementDialog(btn.dataset.farmId, btn.dataset.movementId);
      });
    });
    elements.movTypeRecordsBody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Excluir este registro?")) return;
        deleteMovement(btn.dataset.farmId, btn.dataset.movementId);
        renderMovTypeRecordsBody(movType, safePage);
        renderCommercialDashboard(movType);
      });
    });
  }

  // Footer
  elements.movTypeRecordsFooter.innerHTML = `
    <span class="movements-count">${filtered.length} registro${filtered.length !== 1 ? "s" : ""}</span>
    ${totalPages > 1 ? `
      <button class="mov-page-btn" ${safePage === 0 ? "disabled" : ""} id="movRecPrev">&#8249; Anterior</button>
      <span class="mov-page-info">Página ${safePage + 1} de ${totalPages}</span>
      <button class="mov-page-btn" ${safePage >= totalPages - 1 ? "disabled" : ""} id="movRecNext">Próxima &#8250;</button>
    ` : ""}
  `;
  document.getElementById("movRecPrev")?.addEventListener("click", () => renderMovTypeRecordsBody(movType, safePage - 1));
  document.getElementById("movRecNext")?.addEventListener("click", () => renderMovTypeRecordsBody(movType, safePage + 1));
}

// Extrai o nome do frigorífico/comprador a partir das notas legadas (ex: "MARFRIG | ...")
function extractBuyerFromNotes(notes) {
  if (!notes) return "";
  const m = String(notes).match(/^([A-ZÁÉÍÓÚ][A-Za-záéíóúÁÉÍÓÚÃÕ\s]+?)(?:\s*\|)/);
  return m ? m[1].trim() : "";
}

// Extrai rendimento % das notas legadas onde não foi salvo explicitamente
function extractYieldFromNotes(notes) {
  if (!notes) return "—";
  const m = String(notes).match(/(\d+[,.]?\d*)\s*%/);
  return m ? `${m[1].replace(",", ".")}%` : "—";
}

function renderCommercialDashboard(movType) {
  const el = elements.movCommercialDashboard;
  if (!el) return;

  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const allFarms = isTotalView ? getAllFarms() : [getFarm()].filter(Boolean);
  const isCompra = movType === "compra";

  // Separate farms by currency to never mix BRL and USD totals
  const brlFarms = allFarms.filter((f) => getFarmCurrency(f.id) === "BRL");
  const usdFarms = allFarms.filter((f) => getFarmCurrency(f.id) === "USD");

  function aggregate(farms) {
    const movs = farms.flatMap((f) =>
      f.movements.filter((m) => m.type === movType).map((m) => ({ ...m, _farmId: f.id, _farmName: f.name }))
    );
    const count = movs.length;
    const heads = movs.reduce((s, m) => s + Number(m.quantity || 0), 0);
    const totalValue = movs.reduce((s, m) => s + Number(m.value || 0), 0);
    const totalWeight = isCompra
      ? movs.reduce((s, m) => s + Number(m.purchaseDetails?.totalWeight || 0), 0)
      : movs.reduce((s, m) => s + Number(m.saleDetails?.weightKg || 0), 0);
    const avgPricePerKg = totalWeight > 0 ? totalValue / totalWeight : 0;
    const avgPerHead = heads > 0 ? totalValue / heads : 0;
    const byFarm = farms.map((f) => {
      const fm = movs.filter((m) => m._farmId === f.id);
      return { name: f.name, count: fm.length, heads: fm.reduce((s, m) => s + Number(m.quantity || 0), 0), value: fm.reduce((s, m) => s + Number(m.value || 0), 0) };
    }).filter((x) => x.count > 0);
    return { count, heads, totalValue, totalWeight, avgPricePerKg, avgPerHead, byFarm };
  }

  function buildSection(farms, currency) {
    if (!farms.length) return "";
    const d = aggregate(farms);
    if (d.count === 0) return "";
    const sym = currency === "USD" ? "US$" : "R$";
    const fmt = (v) => v > 0 ? `${sym} ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}` : "—";
    const cards = [
      { t: isCompra ? "Compras" : "Vendas", v: String(d.count), d2: "registros" },
      { t: "Cabeças", v: formatInteger(d.heads), d2: isCompra ? "adquiridas" : "negociadas" },
      { t: isCompra ? "Investimento total" : "Faturamento total", v: fmt(d.totalValue), d2: currency },
      { t: isCompra ? "Custo médio / cabeça" : "Receita média / cabeça", v: fmt(d.avgPerHead), d2: "ticket médio" },
      d.totalWeight > 0 ? { t: isCompra ? "Peso adquirido" : "Kg negociados", v: `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(d.totalWeight)} kg`, d2: "" } : null,
      d.avgPricePerKg > 0 ? { t: isCompra ? "Custo médio / kg" : "Valor médio / kg", v: fmt(d.avgPricePerKg), d2: "" } : null,
    ].filter(Boolean);

    const farmRows = d.byFarm.length > 1 ? `
      <div class="commercial-farm-breakdown">
        ${d.byFarm.map((x) => `
          <div class="commercial-farm-row">
            <span class="farm-tag">${escapeHtml(x.name)}</span>
            <span>${formatInteger(x.heads)} cab.</span>
            <span class="fin-value">${fmt(x.value)}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
      <div class="commercial-currency-block">
        <div class="commercial-block-header">
          <span class="currency-badge ${currency === "USD" ? "usd" : "brl"}">${currency}</span>
          <span class="commercial-block-farms">${farms.map((f) => escapeHtml(f.name)).join(" · ")}</span>
        </div>
        <div class="commercial-cards-row">
          ${cards.map((c) => `
            <div class="commercial-card">
              <p class="commercial-card-label">${c.t}</p>
              <strong class="commercial-card-value">${c.v}</strong>
              ${c.d2 ? `<p class="commercial-card-detail">${c.d2}</p>` : ""}
            </div>
          `).join("")}
        </div>
        ${farmRows}
      </div>
    `;
  }

  const brlHtml = buildSection(brlFarms, "BRL");
  const usdHtml = buildSection(usdFarms, "USD");

  if (!brlHtml && !usdHtml) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `<div class="commercial-dashboard-inner">${brlHtml}${usdHtml}</div>`;
  el.hidden = false;
}

function handleRegisterAction(action) {
  if (action === "dado-mensal") {
    openMonthlyDataDialog();
    return;
  }

  if (action === "categoria") {
    openCategoryDialog();
    return;
  }

  openMovementDialog(action);
}

function renderFarmSwitch() {
  elements.farmSwitch.innerHTML = "";
  const totalButton = document.createElement("button");
  totalButton.className = `farm-btn ${TOTAL_FARM_ID === state.data.selectedFarmId ? "active" : ""}`;
  totalButton.textContent = "Total";
  totalButton.addEventListener("click", () => {
    state.data.selectedFarmId = TOTAL_FARM_ID;
    state.activeView = "dashboard";
    saveData();
    render();
  });
  elements.farmSwitch.appendChild(totalButton);

  Object.values(state.data.farms).forEach((farm) => {
    const button = document.createElement("button");
    button.className = `farm-btn ${farm.id === state.data.selectedFarmId ? "active" : ""}`;
    button.textContent = farm.name;
    button.addEventListener("click", () => {
      state.data.selectedFarmId = farm.id;
      state.activeView = "dashboard";
      runtime.movementsPage = 0;
      runtime.movementsSearch = "";
      runtime.sanitaryPage = 0;
      runtime.sanitarySearch = "";
      saveData();
      render();
    });
    elements.farmSwitch.appendChild(button);
  });
}

function renderGlobalSummary() {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const farms = isTotalView ? getAllFarms() : [state.data.farms[state.data.selectedFarmId]].filter(Boolean);
  const totals = farms.reduce((accumulator, farm) => {
    const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
    accumulator.animais += getFarmTotal(farm);
    accumulator.declaredTotal += Number(farm.declaredTotal || 0);
    accumulator.allocatedAnimals += getRegisteredPotreroAnimals(farm);
    accumulator.entradas += monthly.byType.compra + monthly.byType.nascimento + monthly.adjustPositive;
    accumulator.saidas += monthly.byType.venda + monthly.byType.consumo + monthly.byType.morte + monthly.adjustNegative;
    accumulator.sanitario += getFilteredSanitaryRecords(farm).length;
    accumulator.monthlyRecords += getFilteredMonthlyRecords(farm).length;
    return accumulator;
  }, { animais: 0, declaredTotal: 0, allocatedAnimals: 0, entradas: 0, saidas: 0, sanitario: 0, monthlyRecords: 0 });
  const selectedFarm = farms[0];
  const allocationBalance = totals.animais - totals.allocatedAnimals;

  elements.globalPanelKicker.textContent = isTotalView ? "Painel inicial" : "Fazenda selecionada";
  elements.globalPanelTitle.textContent = isTotalView ? "Consolidado das fazendas" : `Resumo de ${selectedFarm?.name || "fazenda"}`;
  elements.globalPanelChip.textContent = isTotalView ? "Grupo Da Luz" : selectedFarm?.name || "Fazenda";

  const cards = [
    {
      title: isTotalView ? "Estoque consolidado" : "Estoque atual",
      value: formatInteger(totals.animais),
      detail: isTotalView ? "estoque consolidado do grupo" : `estoque atual de ${selectedFarm?.name || "fazenda"}`
    },
    {
      title: isTotalView ? "Entradas consolidadas" : "Entradas no período",
      value: formatInteger(totals.declaredTotal),
      detail: totals.declaredTotal === totals.animais
        ? "estoque alinhado ao total declarado"
        : `${formatInteger(totals.declaredTotal - totals.animais)} animais de diferenca`
    },
    {
      title: isTotalView ? "Saídas consolidadas" : "Saídas no período",
      value: formatInteger(totals.saidas),
      detail: isTotalView ? "vendas, mortes, consumo e ajustes negativos" : "vendas, mortes, consumo e ajustes negativos"
    },
    {
      title: "Registros sanitários",
      value: formatInteger(totals.sanitario),
      detail: isTotalView ? "manejos sanitários no período filtrado" : `manejos sanitários de ${selectedFarm?.name || "fazenda"}`
    }
  ];

  elements.globalSummaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  elements.globalFarmBreakdown.innerHTML = farms.map((farm) => {
    const summary = summarizePeriod(farm, state.filters.year, state.filters.month);
    const sanitaryCount = getFilteredSanitaryRecords(farm).length;
    return `
      <article class="global-farm-card">
        <p class="panel-kicker">${escapeHtml(farm.name)}</p>
        <strong>${formatInteger(getFarmTotal(farm))}</strong>
        <p>Compra ${formatInteger(summary.byType.compra)} | Venda ${formatInteger(summary.byType.venda)}</p>
        <p>Nasc. ${formatInteger(summary.byType.nascimento)} | Mortes ${formatInteger(summary.byType.morte)}</p>
        <span>${formatInteger(sanitaryCount)} registro(s) sanitários no período</span>
      </article>
    `;
  }).join("");
}

function renderActiveView() {
  const view = state.activeView;
  elements.dashboardView.hidden = view !== "dashboard";
  elements.sanitaryView.hidden = view !== "sanitary";
  elements.potreirosView.hidden = view !== "potreiros";
  elements.sanitaryShortcut.classList.toggle("active", view === "sanitary");
  elements.potreirosShortcut.classList.toggle("active", view === "potreiros");
  if (view === "potreiros") {
    renderPotreirosView();
  }
  syncMobileNav(view);
}

function syncMobileNav(view) {
  if (!elements.mobileBottomNav) return;
  [elements.mobileNavDashboard, elements.mobileNavSanitary, elements.mobileNavPotreiros, elements.mobileNavFarms].forEach((btn) => {
    if (btn) btn.classList.remove("active");
  });
  if (view === "dashboard" && elements.mobileNavDashboard) elements.mobileNavDashboard.classList.add("active");
  if (view === "sanitary" && elements.mobileNavSanitary) elements.mobileNavSanitary.classList.add("active");
  if (view === "potreiros" && elements.mobileNavPotreiros) elements.mobileNavPotreiros.classList.add("active");
}

function renderMobileFarmDrawer() {
  if (!elements.mobileFarmSwitchList) return;
  const farms = [{ id: TOTAL_FARM_ID, name: "Total (todas as fazendas)" }, ...getAllFarms()];
  elements.mobileFarmSwitchList.innerHTML = farms.map((farm) => `
    <button type="button" class="mobile-farm-option ${farm.id === state.data.selectedFarmId ? "active" : ""}" data-farm-id="${farm.id}">
      ${escapeHtml(farm.name)}
    </button>
  `).join("");
  elements.mobileFarmSwitchList.querySelectorAll("[data-farm-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.data.selectedFarmId = btn.dataset.farmId;
      state.activeView = "dashboard";
      elements.mobileFarmDrawer.hidden = true;
      saveData();
      render();
    });
  });
}

function renderActionButtonsState() {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  elements.editStockButton.disabled = false;
  elements.editStockButton.title = isTotalView
    ? "Na aba total, o editor abre em modo global para escolher a fazenda dentro do modal."
    : "";
}

function renderGeorefState(farm) {
  const isArapeyDashboard = farm.id === "arapey" && state.activeView === "dashboard";
  elements.georefButton.hidden = !isArapeyDashboard;
  elements.georefButton.disabled = !isArapeyDashboard;
  elements.georefButton.title = isArapeyDashboard ? "" : "Disponível apenas na fazenda Arapey.";

  if (!isArapeyDashboard && elements.georefDialog.open) {
    clearGeorefDraft();
    elements.georefDialog.close();
    return;
  }

  if (isArapeyDashboard && elements.georefDialog.open) {
    void renderGeorefDialog();
  }
}

function renderHero(farm) {
  const dominantCategory = getDominantCategory(farm);
  const dominantText = dominantCategory
    ? `${dominantCategory.name} lidera o rebanho com ${formatInteger(dominantCategory.quantity)} animais.`
    : "Estrutura pronta para acompanhar compras, vendas e manejo.";

  elements.heroFarmName.textContent = farm.name;
  elements.heroFarmNote.textContent = `${farm.note} ${dominantText}`;

  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  if (elements.dashboardFarmLabel) {
    elements.dashboardFarmLabel.textContent = isTotalView
      ? "Painel de Controle de Todas as Fazendas"
      : `Painel de Controle — Fazenda ${farm.name}`;
  }
}

function renderHeroMetrics(farm) {
  const totalAnimals = getFarmTotal(farm);
  const annual = summarizePeriod(farm, state.filters.year, "all");
  const discrepancy = getDiscrepancy(farm);

  const metrics = [
    {
      label: "Rebanho",
      value: formatInteger(totalAnimals),
      text: "animais no estoque atual"
    },
    {
      label: "Giro anual",
      value: formatInteger(annual.totalMovements),
      text: "lançamentos no ano filtrado"
    },
    {
      label: "Conferência",
      value: discrepancy === 0 ? "OK" : `${discrepancy > 0 ? "+" : ""}${formatInteger(discrepancy)}`,
      text: discrepancy === 0 ? "estoque alinhado ao total declarado" : "diferença entre estoque e total declarado"
    }
  ];

  elements.heroMetrics.innerHTML = metrics.map((metric) => `
    <article class="hero-metric">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
      <p>${metric.text}</p>
    </article>
  `).join("");
}

function renderSummaryCards(farm) {
  const totalAnimals = getFarmTotal(farm);
  const monthlyData = summarizePeriod(farm, state.filters.year, state.filters.month);
  const annualData = summarizePeriod(farm, state.filters.year, "all");
  const purchasesAndBirths = monthlyData.byType.compra + monthlyData.byType.nascimento + monthlyData.adjustPositive;
  const salesAndLosses = monthlyData.byType.venda + monthlyData.byType.consumo + monthlyData.byType.morte + monthlyData.adjustNegative;

  const cards = [
    { title: "Rebanho atual", value: formatInteger(totalAnimals), detail: "Estoque total da fazenda selecionada" },
    { title: "Entradas no período", value: formatInteger(purchasesAndBirths), detail: "Compras, nascimentos e ajustes positivos" },
    { title: "Saídas no período", value: formatInteger(salesAndLosses), detail: "Vendas, consumo, mortes e ajustes negativos" },
    { title: "Movimentações no ano", value: formatInteger(annualData.totalMovements), detail: `Lançamentos registrados em ${state.filters.year}` }
  ];

  elements.summaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");
}

function renderVisualHerdGrid(farm) {
  const total = Math.max(getFarmTotal(farm), 1);
  const categories = [...farm.categories]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  elements.visualHerdGrid.innerHTML = categories.map((category) => {
    const share = ((category.quantity / total) * 100).toFixed(1);
    return `
      <article class="visual-card">
        <div class="visual-card-image">
          <img src="${getCategoryImage(category.name)}" alt="${escapeHtml(category.name)}">
        </div>
        <div class="visual-card-copy">
          <div class="visual-card-topline">
            <div>
              <p class="panel-kicker">${escapeHtml(getCategoryFamily(category.name))}</p>
              <strong>${escapeHtml(category.name)}</strong>
            </div>
            <span class="visual-card-share">${share}%</span>
          </div>
          <p>${formatInteger(category.quantity)} animais neste grupo.</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderPeriodSummary(farm) {
  const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
  const annual = summarizePeriod(farm, state.filters.year, "all");
  const valueText = annual.totalValue > 0 ? formatCurrency(annual.totalValue) : "Sem valor informado";

  const cards = [
    { title: state.filters.month === "all" ? "Saldo anual" : "Saldo do mês", value: `${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`, detail: "Variação líquida entre entradas e saídas" },
    { title: "Compras", value: formatInteger(monthly.byType.compra), detail: "Animais comprados no recorte" },
    { title: "Nascimentos", value: formatInteger(monthly.byType.nascimento), detail: "Animais nascidos no recorte" },
    { title: "Valor movimentado", value: valueText, detail: "Soma dos valores registrados no ano" }
  ];

  elements.periodSummary.innerHTML = cards.map((card) => `
    <article class="analytics-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  elements.discrepancyNote.textContent = getDiscrepancyText(farm);
}

function renderSalesAnalysis(farm) {
  const summary = summarizeSalePeriod(farm, state.filters.year, state.filters.month);
  const isPremiumFarm = isPremiumSaleFarm(farm);

  const cards = isPremiumFarm
    ? [
      { title: "Vendas registradas", value: formatInteger(summary.count), detail: "lançamentos comerciais no período" },
      { title: "Faturamento", value: formatCurrency(summary.totalValue), detail: "valor calculado das vendas" },
      { title: "Kg vivo", value: formatWeight(summary.liveKg), detail: "peso vivo negociado" },
      { title: "Kg carcaça", value: formatWeight(summary.carcassKg), detail: "peso de carcaça negociado" }
    ]
    : [
      { title: "Vendas registradas", value: formatInteger(summary.count), detail: "lançamentos comerciais no período" },
      { title: "Faturamento", value: formatCurrency(summary.totalValue), detail: "valor calculado das vendas" },
      { title: "Kg vivo", value: formatWeight(summary.liveKg), detail: "peso vivo negociado" },
      { title: "Média R$/kg vivo", value: summary.liveKg > 0 ? formatCurrency(summary.totalValue / summary.liveKg) : formatCurrency(0), detail: "preço médio por kg vivo" }
    ];

  if (elements.salesSummary) {
    elements.salesSummary.innerHTML = cards.map((card) => `
      <article class="analytics-card">
        <p class="panel-kicker">${card.title}</p>
        <strong>${card.value}</strong>
        <p>${card.detail}</p>
      </article>
    `).join("");
  }

  if (!summary.movements.length) {
    elements.salesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty-cell">Nenhuma venda encontrada para o período selecionado.</td>
      </tr>
    `;
    return;
  }

  elements.salesTableBody.innerHTML = summary.movements.slice(0, 10).map((movement) => `
    <tr>
      <td data-label="Data">${formatDate(movement.date)}</td>
      <td data-label="Categoria">${escapeHtml(movement.categoryName)}${getMovementPhotoFlagMarkup(movement)}</td>
      <td data-label="Base">${movement.saleDetails ? escapeHtml(getSaleModeLabel(movement.saleDetails.mode || "vivo")) : "Relatório mensal"}</td>
      <td data-label="Kg">${movement.saleDetails ? formatWeight(movement.saleDetails.weightKg || 0) : "-"}</td>
      <td data-label="R$/kg">${movement.saleDetails ? formatCurrency(movement.saleDetails.pricePerKg || 0) : "-"}</td>
      <td data-label="Total">${formatCurrency(movement.value || 0)}</td>
    </tr>
  `).join("");
}

const MOVEMENT_TYPE_STYLES = {
  compra: "badge-ok",
  nascimento: "badge-ok",
  venda: "badge-exit",
  morte: "badge-err",
  consumo: "badge-warn",
  ajuste: "badge-neutral",
  transferencia: "badge-neutral",
  sanitario: "badge-ok"
};

const MOVEMENTS_PAGE_SIZE = 50;

function renderMovementsTable(farm) {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const colCount = isTotalView ? 8 : 7;

  // Build full sorted list
  let allMovements;
  if (isTotalView) {
    allMovements = getAllFarms().flatMap((f) => f.movements.map((m) => ({ ...m, _farmId: f.id, _farmName: f.name })));
  } else {
    allMovements = farm.movements.map((m) => ({ ...m, _farmId: farm.id, _farmName: farm.name }));
  }
  allMovements = allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply search filter
  const query = runtime.movementsSearch.trim().toLowerCase();
  const filtered = query
    ? allMovements.filter((m) =>
        (m.code || "").toLowerCase().includes(query) ||
        (m.type || "").toLowerCase().includes(query) ||
        (m.categoryName || "").toLowerCase().includes(query) ||
        (m.notes || "").toLowerCase().includes(query) ||
        (m._farmName || "").toLowerCase().includes(query)
      )
    : allMovements;

  const totalPages = Math.max(1, Math.ceil(filtered.length / MOVEMENTS_PAGE_SIZE));
  if (runtime.movementsPage >= totalPages) runtime.movementsPage = totalPages - 1;
  const page = runtime.movementsPage;
  const movements = filtered.slice(page * MOVEMENTS_PAGE_SIZE, (page + 1) * MOVEMENTS_PAGE_SIZE);

  // Render table header
  if (elements.movementsTableHead) {
    elements.movementsTableHead.innerHTML = `<tr>
      <th>Código</th>
      ${isTotalView ? "<th>Fazenda</th>" : ""}
      <th>Data</th><th>Tipo</th><th>Categoria</th><th>Qtd.</th><th>Obs.</th><th></th>
    </tr>`;
  }

  // Search bar + pagination controls container
  const container = elements.movementsTableBody.closest(".table-wrap") || elements.movementsTableBody.parentElement;
  let toolbar = container.parentElement.querySelector(".movements-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "movements-toolbar";
    container.parentElement.insertBefore(toolbar, container);
  }
  toolbar.innerHTML = `
    <div class="movements-search-wrap">
      <input
        type="search"
        class="movements-search-input"
        placeholder="Buscar por código, tipo, categoria…"
        value="${escapeHtml(runtime.movementsSearch)}"
        id="movementsSearchInput"
      >
    </div>
    <div class="movements-pagination">
      <span class="movements-count">${filtered.length} registro${filtered.length !== 1 ? "s" : ""}${query ? " encontrado" + (filtered.length !== 1 ? "s" : "") : ""}</span>
      ${totalPages > 1 ? `
        <button class="mov-page-btn" data-page="${page - 1}" ${page === 0 ? "disabled" : ""}>&#8249; Anterior</button>
        <span class="mov-page-info">Página ${page + 1} de ${totalPages}</span>
        <button class="mov-page-btn" data-page="${page + 1}" ${page >= totalPages - 1 ? "disabled" : ""}>Próxima &#8250;</button>
      ` : ""}
    </div>
  `;

  toolbar.querySelector("#movementsSearchInput").addEventListener("input", (e) => {
    runtime.movementsSearch = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelectorAll(".mov-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      runtime.movementsPage = Number(btn.dataset.page);
      renderMovementsTable(farm);
    });
  });

  if (!movements.length) {
    elements.movementsTableBody.innerHTML = `
      <tr><td colspan="${colCount}" class="table-empty-cell">${query ? "Nenhum registro encontrado para a busca." : "Ainda não há lançamentos. Use os botões acima para iniciar o controle."}</td></tr>
    `;
    return;
  }

  elements.movementsTableBody.innerHTML = movements.map((movement) => {
    const badgeClass = MOVEMENT_TYPE_STYLES[movement.type] || "badge-neutral";
    const deltaSign = movement.delta > 0 ? "+" : "";
    const codeDisplay = movement.code
      ? `<span class="movement-code">${escapeHtml(movement.code)}</span>`
      : `<span class="movement-code movement-code-legacy">—</span>`;
    const farmCell = isTotalView
      ? `<td data-label="Fazenda"><span class="sanitary-origin manual">${escapeHtml(movement._farmName)}</span></td>`
      : "";
    return `
      <tr>
        <td data-label="Código">${codeDisplay}</td>
        ${farmCell}
        <td data-label="Data">${formatDate(movement.date)}</td>
        <td data-label="Tipo"><span class="badge ${badgeClass}">${capitalize(movement.type)}</span></td>
        <td data-label="Categoria">${escapeHtml(movement.categoryName)}</td>
        <td data-label="Qtd.">${deltaSign}${formatInteger(movement.quantity)}</td>
        <td data-label="Obs.">${escapeHtml(getMovementNotes(movement))}${getMovementPhotoFlagMarkup(movement)}</td>
        <td class="movement-actions-cell">
          <button class="movement-action-btn edit-btn" title="Editar" data-farm-id="${escapeHtml(movement._farmId)}" data-movement-id="${escapeHtml(movement.id)}">✏️</button>
          <button class="movement-action-btn delete-btn" title="Excluir" data-farm-id="${escapeHtml(movement._farmId)}" data-movement-id="${escapeHtml(movement.id)}">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");

  elements.movementsTableBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditMovementDialog(btn.dataset.farmId, btn.dataset.movementId));
  });
  elements.movementsTableBody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteMovement(btn.dataset.farmId, btn.dataset.movementId));
  });
}

function getHistoryOperationLabel(operation) {
  if (operation === "sanitario") return "Sanitário";
  const meta = MOVEMENT_TYPES.find((item) => item.value === operation);
  return meta ? meta.label : capitalize(operation || "registro");
}

function getHistoryRecordCode(record) {
  if (record.code) return record.code;
  if (record.kind === "sanitary") return `SAN-${getFarmCodePrefix(record.farmId)}-LEG`;
  return `LEG-${getFarmCodePrefix(record.farmId)}`;
}

function getUnifiedHistoryRecords(baseFarm, options = {}) {
  const forceSingleFarm = options.scope === "single";
  const farms = forceSingleFarm
    ? [baseFarm].filter(Boolean)
    : (state.data.selectedFarmId === TOTAL_FARM_ID ? getAllFarms() : [baseFarm].filter(Boolean));

  return farms.flatMap((farm) => {
    const movementRecords = farm.movements.map((movement) => ({
      kind: "movement",
      id: movement.id,
      farmId: farm.id,
      farmName: farm.name,
      date: movement.date,
      year: String(movement.date || "").slice(0, 4),
      code: movement.code || "",
      operation: movement.type || "movimento",
      categoryName: movement.categoryName || "—",
      quantity: Number(movement.quantity || 0),
      details: [
        movement.potreiro ? `Potreiro: ${movement.potreiro}` : "",
        movement.potreiroDest ? `Destino: ${movement.potreiroDest}` : "",
        movement.value ? `Valor: ${formatCurrency(movement.value)}` : "",
        getMovementNotes(movement)
      ].filter(Boolean).join(" · "),
      raw: movement
    }));

    const sanitaryRecords = farm.sanitaryRecords.map((record) => ({
      kind: "sanitary",
      id: record.id || record.sourceId,
      farmId: farm.id,
      farmName: farm.name,
      date: record.date,
      year: String(record.date || "").slice(0, 4),
      code: record.code || "",
      operation: "sanitario",
      categoryName: record.categoryName || "—",
      quantity: Number(record.quantity || 0),
      details: [
        record.product ? `Produto: ${record.product}` : "",
        record.potreiro ? `Potreiro: ${record.potreiro}` : "",
        record.notes || ""
      ].filter(Boolean).join(" · "),
      raw: record
    }));

    return [...movementRecords, ...sanitaryRecords];
  }).sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
    || String(getHistoryRecordCode(a)).localeCompare(String(getHistoryRecordCode(b)))
    || String(a.id || "").localeCompare(String(b.id || ""))
  );
}

function renderMovementsTable(farm) {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const colCount = isTotalView ? 8 : 7;
  const allRecords = getUnifiedHistoryRecords(farm);
  const years = [...new Set(allRecords.map((record) => record.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const categories = [...new Set(allRecords.map((record) => record.categoryName).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const operations = [...new Set(allRecords.map((record) => record.operation).filter(Boolean))];
  const query = runtime.movementsSearch.trim().toLowerCase();

  const filtered = allRecords.filter((record) => {
    const matchesQuery = !query || [
      getHistoryRecordCode(record),
      getHistoryOperationLabel(record.operation),
      record.categoryName,
      record.details,
      record.farmName
    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesYear = runtime.movementsYearFilter === "all" || record.year === runtime.movementsYearFilter;
    const matchesCategory = runtime.movementsCategoryFilter === "all" || record.categoryName === runtime.movementsCategoryFilter;
    const matchesOperation = runtime.movementsOperationFilter === "all" || record.operation === runtime.movementsOperationFilter;
    const matchesFarm = !isTotalView || runtime.movementsFarmFilter === "all" || record.farmId === runtime.movementsFarmFilter;

    return matchesQuery && matchesYear && matchesCategory && matchesOperation && matchesFarm;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / MOVEMENTS_PAGE_SIZE));
  if (runtime.movementsPage >= totalPages) runtime.movementsPage = totalPages - 1;
  const page = runtime.movementsPage;
  const records = filtered.slice(page * MOVEMENTS_PAGE_SIZE, (page + 1) * MOVEMENTS_PAGE_SIZE);

  if (elements.movementsTableHead) {
    elements.movementsTableHead.innerHTML = `<tr>
      <th>Código</th>
      ${isTotalView ? "<th>Fazenda</th>" : ""}
      <th>Data</th><th>Operação</th><th>Categoria</th><th>Qtd.</th><th>Registro</th><th></th>
    </tr>`;
  }

  const container = elements.movementsTableBody.closest(".table-wrap") || elements.movementsTableBody.parentElement;
  let toolbar = container.parentElement.querySelector(".movements-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "movements-toolbar";
    container.parentElement.insertBefore(toolbar, container);
  }
  toolbar.innerHTML = `
    <div class="movements-search-wrap">
      <input
        type="search"
        class="movements-search-input"
        placeholder="Buscar por código, fazenda, operação, categoria ou registro..."
        value="${escapeHtml(runtime.movementsSearch)}"
        id="movementsSearchInput"
      >
    </div>
    <div class="movements-filter-group">
      ${isTotalView
        ? `<select class="movements-filter-select" id="movementsFarmFilter">
            <option value="all">Todas as fazendas</option>
            ${getAllFarms().map((item) => `<option value="${escapeHtml(item.id)}" ${runtime.movementsFarmFilter === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>`
        : `<select class="movements-filter-select" id="movementsFarmFilter" disabled><option value="${escapeHtml(farm.id)}">${escapeHtml(farm.name)}</option></select>`
      }
      <select class="movements-filter-select" id="movementsOperationFilter">
        <option value="all">Todas as operações</option>
        ${operations.map((operation) => `<option value="${escapeHtml(operation)}" ${runtime.movementsOperationFilter === operation ? "selected" : ""}>${escapeHtml(getHistoryOperationLabel(operation))}</option>`).join("")}
      </select>
      <select class="movements-filter-select" id="movementsCategoryFilter">
        <option value="all">Todas as categorias</option>
        ${categories.map((category) => `<option value="${escapeHtml(category)}" ${runtime.movementsCategoryFilter === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
      </select>
      <select class="movements-filter-select" id="movementsYearFilter">
        <option value="all">Todos os anos</option>
        ${years.map((year) => `<option value="${escapeHtml(year)}" ${runtime.movementsYearFilter === year ? "selected" : ""}>${escapeHtml(year)}</option>`).join("")}
      </select>
    </div>
    <div class="movements-pagination">
      <span class="movements-count">${filtered.length} registro${filtered.length !== 1 ? "s" : ""}${query ? " encontrado" + (filtered.length !== 1 ? "s" : "") : ""}</span>
      ${totalPages > 1 ? `
        <button class="mov-page-btn" data-page="${page - 1}" ${page === 0 ? "disabled" : ""}>&#8249; Anterior</button>
        <span class="mov-page-info">Página ${page + 1} de ${totalPages}</span>
        <button class="mov-page-btn" data-page="${page + 1}" ${page >= totalPages - 1 ? "disabled" : ""}>Próxima &#8250;</button>
      ` : ""}
    </div>
  `;

  toolbar.querySelector("#movementsSearchInput").addEventListener("input", (e) => {
    runtime.movementsSearch = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelector("#movementsFarmFilter")?.addEventListener("change", (e) => {
    runtime.movementsFarmFilter = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelector("#movementsOperationFilter")?.addEventListener("change", (e) => {
    runtime.movementsOperationFilter = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelector("#movementsCategoryFilter")?.addEventListener("change", (e) => {
    runtime.movementsCategoryFilter = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelector("#movementsYearFilter")?.addEventListener("change", (e) => {
    runtime.movementsYearFilter = e.target.value;
    runtime.movementsPage = 0;
    renderMovementsTable(farm);
  });
  toolbar.querySelectorAll(".mov-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      runtime.movementsPage = Number(btn.dataset.page);
      renderMovementsTable(farm);
    });
  });

  if (!records.length) {
    elements.movementsTableBody.innerHTML = `
      <tr><td colspan="${colCount}" class="table-empty-cell">${query ? "Nenhum registro encontrado para a busca." : "Ainda não há registros no histórico consolidado."}</td></tr>
    `;
    return;
  }

  elements.movementsTableBody.innerHTML = records.map((record) => {
    const badgeClass = MOVEMENT_TYPE_STYLES[record.operation] || "badge-neutral";
    const codeDisplay = `<span class="movement-code ${record.kind === "sanitary" ? "san-code" : ""}">${escapeHtml(getHistoryRecordCode(record))}</span>`;
    const farmCell = isTotalView
      ? `<td data-label="Fazenda"><span class="sanitary-origin manual">${escapeHtml(record.farmName)}</span></td>`
      : "";
    const actionButtons = record.kind === "movement"
      ? `
          <button class="movement-action-btn edit-btn" title="Editar" data-farm-id="${escapeHtml(record.farmId)}" data-movement-id="${escapeHtml(record.id)}">✏️</button>
          <button class="movement-action-btn delete-btn" title="Excluir" data-farm-id="${escapeHtml(record.farmId)}" data-movement-id="${escapeHtml(record.id)}">🗑️</button>
        `
      : `<button class="movement-action-btn edit-sanitary-btn" title="Editar sanitário" data-edit-sanitary-id="${escapeHtml(record.id)}">✏️</button>`;
    return `
      <tr>
        <td data-label="Código">${codeDisplay}</td>
        ${farmCell}
        <td data-label="Data">${formatDate(record.date)}</td>
        <td data-label="Operação"><span class="badge ${badgeClass}">${escapeHtml(getHistoryOperationLabel(record.operation))}</span></td>
        <td data-label="Categoria">${escapeHtml(record.categoryName)}</td>
        <td data-label="Qtd.">${formatInteger(record.quantity)}</td>
        <td data-label="Registro">${escapeHtml(record.details || "—")}${record.kind === "movement" ? getMovementPhotoFlagMarkup(record.raw) : ""}</td>
        <td class="movement-actions-cell">${actionButtons}</td>
      </tr>
    `;
  }).join("");

  elements.movementsTableBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditMovementDialog(btn.dataset.farmId, btn.dataset.movementId));
  });
  elements.movementsTableBody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteMovement(btn.dataset.farmId, btn.dataset.movementId));
  });
  elements.movementsTableBody.querySelectorAll(".edit-sanitary-btn").forEach((btn) => {
    btn.addEventListener("click", () => openSanitaryEditor(btn.dataset.editSanitaryId));
  });
}

function revertMovementEffect(farm, movement) {
  const category = farm.categories.find((c) => c.id === movement.categoryId);
  if (!category) return;

  if (movement.type === "transferencia") {
    // Reverse allocation only
    ensureCategoryAllocation(category);
    const originId = movement.potreiro || UNALLOCATED_POTREIRO_KEY;
    const destId = movement.potreiroDest || UNALLOCATED_POTREIRO_KEY;
    category.allocation[originId] = (Number(category.allocation[originId] || 0)) + movement.quantity;
    category.allocation[destId] = Math.max(0, (Number(category.allocation[destId] || 0)) - movement.quantity);
  } else if (movement.delta !== 0) {
    // Reverse stock delta
    category.quantity -= movement.delta;
    ensureCategoryAllocation(category);
    const potreirosId = movement.potreiro || UNALLOCATED_POTREIRO_KEY;
    if (movement.delta > 0) {
      category.allocation[potreirosId] = Math.max(0, (Number(category.allocation[potreirosId] || 0)) - movement.quantity);
    } else {
      category.allocation[potreirosId] = (Number(category.allocation[potreirosId] || 0)) + movement.quantity;
    }
  }
  updatePotreroQuantitiesFromAllocation(farm);
}

function deleteMovement(farmId, movementId) {
  const farm = state.data.farms[farmId];
  if (!farm) return;
  const movement = farm.movements.find((m) => m.id === movementId);
  if (!movement) return;

  const label = `${capitalize(movement.type)} de ${formatInteger(movement.quantity)} ${movement.categoryName} em ${formatDate(movement.date)}`;
  if (!confirm(`Excluir este lançamento?\n\n${label}\n\nO estoque da categoria será revertido.`)) return;

  revertMovementEffect(farm, movement);
  farm.movements = farm.movements.filter((m) => m.id !== movementId);
  saveData();
  render();
}

function openEditMovementDialog(farmId, movementId) {
  const farm = state.data.farms[farmId];
  if (!farm) return;
  const movement = farm.movements.find((m) => m.id === movementId);
  if (!movement) return;

  runtime.editingMovement = { farmId, movementId };

  syncMovementFarmOptions(farmId);
  if (elements.movementFarmWrap) {
    elements.movementFarmWrap.hidden = true;
  }
  syncMovementTypeOptions(movement.type);
  syncMovementCategoryOptionsForFarm(farm);
  if (elements.movementCategory) elements.movementCategory.value = movement.categoryId;
  syncMovementPotreirosOptions();

  elements.movementDate.value = movement.date;
  elements.movementQuantity.value = movement.quantity;
  elements.adjustDirection.value = movement.delta >= 0 ? "add" : "sub";
  elements.movementNotes.value = movement.notes || "";
  elements.movementValue.value = movement.value || "";

  if (movement.type === "venda" && movement.saleDetails) {
    const d = movement.saleDetails;
    if (elements.movementSaleMode) elements.movementSaleMode.value = d.mode || "vivo";
    if (d.mode === "carcaca") {
      if (elements.movementCarcassPrice) elements.movementCarcassPrice.value = d.pricePerKg || "";
      if (elements.movementCarcassKg) elements.movementCarcassKg.value = d.weightKg || "";
    } else {
      if (elements.movementLivePrice) elements.movementLivePrice.value = d.pricePerKg || "";
      if (elements.movementLiveKg) elements.movementLiveKg.value = d.weightKg || "";
    }
    if (elements.movSaleBuyer) elements.movSaleBuyer.value = d.buyer || "";
    if (elements.movSaleYieldPct) elements.movSaleYieldPct.value = d.yieldPct || "";
  }

  if (movement.type === "compra" && movement.purchaseDetails) {
    const p = movement.purchaseDetails;
    if (elements.movPurchaseSource) elements.movPurchaseSource.value = p.sourceProperty || "";
    if (elements.movPurchaseAvgWeight) elements.movPurchaseAvgWeight.value = p.avgWeight || "";
    if (elements.movPurchaseTotalWeight) { elements.movPurchaseTotalWeight.value = p.totalWeight || ""; delete elements.movPurchaseTotalWeight.dataset.manualEdit; }
    if (elements.movPurchasePricePerKg) elements.movPurchasePricePerKg.value = p.pricePerKg || "";
    if (elements.movPurchaseValuePerHead) elements.movPurchaseValuePerHead.value = p.valuePerHead || "";
  }

  if (movement.potreiro && elements.movementPotreiro) {
    elements.movementPotreiro.value = movement.potreiro;
  }
  if (movement.potreiroDest && elements.movementPotreiroDest) {
    elements.movementPotreiroDest.value = movement.potreiroDest;
  }

  resetMovementPhotoDrafts();
  updateMovementFormForType(movement.type);
  elements.movementDialogTitle.textContent = `Editar ${capitalize(movement.type)}`;
  elements.movementDialog.showModal();
}

function getFilteredSaleMovements(farm, year, month) {
  return farm.movements
    .filter((movement) => {
      if (movement.type !== "venda") {
        return false;
      }

      const movementDate = new Date(movement.date);
      const movementYear = String(movementDate.getFullYear());
      const movementMonth = String(movementDate.getMonth() + 1).padStart(2, "0");
      const matchesYear = movementYear === String(year);
      const matchesMonth = month === "all" || movementMonth === month;
      return matchesYear && matchesMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getSanitarySummary(farm, year = state.filters.year, month = state.filters.month) {
  const records = getFilteredSanitaryRecords(farm, year, month);
  return {
    totalApplications: records.length,
    treatedAnimals: records.reduce((sum, record) => sum + Number(record.quantity || 0), 0),
    uniqueProducts: new Set(records.map((record) => record.product)).size,
    uniquePotreiros: new Set(records.map((record) => record.potreiro)).size,
    latestRecord: [...records].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  };
}

function summarizeSalePeriod(farm, year, month) {
  const movements = getFilteredSaleMovements(farm, year, month);
  return movements.reduce((summary, movement) => {
    const detail = movement.saleDetails || {};
    summary.count += 1;
    summary.totalValue += Number(movement.value || 0);
    if ((detail.mode || "vivo") === "carcaca") {
      summary.carcassKg += Number(detail.weightKg || 0);
    } else {
      summary.liveKg += Number(detail.weightKg || 0);
    }
    summary.movements.push(movement);
    return summary;
  }, { count: 0, totalValue: 0, liveKg: 0, carcassKg: 0, movements: [] });
}

function getFilteredPurchaseMovements(farm, year, month) {
  return farm.movements
    .filter((movement) => {
      if (movement.type !== "compra") return false;
      const movementDate = new Date(movement.date);
      const movementYear = String(movementDate.getFullYear());
      const movementMonth = String(movementDate.getMonth() + 1).padStart(2, "0");
      const matchesYear = movementYear === String(year);
      const matchesMonth = month === "all" || movementMonth === month;
      return matchesYear && matchesMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function summarizePurchasePeriod(farm, year, month) {
  const movements = getFilteredPurchaseMovements(farm, year, month);
  return movements.reduce((summary, movement) => {
    summary.count += 1;
    summary.totalAnimals += Number(movement.quantity || 0);
    summary.totalValue += Number(movement.value || 0);
    summary.movements.push(movement);
    return summary;
  }, { count: 0, totalAnimals: 0, totalValue: 0, movements: [] });
}

function getSaleModeLabel(mode) {
  return mode === "carcaca" ? "Kg carcaça" : "Kg vivo";
}

function getOperationalInsights(farm, year = state.filters.year, month = state.filters.month) {
  const total = getFarmTotal(farm);
  const biggestCategory = [...farm.categories].sort((a, b) => b.quantity - a.quantity)[0];
  const annual = summarizePeriod(farm, year, "all");
  const monthly = summarizePeriod(farm, year, month);
  const mortalityRate = total > 0 ? ((annual.byType.morte / total) * 100).toFixed(2) : "0.00";

  return [
    {
      tag: "Maior lote",
      title: biggestCategory ? biggestCategory.name : "Sem dados",
      text: biggestCategory ? `${formatInteger(biggestCategory.quantity)} animais, representando ${(biggestCategory.quantity / Math.max(total, 1) * 100).toFixed(1)}% do rebanho atual.` : "Cadastre categorias para visualizar concentracao do rebanho."
    },
    {
      tag: "Saude do manejo",
      title: `${mortalityRate}% de mortalidade`,
      text: `Taxa calculada a partir das mortes registradas em ${year}.`
    },
    {
      tag: "Recorte ativo",
      title: monthly.totalMovements ? `${monthly.totalMovements} lançamentos no período` : "Sem lançamentos no período",
      text: month === "all" ? `Visão consolidada do ano de ${year}.` : `Leitura mensal de ${MONTH_NAMES[Number(month) - 1]} de ${year}.`
    }
  ];
}

function getMovementNotes(movement) {
  const notes = movement.notes || "";
  if (movement.type !== "venda" || !movement.saleDetails) {
    return notes || "-";
  }

  const detail = movement.saleDetails;
  const saleText = `${getSaleModeLabel(detail.mode)}: ${formatWeight(detail.weightKg)} x ${formatCurrency(detail.pricePerKg)}`;
  return notes ? `${saleText}. ${notes}` : saleText;
}

function renderSanitarySummary(farm) {
  const { totalApplications, treatedAnimals, uniqueProducts, uniquePotreiros, latestRecord } = getSanitarySummary(farm);
  const records = getFilteredSanitaryRecords(farm);

  // Most used product
  const productCount = {};
  records.forEach((r) => { productCount[r.product] = (productCount[r.product] || 0) + 1; });
  const topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0];

  // Most treated category
  const catCount = {};
  records.forEach((r) => { catCount[r.categoryName] = (catCount[r.categoryName] || 0) + (r.quantity || 0); });
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { title: "Aplicações no período", value: formatInteger(totalApplications), detail: "registros sanitários no filtro ativo" },
    { title: "Animais tratados", value: formatInteger(treatedAnimals), detail: "cabeças somadas nos registros" },
    { title: "Produtos distintos", value: formatInteger(uniqueProducts), detail: "variedade de produtos aplicados" },
    { title: "Potreiros atendidos", value: formatInteger(uniquePotreiros), detail: "campos com manejo registrado" },
    { title: "Produto mais usado", value: topProduct ? escapeHtml(topProduct[0]) : "—", detail: topProduct ? `${topProduct[1]} aplicação(ões)` : "sem registros no período" },
    { title: "Categoria mais tratada", value: topCat ? escapeHtml(topCat[0]) : "—", detail: topCat ? `${formatInteger(topCat[1])} cabeças no período` : "sem registros no período" },
    { title: "Último manejo", value: latestRecord ? formatDate(latestRecord.date) : "—", detail: latestRecord ? `${latestRecord.product} · ${latestRecord.potreiro || "sem potreiro"}` : "nenhum registro disponível" }
  ];

  elements.sanitarySummary.innerHTML = cards.map((card) => `
    <article class="analytics-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");
}

const SANITARY_PAGE_SIZE = 50;

function renderSanitaryTable(farm) {
  const isTotalView = farm.id === TOTAL_FARM_ID;

  // Build full sorted list with farmId attached
  let allRecords;
  if (isTotalView) {
    allRecords = getAllFarms().flatMap((f) =>
      getFilteredSanitaryRecords(f).map((r) => ({ ...r, _farmId: f.id, _farmName: f.name }))
    );
  } else {
    allRecords = getFilteredSanitaryRecords(farm).map((r) => ({ ...r, _farmId: farm.id, _farmName: farm.name }));
  }
  allRecords = allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Search filter
  const query = runtime.sanitarySearch.trim().toLowerCase();
  const filtered = query
    ? allRecords.filter((r) =>
        (r.code || "").toLowerCase().includes(query) ||
        (r.product || "").toLowerCase().includes(query) ||
        (r.categoryName || "").toLowerCase().includes(query) ||
        (r.potreiro || "").toLowerCase().includes(query) ||
        (r.notes || "").toLowerCase().includes(query) ||
        (r._farmName || "").toLowerCase().includes(query)
      )
    : allRecords;

  const totalPages = Math.max(1, Math.ceil(filtered.length / SANITARY_PAGE_SIZE));
  if (runtime.sanitaryPage >= totalPages) runtime.sanitaryPage = totalPages - 1;
  const page = runtime.sanitaryPage;
  const records = filtered.slice(page * SANITARY_PAGE_SIZE, (page + 1) * SANITARY_PAGE_SIZE);

  // Wire search input
  const searchInput = document.getElementById("sanitaryHistorySearch");
  if (searchInput) {
    searchInput.value = runtime.sanitarySearch;
    searchInput.oninput = (e) => {
      runtime.sanitarySearch = e.target.value;
      runtime.sanitaryPage = 0;
      renderSanitaryTable(farm);
    };
  }

  // Render pagination
  const paginationEl = document.getElementById("sanitaryHistoryPagination");
  if (paginationEl) {
    paginationEl.innerHTML = `
      <span class="movements-count">${filtered.length} registro${filtered.length !== 1 ? "s" : ""}</span>
      ${totalPages > 1 ? `
        <button class="mov-page-btn" ${page === 0 ? "disabled" : ""} id="sanPrev">&#8249; Anterior</button>
        <span class="mov-page-info">Pág. ${page + 1}/${totalPages}</span>
        <button class="mov-page-btn" ${page >= totalPages - 1 ? "disabled" : ""} id="sanNext">Próxima &#8250;</button>
      ` : ""}
    `;
    document.getElementById("sanPrev")?.addEventListener("click", () => { runtime.sanitaryPage--; renderSanitaryTable(farm); });
    document.getElementById("sanNext")?.addEventListener("click", () => { runtime.sanitaryPage++; renderSanitaryTable(farm); });
  }

  if (!records.length) {
    elements.sanitaryTableBody.innerHTML = `<tr><td colspan="9" class="table-empty-cell">${query ? "Nenhum registro encontrado." : "Nenhum registro sanitário no período."}</td></tr>`;
    return;
  }

  elements.sanitaryTableBody.innerHTML = records.map((record) => {
    const code = record.code
      ? `<span class="movement-code san-code">${escapeHtml(record.code)}</span>`
      : record.sourceId?.startsWith("xls-san-")
        ? `<span class="movement-code movement-code-legacy">${escapeHtml("IMP-" + getFarmCodePrefix(record._farmId))}</span>`
        : `<span class="movement-code movement-code-legacy">—</span>`;
    const editId = record.id || record.sourceId;
    return `
      <tr>
        <td>${code}</td>
        <td data-label="Data">${formatDate(record.date)}</td>
        <td data-label="Fazenda"><span class="sanitary-origin manual">${escapeHtml(record._farmName)}</span></td>
        <td data-label="Categoria"><strong>${escapeHtml(record.categoryName)}</strong></td>
        <td data-label="Qtd.">${formatMaybeQuantity(record.quantity)} cab.</td>
        <td data-label="Produto">
          <div class="sanitary-product-cell">
            <span class="san-product-badge">${escapeHtml(record.product)}</span>
          </div>
        </td>
        <td data-label="Potreiro">${escapeHtml(record.potreiro || "—")}</td>
        <td data-label="Obs.">${escapeHtml(record.notes || "—")}</td>
        <td data-label="Ações">
          <button type="button" class="table-action-btn" data-edit-sanitary-id="${escapeHtml(editId)}">Editar</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderSanitaryFarmSwitch() {
  if (!elements.sanitaryFarmSwitch) {
    return;
  }

  elements.sanitaryFarmSwitch.innerHTML = "";
  [
    { id: TOTAL_FARM_ID, name: "Total" },
    ...getAllFarms().map((item) => ({ id: item.id, name: item.name }))
  ].forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `farm-btn ${item.id === state.data.selectedFarmId ? "active" : ""}`;
    button.textContent = item.name;
    button.addEventListener("click", () => {
      state.data.selectedFarmId = item.id;
      state.activeView = "sanitary";
      saveData();
      render();
    });
    elements.sanitaryFarmSwitch.appendChild(button);
  });
}

function renderSanitaryComposerState(farm) {
  if (!elements.sanitaryViewNote || !elements.sanitaryFormPanel) {
    return;
  }

  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    elements.sanitaryFormPanel.hidden = true;
    elements.sanitaryViewNote.textContent = "No consolidado total, os registros sanitários aparecem agrupados. Selecione uma fazenda para lançar ou editar um manejo.";
    return;
  }

  elements.sanitaryFormPanel.hidden = false;
  elements.sanitaryViewNote.textContent = `Manejo sanitário ativo para ${farm.name}. Os dados abaixo consideram apenas a fazenda selecionada.`;
}

function renderMonthlySummary(farm) {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  if (elements.monthlySummarySection) {
    elements.monthlySummarySection.hidden = isTotalView;
  }
  if (isTotalView) return;
  const summary = getMonthlySummary(farm);
  const cards = [
    {
      title: "Registros mensais",
      value: formatInteger(summary.count),
      detail: "entradas alinhadas ao relatório mensal filtrado"
    },
    {
      title: "Quantidade informada",
      value: formatInteger(summary.totalQuantity),
      detail: "somatório dos números mensais cadastrados"
    },
    {
      title: "Valor atribuído",
      value: formatCurrency(summary.totalValue),
      detail: "valores monetários associados ao período"
    },
    {
      title: "Categorias ativas",
      value: formatInteger(summary.activeCategories),
      detail: "blocos do relatório mensal em uso"
    }
  ];

  elements.monthlySummaryGrid.innerHTML = cards.map((card) => `
    <article class="analytics-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  if (!hasMeaningfulMonthlyData(summary)) {
    elements.monthlySummaryGrid.insertAdjacentHTML("beforeend", `
      <article class="analytics-card analytics-card-empty">
        <p class="panel-kicker">Sem dados no recorte</p>
        <strong>0</strong>
        <p>Nenhum dado mensal encontrado para o filtro atual. Ajuste ano, mes ou cadastre novos dados mensais.</p>
      </article>
    `);
  }
}

function renderMonthlyProtocol(farm) {
  if (!elements.monthlyProtocolList) return;
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  if (elements.monthlyProtocolSection) {
    elements.monthlyProtocolSection.hidden = isTotalView;
  }
  if (isTotalView) return;

  const records = [...getFilteredMonthlyRecords(farm)].sort((a, b) => {
    if (a.period !== b.period) return a.period < b.period ? 1 : -1;
    return a.title.localeCompare(b.title);
  });

  if (elements.monthlyProtocolCount) {
    elements.monthlyProtocolCount.textContent = `${records.length} registro${records.length !== 1 ? "s" : ""}`;
  }

  if (!records.length) {
    elements.monthlyProtocolList.innerHTML = `
      <div class="protocol-empty">
        <p>Nenhum protocolo encontrado para o recorte selecionado.</p>
      </div>
    `;
    return;
  }

  const CATEGORY_ICONS = {
    estoque: "🐄",
    sanitario: "💉",
    comercial: "💰",
    operacional: "⚙️",
    outros: "📋"
  };

  elements.monthlyProtocolList.innerHTML = records.map((record) => {
    const icon = CATEGORY_ICONS[record.category] || "📋";
    const farmLabel = record.farmName || farm.name;
    return `
      <div class="protocol-row">
        <div class="protocol-icon">${icon}</div>
        <div class="protocol-body">
          <div class="protocol-meta">
            <span class="protocol-farm">${escapeHtml(farmLabel)}</span>
            <span class="protocol-period">${formatMonthYear(record.period)}</span>
            <span class="protocol-category">${escapeHtml(getMonthlyCategoryLabel(record.category))}</span>
          </div>
          <strong class="protocol-title">${escapeHtml(record.title)}</strong>
          ${record.notes ? `<p class="protocol-notes">${escapeHtml(record.notes)}</p>` : ""}
        </div>
        <div class="protocol-values">
          ${record.quantity ? `<span class="protocol-qty">${formatInteger(record.quantity)} cab.</span>` : ""}
          ${record.value ? `<span class="protocol-val">${formatCurrency(record.value)}</span>` : ""}
        </div>
        <button type="button" class="table-action-btn protocol-edit-btn" data-edit-monthly-id="${record.id}">Editar</button>
      </div>
    `;
  }).join("");
}

function handleMonthlyTableInteraction(event) {
  const trigger = event.target.closest("[data-edit-monthly-id]");
  if (!trigger) {
    return;
  }

  openMonthlyDataEditor(trigger.dataset.editMonthlyId);
}


function renderPotreirosView() {
  const farms = getAllFarms();
  elements.potreirosAccordion.innerHTML = farms.map((farm) => {
    const potreiros = getPotreroTotals(farm);
    const totalAnimals = getFarmTotal(farm);
    const allocated = potreiros.reduce((sum, p) => sum + p.quantity, 0);
    const balance = totalAnimals - allocated;

    const potreirosHtml = potreiros.length
      ? potreiros.map((p) => `
          <article class="potrero-card">
            <div class="potrero-card-bar" style="width:${Math.min(p.share, 100).toFixed(1)}%"></div>
            <p class="panel-kicker">${escapeHtml(p.name)}</p>
            <strong>${formatInteger(p.quantity)}</strong>
            <p>${p.share.toFixed(1)}% do rebanho</p>
            <button type="button" class="potr-manej-btn"
              data-potr-manej-farm="${escapeHtml(farm.id)}"
              data-potr-manej-id="${escapeHtml(p.id)}">
              Transferir animais
            </button>
          </article>
        `).join("")
      : `<p class="field-note" style="padding:12px 0">Nenhum potreiro cadastrado. Use "Editar estoque" para cadastrar.</p>`;

    const balanceHtml = potreiros.length ? `
      <article class="potrero-card potrero-card-highlight">
        <p class="panel-kicker">${balance === 0 ? "Conferência" : balance > 0 ? "Sem potreiro" : "Excedente"}</p>
        <strong>${balance === 0 ? "✓ OK" : (balance > 0 ? "+" : "") + formatInteger(balance)}</strong>
        <p>${balance === 0 ? "Distribuição conferida." : balance > 0 ? `${formatInteger(balance)} ainda não alocados.` : `${formatInteger(Math.abs(balance))} acima do estoque.`}</p>
      </article>
    ` : "";

    return `
      <div class="potreiros-farm-item">
        <button type="button" class="potreiros-farm-header" data-toggle-farm="${escapeHtml(farm.id)}">
          <div class="potreiros-farm-header-copy">
            <strong>${escapeHtml(farm.name)}</strong>
            <span>${formatInteger(totalAnimals)} animais &middot; ${potreiros.length} potreiro(s) &middot; ${formatInteger(allocated)} alocados</span>
          </div>
          <span class="potreiros-farm-chevron">&#8250;</span>
        </button>
        <div class="potreiros-farm-body" id="potreiros-body-${escapeHtml(farm.id)}" hidden>
          <div class="potrero-grid potrero-grid-compact">${potreirosHtml}${balanceHtml}</div>
        </div>
      </div>
    `;
  }).join("");

}

// ── Potreiro Management Dialog ─────────────────────────────────────────────

function openPotrManejDialog(farmId, potreirosId) {
  const farm = state.data.farms[farmId];
  if (!farm) return;
  const potrero = getPotreroEntries(farm).find((p) => p.id === potreirosId);
  const potreroName = potrero ? potrero.name : "Sem potreiro";
  const potreroQty = potrero ? normalizePotreroQuantity(potrero.quantity) : 0;
  const farmTotal = getFarmTotal(farm);

  // Calc unallocated
  const allocatedTotal = getRegisteredPotreroAnimals(farm);
  const unallocated = farmTotal - allocatedTotal;

  runtime.potrManej = { farmId, potreirosId, type: "transferencia", photoDrafts: [] };

  elements.potrManejFarmKicker.textContent = farm.name;
  elements.potrManejDlgTitle.textContent = `Transferência — ${potreroName}`;
  elements.potrManejFarmTotal.textContent = formatInteger(farmTotal);
  elements.potrManejPotrTotal.textContent = formatInteger(potreroQty);
  elements.potrManejUnallocated.textContent = formatInteger(Math.max(0, unallocated));

  // Reset form
  elements.potrManejDate.value = new Date().toISOString().slice(0, 10);
  elements.potrManejQty.value = "";
  if (elements.potrManejValue) elements.potrManejValue.value = "";
  elements.potrManejNotes.value = "";
  if (elements.potrManejPhotos) elements.potrManejPhotos.value = "";
  if (elements.potrManejPhotoPreview) elements.potrManejPhotoPreview.innerHTML = "";
  if (elements.potrManejPhotoPanel) elements.potrManejPhotoPanel.hidden = true;
  if (elements.potrManejPhotoCounter) elements.potrManejPhotoCounter.textContent = "Nenhuma foto anexada.";

  if (elements.potrActionTabs) {
    elements.potrActionTabs.querySelectorAll(".potr-action-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.manej === "transferencia");
    });
  }

  // Populate categories
  elements.potrManejCategory.innerHTML = farm.categories.map((c) => `
    <option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} (${formatInteger(c.quantity)})</option>
  `).join("");

  // Populate destination farms (all farms except current)
  const allFarms = getAllFarms();
  elements.potrManejDestFarm.innerHTML = [
    `<option value="${escapeHtml(farmId)}">Mesma fazenda (${escapeHtml(farm.name)})</option>`,
    ...allFarms.filter((f) => f.id !== farmId).map((f) => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`)
  ].join("");
  syncPotrManejDestFarmPotreiros();

  syncPotrManejForm();
  elements.potrManejoDlg.showModal();
}

function syncPotrManejDestFarmPotreiros() {
  const destFarmId = elements.potrManejDestFarm.value;
  const destFarm = state.data.farms[destFarmId];
  const originFarmId = runtime.potrManej.farmId;
  const originPotreroId = runtime.potrManej.potreirosId || UNALLOCATED_POTREIRO_KEY;
  const isSameFarm = !destFarmId || destFarmId === originFarmId;

  if (!destFarm) {
    elements.potrManejDestPotr.innerHTML = `<option value="${UNALLOCATED_POTREIRO_KEY}">Sem potreiro</option>`;
    return;
  }

  const opts = getPotreroEntries(destFarm)
    .filter((p) => !isSameFarm || p.id !== originPotreroId)
    .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} (${formatInteger(p.quantity)})</option>`);

  if (isSameFarm) {
    opts.unshift(`<option value="${UNALLOCATED_POTREIRO_KEY}">Sem potreiro</option>`);
  }

  elements.potrManejDestPotr.innerHTML = opts.join("") || `<option value="${UNALLOCATED_POTREIRO_KEY}">Sem potreiro</option>`;
}

function syncPotrManejForm() {
  {
    runtime.potrManej.type = "transferencia";
    const farmId = runtime.potrManej.farmId;
    const destFarmId = elements.potrManejDestFarm.value;
    const isSameFarm = !destFarmId || destFarmId === farmId;

    elements.potrManejDestFarmWrap.hidden = false;
    elements.potrManejDestPotrWrap.hidden = false;
    if (elements.potrManejDestFarmPotrWrap) elements.potrManejDestFarmPotrWrap.hidden = true;
    if (elements.potrManejValueWrap) elements.potrManejValueWrap.hidden = true;
    if (elements.potrManejPhotoWrap) elements.potrManejPhotoWrap.hidden = true;
    if (elements.potrManejPhotoPanel) elements.potrManejPhotoPanel.hidden = true;

    elements.potrManejDestPotrLabel.textContent = isSameFarm ? "Potreiro de destino" : "Potreiro de destino na fazenda selecionada";
    elements.potrManejSubmit.textContent = "Registrar transferência";
    elements.potrManejSubmit.className = "action-btn secondary";
    return;
  }
  const type = runtime.potrManej.type;
  const isAdd = type === "adicionar";
  const isTransfer = type === "transferencia";
  const isSale = type === "venda";
  const isDeath = type === "morte";
  const isConsume = type === "consumo";
  const isRetorno = type === "retorno";
  const farmId = runtime.potrManej.farmId;
  const potreirosId = runtime.potrManej.potreirosId;

  // Destination potreiro: shown for adicionar and intra-farm transfer (not retorno — dest is always unallocated)
  elements.potrManejDestPotrWrap.hidden = !isAdd && !isTransfer;
  if (isAdd) {
    elements.potrManejDestPotrLabel.textContent = "Potreiro de destino";
    // Pre-select current potrero
    elements.potrManejDestPotr.value = potreirosId || "";
  } else if (isTransfer) {
    elements.potrManejDestPotrLabel.textContent = "Potreiro de destino (mesma fazenda)";
    // Select a different potreiro than origin
    const opts = Array.from(elements.potrManejDestPotr.options);
    const other = opts.find((o) => o.value !== potreirosId);
    if (other) elements.potrManejDestPotr.value = other.value;
  }

  // Destination farm: only for transfer
  elements.potrManejDestFarmWrap.hidden = !isTransfer;
  // Dest farm potreiro: only for inter-farm transfer
  const destFarmId = elements.potrManejDestFarm.value;
  elements.potrManejDestFarmPotrWrap.hidden = !isTransfer || destFarmId === farmId;

  // Value: only for venda
  elements.potrManejValueWrap.hidden = !isSale;

  // Photo: only for morte
  elements.potrManejPhotoWrap.hidden = !isDeath;

  // Submit button label + color
  const labels = { adicionar: "Adicionar ao Rebanho", transferencia: "Registrar Transferência", venda: "Registrar Venda", morte: "Registrar Morte", consumo: "Registrar Abate", retorno: "Retornar ao Total" };
  const classes = { adicionar: "purchase", transferencia: "secondary", venda: "sale", morte: "death", consumo: "neutral", retorno: "secondary" };
  elements.potrManejSubmit.textContent = labels[type] || "Registrar";
  elements.potrManejSubmit.className = `action-btn ${classes[type] || "purchase"}`;
}

function handlePotrManejPhotosChange() {
  const files = Array.from(elements.potrManejPhotos.files || []);
  const promises = files.slice(0, 6).map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ name: file.name, dataUrl: e.target.result, size: file.size });
    reader.readAsDataURL(file);
  }));
  Promise.all(promises).then((photos) => {
    runtime.potrManej.photoDrafts = photos;
    const count = photos.length;
    elements.potrManejPhotoCounter.textContent = count ? `${formatInteger(count)} foto${count !== 1 ? "s" : ""} anexada${count !== 1 ? "s" : ""}.` : "Nenhuma foto anexada.";
    elements.potrManejPhotoPanel.hidden = !count;
    elements.potrManejPhotoPreview.innerHTML = photos.map((p) => `
      <div class="movement-photo-thumb"><img src="${p.dataUrl}" alt="${escapeHtml(p.name)}"></div>
    `).join("");
  });
}

function handlePotrManejSubmit(event) {
  event.preventDefault();
  {
    const sourceFarmId = runtime.potrManej.farmId;
    const sourcePotreroId = runtime.potrManej.potreirosId || UNALLOCATED_POTREIRO_KEY;
    const sourceFarm = state.data.farms[sourceFarmId];
    if (!sourceFarm) return;

    const date = elements.potrManejDate.value;
    const qty = Number(elements.potrManejQty.value);
    const categoryId = elements.potrManejCategory.value;
    const notes = elements.potrManejNotes.value.trim();
    const category = sourceFarm.categories.find((c) => c.id === categoryId);
    if (!date || !qty || qty < 1 || !category) return;

    ensureCategoryAllocation(category);
    const destFarmId = elements.potrManejDestFarm.value || sourceFarmId;
    const destPotreroId = elements.potrManejDestPotr.value || UNALLOCATED_POTREIRO_KEY;
    const isSameFarm = destFarmId === sourceFarmId;
    const originQty = Number(category.allocation[sourcePotreroId] || 0);

    if (originQty < qty) {
      alert(`Apenas ${formatInteger(originQty)} animais alocados neste potreiro para essa categoria.`);
      return;
    }

    if (isSameFarm && sourcePotreroId === destPotreroId) {
      alert("Selecione um potreiro de destino diferente para a transferência.");
      return;
    }

    if (isSameFarm) {
      category.allocation[sourcePotreroId] = Math.max(0, originQty - qty);
      category.allocation[destPotreroId] = (Number(category.allocation[destPotreroId] || 0)) + qty;
      updatePotreroQuantitiesFromAllocation(sourceFarm);
      sourceFarm.movements.push({ id: createMovementId(), code: generateMovementCode(sourceFarm), type: "transferencia", date, categoryId, categoryName: category.name, quantity: qty, delta: 0, value: 0, saleDetails: null, notes, potreiro: sourcePotreroId, potreiroDest: destPotreroId, sourceId: "", photos: [] });
    } else {
      const destFarm = state.data.farms[destFarmId];
      if (!destFarm) return;
      const transferNote = notes || `Transferência de ${sourceFarm.name} para ${destFarm.name}`;

      category.quantity -= qty;
      category.allocation[sourcePotreroId] = Math.max(0, originQty - qty);
      updatePotreroQuantitiesFromAllocation(sourceFarm);
      sourceFarm.movements.push({ id: createMovementId(), code: generateMovementCode(sourceFarm), type: "consumo", date, categoryId, categoryName: category.name, quantity: qty, delta: -qty, value: 0, saleDetails: null, notes: `${transferNote} -> ${destFarm.name}`, potreiro: sourcePotreroId, sourceId: "", photos: [] });

      let destCategory = destFarm.categories.find((c) => c.id === categoryId);
      if (!destCategory) {
        destCategory = { id: categoryId, name: category.name, quantity: 0 };
        destFarm.categories.push(destCategory);
      }
      ensureCategoryAllocation(destCategory);
      destCategory.quantity += qty;
      destCategory.allocation[destPotreroId] = (Number(destCategory.allocation[destPotreroId] || 0)) + qty;
      updatePotreroQuantitiesFromAllocation(destFarm);
      destFarm.movements.push({ id: createMovementId(), code: generateMovementCode(destFarm), type: "compra", date, categoryId, categoryName: category.name, quantity: qty, delta: qty, value: 0, saleDetails: null, notes: `${transferNote} <- ${sourceFarm.name}`, potreiro: destPotreroId, sourceId: "", photos: [] });
    }

    saveData();
    populateYearFilter();
    elements.potrManejoDlg.close();
    renderPotreirosView();
    render();
    return;
  }
  const { farmId, potreirosId, type } = runtime.potrManej;
  const farm = state.data.farms[farmId];
  if (!farm) return;

  const date = elements.potrManejDate.value;
  const qty = Number(elements.potrManejQty.value);
  const categoryId = elements.potrManejCategory.value;
  const notes = elements.potrManejNotes.value.trim();
  const category = farm.categories.find((c) => c.id === categoryId);

  if (!date || !qty || qty < 1 || !category) return;

  const originId = potreirosId || UNALLOCATED_POTREIRO_KEY;
  ensureCategoryAllocation(category);

  if (type === "adicionar") {
    // Add to farm stock at destination potreiro
    const destId = elements.potrManejDestPotr.value || UNALLOCATED_POTREIRO_KEY;
    category.quantity += qty;
    category.allocation[destId] = (Number(category.allocation[destId] || 0)) + qty;
    updatePotreroQuantitiesFromAllocation(farm);
    farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type: "compra", date, categoryId, categoryName: category.name, quantity: qty, delta: qty, value: 0, saleDetails: null, notes: notes || `Adicionado ao potreiro ${getPotreroEntries(farm).find((p) => p.id === destId)?.name || "sem potreiro"}`, potreiro: destId, sourceId: "", photos: [] });

  } else if (type === "transferencia") {
    const destFarmId = elements.potrManejDestFarm.value;
    const isSameFarm = !destFarmId || destFarmId === farmId;

    if (isSameFarm) {
      // Intra-farm transfer — no stock change, just reallocation
      const destId = elements.potrManejDestPotr.value || UNALLOCATED_POTREIRO_KEY;
      if (originId === destId) { alert("Selecione potreiros diferentes para a transferência."); return; }
      const originQty = Number(category.allocation[originId] || 0);
      if (originQty < qty) {
        alert(`Apenas ${formatInteger(originQty)} animais alocados em "${getPotreroEntries(farm).find((p) => p.id === originId)?.name || "sem potreiro"}" para essa categoria.`);
        return;
      }
      category.allocation[originId] -= qty;
      category.allocation[destId] = (Number(category.allocation[destId] || 0)) + qty;
      updatePotreroQuantitiesFromAllocation(farm);
      farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type: "transferencia", date, categoryId, categoryName: category.name, quantity: qty, delta: 0, value: 0, saleDetails: null, notes, potreiro: originId, potreiroDest: destId, sourceId: "", photos: [] });

    } else {
      // Inter-farm transfer — remove from source, add to dest
      const originQty = Number(category.allocation[originId] || 0);
      if (originQty < qty) {
        alert(`Apenas ${formatInteger(originQty)} animais alocados neste potreiro para essa categoria.`);
        return;
      }
      const destFarm = state.data.farms[destFarmId];
      if (!destFarm) return;
      const destPotrId = elements.potrManejDestFarmPotr.value || UNALLOCATED_POTREIRO_KEY;
      const transferNote = notes || `Transferência de ${farm.name} para ${destFarm.name}`;

      // Remove from source
      category.quantity -= qty;
      category.allocation[originId] = Math.max(0, category.allocation[originId] - qty);
      updatePotreroQuantitiesFromAllocation(farm);
      farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type: "consumo", date, categoryId, categoryName: category.name, quantity: qty, delta: -qty, value: 0, saleDetails: null, notes: `${transferNote} → ${destFarm.name}`, potreiro: originId, sourceId: "", photos: [] });

      // Add to destination farm
      let destCategory = destFarm.categories.find((c) => c.id === categoryId);
      if (!destCategory) {
        destCategory = { id: categoryId, name: category.name, quantity: 0 };
        destFarm.categories.push(destCategory);
      }
      ensureCategoryAllocation(destCategory);
      destCategory.quantity += qty;
      destCategory.allocation[destPotrId] = (Number(destCategory.allocation[destPotrId] || 0)) + qty;
      updatePotreroQuantitiesFromAllocation(destFarm);
      destFarm.movements.push({ id: createMovementId(), code: generateMovementCode(destFarm), type: "compra", date, categoryId, categoryName: category.name, quantity: qty, delta: qty, value: 0, saleDetails: null, notes: `${transferNote} ← ${farm.name}`, potreiro: destPotrId, sourceId: "", photos: [] });
    }

  } else if (type === "venda") {
    const value = Number(elements.potrManejValue.value || 0);
    const originQty = Number(category.allocation[originId] || 0);
    if (originQty < qty) {
      alert(`Apenas ${formatInteger(originQty)} animais alocados neste potreiro para essa categoria.`);
      return;
    }
    category.quantity -= qty;
    category.allocation[originId] = Math.max(0, category.allocation[originId] - qty);
    updatePotreroQuantitiesFromAllocation(farm);
    farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type: "venda", date, categoryId, categoryName: category.name, quantity: qty, delta: -qty, value, saleDetails: null, notes, potreiro: originId, sourceId: "", photos: [] });

  } else if (type === "morte" || type === "consumo") {
    const originQty = Number(category.allocation[originId] || 0);
    if (originQty < qty) {
      alert(`Apenas ${formatInteger(originQty)} animais alocados neste potreiro para essa categoria.`);
      return;
    }
    category.quantity -= qty;
    category.allocation[originId] = Math.max(0, category.allocation[originId] - qty);
    updatePotreroQuantitiesFromAllocation(farm);
    const photos = type === "morte" ? runtime.potrManej.photoDrafts.map((p) => ({ ...p })) : [];
    farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type, date, categoryId, categoryName: category.name, quantity: qty, delta: -qty, value: 0, saleDetails: null, notes, potreiro: originId, sourceId: "", photos });

  } else if (type === "retorno") {
    // Move animals from current potreiro back to unallocated pool — no stock change
    if (originId === UNALLOCATED_POTREIRO_KEY) {
      alert("Este potreiro já é o pool geral. Selecione um potreiro específico.");
      return;
    }
    const originQty = Number(category.allocation[originId] || 0);
    if (originQty < qty) {
      alert(`Apenas ${formatInteger(originQty)} animais alocados neste potreiro para essa categoria.`);
      return;
    }
    category.allocation[originId] = originQty - qty;
    category.allocation[UNALLOCATED_POTREIRO_KEY] = (Number(category.allocation[UNALLOCATED_POTREIRO_KEY] || 0)) + qty;
    updatePotreroQuantitiesFromAllocation(farm);
    const potreroName = getPotreroEntries(farm).find((p) => p.id === originId)?.name || originId;
    farm.movements.push({ id: createMovementId(), code: generateMovementCode(farm), type: "transferencia", date, categoryId, categoryName: category.name, quantity: qty, delta: 0, value: 0, saleDetails: null, notes: notes || `Retorno ao total — saída de "${potreroName}"`, potreiro: originId, potreiroDest: UNALLOCATED_POTREIRO_KEY, sourceId: "", photos: [] });
  }

  saveData();
  populateYearFilter();
  elements.potrManejoDlg.close();
  renderPotreirosView();
  render();
}

async function openGeorefDialog() {
  const farm = getFarm();
  if (farm.id !== "arapey") {
    return;
  }

  ensureGeorefDraft(farm, true);
  elements.georefStatus.innerHTML = createGeorefLoadingSummary();
  elements.georefMap.innerHTML = '<div class="georef-map-empty">Carregando o mapa georreferenciado da Arapey...</div>';
  elements.georefLegend.innerHTML = `
    <section class="georef-legend-section">
      <h3>Preparando leitura dos campos</h3>
      <p>Estou cruzando o arquivo KML com os potreiros cadastrados para mostrar a lotação atual em cada localidade.</p>
    </section>
  `;

  elements.georefDialog.showModal();
  await renderGeorefDialog();
}

async function renderGeorefDialog() {
  const farm = getFarm();
  if (farm.id !== "arapey") {
    return;
  }

  try {
    const draftPotreiros = getGeorefDraftPotreiros(farm);
    const kmlData = await loadArapeyKmlData();
    if (!elements.georefDialog.open || getFarm().id !== "arapey") {
      return;
    }

    const model = buildArapeyGeorefModel(farm, kmlData, {
      potreiros: draftPotreiros,
      selectedId: runtime.georefDraft?.selectedId || ""
    });
    elements.georefStatus.innerHTML = renderGeorefSummaryCards(model);
    elements.georefMap.innerHTML = renderEditableGeorefMap(model);
    elements.georefLegend.innerHTML = renderEditableGeorefLegend(model);
  } catch (error) {
    console.error("Falha ao carregar georreferenciamento da Arapey:", error);
    elements.georefStatus.innerHTML = `
      <article class="georef-summary-card">
        <span>Georreferenciamento</span>
        <strong>Indisponível</strong>
        <p>Não consegui ler o arquivo <code>Arapey.kml</code> neste ambiente.</p>
      </article>
    `;
    elements.georefMap.innerHTML = `
      <div class="georef-map-error">
        Não foi possível carregar o mapa da Arapey agora.<br>
        Verifique se o arquivo <code>Arapey.kml</code> está disponível junto do sistema.
      </div>
    `;
    elements.georefLegend.innerHTML = `
      <section class="georef-legend-section">
        <h3>O que foi tentado</h3>
        <p>O sistema tentou ler o arquivo local da Arapey para desenhar os potreiros no painel, mas a leitura falhou neste contexto.</p>
      </section>
    `;
  }
}

function handleGeorefLegendInteraction(event) {
  const card = event.target.closest("[data-georef-card-id]");
  if (!card || event.target.closest("input") || !runtime.georefDraft) {
    return;
  }

  runtime.georefDraft.selectedId = card.dataset.georefCardId || "";
  void renderGeorefDialog();
}

function handleGeorefLegendChange(event) {
  const card = event.target.closest("[data-georef-card-id]");
  if (!card || !runtime.georefDraft) {
    return;
  }

  const entry = runtime.georefDraft.potreiros.find((item) => item.id === card.dataset.georefCardId);
  if (!entry) {
    return;
  }

  if (event.target.matches("[data-georef-name]")) {
    entry.name = event.target.value.trim();
  }

  if (event.target.matches("[data-georef-quantity]")) {
    entry.quantity = normalizePotreroQuantity(event.target.value);
  }

  runtime.georefDraft.selectedId = entry.id;
  void renderGeorefDialog();
}

function getGeorefEntriesFromLegend() {
  const cards = [...elements.georefLegend.querySelectorAll("[data-georef-card-id]")];
  if (!cards.length) {
    return clonePotreroEntries(runtime.georefDraft?.potreiros || []);
  }

  return cards.map((card) => ({
    id: card.dataset.georefCardId || createPotreroId("potreiro"),
    name: card.querySelector("[data-georef-name]")?.value.trim() || "",
    quantity: card.querySelector("[data-georef-quantity]")?.value
  }));
}

function handleGeorefSave() {
  const farm = getFarm();
  if (farm.id !== "arapey") {
    return;
  }

  const entries = getGeorefEntriesFromLegend();
  const nextPotreiros = [];
  const seenPotreiros = new Set();

  for (const entry of entries) {
    const name = String(entry.name || "").trim();
    const quantity = Number(entry.quantity);

    if (!name) {
      alert("Informe o nome de todos os potreiros no georreferenciamento.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      alert(`Informe uma quantidade valida para o potreiro ${name}.`);
      return;
    }

    const normalizedName = normalizeText(name);
    if (seenPotreiros.has(normalizedName)) {
      alert(`O potreiro ${name} foi informado mais de uma vez no georreferenciamento.`);
      return;
    }

    seenPotreiros.add(normalizedName);
    nextPotreiros.push({
      id: entry.id || createPotreroId(name),
      name,
      quantity: normalizePotreroQuantity(quantity)
    });
  }

  farm.potreiros = clonePotreroEntries(nextPotreiros);
  runtime.georefDraft = {
    farmId: farm.id,
    potreiros: clonePotreroEntries(nextPotreiros),
    selectedId: nextPotreiros.some((entry) => entry.id === runtime.georefDraft?.selectedId)
      ? runtime.georefDraft?.selectedId || ""
      : nextPotreiros[0]?.id || ""
  };
  saveData();
  render();
}

function createGeorefLoadingSummary() {
  return `
    <article class="georef-summary-card">
      <span>KML</span>
      <strong>...</strong>
      <p>Lendo as geometrias dos campos.</p>
    </article>
    <article class="georef-summary-card">
      <span>Vínculos</span>
      <strong>...</strong>
      <p>Conferindo potreiros cadastrados.</p>
    </article>
    <article class="georef-summary-card">
      <span>Lotação</span>
      <strong>...</strong>
      <p>Somando as cabeças por localidade.</p>
    </article>
    <article class="georef-summary-card">
      <span>Pendências</span>
      <strong>...</strong>
      <p>Separando o que ainda precisa de ajuste manual.</p>
    </article>
  `;
}

async function loadArapeyKmlData() {
  if (runtime.arapeyKmlData) {
    return runtime.arapeyKmlData;
  }

  if (runtime.arapeyKmlPromise) {
    return runtime.arapeyKmlPromise;
  }

  runtime.arapeyKmlPromise = fetch("./Arapey.kml", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.text();
    })
    .then((kmlText) => parseArapeyKml(kmlText))
    .then((parsed) => {
      runtime.arapeyKmlData = parsed;
      return parsed;
    })
    .finally(() => {
      runtime.arapeyKmlPromise = null;
    });

  return runtime.arapeyKmlPromise;
}

function parseArapeyKml(kmlText) {
  const xml = new DOMParser().parseFromString(kmlText, "application/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error("KML invalido.");
  }

  const featureMap = new Map();
  const pointMap = new Map();

  [...xml.getElementsByTagNameNS("*", "Placemark")].forEach((placemark) => {
    const rawName = (placemark.getElementsByTagNameNS("*", "name")[0]?.textContent || "").trim();
    if (!rawName) {
      return;
    }

    const areaMatch = rawName.match(/^(.*?)\s*-\s*([\d.,]+)\s*ha$/i);
    const baseName = (areaMatch?.[1] || rawName).trim();
    const key = resolveArapeyGeoKey(baseName);
    if (!key) {
      return;
    }

    const pointNode = placemark.getElementsByTagNameNS("*", "Point")[0];
    if (pointNode) {
      const [point] = extractKmlCoordinates(pointNode);
      if (point) {
        pointMap.set(key, {
          point,
          areaHa: parseKmlNumber(areaMatch?.[2])
        });
      }
    }

    [...placemark.getElementsByTagNameNS("*", "Polygon")].forEach((polygonNode) => {
      const polygon = extractKmlCoordinates(polygonNode);
      if (polygon.length < 3) {
        return;
      }

      if (!featureMap.has(key)) {
        featureMap.set(key, {
          key,
          polygons: [],
          sourceNames: new Set()
        });
      }

      const feature = featureMap.get(key);
      feature.polygons.push(polygon);
      feature.sourceNames.add(rawName);
    });
  });

  const features = [...featureMap.values()].map((feature) => {
    const pointInfo = pointMap.get(feature.key);
    return {
      ...feature,
      sourceNames: [...feature.sourceNames],
      label: formatArapeyGeoLabel(feature.key),
      markerPoint: pointInfo?.point || getFeatureCenter(feature.polygons),
      areaHa: Number.isFinite(pointInfo?.areaHa) ? pointInfo.areaHa : null
    };
  });

  return { features };
}

function buildArapeyGeorefModel(farm, kmlData, options = {}) {
  const potreiros = clonePotreroEntries(options.potreiros || getPotreroEntries(farm));
  const selectedId = options.selectedId || "";
  const potreroGroups = new Map();

  potreiros.forEach((potrero) => {
    const key = resolveArapeyGeoKey(potrero.name);
    const quantity = normalizePotreroQuantity(potrero.quantity);
    const bucketKey = key || `unmatched::${slugify(potrero.name) || potrero.id || "potreiro"}`;
    const group = potreroGroups.get(bucketKey) || {
      key,
      names: [],
      quantity: 0,
      entryIds: []
    };

    group.names.push(potrero.name);
    group.quantity += quantity;
    group.entryIds.push(potrero.id);
    potreroGroups.set(bucketKey, group);
  });

  const groupedPotreiros = [...potreroGroups.values()];
  const groupsByKey = new Map(groupedPotreiros.filter((group) => group.key).map((group) => [group.key, group]));

  const visibleFeatures = kmlData.features
    .filter((feature) => feature.areaHa !== null || ARAPEY_PRIMARY_GEO_KEYS.has(feature.key) || groupsByKey.has(feature.key))
    .map((feature) => {
      const group = groupsByKey.get(feature.key) || null;
      return {
        ...feature,
        quantity: group?.quantity || 0,
        registeredNames: group?.names || [],
        isLinked: Boolean(group)
      };
    })
    .sort((a, b) => b.quantity - a.quantity || a.label.localeCompare(b.label));

  const unmatchedPotreiros = groupedPotreiros
    .filter((group) => !group.key || !visibleFeatures.some((feature) => feature.key === group.key))
    .sort((a, b) => b.quantity - a.quantity || a.names[0].localeCompare(b.names[0]));

  const editorEntries = potreiros
    .map((potrero) => {
      const key = resolveArapeyGeoKey(potrero.name);
      const matchedFeature = key ? visibleFeatures.find((feature) => feature.key === key) || null : null;
      return {
        id: potrero.id,
        name: potrero.name,
        quantity: normalizePotreroQuantity(potrero.quantity),
        key,
        mapLabel: matchedFeature?.label || "",
        areaHa: matchedFeature?.areaHa ?? null,
        isLinked: Boolean(matchedFeature),
        isSelected: potrero.id === selectedId
      };
    })
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name));

  const totalRegistered = potreiros.length;
  const linkedPotreiros = visibleFeatures.reduce((sum, feature) => sum + feature.registeredNames.length, 0);
  const linkedAnimals = visibleFeatures.reduce((sum, feature) => sum + feature.quantity, 0);
  const unmatchedAnimals = unmatchedPotreiros.reduce((sum, item) => sum + item.quantity, 0);
  const selectedKey = editorEntries.find((entry) => entry.id === selectedId)?.key || "";

  return {
    farmName: farm.name,
    totalRegistered,
    visibleFeatures,
    unmatchedPotreiros,
    editorEntries,
    selectedId,
    selectedKey,
    stats: {
      mappedAreas: visibleFeatures.length,
      linkedPotreiros,
      linkedAnimals,
      unmatchedPotreiros: unmatchedPotreiros.length,
      unmatchedAnimals,
      emptyAreas: visibleFeatures.filter((feature) => !feature.isLinked).length
    }
  };
}

function renderGeorefSummaryCards(model) {
  return `
    <article class="georef-summary-card">
      <span>Campos no mapa</span>
      <strong>${formatInteger(model.stats.mappedAreas)}</strong>
      <p>Áreas da Arapey disponíveis para leitura georreferenciada.</p>
    </article>
    <article class="georef-summary-card">
      <span>Potreiros vinculados</span>
      <strong>${formatInteger(model.stats.linkedPotreiros)}/${formatInteger(model.totalRegistered)}</strong>
      <p>Potreiros cadastrados que o sistema conseguiu localizar automaticamente no KML.</p>
    </article>
    <article class="georef-summary-card">
      <span>Animais mapeados</span>
      <strong>${formatInteger(model.stats.linkedAnimals)}</strong>
      <p>Cabeças atualmente posicionadas nas localidades reconhecidas.</p>
    </article>
    <article class="georef-summary-card">
      <span>Pendencias</span>
      <strong>${formatInteger(model.stats.unmatchedPotreiros)}</strong>
      <p>${formatInteger(model.stats.unmatchedAnimals)} animais em potreiros ainda sem correspondência automática no mapa.</p>
    </article>
  `;
}

function renderEditableGeorefLegend(model) {
  const editorCards = model.editorEntries.length
    ? model.editorEntries.map((entry, index) => {
      const areaText = Number.isFinite(entry.areaHa)
        ? `<span class="georef-meta-pill">${formatWeight(entry.areaHa)} ha</span>`
        : "";

      return `
        <article class="georef-legend-item georef-editor-card ${entry.isLinked ? "is-linked" : "is-unmatched"} ${entry.isSelected ? "is-active" : ""}" data-georef-card-id="${escapeHtml(entry.id)}">
          <div class="georef-legend-head">
            <div class="georef-card-title">
              <span class="georef-card-index">Card ${index + 1}</span>
              <strong>${escapeHtml(entry.name)}</strong>
            </div>
            <span class="georef-badge">${formatInteger(entry.quantity)} cab.</span>
          </div>
          <div class="georef-legend-meta">
            <span class="georef-meta-pill">${entry.isLinked ? `Campo: ${escapeHtml(entry.mapLabel)}` : "Sem referencia no mapa"}</span>
            ${areaText}
          </div>
          <label class="georef-field">
            Nome do potreiro
            <input
              type="text"
              maxlength="80"
              value="${escapeHtml(entry.name)}"
              data-georef-name
              placeholder="Ex.: Campo 7"
            >
          </label>
          <label class="georef-field">
            Quantidade de animais
            <input
              type="number"
              min="0"
              step="1"
              value="${entry.quantity}"
              data-georef-quantity
              placeholder="0"
            >
          </label>
          <p class="georef-legend-note">${entry.isLinked ? "Clique no card para destacar este campo no mapa." : "Ajuste o nome para o KML reconhecer o campo correto."}</p>
        </article>
      `;
    }).join("")
    : "<p>Nenhum potreiro da Arapey esta disponivel para edicao neste momento.</p>";

  const emptyFeatures = model.visibleFeatures.filter((feature) => !feature.isLinked);
  const emptySection = emptyFeatures.length
    ? `
      <section class="georef-legend-section">
        <h3>Campos do KML sem cadastro</h3>
        <p>Essas areas existem no mapa, mas ainda nao possuem um potreiro vinculado no painel.</p>
        ${emptyFeatures.map((feature) => `
          <article class="georef-legend-item">
            <div class="georef-legend-head">
              <strong>${escapeHtml(feature.label)}</strong>
              <span class="georef-badge">Livre</span>
            </div>
            <div class="georef-legend-meta">
              ${Number.isFinite(feature.areaHa) ? `<span class="georef-meta-pill">${formatWeight(feature.areaHa)} ha</span>` : ""}
              <span class="georef-meta-pill">Sem cadastro</span>
            </div>
            <p class="georef-legend-note">Renomeie um card lateral com esta referencia e salve para vincular o campo.</p>
          </article>
        `).join("")}
      </section>
    `
    : `
      <section class="georef-legend-section">
        <h3>Mapa conferido</h3>
        <p>Todos os campos principais visiveis no KML ja possuem alguma referencia cadastrada.</p>
      </section>
    `;

  return `
    <section class="georef-legend-section">
      <h3>Cadastros editaveis</h3>
      <p>Clique em um card para destacar a referencia no mapa. Edite nome e quantidade aqui e use o botao Salvar no topo.</p>
      ${editorCards}
    </section>
    ${emptySection}
  `;
}

function renderEditableGeorefMap(model) {
  if (!model.visibleFeatures.length) {
    return '<div class="georef-map-empty">Nenhuma area do KML foi localizada para montar o mapa da Arapey.</div>';
  }

  const bounds = getGeorefBounds(model.visibleFeatures);
  if (!bounds) {
    return '<div class="georef-map-empty">Nao encontrei coordenadas suficientes para desenhar o mapa georreferenciado.</div>';
  }

  const padding = 42;
  const maxWidth = 1000;
  const maxHeight = 760;
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.000001);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.000001);
  const scale = Math.min((maxWidth - (padding * 2)) / lonSpan, (maxHeight - (padding * 2)) / latSpan);
  const width = Math.max(720, Math.round((lonSpan * scale) + (padding * 2)));
  const height = Math.max(420, Math.round((latSpan * scale) + (padding * 2)));
  const maxQuantity = Math.max(...model.visibleFeatures.map((feature) => feature.quantity), 0);

  const projectPoint = (point) => ({
    x: padding + ((point.lon - bounds.minLon) * scale),
    y: padding + ((bounds.maxLat - point.lat) * scale)
  });

  const featuresSvg = model.visibleFeatures.map((feature) => {
    const isActive = Boolean(model.selectedKey) && feature.key === model.selectedKey;
    const fill = getGeorefFeatureFill(feature.quantity, maxQuantity, feature.isLinked);
    const stroke = isActive ? "#bf7e42" : feature.isLinked ? "#335c43" : "#8f6132";
    const tooltip = feature.registeredNames.length
      ? `${feature.label}: ${formatInteger(feature.quantity)} cab. | ${feature.registeredNames.join(", ")}`
      : `${feature.label}: sem lotacao cadastrada`;
    const polygons = feature.polygons.map((polygon) => {
      const points = polygon.map(projectPoint).map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
      return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${isActive ? "4.6" : "2.4"}"></polygon>`;
    }).join("");

    const labelAnchor = projectPoint(feature.markerPoint || getFeatureCenter(feature.polygons));
    const quantityText = feature.quantity > 0 ? `${formatInteger(feature.quantity)} cab.` : "Sem gado";
    const labelWidth = Math.max(feature.label.length, quantityText.length) * 8 + 26;
    const labelX = clamp(labelAnchor.x, (labelWidth / 2) + 8, width - (labelWidth / 2) - 8);
    const labelY = clamp(labelAnchor.y, 34, height - 46);

    return `
      <g class="georef-feature ${feature.isLinked ? "is-linked" : "is-unlinked"} ${isActive ? "is-active" : ""}">
        <title>${escapeHtml(tooltip)}</title>
        ${polygons}
        <g class="georef-label">
          <rect x="${(labelX - (labelWidth / 2)).toFixed(1)}" y="${(labelY - 26).toFixed(1)}" width="${labelWidth.toFixed(1)}" height="44" rx="14"></rect>
          <text x="${labelX.toFixed(1)}" y="${(labelY - 6).toFixed(1)}">
            <tspan x="${labelX.toFixed(1)}" dy="0">${escapeHtml(feature.label)}</tspan>
            <tspan x="${labelX.toFixed(1)}" dy="16">${escapeHtml(quantityText)}</tspan>
          </text>
        </g>
      </g>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mapa georreferenciado da fazenda Arapey">
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,0.18)"></rect>
      ${featuresSvg}
    </svg>
  `;
}

function renderGeorefLegend(model) {
  const mappedItems = model.visibleFeatures.length
    ? model.visibleFeatures.map((feature) => {
      const namesText = feature.registeredNames.length
        ? `Cadastro: ${escapeHtml(feature.registeredNames.join(", "))}.`
        : "Sem lotação cadastrada para esta localidade.";
      const areaText = Number.isFinite(feature.areaHa)
        ? `<span class="georef-meta-pill">${formatWeight(feature.areaHa)} ha</span>`
        : "";
      const quantityText = feature.quantity > 0 ? `${formatInteger(feature.quantity)} cab.` : "Sem gado";

      return `
        <article class="georef-legend-item ${feature.isLinked ? "is-linked" : ""}">
          <div class="georef-legend-head">
            <strong>${escapeHtml(feature.label)}</strong>
            <span class="georef-badge">${escapeHtml(quantityText)}</span>
          </div>
          <div class="georef-legend-meta">
            ${areaText}
            <span class="georef-meta-pill">${feature.isLinked ? "Vinculado" : "Sem vínculo"}</span>
          </div>
          <p class="georef-legend-note">${namesText}</p>
        </article>
      `;
    }).join("")
    : "<p>Nenhuma geometria da Arapey foi localizada no arquivo KML.</p>";

  const unmatchedSection = model.unmatchedPotreiros.length
    ? `
      <section class="georef-legend-section">
        <h3>Potreiros sem correspondência automática</h3>
        <p>Esses cadastros ainda precisam de ajuste de nome para o mapa reconhecer a localidade correta.</p>
        ${model.unmatchedPotreiros.map((item) => `
          <article class="georef-legend-item is-unmatched">
            <div class="georef-legend-head">
              <strong>${escapeHtml(item.names.join(", "))}</strong>
              <span class="georef-badge">${formatInteger(item.quantity)} cab.</span>
            </div>
            <p class="georef-legend-note">Revise a grafia do potreiro ou confira se essa localidade existe no arquivo georreferenciado.</p>
          </article>
        `).join("")}
      </section>
    `
    : `
      <section class="georef-legend-section">
        <h3>Correspondencia automatica</h3>
        <p>Todos os potreiros cadastrados da Arapey encontraram uma localidade no arquivo <code>Arapey.kml</code>.</p>
      </section>
    `;

  return `
    <section class="georef-legend-section">
      <h3>Localidades identificadas</h3>
      <p>O mapa usa as áreas do KML e a lotação atual cadastrada em <strong>${escapeHtml(model.farmName)}</strong>.</p>
      ${mappedItems}
    </section>
    ${unmatchedSection}
  `;
}

function renderGeorefMap(model) {
  if (!model.visibleFeatures.length) {
    return '<div class="georef-map-empty">Nenhuma area do KML foi localizada para montar o mapa da Arapey.</div>';
  }

  const bounds = getGeorefBounds(model.visibleFeatures);
  if (!bounds) {
    return '<div class="georef-map-empty">Não encontrei coordenadas suficientes para desenhar o mapa georreferenciado.</div>';
  }

  const padding = 42;
  const maxWidth = 1000;
  const maxHeight = 760;
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.000001);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.000001);
  const scale = Math.min((maxWidth - (padding * 2)) / lonSpan, (maxHeight - (padding * 2)) / latSpan);
  const width = Math.max(720, Math.round((lonSpan * scale) + (padding * 2)));
  const height = Math.max(420, Math.round((latSpan * scale) + (padding * 2)));
  const maxQuantity = Math.max(...model.visibleFeatures.map((feature) => feature.quantity), 0);

  const projectPoint = (point) => ({
    x: padding + ((point.lon - bounds.minLon) * scale),
    y: padding + ((bounds.maxLat - point.lat) * scale)
  });

  const featuresSvg = model.visibleFeatures.map((feature) => {
    const fill = getGeorefFeatureFill(feature.quantity, maxQuantity, feature.isLinked);
    const stroke = feature.isLinked ? "#335c43" : "#8f6132";
    const tooltip = feature.registeredNames.length
      ? `${feature.label}: ${formatInteger(feature.quantity)} cab. | ${feature.registeredNames.join(", ")}`
      : `${feature.label}: sem lotação cadastrada`;
    const polygons = feature.polygons.map((polygon) => {
      const points = polygon.map(projectPoint).map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
      return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2.4"></polygon>`;
    }).join("");

    const labelAnchor = projectPoint(feature.markerPoint || getFeatureCenter(feature.polygons));
    const quantityText = feature.quantity > 0 ? `${formatInteger(feature.quantity)} cab.` : "Sem gado";
    const labelWidth = Math.max(feature.label.length, quantityText.length) * 8 + 26;
    const labelX = clamp(labelAnchor.x, (labelWidth / 2) + 8, width - (labelWidth / 2) - 8);
    const labelY = clamp(labelAnchor.y, 34, height - 46);

    return `
      <g class="georef-feature ${feature.isLinked ? "is-linked" : "is-unlinked"}">
        <title>${escapeHtml(tooltip)}</title>
        ${polygons}
        <g class="georef-label">
          <rect x="${(labelX - (labelWidth / 2)).toFixed(1)}" y="${(labelY - 26).toFixed(1)}" width="${labelWidth.toFixed(1)}" height="44" rx="14"></rect>
          <text x="${labelX.toFixed(1)}" y="${(labelY - 6).toFixed(1)}">
            <tspan x="${labelX.toFixed(1)}" dy="0">${escapeHtml(feature.label)}</tspan>
            <tspan x="${labelX.toFixed(1)}" dy="16">${escapeHtml(quantityText)}</tspan>
          </text>
        </g>
      </g>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mapa georreferenciado da fazenda Arapey">
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,0.18)"></rect>
      ${featuresSvg}
    </svg>
  `;
}

function getGeorefBounds(features) {
  const points = features.flatMap((feature) => feature.polygons.flatMap((polygon) => polygon));
  if (!points.length) {
    return null;
  }

  return points.reduce((bounds, point) => ({
    minLon: Math.min(bounds.minLon, point.lon),
    maxLon: Math.max(bounds.maxLon, point.lon),
    minLat: Math.min(bounds.minLat, point.lat),
    maxLat: Math.max(bounds.maxLat, point.lat)
  }), {
    minLon: Number.POSITIVE_INFINITY,
    maxLon: Number.NEGATIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY
  });
}

function getGeorefFeatureFill(quantity, maxQuantity, isLinked) {
  if (!isLinked) {
    return "rgba(201, 140, 79, 0.16)";
  }

  if (quantity <= 0 || maxQuantity <= 0) {
    return "rgba(55, 91, 67, 0.2)";
  }

  const ratio = quantity / maxQuantity;
  return `rgba(55, 91, 67, ${(0.28 + (ratio * 0.54)).toFixed(2)})`;
}

function extractKmlCoordinates(containerNode) {
  const coordinatesNode = containerNode.getElementsByTagNameNS("*", "coordinates")[0];
  if (!coordinatesNode) {
    return [];
  }

  return coordinatesNode.textContent
    .trim()
    .split(/\s+/)
    .map((chunk) => {
      const [lon, lat] = chunk.split(",").map(Number);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        return null;
      }

      return { lon, lat };
    })
    .filter(Boolean);
}

function parseKmlNumber(value) {
  if (!value) {
    return null;
  }

  const parsed = Number(String(value).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getFeatureCenter(polygons) {
  const points = polygons.flat();
  if (!points.length) {
    return { lon: 0, lat: 0 };
  }

  const totals = points.reduce((accumulator, point) => ({
    lon: accumulator.lon + point.lon,
    lat: accumulator.lat + point.lat
  }), { lon: 0, lat: 0 });

  return {
    lon: totals.lon / points.length,
    lat: totals.lat / points.length
  };
}

function resolveArapeyGeoKey(value) {
  const normalized = normalizeText(value)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s*-\s*[\d.,]+\s*ha$/i, "")
    .replace(/\bpotreiro\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || ["aaa", "poligono sem titulo", "dadassadasdasd"].includes(normalized)) {
    return "";
  }

  if (/^(campo\s*)?\d{1,2}$/.test(normalized)) {
    return normalized.match(/\d{1,2}/)?.[0] || "";
  }

  if (normalized.includes("campo 10 e 1")) {
    return "campo 10 e 1";
  }

  if (normalized.includes("chacra") && normalized.includes("10")) {
    return "chacra 10";
  }

  if (normalized.includes("las pampa")) {
    return "las pampas";
  }

  if (normalized.includes("cerrillada")) {
    return "cerrillada";
  }

  if (normalized.includes("pedreira")) {
    return "pedreira";
  }

  if (normalized.includes("tapera")) {
    return "tapera";
  }

  if (normalized.includes("costa")) {
    return "costa";
  }

  if (normalized.includes("molino")) {
    return "molino";
  }

  if (normalized.includes("piq rincon")) {
    return "piq rincon";
  }

  if (normalized.includes("prad 7")) {
    return "prad 7";
  }

  if (normalized.includes("prad 8")) {
    return "prad 8";
  }

  if (normalized === "frente") {
    return "frente";
  }

  return normalized;
}

function formatArapeyGeoLabel(key) {
  const labels = {
    "2": "Campo 2",
    "3": "Campo 3",
    "4": "Campo 4",
    "5": "Campo 5",
    "6": "Campo 6",
    "7": "Campo 7",
    "8": "Campo 8",
    "9": "Campo 9",
    "10": "Campo 10",
    "11": "Campo 11",
    "tapera": "Tapera",
    "pedreira": "Pedreira",
    "costa": "Costa",
    "molino": "Molino",
    "chacra 10": "Chacra 10",
    "las pampas": "Las Pampas",
    "cerrillada": "Cerrillada",
    "piq rincon": "Piq Rincon",
    "prad 7": "Prad 7",
    "prad 8": "Prad 8",
    "frente": "Frente",
    "campo 10 e 1": "Campo 10 e 1"
  };

  if (labels[key]) {
    return labels[key];
  }

  return key.replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderInsights(farm) {
  return;
}

function renderCharts(farm) {
  renderInventoryRankedList(farm);
  renderMovementChart(farm);
  renderMonthlyEvolutionChart(farm);
}

function renderInventoryRankedList(farm) {
  if (state.charts.inventory) {
    state.charts.inventory.destroy();
    state.charts.inventory = null;
  }

  const container = document.getElementById("inventoryChart");
  if (!container) return;

  const categories = [...farm.categories]
    .filter((cat) => Number(cat.quantity || 0) > 0)
    .sort((a, b) => b.quantity - a.quantity);

  const total = categories.reduce((sum, cat) => sum + Number(cat.quantity || 0), 0) || 1;

  if (!categories.length) {
    container.innerHTML = `<p class="chart-fallback-msg">Sem estoque para distribuir por categoria.</p>`;
    return;
  }

  const TOP_N = 8;
  const topCats = categories.slice(0, TOP_N);
  const restCats = categories.slice(TOP_N);
  const restQty = restCats.reduce((s, c) => s + Number(c.quantity || 0), 0);

  const rows = topCats.map((cat, index) => {
    const pct = ((cat.quantity / total) * 100).toFixed(1);
    const color = COLORS[index % COLORS.length];
    return `
      <div class="inv-ranked-row">
        <div class="inv-ranked-bar" style="width:${pct}%"></div>
        <span class="inv-ranked-dot" style="background:${color}"></span>
        <span class="inv-ranked-name">${escapeHtml(cat.name)}</span>
        <strong class="inv-ranked-qty">${formatInteger(cat.quantity)}</strong>
        <span class="inv-ranked-pct">${pct}%</span>
      </div>
    `;
  });

  if (restCats.length > 0) {
    const restPct = ((restQty / total) * 100).toFixed(1);
    rows.push(`
      <div class="inv-ranked-row inv-ranked-others">
        <div class="inv-ranked-bar" style="width:${restPct}%"></div>
        <span class="inv-ranked-dot" style="background:var(--muted);opacity:0.5"></span>
        <span class="inv-ranked-name">Outras (${restCats.length} categorias)</span>
        <strong class="inv-ranked-qty">${formatInteger(restQty)}</strong>
        <span class="inv-ranked-pct">${restPct}%</span>
      </div>
    `);
  }

  container.innerHTML = rows.join("");
}

function renderMovementChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("movementChart", "Gráfico indisponível no momento.");
    return;
  }

  const context = document.getElementById("movementChart");
  const summaryByMonth = Array.from({ length: 12 }, (_, monthIndex) => {
    const month = String(monthIndex + 1).padStart(2, "0");
    const summary = summarizePeriod(farm, state.filters.year, month);
    return {
      label: MONTH_NAMES[monthIndex].slice(0, 3),
      entradas: summary.byType.compra + summary.byType.nascimento + summary.adjustPositive,
      saidas: summary.byType.venda + summary.byType.consumo + summary.byType.morte + summary.adjustNegative,
      saldo: summary.netChange
    };
  });

  if (!summaryByMonth.some((item) => item.entradas || item.saidas || item.saldo)) {
    if (state.charts.movement) {
      state.charts.movement.destroy();
      state.charts.movement = null;
    }
    drawChartFallback("movementChart", "Sem movimentacoes registradas no ano filtrado.");
    return;
  }

  if (state.charts.movement) {
    state.charts.movement.destroy();
  }

  state.charts.movement = new Chart(context, {
    data: {
      labels: summaryByMonth.map((item) => item.label),
      datasets: [
        {
          type: "bar",
          label: "Entradas",
          data: summaryByMonth.map((item) => item.entradas),
          backgroundColor: createLinearColor(context, "rgba(55, 91, 67, 0.98)", "rgba(103, 149, 111, 0.62)"),
          borderRadius: 10,
          maxBarThickness: 26
        },
        {
          type: "bar",
          label: "Saidas",
          data: summaryByMonth.map((item) => item.saidas),
          backgroundColor: createLinearColor(context, "rgba(140, 75, 56, 0.98)", "rgba(195, 120, 100, 0.62)"),
          borderRadius: 10,
          maxBarThickness: 26
        },
        {
          type: "line",
          label: "Saldo",
          data: summaryByMonth.map((item) => item.saldo),
          borderColor: "#d39b5c",
          backgroundColor: "#d39b5c",
          pointBackgroundColor: "#fff7ed",
          pointBorderColor: "#d39b5c",
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 3,
          tension: 0.32
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 16
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(76, 55, 34, 0.08)"
          }
        }
      }
    }
  });
}

function renderRankingChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("rankingChart", "Gráfico indisponível no momento.");
    return;
  }

  const context = document.getElementById("rankingChart");
  const categories = [...farm.categories]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  if (!categories.some((category) => Number(category.quantity || 0) > 0)) {
    if (state.charts.ranking) {
      state.charts.ranking.destroy();
      state.charts.ranking = null;
    }
    drawChartFallback("rankingChart", "Sem lotes com animais para montar o ranking.");
    return;
  }

  if (state.charts.ranking) {
    state.charts.ranking.destroy();
  }

  state.charts.ranking = new Chart(context, {
    type: "bar",
    data: {
      labels: categories.map((category) => category.name),
      datasets: [{
        label: "Quantidade",
        data: categories.map((category) => category.quantity),
        backgroundColor: createLinearColor(context, "rgba(211, 155, 92, 0.96)", "rgba(237, 206, 166, 0.92)"),
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(chartContext) {
              return `${formatInteger(chartContext.raw)} animais`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "rgba(76, 55, 34, 0.08)"
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderMonthlyEvolutionChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("monthlyEvolutionChart", "Gráfico indisponível no momento.");
    return;
  }

  const context = document.getElementById("monthlyEvolutionChart");
  const evolution = getMonthlyEvolution(farm, state.filters.year);

  if (!evolution.some((item) => item.count || item.quantity || item.value)) {
    if (state.charts.monthlyEvolution) {
      state.charts.monthlyEvolution.destroy();
      state.charts.monthlyEvolution = null;
    }
    drawChartFallback("monthlyEvolutionChart", "Sem dados mensais no ano filtrado.");
    return;
  }

  if (state.charts.monthlyEvolution) {
    state.charts.monthlyEvolution.destroy();
  }

  state.charts.monthlyEvolution = new Chart(context, {
    type: "bar",
    data: {
      labels: evolution.map((item) => item.label),
      datasets: [
        {
          type: "bar",
          label: "Quantidade",
          data: evolution.map((item) => item.quantity),
          backgroundColor: "rgba(51, 92, 67, 0.72)",
          borderRadius: 10,
          yAxisID: "y"
        },
        {
          type: "line",
          label: "Valor (R$)",
          data: evolution.map((item) => item.value),
          borderColor: "#d39b5c",
          backgroundColor: "rgba(211, 155, 92, 0.2)",
          fill: true,
          tension: 0.34,
          pointRadius: 4,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(76, 55, 34, 0.08)" }
        },
        y1: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: {
            callback(value) {
              return formatCurrency(value).replace(",00", "");
            }
          }
        }
      }
    }
  });
}

function renderMonthlyCategoryChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("monthlyCategoryChart", "Gráfico indisponível no momento.");
    return;
  }

  const context = document.getElementById("monthlyCategoryChart");
  const summary = getMonthlySummary(farm);
  const labels = summary.byCategory.map((item) => item.label);
  const values = summary.byCategory.map((item) => item.value > 0 ? item.value : item.quantity > 0 ? item.quantity : item.count);

  if (!hasMeaningfulMonthlyData(summary)) {
    if (state.charts.monthlyCategory) {
      state.charts.monthlyCategory.destroy();
      state.charts.monthlyCategory = null;
    }
    drawChartFallback("monthlyCategoryChart", "Sem dados mensais para distribuir por categoria.");
    return;
  }

  if (state.charts.monthlyCategory) {
    state.charts.monthlyCategory.destroy();
  }

  state.charts.monthlyCategory = new Chart(context, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [{
        data: values.length ? values : [1],
        backgroundColor: (labels.length ? labels : ["Sem dados"]).map((_, index) => COLORS[index % COLORS.length]),
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 16
          }
        }
      },
      cutout: "58%"
    },
    plugins: [centerTextPlugin(() => ({
      title: summary.count ? formatInteger(summary.count) : "0",
      subtitle: summary.count ? "dados mensais" : "Sem dados"
    }))]
  });
}

function renderMonthlyCategoryModernChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("monthlyCategoryChart", "Grafico indisponivel no momento.");
    return;
  }

  const context = document.getElementById("monthlyCategoryChart");
  if (!context) {
    return;
  }
  const summary = getMonthlySummary(farm);
  const categories = [...summary.byCategory]
    .map((item) => ({
      ...item,
      metric: item.value > 0 ? item.value : item.quantity > 0 ? item.quantity : item.count
    }))
    .filter((item) => item.metric > 0)
    .sort((a, b) => b.metric - a.metric)
    .slice(0, 8);

  if (!hasMeaningfulMonthlyData(summary) || !categories.length) {
    if (state.charts.monthlyCategory) {
      state.charts.monthlyCategory.destroy();
      state.charts.monthlyCategory = null;
    }
    drawChartFallback("monthlyCategoryChart", "Sem dados mensais para distribuir por categoria.");
    return;
  }

  const labels = categories.map((item) => item.label);
  const values = categories.map((item) => item.metric);
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const usesValue = categories.some((item) => item.value > 0);
  const usesQuantity = !usesValue && categories.some((item) => item.quantity > 0);
  const metricLabel = usesValue ? "Valor" : usesQuantity ? "Quantidade" : "Registros";

  if (state.charts.monthlyCategory) {
    state.charts.monthlyCategory.destroy();
  }

  context.setAttribute(
    "aria-label",
    `Grafico de barras da distribuicao dos dados mensais por categoria em ${metricLabel.toLowerCase()}`
  );

  state.charts.monthlyCategory = new Chart(context, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: metricLabel,
        data: values,
        backgroundColor: labels.map((_, index) => createLinearColor(
          context,
          lightenColor(COLORS[index % COLORS.length], 0.2),
          COLORS[index % COLORS.length]
        )),
        borderRadius: 14,
        borderSkipped: false,
        barThickness: 18,
        maxBarThickness: 22
      }]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 12
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(38, 31, 24, 0.94)",
          padding: 12,
          displayColors: false,
          callbacks: {
            title(items) {
              return items[0]?.label || "";
            },
            label(chartContext) {
              const item = categories[chartContext.dataIndex];
              if (!item) {
                return `${metricLabel}: ${chartContext.raw}`;
              }

              if (usesValue) {
                return `Valor: ${formatCurrency(item.value)}`;
              }

              if (usesQuantity) {
                return `Quantidade: ${formatInteger(item.quantity)}`;
              }

              return `Registros: ${formatInteger(item.count)}`;
            },
            afterLabel(chartContext) {
              const item = categories[chartContext.dataIndex];
              if (!item) {
                return "";
              }

              return `Participacao: ${((item.metric / total) * 100).toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "rgba(76, 55, 34, 0.08)"
          },
          ticks: {
            color: "#6a5a47",
            font: {
              weight: "700"
            },
            callback(value) {
              return usesValue
                ? formatCurrency(value).replace(",00", "")
                : formatInteger(value);
            }
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: "#4c4032",
            font: {
              size: 12,
              weight: "700"
            },
            callback(value) {
              return trimLabel(labels[value] || "", 24);
            }
          }
        }
      }
    }
  });
}

function syncMovementFarmOptions(selectedFarmId = null) {
  const farms = getAllFarms();
  const shouldRequireExplicitSelection = !selectedFarmId && state.data.selectedFarmId === TOTAL_FARM_ID;
  const currentId = selectedFarmId ?? (state.data.selectedFarmId !== TOTAL_FARM_ID ? state.data.selectedFarmId : "");
  elements.movementFarm.innerHTML = [
    shouldRequireExplicitSelection ? '<option value="">Selecione uma fazenda</option>' : "",
    ...farms.map((farm) => `
    <option value="${escapeHtml(farm.id)}" ${farm.id === currentId ? "selected" : ""}>${escapeHtml(farm.name)}</option>
  `)
  ].join("");
  elements.movementFarm.value = currentId;
  if (elements.movementFarmWrap) {
    elements.movementFarmWrap.hidden = state.data.selectedFarmId !== TOTAL_FARM_ID && !selectedFarmId;
  }
}

function getMovementDialogFarm() {
  const farmId = elements.movementFarm?.value;
  return (farmId && state.data.farms[farmId]) ? state.data.farms[farmId] : null;
}

function openMovementDialog(initialType) {
  runtime.editingMovement = null;
  syncMovementFarmOptions();
  syncMovementTypeOptions(initialType);
  syncMovementCategoryOptionsForFarm(getMovementDialogFarm());
  syncMovementPotreirosOptions();
  elements.movementDate.value = new Date().toISOString().slice(0, 10);
  elements.movementQuantity.value = "";
  elements.adjustDirection.value = "add";
  elements.movementSaleMode.value = "vivo";
  elements.movementLivePrice.value = "";
  elements.movementLiveKg.value = "";
  elements.movementCarcassPrice.value = "";
  elements.movementCarcassKg.value = "";
  elements.movementValue.value = "";
  elements.movementNotes.value = "";
  if (elements.movSaleBuyer) elements.movSaleBuyer.value = "";
  if (elements.movSaleYieldPct) elements.movSaleYieldPct.value = "";
  if (elements.movPurchaseSource) elements.movPurchaseSource.value = "";
  if (elements.movPurchaseAvgWeight) elements.movPurchaseAvgWeight.value = "";
  if (elements.movPurchaseTotalWeight) { elements.movPurchaseTotalWeight.value = ""; delete elements.movPurchaseTotalWeight.dataset.manualEdit; }
  if (elements.movPurchasePricePerKg) elements.movPurchasePricePerKg.value = "";
  if (elements.movPurchaseValuePerHead) elements.movPurchaseValuePerHead.value = "";
  resetMovementPhotoDrafts();
  updateMovementFormForType(initialType);
  elements.movementDialog.showModal();
}

function resetMovementPhotoDrafts() {
  runtime.movementPhotoDrafts = [];
  if (elements.movementPhotos) {
    elements.movementPhotos.value = "";
  }
  renderMovementPhotoDrafts();
}

function movementTypeSupportsPhotos(type) {
  return MOVEMENT_PHOTO_TYPES.has(type);
}

function renderMovementPhotoDrafts() {
  const count = runtime.movementPhotoDrafts.length;
  const visible = movementTypeSupportsPhotos(elements.movementType.value);

  elements.movementPhotoWrap.hidden = !visible;
  elements.movementPhotoPanel.hidden = !visible || !count;
  elements.movementPhotoCounter.textContent = count
    ? `${formatInteger(count)} ${count === 1 ? "foto anexada" : "fotos anexadas"}`
    : "Nenhuma foto anexada.";

  if (!visible || !count) {
    elements.movementPhotoPreview.innerHTML = "";
    return;
  }

  elements.movementPhotoPreview.innerHTML = runtime.movementPhotoDrafts.map((photo, index) => `
    <article class="movement-photo-card">
      <img src="${photo.url || photo.dataUrl}" alt="${escapeHtml(photo.name || `Foto ${index + 1}`)}">
      <div class="movement-photo-meta">
        <strong>${escapeHtml(photo.name || `Foto ${index + 1}`)}</strong>
        <span>${formatInteger(index + 1)} de ${formatInteger(count)} | ${escapeHtml(photo.caption || "Pronto para o PDF")}</span>
      </div>
      <button type="button" class="ghost-btn movement-photo-remove" data-remove-movement-photo="${escapeHtml(photo.id)}">Remover</button>
    </article>
  `).join("");
}

async function handleMovementPhotosChange(event) {
  const files = [...(event.target.files || [])];
  if (!files.length) {
    return;
  }

  if (!movementTypeSupportsPhotos(elements.movementType.value)) {
    resetMovementPhotoDrafts();
    return;
  }

  const availableSlots = Math.max(0, MAX_MOVEMENT_PHOTOS - runtime.movementPhotoDrafts.length);
  if (availableSlots === 0) {
    alert(`Cada lançamento aceita até ${MAX_MOVEMENT_PHOTOS} fotos.`);
    event.target.value = "";
    return;
  }

  const nextFiles = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    alert(`Foram consideradas apenas ${availableSlots} fotos para manter o limite de ${MAX_MOVEMENT_PHOTOS} por lançamento.`);
  }

  elements.movementPhotoCounter.textContent = "Enviando fotos para o servidor...";
  elements.movementPhotoPanel.hidden = false;

  const processed = [];
  for (const file of nextFiles) {
    if (!String(file.type || "").startsWith("image/")) {
      continue;
    }

    try {
      processed.push(await createMovementPhotoAttachment(file));
    } catch (error) {
      console.warn("Não foi possível preparar a foto para o lançamento.", error);
      alert(`Falha ao enviar a foto "${file.name}". Verifique sua conexão e tente novamente.`);
    }
  }

  runtime.movementPhotoDrafts = [...runtime.movementPhotoDrafts, ...processed];
  event.target.value = "";
  renderMovementPhotoDrafts();
}

function handleMovementPhotoPreviewClick(event) {
  const trigger = event.target.closest("[data-remove-movement-photo]");
  if (!trigger) {
    return;
  }

  runtime.movementPhotoDrafts = runtime.movementPhotoDrafts.filter((photo) => photo.id !== trigger.dataset.removeMovementPhoto);
  renderMovementPhotoDrafts();
}

function openCategoryDialog() {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda específica para adicionar uma categoria.");
    return;
  }

  elements.categoryName.value = "";
  elements.categoryInitialQuantity.value = "0";
  elements.categoryDialog.showModal();
}

function syncMonthlyDataFarmOptions(selectedFarmId = elements.monthlyDataFarm.value || (state.data.selectedFarmId === TOTAL_FARM_ID ? getAllFarms()[0]?.id : state.data.selectedFarmId)) {
  elements.monthlyDataFarm.innerHTML = getAllFarms().map((farm) => `
    <option value="${farm.id}" ${farm.id === selectedFarmId ? "selected" : ""}>${escapeHtml(farm.name)}</option>
  `).join("");
  if (selectedFarmId) {
    elements.monthlyDataFarm.value = selectedFarmId;
  }
}

function syncMonthlyDataCategoryOptions(selectedCategory = elements.monthlyDataCategory.value || MONTHLY_REPORT_CATEGORIES[0].value) {
  elements.monthlyDataCategory.innerHTML = MONTHLY_REPORT_CATEGORIES.map((category) => `
    <option value="${category.value}" ${category.value === selectedCategory ? "selected" : ""}>${escapeHtml(category.label)}</option>
  `).join("");
  elements.monthlyDataCategory.value = selectedCategory;
}

function resetMonthlyDataForm(defaultFarmId = state.data.selectedFarmId === TOTAL_FARM_ID ? getAllFarms()[0]?.id : state.data.selectedFarmId) {
  state.monthlyEditingId = null;
  elements.monthlyDataDialogTitle.textContent = "Registrar dado mensal";
  elements.monthlyDataSubmitButton.textContent = "Salvar dado mensal";
  elements.monthlyDataEditingId.value = "";
  syncMonthlyDataFarmOptions(defaultFarmId);
  syncMonthlyDataCategoryOptions();
  elements.monthlyDataPeriod.value = `${state.filters.year}-${state.filters.month === "all" ? String(today.getMonth() + 1).padStart(2, "0") : state.filters.month}`;
  elements.monthlyDataTitle.value = "";
  elements.monthlyDataQuantity.value = "";
  elements.monthlyDataValue.value = "";
  elements.monthlyDataNotes.value = "";
}

function openMonthlyDataDialog() {
  resetMonthlyDataForm();
  elements.monthlyDataDialog.showModal();
}

function openMonthlyDataEditor(recordId) {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    const aggregateFarm = getAggregateFarm();
    const aggregateRecord = getMonthlyRecords(aggregateFarm).find((record) => record.id === recordId);
    if (aggregateRecord?.farmId) {
      openMonthlyDataEditorForFarm(recordId, aggregateRecord.farmId);
    }
    return;
  }

  openMonthlyDataEditorForFarm(recordId, state.data.selectedFarmId);
}

function openMonthlyDataEditorForFarm(recordId, farmId) {
  const farm = state.data.farms[farmId];
  const record = getMonthlyRecords(farm).find((item) => item.id === recordId);
  if (!farm || !record) {
    return;
  }

  state.monthlyEditingId = record.id;
  elements.monthlyDataDialogTitle.textContent = "Editar dado mensal";
  elements.monthlyDataSubmitButton.textContent = "Atualizar dado mensal";
  elements.monthlyDataEditingId.value = record.id;
  syncMonthlyDataFarmOptions(farm.id);
  syncMonthlyDataCategoryOptions(record.category);
  elements.monthlyDataPeriod.value = record.period;
  elements.monthlyDataTitle.value = record.title;
  elements.monthlyDataQuantity.value = record.quantity ? String(record.quantity) : "";
  elements.monthlyDataValue.value = record.value ? String(record.value) : "";
  elements.monthlyDataNotes.value = record.notes || "";
  elements.monthlyDataDialog.showModal();
}

// ── Stock Editor ──────────────────────────────────────────────────────────

function openEditStockDialog() {
  renderStockCategoryAccordion();
  renderStockPotreirosAccordion();
  setStockEditorTab("categorias");
  updateStockEditorHint();
  elements.editStockDialog.showModal();
}

function setStockEditorTab(tab) {
  document.querySelectorAll(".stock-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.stockTab === tab);
  });
  document.getElementById("stockPanelCategorias").hidden = tab !== "categorias";
  document.getElementById("stockPanelPotreiros").hidden  = tab !== "potreiros";
}

function updateStockEditorHint() {
  const hint = document.getElementById("stockEditorHint");
  if (!hint) return;
  const farms = getAllFarms();
  const total = farms.reduce((s, f) => s + getFarmTotal(f), 0);
  hint.textContent = `${farms.length} fazenda(s) · ${formatInteger(total)} animais no sistema`;
}

function stockCategoryRowHtml(farmId, cat) {
  return `
    <tr data-cat-row="${escapeHtml(cat.id)}" data-farm-id="${escapeHtml(farmId)}">
      <td><input type="text" class="stock-input" value="${escapeHtml(cat.name)}"
          data-cat-name="${escapeHtml(cat.id)}" maxlength="80" placeholder="Nome da categoria" required></td>
      <td><input type="number" class="stock-input stock-qty" value="${Number(cat.quantity || 0)}"
          min="0" step="1" data-cat-qty="${escapeHtml(cat.id)}"></td>
      <td><button type="button" class="stock-remove-btn" title="Remover categoria"
          data-remove-cat="${escapeHtml(cat.id)}" data-farm-id="${escapeHtml(farmId)}">&#x2715;</button></td>
    </tr>`;
}

function stockPotreirosRowHtml(farmId, p) {
  return `
    <tr data-potr-row="${escapeHtml(p.id)}" data-farm-id="${escapeHtml(farmId)}">
      <td><input type="text" class="stock-input" value="${escapeHtml(p.name)}"
          data-potr-name="${escapeHtml(p.id)}" maxlength="80" placeholder="Nome do potreiro" required></td>
      <td><input type="number" class="stock-input stock-qty" value="${Number(p.quantity || 0)}"
          min="0" step="1" data-potr-qty="${escapeHtml(p.id)}"></td>
      <td><button type="button" class="stock-remove-btn" title="Remover potreiro"
          data-remove-potr="${escapeHtml(p.id)}" data-farm-id="${escapeHtml(farmId)}">&#x2715;</button></td>
    </tr>`;
}

function renderStockCategoryAccordion() {
  const farms = getAllFarms();
  const el = document.getElementById("stockCategoryAccordion");
  el.innerHTML = farms.map((farm, i) => {
    const total = getFarmTotal(farm);
    const declared = farm.declaredTotal || total;
    const diff = declared - total;
    const diffLabel = diff === 0
      ? '<span class="stock-ok">✓ Alinhado</span>'
      : `<span class="stock-diff ${diff > 0 ? "stock-diff-pos" : "stock-diff-neg"}">${diff > 0 ? "+" : ""}${formatInteger(diff)} declarado vs. calculado</span>`;
    return `
      <div class="stock-accordion-item" data-cat-farm="${escapeHtml(farm.id)}">
        <button type="button" class="stock-accordion-hdr" data-toggle-cat="${escapeHtml(farm.id)}">
          <span class="stock-farm-name">${escapeHtml(farm.name)}</span>
          <span class="stock-farm-meta">${farm.categories.length} categoria(s) · ${formatInteger(total)} animais ${diffLabel}</span>
          <span class="stock-chevron">${i === 0 ? "▲" : "▼"}</span>
        </button>
        <div class="stock-accordion-body" ${i > 0 ? "hidden" : ""} data-cat-body="${escapeHtml(farm.id)}">
          <div class="stock-declared-row">
            <label>Total declarado
              <input type="number" class="stock-input" min="0" step="1"
                value="${declared}" data-declared="${escapeHtml(farm.id)}">
            </label>
            <span class="stock-live-total" data-live="${escapeHtml(farm.id)}">Calculado: ${formatInteger(total)}</span>
          </div>
          <table class="stock-table">
            <thead><tr><th>Categoria</th><th>Quantidade</th><th></th></tr></thead>
            <tbody data-cat-tbody="${escapeHtml(farm.id)}">
              ${farm.categories.map((cat) => stockCategoryRowHtml(farm.id, cat)).join("")}
            </tbody>
          </table>
          <button type="button" class="stock-add-btn" data-add-cat="${escapeHtml(farm.id)}">+ Adicionar categoria</button>
        </div>
      </div>`;
  }).join("");

  // Live quantity total update
  el.addEventListener("input", (e) => {
    const qtyInput = e.target.closest("[data-cat-qty]");
    if (!qtyInput) return;
    const row = qtyInput.closest("[data-cat-row]");
    const farmId = row?.dataset.farmId;
    if (!farmId) return;
    const tbody = el.querySelector(`[data-cat-tbody="${farmId}"]`);
    let live = 0;
    tbody?.querySelectorAll("[data-cat-qty]").forEach((inp) => { live += Number(inp.value) || 0; });
    const liveEl = el.querySelector(`[data-live="${farmId}"]`);
    if (liveEl) liveEl.textContent = `Calculado: ${formatInteger(live)}`;
  });
}

function renderStockPotreirosAccordion() {
  const farms = getAllFarms();
  const el = document.getElementById("stockPotreirosAccordion");
  el.innerHTML = farms.map((farm, i) => {
    const potreiros = getPotreroEntries(farm);
    const allocated = potreiros.reduce((s, p) => s + (Number(p.quantity) || 0), 0);
    const farmTotal = getFarmTotal(farm);
    const pct = farmTotal > 0 ? Math.round((allocated / farmTotal) * 100) : 0;
    return `
      <div class="stock-accordion-item" data-potr-farm="${escapeHtml(farm.id)}">
        <button type="button" class="stock-accordion-hdr" data-toggle-potr="${escapeHtml(farm.id)}">
          <span class="stock-farm-name">${escapeHtml(farm.name)}</span>
          <span class="stock-farm-meta">${potreiros.length} potreiro(s) · ${formatInteger(allocated)}/${formatInteger(farmTotal)} alocados (${pct}%)</span>
          <span class="stock-chevron">${i === 0 ? "▲" : "▼"}</span>
        </button>
        <div class="stock-accordion-body" ${i > 0 ? "hidden" : ""} data-potr-body="${escapeHtml(farm.id)}">
          <table class="stock-table">
            <thead><tr><th>Potreiro</th><th>Animais</th><th></th></tr></thead>
            <tbody data-potr-tbody="${escapeHtml(farm.id)}">
              ${potreiros.map((p) => stockPotreirosRowHtml(farm.id, p)).join("")}
            </tbody>
          </table>
          <button type="button" class="stock-add-btn" data-add-potr="${escapeHtml(farm.id)}">+ Adicionar potreiro</button>
        </div>
      </div>`;
  }).join("");
}

function handleStockCategoryAccordionClick(e) {
  // Toggle accordion
  const toggleBtn = e.target.closest("[data-toggle-cat]");
  if (toggleBtn) {
    const farmId = toggleBtn.dataset.toggleCat;
    const body = document.querySelector(`[data-cat-body="${farmId}"]`);
    const chevron = toggleBtn.querySelector(".stock-chevron");
    if (body) {
      body.hidden = !body.hidden;
      if (chevron) chevron.textContent = body.hidden ? "▼" : "▲";
    }
    return;
  }
  // Remove category row
  const removeBtn = e.target.closest("[data-remove-cat]");
  if (removeBtn) {
    removeBtn.closest("[data-cat-row]")?.remove();
    return;
  }
  // Add category row
  const addBtn = e.target.closest("[data-add-cat]");
  if (addBtn) {
    const farmId = addBtn.dataset.addCat;
    const tbody = document.querySelector(`[data-cat-tbody="${farmId}"]`);
    if (tbody) {
      const newId = `new-cat-${Date.now()}`;
      const newRow = document.createElement("tr");
      newRow.dataset.catRow = newId;
      newRow.dataset.farmId = farmId;
      newRow.innerHTML = `
        <td><input type="text" class="stock-input" value="" data-cat-name="${newId}" maxlength="80" placeholder="Nome da categoria" required></td>
        <td><input type="number" class="stock-input stock-qty" value="0" min="0" step="1" data-cat-qty="${newId}"></td>
        <td><button type="button" class="stock-remove-btn" data-remove-cat="${newId}" data-farm-id="${farmId}">&#x2715;</button></td>`;
      tbody.appendChild(newRow);
      newRow.querySelector("[data-cat-name]")?.focus();
    }
  }
}

function handleStockPotreirosAccordionClick(e) {
  // Toggle accordion
  const toggleBtn = e.target.closest("[data-toggle-potr]");
  if (toggleBtn) {
    const farmId = toggleBtn.dataset.togglePotr;
    const body = document.querySelector(`[data-potr-body="${farmId}"]`);
    const chevron = toggleBtn.querySelector(".stock-chevron");
    if (body) {
      body.hidden = !body.hidden;
      if (chevron) chevron.textContent = body.hidden ? "▼" : "▲";
    }
    return;
  }
  // Remove potreiro row
  const removeBtn = e.target.closest("[data-remove-potr]");
  if (removeBtn) {
    removeBtn.closest("[data-potr-row]")?.remove();
    return;
  }
  // Add potreiro row
  const addBtn = e.target.closest("[data-add-potr]");
  if (addBtn) {
    const farmId = addBtn.dataset.addPotr;
    const tbody = document.querySelector(`[data-potr-tbody="${farmId}"]`);
    if (tbody) {
      const newId = createPotreroId(`potreiro-${Date.now()}`);
      const newRow = document.createElement("tr");
      newRow.dataset.potrRow = newId;
      newRow.dataset.farmId = farmId;
      newRow.innerHTML = `
        <td><input type="text" class="stock-input" value="" data-potr-name="${newId}" maxlength="80" placeholder="Ex.: Potreiro Norte" required></td>
        <td><input type="number" class="stock-input stock-qty" value="0" min="0" step="1" data-potr-qty="${newId}"></td>
        <td><button type="button" class="stock-remove-btn" data-remove-potr="${newId}" data-farm-id="${farmId}">&#x2715;</button></td>`;
      tbody.appendChild(newRow);
      newRow.querySelector("[data-potr-name]")?.focus();
    }
  }
}

function handleSaveStockEdit() {
  const farms = getAllFarms();
  const errors = [];

  // Validate & collect categories
  const catUpdates = {};
  for (const farm of farms) {
    const tbody = document.querySelector(`[data-cat-tbody="${farm.id}"]`);
    if (!tbody) continue;
    const rows = [...tbody.querySelectorAll("[data-cat-row]")];
    const seen = new Set();
    const cats = [];
    for (const row of rows) {
      const catId = row.dataset.catRow;
      const name = row.querySelector("[data-cat-name]")?.value.trim() || "";
      const qty = Number(row.querySelector("[data-cat-qty]")?.value);
      if (!name) { errors.push(`${farm.name}: nome de categoria em branco.`); break; }
      if (!Number.isFinite(qty) || qty < 0) { errors.push(`${farm.name}: quantidade inválida em "${name}".`); break; }
      const normalized = normalizeText(name);
      if (seen.has(normalized)) { errors.push(`${farm.name}: categoria "${name}" duplicada.`); break; }
      seen.add(normalized);
      cats.push({ id: catId, name, qty });
    }
    const declaredInput = document.querySelector(`[data-declared="${farm.id}"]`);
    const declared = Number(declaredInput?.value);
    catUpdates[farm.id] = { cats, declared: Number.isFinite(declared) && declared >= 0 ? declared : getFarmTotal(farm) };
  }

  // Validate & collect potreiros
  const potrUpdates = {};
  for (const farm of farms) {
    const tbody = document.querySelector(`[data-potr-tbody="${farm.id}"]`);
    if (!tbody) continue;
    const rows = [...tbody.querySelectorAll("[data-potr-row]")];
    const seen = new Set();
    const potrs = [];
    for (const row of rows) {
      const potrId = row.dataset.potrRow;
      const name = row.querySelector("[data-potr-name]")?.value.trim() || "";
      const qty = Number(row.querySelector("[data-potr-qty]")?.value);
      if (!name) { errors.push(`${farm.name}: nome de potreiro em branco.`); break; }
      if (!Number.isFinite(qty) || qty < 0) { errors.push(`${farm.name}: quantidade inválida em "${name}".`); break; }
      const normalized = normalizeText(name);
      if (seen.has(normalized)) { errors.push(`${farm.name}: potreiro "${name}" duplicado.`); break; }
      seen.add(normalized);
      potrs.push({ id: potrId.startsWith("new-") ? createPotreroId(name) : potrId, name, quantity: qty });
    }
    potrUpdates[farm.id] = potrs;
  }

  if (errors.length) {
    alert(errors[0]);
    return;
  }

  // Apply all changes
  for (const farm of farms) {
    const { cats, declared } = catUpdates[farm.id] || { cats: [], declared: 0 };
    for (const { id, name, qty } of cats) {
      const existing = farm.categories.find((c) => c.id === id);
      if (existing) {
        if (existing.name !== name) {
          farm.movements.forEach((m) => { if (m.categoryId === id) m.categoryName = name; });
          farm.sanitaryRecords.forEach((r) => { if (r.categoryId === id) r.categoryName = name; });
          existing.name = name;
        }
        existing.quantity = qty;
      } else {
        // New category
        const newCatId = slugify(`${name}-${Date.now()}`);
        farm.categories.push({ id: newCatId, name, quantity: qty, allocation: {} });
      }
    }
    // Remove categories no longer in the list
    const keptIds = new Set(cats.map((c) => c.id));
    farm.categories = farm.categories.filter((c) => keptIds.has(c.id));

    farm.declaredTotal = declared;
    farm.potreiros = potrUpdates[farm.id] || farm.potreiros;
  }

  saveData();
  elements.editStockDialog.close();
  render();
}

function openSanitaryEditor(recordId) {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    const aggregateFarm = getAggregateFarm();
    const aggregateRecord = aggregateFarm.sanitaryRecords.find((item) => item.id === recordId || item.sourceId === recordId);
    if (aggregateRecord?.farmId && state.data.farms[aggregateRecord.farmId]) {
      state.data.selectedFarmId = aggregateRecord.farmId;
      saveData();
      render();
      openSanitaryEditor(recordId);
    }
    return;
  }

  const farm = getFarm();
  const record = farm.sanitaryRecords.find((item) => item.id === recordId || item.sourceId === recordId);
  if (!record) {
    return;
  }

  state.activeView = "sanitary";
  renderActiveView();
  syncSanitaryFormOptions();
  ensureSanitaryCategoryOption(record.categoryId, record.categoryName);
  ensureSelectOption(elements.sanitaryProduct, record.product, record.product);
  ensureSelectOption(elements.sanitaryPotrero, record.potreiro || "Sem potreiro", record.potreiro || "Sem potreiro");

  elements.sanitaryEditingId.value = record.id || record.sourceId;
  elements.sanitaryDate.value = record.date;
  elements.sanitaryQuantity.value = Number.isFinite(record.quantity) ? String(record.quantity) : "";
  elements.sanitaryCategory.value = record.categoryId;
  elements.sanitaryProduct.value = record.product;
  elements.sanitaryPotrero.value = record.potreiro || "Sem potreiro";
  elements.sanitaryNotes.value = record.notes || "";
  elements.sanitarySubmitButton.textContent = "Atualizar registro sanitário";
  updateSanitaryProductMode();
  updateSanitaryPotreroMode();
  elements.sanitaryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncMovementTypeOptions(selectedType = elements.movementType.value || "compra") {
  elements.movementType.innerHTML = MOVEMENT_TYPES.map((type) => `
    <option value="${type.value}" ${type.value === selectedType ? "selected" : ""}>${type.label}</option>
  `).join("");
}

function updateMovementFormForType(type) {
  const farm = getMovementDialogFarm() || getFarm();
  const typeMeta = MOVEMENT_TYPES.find((item) => item.value === type);
  elements.movementDialogTitle.textContent = typeMeta ? `Registrar ${typeMeta.label.toLowerCase()}` : "Registrar movimentação";
  elements.adjustDirectionWrap.hidden = type !== "ajuste";
  const isTransfer = type === "transferencia";
  const isExit = typeMeta?.direction === -1;
  if (elements.movementPotreiroWrap) {
    elements.movementPotreiroWrap.hidden = false;
    if (elements.movementPotreiroLabel) {
      elements.movementPotreiroLabel.textContent = (isExit || isTransfer) ? "Potreiro de origem" : "Potreiro de destino";
    }
  }
  if (elements.movementPotreirowDestWrap) {
    elements.movementPotreirowDestWrap.hidden = !isTransfer;
  }
  // hide quantity/value for transfer (keep notes)
  if (elements.movementValueWrap) elements.movementValueWrap.hidden = isTransfer;
  syncMovementPotreirosOptions();
  const isSale = type === "venda";
  const isPremiumFarm = isPremiumSaleFarm(farm);

  const isCompra = type === "compra";
  elements.movementSaleModeWrap.hidden = !isSale || !isPremiumFarm;
  elements.movementSaleHint.hidden = !isSale;
  if (elements.movSaleExtraWrap) elements.movSaleExtraWrap.hidden = !isSale;
  if (elements.movPurchaseSection) elements.movPurchaseSection.hidden = !isCompra;

  elements.movementValueWrap.hidden = false;
  elements.movementValue.readOnly = isSale;
  if (isCompra) {
    elements.movementValue.readOnly = false;
    elements.movementValueLabel.textContent = "Valor total";
    elements.movementValue.placeholder = "Calculado automaticamente";
  } else if (isSale) {
    elements.movementValueLabel.textContent = "Total calculado";
    elements.movementValue.placeholder = "Calculado automaticamente";
  } else {
    elements.movementValueLabel.textContent = "Valor total (opcional)";
    elements.movementValue.placeholder = "0,00";
    elements.movementValue.value = "";
  }

  if (!movementTypeSupportsPhotos(type)) {
    resetMovementPhotoDrafts();
  } else {
    renderMovementPhotoDrafts();
  }
  updateSaleFieldVisibility();
}

function updateSaleFieldVisibility() {
  const farm = getMovementDialogFarm();
  const isSale = elements.movementType.value === "venda";
  const isPremiumFarm = isPremiumSaleFarm(farm);
  const saleMode = isPremiumFarm ? elements.movementSaleMode.value : "vivo";
  const showLive = isSale && saleMode === "vivo";
  const showCarcass = isSale && isPremiumFarm && saleMode === "carcaca";

  elements.movementLiveFields.hidden = !showLive;
  elements.movementCarcassFields.hidden = !showCarcass;
  elements.movementLivePrice.required = showLive;
  elements.movementLiveKg.required = showLive;
  elements.movementCarcassPrice.required = showCarcass;
  elements.movementCarcassKg.required = showCarcass;

  if (!showLive) {
    elements.movementLivePrice.value = "";
    elements.movementLiveKg.value = "";
  }
  if (!showCarcass) {
    elements.movementCarcassPrice.value = "";
    elements.movementCarcassKg.value = "";
  }

  updateSaleComputedValue();
}

function updateSaleComputedValue() {
  if (elements.movementType.value !== "venda") {
    return;
  }

  const farm = getMovementDialogFarm();
  const saleMode = isPremiumSaleFarm(farm) ? elements.movementSaleMode.value : "vivo";
  const pricePerKg = Number(saleMode === "carcaca" ? elements.movementCarcassPrice.value : elements.movementLivePrice.value);
  const weightKg = Number(saleMode === "carcaca" ? elements.movementCarcassKg.value : elements.movementLiveKg.value);
  const total = Number.isFinite(pricePerKg) && Number.isFinite(weightKg) ? pricePerKg * weightKg : 0;
  elements.movementValue.value = total > 0 ? total.toFixed(2) : "";
}

function updatePurchaseComputedValues() {
  if (elements.movementType.value !== "compra") return;
  const qty = Number(elements.movementQuantity.value || 0);
  const avgWeight = Number(elements.movPurchaseAvgWeight?.value || 0);
  const manualTotalWeight = Number(elements.movPurchaseTotalWeight?.value || 0);
  const pricePerKg = Number(elements.movPurchasePricePerKg?.value || 0);

  // Auto-fill total weight from qty × avgWeight (only if avg was changed)
  if (qty > 0 && avgWeight > 0) {
    const computed = +(qty * avgWeight).toFixed(1);
    if (elements.movPurchaseTotalWeight && !elements.movPurchaseTotalWeight.dataset.manualEdit) {
      elements.movPurchaseTotalWeight.value = computed;
    }
  }

  const totalWeight = Number(elements.movPurchaseTotalWeight?.value || 0);

  if (pricePerKg > 0 && totalWeight > 0) {
    const total = +(pricePerKg * totalWeight).toFixed(2);
    elements.movementValue.value = total;
    if (qty > 0 && elements.movPurchaseValuePerHead) {
      elements.movPurchaseValuePerHead.value = +(total / qty).toFixed(2);
    }
  } else if (Number(elements.movementValue.value) > 0 && qty > 0 && elements.movPurchaseValuePerHead) {
    elements.movPurchaseValuePerHead.value = +(Number(elements.movementValue.value) / qty).toFixed(2);
  }
}

function syncMovementCategoryOptionsForFarm(farm) {
  if (!farm) {
    elements.movementCategory.innerHTML = '<option value="">Selecione uma fazenda primeiro</option>';
    elements.movementCategory.value = "";
    syncMovementPotreirosOptions();
    return;
  }
  elements.movementCategory.innerHTML = farm.categories.map((category) => `
    <option value="${category.id}">${escapeHtml(category.name)}</option>
  `).join("");
  syncMovementPotreirosOptions();
}

function syncCategoryOptions() {
  syncMovementCategoryOptionsForFarm(getMovementDialogFarm());
}

function syncMovementPotreirosOptions() {
  if (!elements.movementPotreiro) return;
  const farm = getMovementDialogFarm();
  const type = elements.movementType?.value;
  if (!farm || !type) {
    elements.movementPotreiro.innerHTML = '<option value="">Selecione uma fazenda primeiro</option>';
    elements.movementPotreiro.value = "";
    if (elements.movementPotreiroDest) {
      elements.movementPotreiroDest.innerHTML = '<option value="">Selecione uma fazenda primeiro</option>';
      elements.movementPotreiroDest.value = "";
    }
    return;
  }

  const typeMeta = MOVEMENT_TYPES.find((t) => t.value === type);
  const isExit = typeMeta?.direction === -1;
  const isTransfer = type === "transferencia";
  const potreiros = getPotreroEntries(farm);
  const categoryId = elements.movementCategory?.value;
  const category = farm.categories.find((c) => c.id === categoryId);
  const alloc = category?.allocation || {};

  const unallocatedQty = Number(alloc[UNALLOCATED_POTREIRO_KEY] || 0);
  const unallocatedLabel = isExit || isTransfer
    ? `Sem potreiro (${formatInteger(unallocatedQty)} animais)`
    : "Sem potreiro (padrão)";

  const potreroOptions = [
    `<option value="${UNALLOCATED_POTREIRO_KEY}">${unallocatedLabel}</option>`,
    ...potreiros.map((p) => {
      const qty = Number(alloc[p.id] || 0);
      const label = (isExit || isTransfer)
        ? `${escapeHtml(p.name)} (${formatInteger(qty)} animais)`
        : escapeHtml(p.name);
      return `<option value="${escapeHtml(p.id)}">${label}</option>`;
    })
  ].join("");

  elements.movementPotreiro.innerHTML = potreroOptions;

  if (elements.movementPotreiroDest) {
    elements.movementPotreiroDest.innerHTML = [
      `<option value="${UNALLOCATED_POTREIRO_KEY}">Sem potreiro</option>`,
      ...potreiros.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`)
    ].join("");
  }
}

function ensureCategoryAllocation(category) {
  if (!category.allocation || typeof category.allocation !== "object") {
    category.allocation = { [UNALLOCATED_POTREIRO_KEY]: Number(category.quantity || 0) };
  }
}

function updatePotreroQuantitiesFromAllocation(farm) {
  const totals = {};
  farm.categories.forEach((cat) => {
    const alloc = cat.allocation || {};
    Object.entries(alloc).forEach(([potreirosId, qty]) => {
      if (potreirosId !== UNALLOCATED_POTREIRO_KEY) {
        totals[potreirosId] = (totals[potreirosId] || 0) + Number(qty || 0);
      }
    });
  });
  farm.potreiros.forEach((p) => {
    if (totals[p.id] !== undefined) {
      p.quantity = totals[p.id];
    }
  });
}

function syncSanitaryFormOptions() {
  const farm = getFarm();
  const selectedProduct = elements.sanitaryProduct.value;
  const selectedPotrero = elements.sanitaryPotrero.value;
  elements.sanitaryCategory.innerHTML = getSanitaryCategoryOptions(farm).map((category) => `
    <option value="${category.id}">${escapeHtml(category.name)}</option>
  `).join("");

  const productOptions = farm.sanitaryProducts.map((product) => `
    <option value="${escapeHtml(product)}" ${product === selectedProduct ? "selected" : ""}>${escapeHtml(product)}</option>
  `);
  productOptions.push(`<option value="__new__" ${selectedProduct === "__new__" ? "selected" : ""}>Outros</option>`);

  elements.sanitaryProduct.innerHTML = productOptions.join("");
  if (!elements.sanitaryProduct.value && farm.sanitaryProducts.length) {
    elements.sanitaryProduct.value = farm.sanitaryProducts[0];
  }

  const potreroOptions = getPotreroEntries(farm).map((potreiro) => `
    <option value="${escapeHtml(potreiro.name)}" ${potreiro.name === selectedPotrero ? "selected" : ""}>${escapeHtml(potreiro.name)}</option>
  `);
  potreroOptions.push(`<option value="__new__" ${selectedPotrero === "__new__" ? "selected" : ""}>Adicionar novo potreiro</option>`);
  elements.sanitaryPotrero.innerHTML = potreroOptions.join("");
  if (!elements.sanitaryPotrero.value) {
    const firstPotrero = getPotreroEntries(farm)[0];
    elements.sanitaryPotrero.value = firstPotrero ? firstPotrero.name : "__new__";
  }

  if (!elements.sanitaryDate.value) {
    elements.sanitaryDate.value = new Date().toISOString().slice(0, 10);
  }
  updateSanitaryProductMode();
  updateSanitaryPotreroMode();
}

function getSanitaryCategoryOptions(farm) {
  const categoryMap = new Map();
  farm.categories.forEach((category) => {
    categoryMap.set(category.id, { id: category.id, name: category.name });
  });
  farm.sanitaryRecords.forEach((record) => {
    if (!categoryMap.has(record.categoryId)) {
      categoryMap.set(record.categoryId, { id: record.categoryId, name: record.categoryName });
    }
  });
  return [...categoryMap.values()];
}

function ensureSanitaryCategoryOption(categoryId, categoryName) {
  ensureSelectOption(elements.sanitaryCategory, categoryId, categoryName);
}

function ensureSelectOption(select, value, label) {
  if (![...select.options].some((option) => option.value === value)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

function updateSanitaryProductMode() {
  const isNewProduct = elements.sanitaryProduct.value === "__new__";
  elements.newProductWrap.hidden = !isNewProduct;
  elements.newProductName.required = isNewProduct;
  if (!isNewProduct) {
    elements.newProductName.value = "";
  }
}

function updateSanitaryPotreroMode() {
  const isNewPotrero = elements.sanitaryPotrero.value === "__new__";
  elements.newPotreroWrap.hidden = !isNewPotrero;
  elements.newPotreroName.required = isNewPotrero;
  if (!isNewPotrero) {
    elements.newPotreroName.value = "";
  }
}

async function handleMovementSubmit(event) {
  event.preventDefault();
  const farm = getMovementDialogFarm();
  if (!farm || farm.id === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda específica para registrar movimentações.");
    return;
  }

  // If editing, revert old movement first then remove it
  const editing = runtime.editingMovement;
  if (editing) {
    const editFarm = state.data.farms[editing.farmId];
    if (editFarm) {
      const oldMovement = editFarm.movements.find((m) => m.id === editing.movementId);
      if (oldMovement) {
        revertMovementEffect(editFarm, oldMovement);
        editFarm.movements = editFarm.movements.filter((m) => m.id !== editing.movementId);
      }
    }
    runtime.editingMovement = null;
  }
  const type = elements.movementType.value;
  const quantity = Number(elements.movementQuantity.value);
  const adjustDirection = elements.adjustDirection.value;
  const date = elements.movementDate.value;
  const categoryId = elements.movementCategory.value;
  const notes = elements.movementNotes.value.trim();
  const category = farm.categories.find((item) => item.id === categoryId);
  let value = Number(elements.movementValue.value || 0);
  let saleDetails = null;
  let purchaseDetails = null;

  // Handle transfer between potreiros (no stock change, only reallocation)
  if (type === "transferencia") {
    if (!category || !date || !quantity || quantity < 1) return;
    const originId = elements.movementPotreiro?.value || UNALLOCATED_POTREIRO_KEY;
    const destId = elements.movementPotreiroDest?.value || UNALLOCATED_POTREIRO_KEY;
    if (originId === destId) {
      alert("Selecione potreiros de origem e destino diferentes para a transferência.");
      return;
    }
    ensureCategoryAllocation(category);
    const originQty = Number(category.allocation[originId] || 0);
    if (originQty < quantity) {
      const originName = originId === UNALLOCATED_POTREIRO_KEY ? "Sem potreiro" : (farm.potreiros.find((p) => p.id === originId)?.name || originId);
      alert(`Apenas ${formatInteger(originQty)} animais estão alocados em "${originName}" para essa categoria.`);
      return;
    }
    category.allocation[originId] = originQty - quantity;
    category.allocation[destId] = (Number(category.allocation[destId] || 0)) + quantity;
    updatePotreroQuantitiesFromAllocation(farm);
    farm.movements.push({
      id: createMovementId(),
      code: generateMovementCode(farm),
      type: "transferencia",
      date,
      categoryId,
      categoryName: category.name,
      quantity,
      delta: 0,
      value: 0,
      saleDetails: null,
      notes,
      potreiro: originId,
      potreiroDest: destId,
      photos: []
    });
    saveData();
    populateYearFilter();
    resetMovementPhotoDrafts();
    elements.movementDialog.close();
    render();
    return;
  }

  if (!category || !date || !quantity || quantity < 1) {
    return;
  }

  if (type === "compra") {
    const sourceProperty = elements.movPurchaseSource?.value?.trim() || "";
    const avgWeight = Number(elements.movPurchaseAvgWeight?.value) || null;
    const totalWeight = Number(elements.movPurchaseTotalWeight?.value) || null;
    const pricePerKg = Number(elements.movPurchasePricePerKg?.value) || null;
    const valuePerHead = Number(elements.movPurchaseValuePerHead?.value) || null;
    purchaseDetails = { sourceProperty, avgWeight, totalWeight, pricePerKg, valuePerHead };
  }

  if (type === "venda") {
    const saleMode = isPremiumSaleFarm(farm) ? elements.movementSaleMode.value : "vivo";
    const pricePerKg = Number(saleMode === "carcaca" ? elements.movementCarcassPrice.value : elements.movementLivePrice.value);
    const weightKg = Number(saleMode === "carcaca" ? elements.movementCarcassKg.value : elements.movementLiveKg.value);

    if (!Number.isFinite(pricePerKg) || pricePerKg <= 0 || !Number.isFinite(weightKg) || weightKg <= 0) {
      alert("Preencha o valor por kg e o peso da venda para calcular o total.");
      return;
    }

    value = pricePerKg * weightKg;
    const buyer = elements.movSaleBuyer?.value?.trim() || "";
    const yieldPct = Number(elements.movSaleYieldPct?.value) || null;
    const valuePerHead = quantity > 0 ? +(value / quantity).toFixed(2) : null;
    saleDetails = {
      mode: saleMode,
      pricePerKg,
      weightKg,
      buyer,
      yieldPct,
      valuePerHead
    };
  }

  const delta = getMovementDelta(type, quantity, adjustDirection);
  if (!Number.isFinite(delta)) {
    return;
  }

  if (category.quantity + delta < 0) {
    alert("A quantidade informada deixa o estoque negativo para essa categoria.");
    return;
  }

  const selectedPotreiro = (!elements.movementPotreiroWrap?.hidden && elements.movementPotreiro?.value)
    ? elements.movementPotreiro.value
    : UNALLOCATED_POTREIRO_KEY;

  ensureCategoryAllocation(category);
  category.quantity += delta;
  if (delta > 0) {
    category.allocation[selectedPotreiro] = (Number(category.allocation[selectedPotreiro] || 0)) + quantity;
  } else if (delta < 0) {
    category.allocation[selectedPotreiro] = Math.max(0, (Number(category.allocation[selectedPotreiro] || 0)) - quantity);
  }
  updatePotreroQuantitiesFromAllocation(farm);

  farm.movements.push({
    id: createMovementId(),
    code: generateMovementCode(farm),
    type,
    date,
    categoryId,
    categoryName: category.name,
    quantity,
    delta,
    value,
    saleDetails,
    purchaseDetails,
    currency: getFarmCurrency(farm.id),
    notes,
    potreiro: selectedPotreiro,
    photos: movementTypeSupportsPhotos(type) ? runtime.movementPhotoDrafts.map((photo) => ({ ...photo })) : []
  });

  if (farm.declaredTotal === 0) {
    farm.declaredTotal = getFarmTotal(farm);
  }

  saveData();
  populateYearFilter();
  resetMovementPhotoDrafts();
  elements.movementDialog.close();
  render();
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const farm = getFarm();
  const name = elements.categoryName.value.trim();
  const quantity = Number(elements.categoryInitialQuantity.value || 0);

  if (!name) {
    return;
  }

  farm.categories.push({ id: slugify(`${name}-${Date.now()}`), name, quantity });
  saveData();
  elements.categoryDialog.close();
  render();
}

function handleMonthlyDataSubmit(event) {
  event.preventDefault();
  const farm = state.data.farms[elements.monthlyDataFarm.value];
  const period = elements.monthlyDataPeriod.value;
  const category = elements.monthlyDataCategory.value;
  const title = elements.monthlyDataTitle.value.trim();
  const quantity = Number(elements.monthlyDataQuantity.value || 0);
  const value = Number(elements.monthlyDataValue.value || 0);
  const notes = elements.monthlyDataNotes.value.trim();
  const editingId = elements.monthlyDataEditingId.value;

  if (!farm || !period || !category || !title) {
    return;
  }

  if (quantity < 0 || value < 0) {
    alert("Quantidade e valor atribuído não podem ser negativos.");
    return;
  }

  const payload = {
    period,
    category,
    title,
    quantity: Number.isFinite(quantity) ? Math.round(quantity) : 0,
    value: Number.isFinite(value) ? Number(value.toFixed(2)) : 0,
    notes
  };

  if (editingId) {
    const ownerFarm = getAllFarms().find((item) => getMonthlyRecords(item).some((record) => record.id === editingId));
    const existing = ownerFarm ? getMonthlyRecords(ownerFarm).find((record) => record.id === editingId) : null;
    if (existing && ownerFarm?.id === farm.id) {
      Object.assign(existing, payload);
    } else if (existing) {
      ownerFarm.monthlyRecords = ownerFarm.monthlyRecords.filter((record) => record.id !== editingId);
      farm.monthlyRecords.push({
        id: editingId,
        ...payload
      });
    } else {
      farm.monthlyRecords.push({
        id: editingId,
        ...payload
      });
    }
  } else {
    farm.monthlyRecords.push({
      id: createMovementId(),
      ...payload
    });
  }

  state.data.selectedFarmId = farm.id;
  saveData();
  populateYearFilter();
  elements.monthlyDataDialog.close();
  render();
}

function handleSanitarySubmit(event) {
  event.preventDefault();
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda específica para registrar ou editar o manejo sanitário.");
    return;
  }

  const farm = getFarm();
  const editingId = elements.sanitaryEditingId.value;
  const date = elements.sanitaryDate.value;
  const quantity = Number(elements.sanitaryQuantity.value);
  const categoryId = elements.sanitaryCategory.value;
  const categoryLabel = elements.sanitaryCategory.selectedOptions[0]?.textContent || "Categoria";
  const selectedProduct = elements.sanitaryProduct.value;
  const newProductName = elements.newProductName.value.trim();
  const product = selectedProduct === "__new__" ? newProductName : selectedProduct;
  const selectedPotrero = elements.sanitaryPotrero.value;
  const newPotreroName = elements.newPotreroName.value.trim();
  const potreiro = selectedPotrero === "__new__" ? newPotreroName : selectedPotrero;
  const notes = elements.sanitaryNotes.value.trim();

  if (!date || !categoryId || !Number.isFinite(quantity) || quantity < 1 || !product || !potreiro) {
    return;
  }

  if (selectedProduct === "__new__" && !farm.sanitaryProducts.includes(product)) {
    farm.sanitaryProducts.push(product);
  }
  const hasPotrero = getPotreroEntries(farm).some((item) => normalizeText(item.name) === normalizeText(potreiro));
  if (selectedPotrero === "__new__" && !hasPotrero) {
    farm.potreiros.push({
      id: createPotreroId(potreiro),
      name: potreiro,
      quantity: 0
    });
  }

  const recordPayload = {
    date,
    quantity,
    categoryId,
    categoryName: categoryLabel,
    potreiro,
    product,
    notes
  };

  if (editingId) {
    const existingRecord = farm.sanitaryRecords.find((item) => item.id === editingId || item.sourceId === editingId);
    if (existingRecord) {
      Object.assign(existingRecord, recordPayload);
    }
  } else {
    farm.sanitaryRecords.push({
      id: createMovementId(),
      code: generateSanitaryCode(farm),
      farmId: farm.id,
      ...recordPayload
    });
  }

  saveData();
  populateYearFilter();
  elements.sanitaryEditingId.value = "";
  elements.sanitaryQuantity.value = "";
  elements.sanitaryNotes.value = "";
  elements.sanitaryProduct.value = farm.sanitaryProducts[0] || "__new__";
  elements.sanitaryPotrero.value = getPotreroEntries(farm)[0]?.name || "__new__";
  elements.sanitarySubmitButton.textContent = "Salvar registro sanitário";
  updateSanitaryProductMode();
  updateSanitaryPotreroMode();
  render();
}

function handleEditStockSubmit(event) {
  // Legacy stub — replaced by handleSaveStockEdit
  event?.preventDefault();
  const farm = state.data.farms[Object.keys(state.data.farms)[0]];
  if (!farm) {
    return;
  }
  const declaredTotal = Number(elements.editDeclaredTotal.value);
  if (!Number.isFinite(declaredTotal) || declaredTotal < 0) {
    return;
  }

  const categoryRows = [...elements.editStockList.querySelectorAll("[data-category-row]")];
  const seenCategories = new Set();
  for (const row of categoryRows) {
    const categoryId = row.dataset.categoryId;
    const name = row.querySelector("[data-category-name]")?.value.trim() || "";
    const quantity = Number(row.querySelector("[data-category-quantity]")?.value);
    if (!name) {
      alert("Informe o nome de todas as categorias.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      return;
    }
    const normalizedName = normalizeText(name);
    if (seenCategories.has(normalizedName)) {
      alert(`A categoria ${name} foi informada mais de uma vez. Ajuste os nomes para continuar.`);
      return;
    }
    seenCategories.add(normalizedName);

    const category = farm.categories.find((item) => item.id === categoryId);
    if (category) {
      category.name = name;
      category.quantity = quantity;
      farm.movements.forEach((movement) => {
        if (movement.categoryId === category.id) {
          movement.categoryName = name;
        }
      });
      farm.sanitaryRecords.forEach((record) => {
        if (record.categoryId === category.id) {
          record.categoryName = name;
        }
      });
    }
  }

  const potreroRows = [...elements.potreroStockList.querySelectorAll("[data-potrero-row]")];
  const nextPotreiros = [];
  const seenPotreiros = new Set();
  for (const row of potreroRows) {
    const name = row.querySelector("[data-potrero-name]")?.value.trim() || "";
    const quantity = Number(row.querySelector("[data-potrero-quantity]")?.value);
    if (!name) {
      alert("Informe o nome de todos os potreiros cadastrados.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      alert(`Informe uma quantidade válida para o potreiro ${name}.`);
      return;
    }

    const normalizedName = normalizeText(name);
    if (seenPotreiros.has(normalizedName)) {
      alert(`O potreiro ${name} foi informado mais de uma vez. Ajuste os nomes para continuar.`);
      return;
    }

    seenPotreiros.add(normalizedName);
    nextPotreiros.push({
      id: row.dataset.potreroId || createPotreroId(name),
      name,
      quantity: normalizePotreroQuantity(quantity)
    });
  }

  farm.potreiros = nextPotreiros;
  farm.declaredTotal = declaredTotal;
  state.data.selectedFarmId = runtime.editStockContextFarmId === TOTAL_FARM_ID
    ? TOTAL_FARM_ID
    : farm.id;
  saveData();
  elements.editStockDialog.close();
  render();
}

function summarizePeriod(farm, year, month) {
  const summary = {
    totalMovements: 0,
    netChange: 0,
    saldo: 0,
    totalValue: 0,
    adjustPositive: 0,
    adjustNegative: 0,
    saleValue: 0,
    byType: { compra: 0, venda: 0, consumo: 0, nascimento: 0, morte: 0, ajuste: 0, transferencia: 0 }
  };

  farm.movements.forEach((movement) => {
    const movementDate = new Date(movement.date);
    const movementYear = String(movementDate.getFullYear());
    const movementMonth = String(movementDate.getMonth() + 1).padStart(2, "0");
    const matchesYear = movementYear === String(year);
    const matchesMonth = month === "all" || movementMonth === month;
    if (!matchesYear || !matchesMonth) {
      return;
    }

    summary.totalMovements += 1;
    summary.byType[movement.type] += movement.quantity;
    summary.netChange += movement.delta;
    summary.totalValue += Number(movement.value || 0);
    if (movement.type === "venda") {
      summary.saleValue += Number(movement.value || 0);
    }

    if (movement.type === "ajuste") {
      if (movement.delta >= 0) {
        summary.adjustPositive += movement.delta;
      } else {
        summary.adjustNegative += Math.abs(movement.delta);
      }
    }
    if (movement.type === "transferencia") {
      summary.byType.transferencia += movement.quantity;
      summary.totalMovements -= 1; // don't count transfers as stock movements
    }
  });

  summary.saldo = summary.byType.compra + summary.byType.nascimento + summary.adjustPositive
    - summary.byType.venda - summary.byType.consumo - summary.byType.morte - summary.adjustNegative;

  return summary;
}

function getFilteredSanitaryRecords(farm, year = state.filters.year, month = state.filters.month) {
  return farm.sanitaryRecords.filter((record) => {
    const recordDate = new Date(record.date);
    const recordYear = String(recordDate.getFullYear());
    const recordMonth = String(recordDate.getMonth() + 1).padStart(2, "0");
    const matchesYear = recordYear === String(year);
    const matchesMonth = month === "all" || recordMonth === month;
    return matchesYear && matchesMonth;
  });
}

function getPotreroTotals(farm) {
  const totalAnimals = Math.max(getFarmTotal(farm), 1);
  return getPotreroEntries(farm)
    .map((potrero) => {
      const quantity = normalizePotreroQuantity(potrero.quantity);
      return {
        id: potrero.id,
        name: potrero.name,
        farmId: potrero.farmId || (farm.id === TOTAL_FARM_ID ? "" : farm.id),
        farmName: potrero.farmName || (farm.id === TOTAL_FARM_ID ? "" : farm.name),
        quantity,
        share: (quantity / totalAnimals) * 100
      };
    })
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name));
}

function getMovementDelta(type, quantity, adjustDirection) {
  if (type === "ajuste") {
    return adjustDirection === "subtract" ? -quantity : quantity;
  }

  const meta = MOVEMENT_TYPES.find((item) => item.value === type);
  return (meta?.direction || 0) * quantity;
}

function getDiscrepancyText(farm) {
  const computedTotal = getFarmTotal(farm);
  if (!farm.declaredTotal) {
    return `A fazenda ${farm.name} ainda não possui total declarado. O sistema está usando o estoque atual como referência operacional.`;
  }

  const difference = farm.declaredTotal - computedTotal;
  if (difference === 0) {
    return `Inventario alinhado ao total declarado de ${formatInteger(farm.declaredTotal)} animais.`;
  }

  return `Atenção: o total declarado para ${farm.name} é ${formatInteger(farm.declaredTotal)} animais, mas o estoque atual mostra ${formatInteger(computedTotal)}. Diferença de ${formatInteger(difference)} animais.`;
}

function openPdfOptionsDialog() {
  elements.pdfOptionsForm.reset();
  runtime.pdfContextFarmId = state.data.selectedFarmId;
  populatePdfPeriodFilters();
  renderPdfFarmOptions(runtime.pdfContextFarmId === TOTAL_FARM_ID ? getAllFarms().map((farm) => farm.id) : [runtime.pdfContextFarmId]);
  const currentScope = elements.pdfOptionsForm.querySelector('input[name="pdfScope"][value="current"]');
  if (currentScope) {
    currentScope.checked = true;
  }
  updatePdfScopeMode();
  elements.pdfOptionsDialog.showModal();
}

function renderPdfFarmOptions(selectedIds = []) {
  const selected = new Set(selectedIds);
  elements.pdfFarmList.innerHTML = getAllFarms().map((farm) => `
    <label class="user-row pdf-farm-row">
      <input type="checkbox" name="pdfFarmIds" value="${farm.id}" ${selected.has(farm.id) ? "checked" : ""}>
      <div>
        <strong>${escapeHtml(farm.name)}</strong>
        <span>${formatInteger(getFarmTotal(farm))} animais em estoque atualmente</span>
      </div>
      <span class="chip">${formatInteger(farm.movements.length)} mov.</span>
    </label>
  `).join("");
}

function getPdfScopeSelection() {
  return elements.pdfOptionsForm.querySelector('input[name="pdfScope"]:checked')?.value || "current";
}

function updatePdfScopeMode() {
  const scope = getPdfScopeSelection();
  elements.pdfFarmList.hidden = scope !== "custom";

  if (scope === "custom" && !elements.pdfFarmList.querySelector('input[name="pdfFarmIds"]:checked')) {
    const currentFarmId = runtime.pdfContextFarmId !== TOTAL_FARM_ID ? runtime.pdfContextFarmId : state.data.selectedFarmId;
    const currentFarmInput = elements.pdfFarmList.querySelector(`input[name="pdfFarmIds"][value="${currentFarmId}"]`);
    if (currentFarmInput) {
      currentFarmInput.checked = true;
    }
  }
}

function getSelectedPdfFarmIds() {
  const scope = getPdfScopeSelection();
  if (scope === "all") {
    return getAllFarms().map((farm) => farm.id);
  }

  if (scope === "custom") {
    return [...elements.pdfFarmList.querySelectorAll('input[name="pdfFarmIds"]:checked')].map((input) => input.value);
  }

  const currentFarmId = runtime.pdfContextFarmId || state.data.selectedFarmId;
  if (currentFarmId === TOTAL_FARM_ID) {
    return getAllFarms().map((farm) => farm.id);
  }

  return [currentFarmId];
}

function getPdfPeriodSelection() {
  return {
    year: elements.pdfYearFilter.value || state.filters.year,
    month: elements.pdfMonthFilter.value || state.filters.month
  };
}

function handlePdfOptionsSubmit(event) {
  event.preventDefault();
  const farmIds = getSelectedPdfFarmIds();
  const period = getPdfPeriodSelection();

  if (!farmIds.length) {
    alert("Selecione pelo menos uma fazenda para gerar o PDF.");
    return;
  }

  elements.pdfOptionsDialog.close();
  exportPdfReport(farmIds, period);
}

async function addPdfHeader(doc, farm, periodLabel, monthly) {
  try {
    const imageData = await loadLogoForPdf("#ffffff");
    doc.addImage(imageData, "JPEG", 14, 10, 22, 22);
  } catch (error) {
    console.warn("Não foi possível carregar o logo para o PDF.", error);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Estabelecimentos Da Luz", 42, 18);
  doc.setFontSize(15);
  doc.text(`Relatório Pecuário - ${farm.name}`, 42, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Período analisado: ${periodLabel}`, 42, 33);
  doc.text(`Responsável técnico: ${TECHNICAL_MANAGER_NAME}`, 42, 39);
  doc.text(`Movimentações no período: ${formatInteger(monthly.totalMovements)}`, 14, 50);
  doc.text(`Saldo do período: ${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`, 92, 50);
  return 56;
}

function getPdfPageSize(doc) {
  return {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight()
  };
}

function drawPdfPastureBackground(doc) {
  const { width, height } = getPdfPageSize(doc);
  doc.setFillColor(27, 77, 47);
  doc.rect(0, 0, width, height, "F");

  doc.setFillColor(38, 96, 57);
  doc.rect(0, height * 0.44, width, height * 0.56, "F");

  doc.setFillColor(73, 126, 66);
  doc.ellipse(width * 0.14, height * 0.88, width * 0.26, height * 0.16, "F");
  doc.ellipse(width * 0.52, height * 0.84, width * 0.34, height * 0.17, "F");
  doc.ellipse(width * 0.9, height * 0.87, width * 0.28, height * 0.16, "F");

  doc.setFillColor(106, 156, 82);
  doc.ellipse(width * 0.3, height * 0.96, width * 0.34, height * 0.13, "F");
  doc.ellipse(width * 0.73, height * 0.97, width * 0.36, height * 0.14, "F");

  doc.setDrawColor(181, 214, 161);
  doc.setLineWidth(0.8);
  doc.line(0, height * 0.63, width, height * 0.63);
}

async function appendPdfCoverPage(doc, farms, periodLabel) {
  const { width, height } = getPdfPageSize(doc);
  const scopeLabel = farms.length === 1
    ? farms[0].name
    : farms.length === getAllFarms().length
      ? "Todas as fazendas"
      : `${formatInteger(farms.length)} fazendas selecionadas`;

  drawPdfPastureBackground(doc);

  doc.setFillColor(247, 241, 229);
  doc.circle(width / 2, 96, 28, "F");

  try {
    const imageData = await loadLogoForPdf("#f7f1e5");
    doc.addImage(imageData, "JPEG", (width / 2) - 19, 77, 38, 38);
  } catch (error) {
    console.warn("Não foi possível carregar o logo para a capa do PDF.", error);
  }

  doc.setTextColor(248, 244, 236);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Painel Pecuário", width / 2, 142, { align: "center" });
  doc.setFontSize(12);
  doc.text("Estabelecimentos Da Luz", width / 2, 151, { align: "center" });

  doc.setDrawColor(225, 232, 214);
  doc.setLineWidth(0.7);
  doc.line(58, 162, width - 58, 162);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(scopeLabel, width / 2, 174, { align: "center" });
  doc.text(`Período analisado: ${periodLabel}`, width / 2, 183, { align: "center" });
  doc.text(`Responsável técnico: ${TECHNICAL_MANAGER_NAME}`, width / 2, 192, { align: "center" });

  doc.setFontSize(9.5);
  doc.setTextColor(230, 239, 223);
  doc.text("Relatório gerencial com consolidado, movimentações, sanitário e dados mensais.", width / 2, height - 26, { align: "center" });
}

function appendFarmDividerPage(doc, farm, periodLabel, year, month, sectionIndex, sectionCount) {
  const { width, height } = getPdfPageSize(doc);
  const monthly = summarizePeriod(farm, year, month);
  const sanitarySummary = getSanitarySummary(farm, year, month);
  const monthlySummary = getMonthlySummary(farm, year, month);
  const registeredPotreiros = getPotreroEntries(farm).length;

  doc.setFillColor(242, 238, 228);
  doc.rect(0, 0, width, height, "F");

  doc.setFillColor(37, 88, 58);
  doc.rect(0, 0, width, 58, "F");

  doc.setTextColor(248, 244, 236);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Fazenda ${sectionIndex} de ${sectionCount}`, 16, 18);
  doc.setFontSize(24);
  doc.text(farm.name, 16, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Período analisado: ${periodLabel}`, 16, 46);

  doc.setTextColor(45, 35, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Separação de fazenda", 16, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("As próximas páginas detalham o estoque, o comercial, o sanitário e os dados mensais desta unidade.", 16, 89, {
    maxWidth: width - 32
  });

  const cards = [
    { label: "Estoque atual", value: `${formatInteger(getFarmTotal(farm))} animais` },
    { label: "Movimentações", value: formatInteger(monthly.totalMovements) },
    { label: "Potreiros cadastrados", value: formatInteger(registeredPotreiros) },
    { label: "Registros sanitários", value: formatInteger(sanitarySummary.totalApplications) },
    { label: "Dados mensais", value: formatInteger(monthlySummary.count) },
    { label: "Valor atribuído", value: formatCurrency(monthlySummary.totalValue) }
  ];

  const left = 16;
  const gap = 8;
  const cardWidth = (width - (left * 2) - gap) / 2;
  const cardHeight = 34;
  let y = 108;

  cards.forEach((card, index) => {
    const column = index % 2;
    if (index > 0 && column === 0) {
      y += cardHeight + 8;
    }

    const x = left + (column * (cardWidth + gap));
    doc.setFillColor(255, 252, 245);
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "F");
    doc.setDrawColor(219, 209, 191);
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(87, 69, 52);
    doc.text(card.label, x + 6, y + 12);
    doc.setFontSize(13);
    doc.setTextColor(38, 66, 48);
    doc.text(card.value, x + 6, y + 23);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(112, 94, 76);
  doc.text("Painel Pecuário | separação por fazenda no relatório consolidado", 16, height - 18);
}

function addPdfFooters(doc, options = {}) {
  const { coverPage = false } = options;
  const pageCount = doc.getNumberOfPages();
  const firstFooterPage = coverPage ? 2 : 1;
  const visiblePageCount = coverPage ? Math.max(pageCount - 1, 0) : pageCount;

  for (let page = firstFooterPage; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(220, 209, 193);
    doc.line(14, 286, 196, 286);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(112, 94, 76);
    doc.text(`Estabelecimentos Da Luz | Responsável técnico: ${TECHNICAL_MANAGER_NAME}`, 14, 291);
    doc.text(`Página ${coverPage ? page - 1 : page} de ${visiblePageCount}`, 196, 291, { align: "right" });
    doc.setTextColor(45, 35, 25);
  }
}

function appendExecutivePdfTable(doc, farm, monthly, discrepancy, topY) {
  const registeredPotreiros = getPotreroEntries(farm).length;
  const registeredAnimals = getRegisteredPotreroAnimals(farm);
  const potreroBalance = getPotreroBalance(farm);
  const total = getFarmTotal(farm);
  const annualForMortality = summarizePeriod(farm, String(new Date().getFullYear()), "all");
  const mortalityRate = total > 0 ? ((annualForMortality.byType.morte / total) * 100).toFixed(2) : "0.00";
  doc.autoTable({
    startY: topY + 4,
    head: [["Indicador executivo", "Valor"]],
    body: [
      ["Estoque atual", `${formatInteger(total)} animais`],
      ["Total declarado", farm.declaredTotal ? `${formatInteger(farm.declaredTotal)} animais` : "Não informado"],
      ["Conferência de estoque", discrepancy === 0 ? "Alinhado" : `${discrepancy > 0 ? "+" : ""}${formatInteger(discrepancy)} animais`],
      ["Taxa de mortalidade (ano)", `${mortalityRate}%`],
      ["Potreiros cadastrados", formatInteger(registeredPotreiros)],
      ["Animais distribuídos em potreiros", `${formatInteger(registeredAnimals)} animais`],
      ["Saldo da distribuição", potreroBalance === 0 ? "Alinhado" : `${potreroBalance > 0 ? "+" : ""}${formatInteger(potreroBalance)} animais`],
      ["Movimentações no período", formatInteger(monthly.totalMovements)],
      ["Saldo do período", `${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`],
      ["Responsável técnico", TECHNICAL_MANAGER_NAME]
    ],
    theme: "striped",
    headStyles: { fillColor: [76, 64, 50] }
  });
}

function appendInventoryPdfTable(doc, farm) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Categoria", "Quantidade"]],
    body: farm.categories.map((category) => [category.name, formatInteger(category.quantity)]),
    theme: "grid",
    headStyles: { fillColor: [51, 92, 67] }
  });
}

function appendOperationalPdfTable(doc, monthly, annual, saleSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador", "Valor"]],
    body: [
      ["Compras no período", formatInteger(monthly.byType.compra)],
      ["Vendas no período", formatInteger(monthly.byType.venda)],
      ["Faturamento de vendas", formatCurrency(saleSummary.totalValue)],
      ["Consumo no período", formatInteger(monthly.byType.consumo)],
      ["Nascimentos no período", formatInteger(monthly.byType.nascimento)],
      ["Mortes no período", formatInteger(monthly.byType.morte)],
      ["Movimentações no ano", formatInteger(annual.totalMovements)],
      ["Valor anual movimentado", annual.totalValue ? formatCurrency(annual.totalValue) : "Sem valor informado"]
    ],
    theme: "striped",
    headStyles: { fillColor: [138, 75, 56] }
  });
}

function appendSaleSummaryPdfTable(doc, saleSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador comercial", "Valor"]],
    body: [
      ["Vendas registradas", formatInteger(saleSummary.count)],
      ["Faturamento total", formatCurrency(saleSummary.totalValue)],
      ["Kg vivo negociado", formatWeight(saleSummary.liveKg)],
      ["Kg carcaça negociado", formatWeight(saleSummary.carcassKg)],
      ["Preço médio kg vivo", saleSummary.liveKg > 0 ? formatCurrency(saleSummary.totalValue / saleSummary.liveKg) : formatCurrency(0)]
    ],
    theme: "striped",
    headStyles: { fillColor: [201, 140, 79] }
  });
}

function appendSaleDetailsPdfTable(doc, saleSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Categoria", "Base", "Kg", "R$/kg", "Total", "Fotos"]],
    body: saleSummary.movements.length
      ? saleSummary.movements.map((movement) => [
        formatDate(movement.date),
        movement.categoryName,
        movement.saleDetails ? getSaleModeLabel(movement.saleDetails.mode || "vivo") : "Relatório mensal",
        movement.saleDetails ? formatWeight(movement.saleDetails.weightKg || 0) : "-",
        movement.saleDetails ? formatCurrency(movement.saleDetails.pricePerKg || 0) : "-",
        formatCurrency(movement.value || 0),
        formatMovementPhotoCount(movement)
      ])
      : [["-", "-", "-", "-", "-", "Sem vendas no período", "-"]],
    theme: "striped",
    headStyles: { fillColor: [201, 140, 79] }
  });
}

function appendPurchaseSummaryPdfTable(doc, purchaseSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador de compras", "Valor"]],
    body: [
      ["Compras registradas", formatInteger(purchaseSummary.count)],
      ["Animais adquiridos", formatInteger(purchaseSummary.totalAnimals)],
      ["Custo total de aquisição", formatCurrency(purchaseSummary.totalValue)],
      ["Custo médio por animal", purchaseSummary.totalAnimals > 0 ? formatCurrency(purchaseSummary.totalValue / purchaseSummary.totalAnimals) : formatCurrency(0)]
    ],
    theme: "striped",
    headStyles: { fillColor: [79, 115, 168] }
  });
}

function appendPurchaseDetailsPdfTable(doc, purchaseSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Categoria", "Qtd.", "Custo total", "Custo/cab.", "Observações"]],
    body: purchaseSummary.movements.length
      ? purchaseSummary.movements.map((movement) => {
        const qty = Number(movement.quantity || 0);
        const val = Number(movement.value || 0);
        return [
          formatDate(movement.date),
          movement.categoryName || "-",
          formatInteger(qty),
          formatCurrency(val),
          qty > 0 ? formatCurrency(val / qty) : "-",
          movement.notes || "-"
        ];
      })
      : [["-", "-", "-", "-", "-", "Sem compras no período"]],
    theme: "striped",
    headStyles: { fillColor: [79, 115, 168] }
  });
}

function appendFinancialBalancePdfTable(doc, saleSummary, purchaseSummary) {
  const saldo = saleSummary.totalValue - purchaseSummary.totalValue;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Resultado financeiro do período", "Valor"]],
    body: [
      ["Receita de vendas", formatCurrency(saleSummary.totalValue)],
      ["Custo de compras", formatCurrency(purchaseSummary.totalValue)],
      ["Resultado líquido", `${saldo >= 0 ? "+" : ""}${formatCurrency(saldo)}`]
    ],
    theme: "striped",
    headStyles: { fillColor: [55, 91, 67] },
    bodyStyles: (row) => row.index === 2 ? { fontStyle: "bold" } : {}
  });
}

function appendPotreroPdfTable(doc, potreroTotals) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Potreiro", "Animais atuais", "% do rebanho"]],
    body: potreroTotals.length
      ? potreroTotals.map((item) => [item.name, formatInteger(item.quantity), `${item.share.toFixed(1)}%`])
      : [["Sem cadastro", "0", "0,0%"]],
    theme: "striped",
    headStyles: { fillColor: [55, 91, 67] }
  });
}

function appendMonthlySummaryPdfTable(doc, monthlySummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador mensal", "Valor"]],
    body: [
      ["Registros no período", formatInteger(monthlySummary.count)],
      ["Quantidade informada", formatInteger(monthlySummary.totalQuantity)],
      ["Valor atribuído", formatCurrency(monthlySummary.totalValue)],
      ["Categorias ativas", formatInteger(monthlySummary.activeCategories)]
    ],
    theme: "striped",
    headStyles: { fillColor: [111, 95, 77] }
  });
}

function appendMonthlyDetailsPdfTable(doc, farm, monthlyRecords) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Competência", "Categoria", "Indicador", "Qtd.", "Valor", "Observações"]],
    body: monthlyRecords.length
      ? monthlyRecords.map((record) => [
        formatMonthYear(record.period),
        getMonthlyCategoryLabel(record.category),
        record.farmName && farm.id === TOTAL_FARM_ID ? `${record.farmName} | ${record.title}` : record.title,
        record.quantity ? formatInteger(record.quantity) : "-",
        record.value ? formatCurrency(record.value) : "-",
        record.notes || "-"
      ])
      : [["-", "-", "Sem dados mensais no período", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [111, 95, 77] }
  });
}

function appendSanitarySummaryPdfTable(doc, sanitarySummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador sanitário", "Valor"]],
    body: [
      ["Aplicações no período", formatInteger(sanitarySummary.totalApplications)],
      ["Animais tratados", formatInteger(sanitarySummary.treatedAnimals)],
      ["Produtos utilizados", formatInteger(sanitarySummary.uniqueProducts)],
      ["Potreiros utilizados", formatInteger(sanitarySummary.uniquePotreiros)],
      ["Último manejo", sanitarySummary.latestRecord ? `${formatDate(sanitarySummary.latestRecord.date)} - ${sanitarySummary.latestRecord.product}` : "Sem registro"]
    ],
    theme: "striped",
    headStyles: { fillColor: [55, 91, 67] }
  });
}

function appendSanitaryDetailsPdfTable(doc, sanitaryRecords) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Categoria", "Qtd.", "Potreiro", "Produto", "Observações"]],
    body: sanitaryRecords.length
      ? sanitaryRecords.map((record) => [
        formatDate(record.date),
        record.categoryName,
        formatMaybeQuantity(record.quantity),
        record.potreiro || "-",
        record.product,
        record.notes || "-"
      ])
      : [["-", "-", "-", "-", "Sem registros sanitários no período", "-"]],
    theme: "striped",
    headStyles: { fillColor: [55, 91, 67] }
  });
}

function appendInsightsPdfTable(doc, insights) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Insight gerencial", "Leitura"]],
    body: insights.map((item) => [item.tag, item.text]),
    theme: "striped",
    headStyles: { fillColor: [76, 64, 50] }
  });
}

function appendRecentMovementsPdfTable(doc, recentMovements) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Tipo", "Categoria", "Qtd.", "Valor", "Fotos", "Observação"]],
    body: recentMovements.length
      ? recentMovements.map((movement) => [
        formatDate(movement.date),
        capitalize(movement.type),
        movement.categoryName,
        formatInteger(movement.quantity),
        movement.value ? formatCurrency(movement.value) : "-",
        formatMovementPhotoCount(movement),
        getMovementNotes(movement)
      ])
      : [["-", "-", "-", "-", "-", "-", "Sem movimentações recentes"]],
    theme: "striped",
    headStyles: { fillColor: [138, 75, 56] }
  });
}

function appendUnifiedHistoryPdfTable(doc, records) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Código", "Data", "Operação", "Categoria", "Qtd.", "Registro"]],
    body: records.length
      ? records.map((record) => [
        getHistoryRecordCode(record),
        formatDate(record.date),
        getHistoryOperationLabel(record.operation),
        record.categoryName,
        formatInteger(record.quantity),
        record.details || "-"
      ])
      : [["-", "-", "-", "-", "-", "Sem registros no histórico do período"]],
    theme: "striped",
    headStyles: { fillColor: [138, 75, 56] }
  });
}

async function appendMovementPhotoPages(doc, farm, year, month) {
  const photoEntries = getMovementPhotoEntries(farm, year, month);
  if (!photoEntries.length) {
    return;
  }

  const chunkSize = 3;
  for (let index = 0; index < photoEntries.length; index += chunkSize) {
    const chunk = photoEntries.slice(index, index + chunkSize);
    doc.addPage();

    doc.setFillColor(248, 244, 236);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(45, 35, 25);
    doc.text(`Anexos fotográficos - ${farm.name}`, 105, 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(112, 94, 76);
    doc.text("Até 3 fotos por página, centralizadas para leitura e impressão.", 105, 25, { align: "center" });

    for (let chunkIndex = 0; chunkIndex < chunk.length; chunkIndex++) {
      const entry = chunk[chunkIndex];
      const boxX = 22;
      const boxY = 34 + (chunkIndex * 80);
      const boxWidth = 166;
      const boxHeight = 68;

      doc.setFillColor(255, 252, 247);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5, "F");
      doc.setDrawColor(219, 209, 191);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(50, 74, 55);
      doc.text(`${capitalize(entry.movement.type)} | ${formatDate(entry.movement.date)} | ${entry.movement.categoryName}`, 105, boxY + 10, { align: "center" });

      const imageData = await fetchPhotoForPdf(entry.photo);
      if (imageData) {
        drawPdfMovementPhoto(doc, imageData, boxX + 8, boxY + 14, boxWidth - 16, 40);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(112, 94, 76);
      doc.text(trimLabel(entry.photo.name || `Foto ${index + chunkIndex + 1}`, 44), 105, boxY + 60, { align: "center" });
      doc.text(trimLabel(getMovementNotes(entry.movement) || "Sem observação", 74), 105, boxY + 65, { align: "center" });
    }
  }
}

function appendConsolidatedPdfIntro(doc, farms, periodLabel, year, month) {
  const totals = farms.reduce((summary, farm) => {
    const monthly = summarizePeriod(farm, year, month);
    const saleSummary = summarizeSalePeriod(farm, year, month);
    const sanitarySummary = getSanitarySummary(farm, year, month);
    const monthlySummary = getMonthlySummary(farm, year, month);
    summary.animals += getFarmTotal(farm);
    summary.allocatedAnimals += getRegisteredPotreroAnimals(farm);
    summary.potreiros += getPotreroEntries(farm).length;
    summary.movements += monthly.totalMovements;
    summary.salesValue += saleSummary.totalValue;
    summary.sanitaryRecords += sanitarySummary.totalApplications;
    summary.monthlyRecords += monthlySummary.count;
    summary.monthlyValue += monthlySummary.totalValue;
    return summary;
  }, { animals: 0, allocatedAnimals: 0, potreiros: 0, movements: 0, salesValue: 0, sanitaryRecords: 0, monthlyRecords: 0, monthlyValue: 0 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Estabelecimentos Da Luz", 14, 18);
  doc.setFontSize(16);
  doc.text("Relatório consolidado de fazendas", 14, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Período analisado: ${periodLabel}`, 14, 36);
  doc.text(`Responsável técnico: ${TECHNICAL_MANAGER_NAME}`, 14, 42);

  doc.autoTable({
    startY: 50,
    head: [["Indicador consolidado", "Valor"]],
    body: [
      ["Fazendas selecionadas", formatInteger(farms.length)],
      ["Estoque consolidado", `${formatInteger(totals.animals)} animais`],
      ["Potreiros cadastrados", formatInteger(totals.potreiros)],
      ["Animais alocados em potreiros", `${formatInteger(totals.allocatedAnimals)} animais`],
      ["Movimentações no período", formatInteger(totals.movements)],
      ["Dados mensais no período", formatInteger(totals.monthlyRecords)],
      ["Valor mensal atribuído", formatCurrency(totals.monthlyValue)],
      ["Faturamento de vendas", formatCurrency(totals.salesValue)],
      ["Registros sanitários", formatInteger(totals.sanitaryRecords)]
    ],
    theme: "striped",
    headStyles: { fillColor: [76, 64, 50] }
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Fazenda", "Estoque", "Potreiros", "Alocados", "Mov.", "Dados", "Valor mensal", "Vendas", "Sanitário"]],
    body: farms.map((farm) => {
      const monthly = summarizePeriod(farm, year, month);
      const saleSummary = summarizeSalePeriod(farm, year, month);
      const sanitarySummary = getSanitarySummary(farm, year, month);
      const monthlySummary = getMonthlySummary(farm, year, month);
      return [
        farm.name,
        formatInteger(getFarmTotal(farm)),
        formatInteger(getPotreroEntries(farm).length),
        formatInteger(getRegisteredPotreroAnimals(farm)),
        formatInteger(monthly.totalMovements),
        formatInteger(monthlySummary.count),
        formatCurrency(monthlySummary.totalValue),
        formatCurrency(saleSummary.totalValue),
        formatInteger(sanitarySummary.totalApplications)
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [51, 92, 67] },
    styles: { fontSize: 8.5, cellPadding: 2 }
  });
}

async function appendFarmPdfSection(doc, farm, periodLabel, year, month) {
  const monthly = summarizePeriod(farm, year, month);
  const annual = summarizePeriod(farm, year, "all");
  const saleSummary = summarizeSalePeriod(farm, year, month);
  const purchaseSummary = summarizePurchasePeriod(farm, year, month);
  const sanitarySummary = getSanitarySummary(farm, year, month);
  const sanitaryRecords = [...getFilteredSanitaryRecords(farm, year, month)].sort((a, b) => new Date(a.date) - new Date(b.date));
  const monthlySummary = getMonthlySummary(farm, year, month);
  const monthlyRecords = [...monthlySummary.records].sort((a, b) => a.period < b.period ? 1 : -1);
  const potreroTotals = getPotreroTotals(farm);
  const unifiedHistory = getUnifiedHistoryRecords(farm, { scope: "single" }).filter((record) => {
    if (!record.date || !String(record.date).startsWith(String(year))) return false;
    if (month === "all") return true;
    return String(record.date).slice(5, 7) === String(month).padStart(2, "0");
  }).slice(0, 50);
  const insights = getOperationalInsights(farm, year, month);
  const discrepancy = getDiscrepancy(farm);
  const topY = await addPdfHeader(doc, farm, periodLabel, monthly);

  appendExecutivePdfTable(doc, farm, monthly, discrepancy, topY);
  appendInventoryPdfTable(doc, farm);
  appendOperationalPdfTable(doc, monthly, annual, saleSummary);
  appendFinancialBalancePdfTable(doc, saleSummary, purchaseSummary);
  appendSaleSummaryPdfTable(doc, saleSummary);
  appendSaleDetailsPdfTable(doc, saleSummary);
  appendPurchaseSummaryPdfTable(doc, purchaseSummary);
  appendPurchaseDetailsPdfTable(doc, purchaseSummary);
  appendPotreroPdfTable(doc, potreroTotals);
  appendMonthlySummaryPdfTable(doc, monthlySummary);
  appendMonthlyDetailsPdfTable(doc, farm, monthlyRecords);
  appendSanitarySummaryPdfTable(doc, sanitarySummary);
  appendSanitaryDetailsPdfTable(doc, sanitaryRecords);
  appendInsightsPdfTable(doc, insights);
  appendUnifiedHistoryPdfTable(doc, unifiedHistory);
  await appendMovementPhotoPages(doc, farm, year, month);
}

async function exportSanitaryPdfReport() {
  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    alert("A biblioteca de PDF não foi carregada. Verifique sua conexão e tente novamente.");
    return;
  }

  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const farms = isTotalView ? getAllFarms() : [getFarm()].filter(Boolean);
  if (!farms.length) {
    alert("Nenhuma fazenda válida encontrada.");
    return;
  }

  const { jsPDF } = window.jspdf;

  for (const farm of farms) {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    await appendSanitaryPdfReport(doc, farm);
    const periodSuffix = state.filters.month === "all"
      ? state.filters.year
      : `${state.filters.year}-${state.filters.month}`;
    doc.save(`manejo-sanitario-${slugify(farm.name)}-${periodSuffix}.pdf`);
  }
}

async function appendSanitaryPdfReport(doc, farm) {
  const year = state.filters.year;
  const month = state.filters.month;
  const periodLabel = month === "all"
    ? `Ano ${year}`
    : `${MONTH_NAMES[Number(month) - 1]}/${year}`;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header
  try {
    const logoData = await loadLogoForPdf("#ffffff");
    doc.addImage(logoData, "JPEG", margin, 8, 18, 18);
  } catch (e) { /* ignore */ }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório de Manejo Sanitário", margin + 22, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Fazenda: ${farm.name}   Período: ${periodLabel}`, margin + 22, 20);
  doc.text(`Responsável técnico: ${TECHNICAL_MANAGER_NAME}`, margin + 22, 26);

  // Divider
  doc.setDrawColor(55, 91, 67);
  doc.setLineWidth(0.6);
  doc.line(margin, 30, pageW - margin, 30);

  // Summary stats
  const { totalApplications, treatedAnimals, uniqueProducts } = getSanitarySummary(farm);
  const records = getFilteredSanitaryRecords(farm).sort((a, b) => new Date(b.date) - new Date(a.date));

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 91, 67);
  doc.text(`Aplicações: ${totalApplications}`, margin, 37);
  doc.text(`Animais tratados: ${treatedAnimals}`, margin + 50, 37);
  doc.text(`Produtos distintos: ${uniqueProducts}`, margin + 110, 37);
  doc.text(`Total de registros: ${records.length}`, margin + 170, 37);
  doc.setTextColor(0, 0, 0);

  // Table
  let y = 44;
  const colW = [
    (pageW - 2 * margin) * 0.09,
    (pageW - 2 * margin) * 0.07,
    (pageW - 2 * margin) * 0.14,
    (pageW - 2 * margin) * 0.06,
    (pageW - 2 * margin) * 0.17,
    (pageW - 2 * margin) * 0.14,
    (pageW - 2 * margin) * 0.33
  ];
  const headers = ["Código", "Data", "Categoria", "Qtd.", "Produto", "Potreiro", "Observações"];
  const rowH = 8;

  // Table header
  doc.setFillColor(55, 91, 67);
  doc.rect(margin, y, pageW - 2 * margin, rowH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5.5);
    x += colW[i];
  });
  y += rowH;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  records.forEach((record, idx) => {
    if (y + rowH > pageH - 12) {
      doc.addPage();
      y = 14;
      doc.setFillColor(55, 91, 67);
      doc.rect(margin, y, pageW - 2 * margin, rowH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      x = margin;
      headers.forEach((h, i) => { doc.text(h, x + 2, y + 5.5); x += colW[i]; });
      y += rowH;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }

    if (idx % 2 === 0) {
      doc.setFillColor(245, 240, 230);
      doc.rect(margin, y, pageW - 2 * margin, rowH, "F");
    }

    doc.setFontSize(7.5);
    const cells = [
      record.code || (record.sourceId?.startsWith("xls-san-") ? `IMP-${getFarmCodePrefix(farm.id)}` : "—"),
      formatDate(record.date),
      record.categoryName || "—",
      String(record.quantity || "—"),
      record.product || "—",
      record.potreiro || "—",
      record.notes || ""
    ];

    x = margin;
    cells.forEach((cell, i) => {
      const maxW = colW[i] - 4;
      const text = doc.splitTextToSize(String(cell), maxW)[0] || "";
      doc.text(text, x + 2, y + 5.5);
      x += colW[i];
    });

    doc.setDrawColor(220, 210, 195);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, pageW - margin, y + rowH);
    y += rowH;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150, 130, 100);
    doc.text(`Página ${i} de ${pageCount}`, pageW - margin, pageH - 6, { align: "right" });
    doc.text(`Estabelecimentos Da Luz · Manejo Sanitário · ${periodLabel}`, margin, pageH - 6);
  }
}

function getPdfFileName(farms, year, month) {
  const periodSuffix = month === "all" ? year : `${year}-${month}`;
  if (farms.length === 1) {
    return `relatorio-${slugify(farms[0].name)}-${periodSuffix}.pdf`;
  }

  return `relatorio-fazendas-da-luz-${periodSuffix}.pdf`;
}

async function exportPdfReport(farmIds = [state.data.selectedFarmId], period = { year: state.filters.year, month: state.filters.month }) {
  const farms = farmIds.map((farmId) => state.data.farms[farmId]).filter(Boolean);
  if (!farms.length) {
    alert("Nenhuma fazenda válida foi selecionada para o PDF.");
    return;
  }

  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    alert("A biblioteca de PDF não foi carregada. Verifique sua conexão e tente novamente.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  if (typeof doc.autoTable !== "function") {
    alert("O módulo de tabela do PDF não foi carregado. Verifique sua conexão e tente novamente.");
    return;
  }

  const year = String(period.year || state.filters.year);
  const month = period.month || state.filters.month;
  const periodLabel = month === "all" ? `Ano de ${year}` : `${MONTH_NAMES[Number(month) - 1]} de ${year}`;

  await appendPdfCoverPage(doc, farms, periodLabel);

  if (farms.length > 1) {
    doc.addPage();
    appendConsolidatedPdfIntro(doc, farms, periodLabel, year, month);
  }

  for (const [index, farm] of farms.entries()) {
    doc.addPage();
    appendFarmDividerPage(doc, farm, periodLabel, year, month, index + 1, farms.length);
    doc.addPage();
    await appendFarmPdfSection(doc, farm, periodLabel, year, month);
  }

  addPdfFooters(doc, { coverPage: true });

  doc.save(getPdfFileName(farms, year, month));
}

function cloneSeedData() {
  if (typeof structuredClone === "function") {
    return structuredClone(seedData);
  }

  return JSON.parse(JSON.stringify(seedData));
}

function ensureDataShape(data, options = {}) {
  const preserveSnapshot = Boolean(options.preserveSnapshot);
  if (!data.farms || typeof data.farms !== "object") {
    data.farms = {};
  }

  if (typeof data.selectedFarmId !== "string") {
    data.selectedFarmId = TOTAL_FARM_ID;
  }

  if (!data.auth || typeof data.auth !== "object") {
    data.auth = cloneDeep(seedData.auth);
  }
  if (!Array.isArray(data.auth.users) || !data.auth.users.length) {
    data.auth.users = cloneDeep(seedData.auth.users);
  }
  if (typeof data.auth.sessionUserId !== "string") {
    data.auth.sessionUserId = "";
  }
  data.auth.users = data.auth.users.map((user, index) => ({
    id: user.id || `user-${index + 1}`,
    login: user.login || `Usuário ${index + 1}`,
    password: user.password || "",
    role: user.role || "usuario"
  }));
  data.auth.users = data.auth.users.map((user) => {
    if (user.id === "user-da-luz") {
      return {
        ...user,
        login: user.login || "Hugo Balbuena",
        password: user.password || "hugo123",
        role: user.role || "admin"
      };
    }

    return user;
  });
  // Migrate users without roles — first user is admin, rest are usuario
  data.auth.users.forEach((user, index) => {
    if (!user.role) {
      user.role = index === 0 ? "admin" : "usuario";
    }
  });
  if (!data.auth.users.some((user) => user.id === data.auth.sessionUserId)) {
    data.auth.sessionUserId = "";
  }

  Object.entries(seedData.farms).forEach(([farmId, farmTemplate]) => {
    if (!data.farms[farmId]) {
      data.farms[farmId] = cloneDeep(farmTemplate);
    }
  });

  if (data.selectedFarmId !== TOTAL_FARM_ID && !data.farms[data.selectedFarmId]) {
    data.selectedFarmId = TOTAL_FARM_ID;
  }

  Object.values(data.farms).forEach((farm) => {
    if (!Array.isArray(farm.categories)) {
      farm.categories = [];
    }
    if (!Array.isArray(farm.movements)) {
      farm.movements = [];
    }
    if (!Array.isArray(farm.sanitaryRecords)) {
      farm.sanitaryRecords = [];
    }
    if (!Array.isArray(farm.monthlyRecords)) {
      farm.monthlyRecords = [];
    }
    if (!Array.isArray(farm.sanitaryProducts) || !farm.sanitaryProducts.length) {
      farm.sanitaryProducts = [...DEFAULT_SANITARY_PRODUCTS];
    }
    farm.importedBaselineVersion = Number(farm.importedBaselineVersion || 0);
    if (!Array.isArray(farm.potreiros)) {
      farm.potreiros = normalizePotreroEntries([], DEFAULT_POTREIROS);
    } else {
      farm.potreiros = normalizePotreroEntries(farm.potreiros);
    }
    STANDARD_FARM_CATEGORIES.forEach((template) => {
      if (!farm.categories.some((category) => category.id === template.id)) {
        farm.categories.push({ ...template, quantity: 0 });
      }
    });
    farm.categories.forEach((category) => {
      if (!category.allocation || typeof category.allocation !== "object") {
        category.allocation = { [UNALLOCATED_POTREIRO_KEY]: Number(category.quantity || 0) };
      }
    });
    farm.sanitaryRecords = farm.sanitaryRecords.map((record) => ({
      ...record,
      id: record.id || record.sourceId || createMovementId(),
      code: record.code || "",
      potreiro: record.potreiro || "Sem potreiro"
    }));
    if (typeof farm.sanitaryCodeSequence !== "number") {
      farm.sanitaryCodeSequence = farm.sanitaryRecords.filter((r) => !r.sourceId).length;
    }
    farm.movements = farm.movements.map((movement) => ({
      ...movement,
      id: movement.id || movement.sourceId || createMovementId(),
      code: movement.code || "",
      sourceId: movement.sourceId || "",
      quantity: Number(movement.quantity || 0),
      delta: Number(movement.delta || 0),
      value: Number(movement.value || 0),
      notes: movement.notes || "",
      photos: normalizeMovementPhotos(movement.photos),
      saleDetails: movement.saleDetails
        ? {
          mode: movement.saleDetails.mode || "vivo",
          pricePerKg: Number(movement.saleDetails.pricePerKg || 0),
          weightKg: Number(movement.saleDetails.weightKg || 0)
        }
        : null
    }));
    ensureSanitaryCodesForFarm(farm);
    ensureMovementCodesForFarm(farm);
    farm.monthlyRecords = farm.monthlyRecords.map((record) => ({
      id: record.id || createMovementId(),
      sourceId: record.sourceId || "",
      period: record.period || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
      category: record.category || "outros",
      title: record.title || "Indicador mensal",
      quantity: Number(record.quantity || 0),
      value: Number(record.value || 0),
      notes: record.notes || ""
    }));
    pruneLegacyPotreiros(farm);
    applyImportedFarmBaseline(farm);
  });

  // Always apply sanitary imports — idempotent (sourceId check prevents duplicates)
  Object.entries(IMPORTED_SANITARY_RECORDS).forEach(([farmId, records]) => {
    const farm = data.farms[farmId];
    if (!farm) {
      return;
    }

    records.forEach((record) => {
      if (!farm.sanitaryRecords.some((item) => item.sourceId === record.sourceId)) {
        farm.sanitaryRecords.push({
          ...record,
          id: record.sourceId || createMovementId(),
          potreiro: record.potreiro || "Sem potreiro"
        });
      }
      if (!farm.sanitaryProducts.includes(record.product)) {
        farm.sanitaryProducts.push(record.product);
      }
      if (record.potreiro && !getPotreroEntries(farm).some((item) => normalizeText(item.name) === normalizeText(record.potreiro))) {
        farm.potreiros.push({
          id: createPotreroId(record.potreiro),
          name: record.potreiro,
          quantity: 0
        });
      }
    });
  });

  Object.values(data.farms).forEach((farm) => {
    ensureSanitaryCodesForFarm(farm);
    ensureMovementCodesForFarm(farm);
  });

  if (!preserveSnapshot) {
    const allMonthlyRecords = { ...IMPORTED_MONTHLY_RECORDS };
    Object.entries(EXTENDED_MONTHLY_RECORDS).forEach(([farmId, records]) => {
      if (!allMonthlyRecords[farmId]) allMonthlyRecords[farmId] = [];
      allMonthlyRecords[farmId] = [...allMonthlyRecords[farmId], ...records];
    });

    Object.entries(allMonthlyRecords).forEach(([farmId, records]) => {
      const farm = data.farms[farmId];
      if (!farm) {
        return;
      }

      records.forEach((record) => {
        if (!farm.monthlyRecords.some((item) => item.sourceId === record.sourceId)) {
          farm.monthlyRecords.push({
            ...record,
            id: createMovementId()
          });
        }
      });
    });

    const needsMovementUpdate = (data.commercialMovementsVersion || 0) < COMMERCIAL_MOVEMENTS_VERSION;
    Object.entries(IMPORTED_COMMERCIAL_MOVEMENTS).forEach(([farmId, movements]) => {
      const farm = data.farms[farmId];
      if (!farm) {
        return;
      }

      movements.forEach((movement) => {
        const existingIdx = farm.movements.findIndex((item) => item.sourceId === movement.sourceId);
        if (existingIdx === -1) {
          farm.movements.push({
            ...movement,
            id: movement.sourceId || createMovementId()
          });
        } else if (needsMovementUpdate) {
          // Update existing movement with corrected values (e.g. USD→BRL conversion)
          farm.movements[existingIdx] = {
            ...farm.movements[existingIdx],
            value: movement.value,
            notes: movement.notes,
            saleDetails: movement.saleDetails || farm.movements[existingIdx].saleDetails
          };
        }
      });
    });
    data.commercialMovementsVersion = COMMERCIAL_MOVEMENTS_VERSION;
  }

  return data;
}

function applyImportedFarmBaseline(farm) {
  const imported = IMPORTED_FARM_BASELINES[farm.id];
  if (!imported || farm.importedBaselineVersion >= IMPORTED_FARM_BASELINE_VERSION) {
    return;
  }
  if (!isPlaceholderInventory(farm)) {
    return;
  }

  farm.declaredTotal = Number(imported.declaredTotal || 0);
  farm.note = imported.note || farm.note;
  farm.categories = imported.categories.map((category) => ({
    id: category.id || slugify(category.name || "categoria"),
    name: category.name || "Categoria",
    quantity: Number(category.quantity || 0)
  }));
  farm.importedBaselineVersion = IMPORTED_FARM_BASELINE_VERSION;
}

function isPlaceholderInventory(farm) {
  const categories = Array.isArray(farm.categories) ? farm.categories : [];
  const hasAnyCategoryValue = categories.some((category) => Number(category.quantity || 0) > 0);
  const usesOnlyStandardCategories = categories.every((category) => STANDARD_FARM_CATEGORIES.some((template) => template.id === category.id));
  const hasOperationalHistory = (farm.movements?.length || 0) > 0
    || getPotreroEntries(farm).some((potrero) => normalizePotreroQuantity(potrero.quantity) > 0);
  const normalizedNote = normalizeText(farm.note || "");

  return !hasAnyCategoryValue
    && !hasOperationalHistory
    && usesOnlyStandardCategories
    && Number(farm.declaredTotal || 0) === 0
    && (!normalizedNote || normalizedNote.includes("estrutura pronta para receber o inventario inicial"));
}

function cloneDeep(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

const assetDataUrlCache = new Map();

function createMovementId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `mov-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLinearColor(canvas, startColor, endColor) {
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height || 320);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  return gradient;
}

function createRadialColor(canvas, color, index) {
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    16,
    canvas.width / 2,
    canvas.height / 2,
    (canvas.width / 2) + (index * 2)
  );
  gradient.addColorStop(0, lightenColor(color, 0.18));
  gradient.addColorStop(1, color);
  return gradient;
}

function centerTextPlugin(getText) {
  return {
    id: "centerTextPlugin",
    afterDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || !meta.data.length) {
        return;
      }

      const text = getText();
      const point = meta.data[0];
      const { ctx } = chart;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#2d2319";
      ctx.font = "700 28px Yrsa";
      ctx.fillText(text.title, point.x, point.y - 10);
      ctx.fillStyle = "#7a6754";
      ctx.font = "600 12px Manrope";
      ctx.fillText(trimLabel(text.subtitle, 24), point.x, point.y + 18);
      ctx.restore();
    }
  };
}

function drawChartFallback(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const width = Math.max(canvas.clientWidth || 0, 320);
  const height = Math.max(canvas.clientHeight || 0, 320);
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f5ede1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#776552";
  context.font = "16px Manrope";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(message, canvas.width / 2, canvas.height / 2);
}

function showStartupError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const target = document.querySelector(".page-shell");
  if (!target) {
    return;
  }

  target.innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Falha na inicialização</p>
          <h2>O painel encontrou um erro ao abrir</h2>
        </div>
      </div>
      <div class="note-box">
        Verifique a conexão com a internet e recarregue a página. Detalhe técnico: ${escapeHtml(message)}
      </div>
    </section>
  `;
}

async function loadLogoForPdf(bgColor = "#ffffff") {
  const cacheKey = `logo-bg-${bgColor}`;
  if (assetDataUrlCache.has(cacheKey)) return assetDataUrlCache.get(cacheKey);

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Falha ao carregar logo PNG"));
    el.src = PDF_LOGO_PATH;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 256;
  canvas.height = img.naturalHeight || 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  assetDataUrlCache.set(cacheKey, dataUrl);
  return dataUrl;
}

async function loadAssetAsDataUrl(path) {
  if (assetDataUrlCache.has(path)) {
    return assetDataUrlCache.get(path);
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Falha ao carregar asset: ${path}`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Falha ao converter asset em base64: ${path}`));
    reader.readAsDataURL(blob);
  });

  assetDataUrlCache.set(path, dataUrl);
  return dataUrl;
}

function normalizeMovementPhotos(photos) {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .filter((photo) => photo && (
      (typeof photo.url === "string" && photo.url.startsWith("https://")) ||
      (typeof photo.dataUrl === "string" && photo.dataUrl.startsWith("data:image/"))
    ))
    .map((photo, index) => ({
      id: photo.id || `photo-${index + 1}`,
      name: String(photo.name || `Foto ${index + 1}`),
      caption: String(photo.caption || ""),
      mimeType: String(photo.mimeType || (photo.dataUrl ? getDataUrlMimeType(photo.dataUrl) : "image/jpeg")),
      url: photo.url || null,
      dataUrl: photo.dataUrl || null
    }));
}

function getDataUrlMimeType(dataUrl = "") {
  const match = String(dataUrl).match(/^data:([^;]+);/i);
  return match ? match[1] : "image/jpeg";
}

function getDataUrlImageFormat(dataUrl = "") {
  const mimeType = getDataUrlMimeType(dataUrl).toLowerCase();
  if (mimeType.includes("png")) {
    return "PNG";
  }
  if (mimeType.includes("webp")) {
    return "WEBP";
  }
  return "JPEG";
}

function getMovementPhotoCount(movement) {
  return normalizeMovementPhotos(movement?.photos).length;
}

function formatMovementPhotoCount(movement) {
  const count = getMovementPhotoCount(movement);
  return count ? `${formatInteger(count)} ${count === 1 ? "foto" : "fotos"}` : "-";
}

function getMovementPhotoFlagMarkup(movement) {
  const count = getMovementPhotoCount(movement);
  if (!count) {
    return "";
  }

  return `<span class="photo-flag">${formatInteger(count)} ${count === 1 ? "foto" : "fotos"}</span>`;
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Falha ao ler o arquivo ${file?.name || ""}.`));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao preparar a imagem selecionada."));
    image.src = dataUrl;
  });
}

async function normalizePhotoDataUrlForPdf(dataUrl) {
  if (!dataUrl) {
    return null;
  }

  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Falha ao preparar a imagem para o PDF.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.9);
}

async function uploadToCloudinary(blob, fileName) {
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "painel-pecuario");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary: ${err}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function fetchPhotoForPdf(photo) {
  if (photo.dataUrl) {
    return await normalizePhotoDataUrlForPdf(photo.dataUrl);
  }
  if (!photo.url) {
    return null;
  }
  try {
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const originalDataUrl = await readFileAsDataUrl(blob);
    return await normalizePhotoDataUrlForPdf(originalDataUrl);
  } catch (error) {
    console.warn("Não foi possível carregar a foto do servidor para o PDF.", error);
    return null;
  }
}

async function createMovementPhotoAttachment(file) {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageFromDataUrl(originalDataUrl);
  const scale = Math.min(1, MOVEMENT_PHOTO_MAX_DIMENSION / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Falha ao preparar a imagem para o lançamento.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const fileName = file.name || `foto-${Date.now()}.jpg`;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", MOVEMENT_PHOTO_QUALITY));
  const url = await uploadToCloudinary(blob, fileName);

  return {
    id: createMovementId(),
    name: fileName,
    caption: "Anexo do lançamento",
    mimeType: "image/jpeg",
    url
  };
}

function movementMatchesPeriod(movement, year, month) {
  const [movementYear = "", movementMonth = ""] = String(movement.date || "").split("-");
  if (!movementYear || !movementMonth) {
    return false;
  }
  return movementYear === String(year) && (month === "all" || movementMonth === month);
}

function getMovementPhotoEntries(farm, year, month) {
  return farm.movements
    .filter((movement) => movementMatchesPeriod(movement, year, month) && movementTypeSupportsPhotos(movement.type) && getMovementPhotoCount(movement) > 0)
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .flatMap((movement) => normalizeMovementPhotos(movement.photos).map((photo, index) => ({
      movement,
      photo,
      sequence: index + 1
    })));
}

function drawPdfMovementPhoto(doc, dataUrl, x, y, maxWidth, maxHeight) {
  try {
    const imageFormat = getDataUrlImageFormat(dataUrl);
    const properties = doc.getImageProperties(dataUrl);
    const ratio = Math.min(maxWidth / properties.width, maxHeight / properties.height);
    const width = properties.width * ratio;
    const height = properties.height * ratio;
    const originX = x + ((maxWidth - width) / 2);
    const originY = y + ((maxHeight - height) / 2);
    doc.addImage(dataUrl, imageFormat, originX, originY, width, height);
  } catch (error) {
    console.warn("Não foi possível incluir uma foto no PDF.", error);
    doc.setDrawColor(219, 209, 191);
    doc.rect(x, y, maxWidth, maxHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(112, 94, 76);
    doc.text("Imagem indisponível", x + (maxWidth / 2), y + (maxHeight / 2), { align: "center" });
    doc.setTextColor(45, 35, 25);
  }
}

function formatInteger(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value || 0);
}

function formatMaybeQuantity(value) {
  return Number.isFinite(value) ? formatInteger(value) : "?";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function formatWeight(value) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value || 0);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${dateString}T00:00:00`));
}

function formatMonthYear(period) {
  const [year, month] = String(period || "").split("-");
  const monthIndex = Number(month) - 1;
  if (!year || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return period || "-";
  }

  return `${MONTH_NAMES[monthIndex]}/${year}`;
}

function getCategoryImage(categoryName) {
  const normalized = normalizeText(categoryName);
  if (normalized.includes("touro")) {
    return CATEGORY_VISUALS.touro;
  }
  if (normalized.includes("terneir") || normalized.includes("novilh")) {
    return CATEGORY_VISUALS.terneiro;
  }
  if (normalized.includes("vaca") || normalized.includes("boi")) {
    return CATEGORY_VISUALS.vaca;
  }
  return CATEGORY_VISUALS.rebanho;
}

function getCategoryFamily(categoryName) {
  const normalized = normalizeText(categoryName);
  if (normalized.includes("touro")) {
    return "Reprodutores";
  }
  if (normalized.includes("terneir")) {
    return "Terneiros";
  }
  if (normalized.includes("novilh")) {
    return "Novilhas";
  }
  if (normalized.includes("boi")) {
    return "Abate";
  }
  if (normalized.includes("vaca")) {
    return "Matrizes";
  }
  return "Rebanho";
}

function trimLabel(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function lightenColor(hexColor, amount) {
  const hex = hexColor.replace("#", "");
  const color = Number.parseInt(hex, 16);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const nextR = Math.min(255, Math.round(r + ((255 - r) * amount)));
  const nextG = Math.min(255, Math.round(g + ((255 - g) * amount)));
  const nextB = Math.min(255, Math.round(b + ((255 - b) * amount)));
  return `rgb(${nextR}, ${nextG}, ${nextB})`;
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ── Backup / Restore ─────────────────────────────────────────────────────────

function getLastBackupDate() {
  const stored = localStorage.getItem(BACKUP_DATE_KEY);
  return stored ? new Date(stored) : null;
}

function getDaysSinceBackup() {
  const last = getLastBackupDate();
  if (!last) return null;
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function markBackupDone() {
  localStorage.setItem(BACKUP_DATE_KEY, new Date().toISOString());
}

function exportBackup() {
  const snapshot = JSON.parse(JSON.stringify(state.data));
  snapshot.auth = { ...snapshot.auth, sessionUserId: "" };

  const payload = {
    sistema: "Painel Pecuário Da Luz",
    versao: 2,
    dataBackup: new Date().toISOString(),
    dados: snapshot
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const dateTag = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `backup-painel-pecuario-${dateTag}.json`;
  anchor.click();
  URL.revokeObjectURL(url);

  markBackupDone();
  alert(`Backup realizado com sucesso!\nArquivo: backup-painel-pecuario-${dateTag}.json\nGuarde em local seguro (Drive, pen drive, etc).`);
}

async function handleRestoreFile(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  const confirmed = confirm(
    "Restaurar o backup vai substituir TODOS os dados atuais do sistema.\n\nTem certeza que deseja continuar?"
  );
  if (!confirmed) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (!payload.dados || !payload.dados.farms || !payload.dados.auth) {
      alert("Arquivo inválido. Este não parece ser um backup do Painel Pecuário.");
      return;
    }

    const restored = ensureDataShape(payload.dados, { preserveSnapshot: true });
    const currentSessionUserId = state.data.auth.sessionUserId;
    restored.selectedFarmId = TOTAL_FARM_ID;
    restored.auth.sessionUserId = restored.auth.users.some((user) => user.id === currentSessionUserId)
      ? currentSessionUserId
      : "";

    state.data = restored;
    saveData();
    markBackupDone();
    renderAuthState();
    initializeAppShell();
    render();
    alert(`Backup restaurado com sucesso!\nData do backup: ${payload.dataBackup ? new Date(payload.dataBackup).toLocaleString("pt-BR") : "desconhecida"}`);
  } catch (error) {
    console.error("Falha ao restaurar backup.", error);
    alert("Não foi possível restaurar o backup. Verifique se o arquivo está correto.");
  }
}

function checkBackupWarning() {
  const days = getDaysSinceBackup();
  const neverDid = days === null;

  if (!neverDid && days < BACKUP_WARN_DAYS) return;

  if (neverDid) {
    elements.backupWarningTitle.textContent = "Nenhum backup realizado";
    elements.backupWarningMessage.textContent =
      "Você ainda não fez nenhum backup dos dados do sistema. Em caso de problema no navegador, todos os registros podem ser perdidos. Faça um backup agora.";
  } else {
    elements.backupWarningTitle.textContent = `Backup há ${days} dias`;
    elements.backupWarningMessage.textContent =
      `O último backup foi realizado há ${days} dias. Recomendamos fazer backup a cada ${BACKUP_WARN_DAYS} dias para proteger seus dados.`;
  }

  elements.backupWarningDialog.showModal();
}
