export function calcReproStats(records) {
  if (!Array.isArray(records)) {
    return { totalInsem: 0, totalEntour: 0, totalPrenha: 0, totalFalhada: 0, taxa: 0, aguardando: 0 };
  }

  const verified = records.filter((record) => record.verificationDate);
  const totalInsem = records.filter((record) => record.type === "inseminacao").reduce((sum, record) => sum + (record.quantity || 0), 0);
  const totalEntour = records.filter((record) => record.type === "entourada").reduce((sum, record) => sum + (record.quantity || 0), 0);
  const totalPrenha = verified.reduce((sum, record) => sum + (record.quantityPegou || 0), 0);
  const totalFalhada = verified.reduce((sum, record) => sum + (record.quantityFalhou || 0), 0);
  const totalVerifBase = verified.reduce((sum, record) => sum + (record.quantity || 0), 0);
  const taxa = totalVerifBase > 0 ? Math.round((totalPrenha / totalVerifBase) * 100) : 0;
  const aguardando = records.filter((record) => !record.verificationDate).reduce((sum, record) => sum + (record.quantity || 0), 0);

  return { totalInsem, totalEntour, totalPrenha, totalFalhada, taxa, aguardando };
}

export function calcStockTotal(farm) {
  if (!farm || !Array.isArray(farm.categories)) return 0;
  return farm.categories.reduce((sum, category) => sum + (category.quantity || 0), 0);
}

export function fmtDate(iso) {
  if (!iso) return "-";
  const parts = String(iso).split("T")[0].split("-");
  if (parts.length < 3) return String(iso);
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function fmtTime(value) {
  if (!value) return "-";
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  if (!match) return String(value);
  return `${match[1]}:${match[2]}`;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function currentTimeHM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export const FARM_PREFIXES = {
  arapey: "A",
  colorado: "C",
  sarandi: "S",
  "passa-da-guarda": "PG",
  chiquita: "CH",
};

export function getFarmPrefix(farmId) {
  return FARM_PREFIXES[farmId] || (farmId || "X").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "X";
}

export function createUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function generateRepCode(farm) {
  farm.reproductionCodeSequence = (farm.reproductionCodeSequence || 0) + 1;
  const prefix = getFarmPrefix(farm.id);
  return `REP-${prefix}-${String(farm.reproductionCodeSequence).padStart(5, "0")}`;
}

export function generateSanCode(farm) {
  farm.sanitaryCodeSequence = (farm.sanitaryCodeSequence || 0) + 1;
  const prefix = getFarmPrefix(farm.id);
  return `SAN-${prefix}-${String(farm.sanitaryCodeSequence).padStart(5, "0")}`;
}

export function generateMovCode(farm) {
  farm.movementCodeSequence = (farm.movementCodeSequence || 0) + 1;
  const prefix = getFarmPrefix(farm.id);
  return `${prefix}${String(farm.movementCodeSequence).padStart(5, "0")}`;
}
