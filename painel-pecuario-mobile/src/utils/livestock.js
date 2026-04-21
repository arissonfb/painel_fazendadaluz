const STANDARD_FARM_CATEGORIES = [
  { id: "vacas-cria", name: "Vacas de cria" },
  { id: "terneiros-machos", name: "Terneiros 1 a 2 anos - machos" },
  { id: "terneiros-femeas", name: "Terneiros 1 a 2 anos - femeas" },
  { id: "bois-abate", name: "Bois de abate" },
  { id: "novilhas-entouradas", name: "Novilhas entouradas" },
  { id: "touros", name: "Touros" },
  { id: "vacas-invernar", name: "Vacas de invernar" },
  { id: "vacas-entouradas", name: "Vacas entouradas" },
];

const DEFAULT_SANITARY_PRODUCTS = [
  "Vacina aftosa",
  "Brucelose",
  "Clostridiose",
  "Raiva",
  "Botulismo",
  "Leptospirose",
  "IBR/BVD",
  "Carbunculo",
  "Vermifugo",
  "Ivermectina",
  "Abamectina",
  "Moxidectina",
  "Closantel",
  "Fluazuron",
  "Amitraz",
  "Fipronil",
  "Potenty",
  "Exolt",
  "Fortik 4",
  "Nexlander",
  "Flok",
  "Dueto",
  "Insemax",
];

export const MOVEMENT_TYPES = [
  { value: "compra", label: "Compra", direction: 1, accent: "#375b43" },
  { value: "venda", label: "Venda", direction: -1, accent: "#8c4b38" },
  { value: "consumo", label: "Consumo", direction: -1, accent: "#c98c4f" },
  { value: "nascimento", label: "Nascimento", direction: 1, accent: "#4CAF50" },
  { value: "morte", label: "Morte", direction: -1, accent: "#795548" },
  { value: "ajuste", label: "Ajuste manual", direction: 0, accent: "#5b8db8" },
  { value: "transferencia", label: "Transferencia entre potreiros", direction: 0, accent: "#9C27B0" },
];

export const MOVEMENT_REFERENCE_PRESETS = {
  compra: {
    title: "Registrar compra",
    detailTitle: "Detalhes da compra",
    categories: ["Reposicao", "Bois de abate", "Novilhas", "Terneiros", "Touros", "Vacas"],
  },
  venda: {
    title: "Registrar venda",
    detailTitle: "Detalhes da venda",
    categories: ["Bois gordos", "Novilhas", "Terneiros", "Vacas descarte", "Touros"],
  },
  nascimento: {
    title: "Registrar nascimento",
    detailTitle: "Detalhes do nascimento",
    categories: ["Terneiros machos", "Terneiros femeas"],
  },
  morte: {
    title: "Registrar morte",
    detailTitle: "Detalhes da morte",
    categories: ["Vacas", "Terneiros", "Touros", "Novilhas", "Bois"],
  },
  consumo: {
    title: "Registrar consumo",
    detailTitle: "Detalhes do consumo",
    categories: ["Consumo interno", "Abate proprio", "Transferencia externa"],
  },
  ajuste: {
    title: "Registrar ajuste",
    detailTitle: "Detalhes do ajuste",
    categories: ["Correcao inventario", "Recontagem", "Baixa administrativa"],
  },
  transferencia: {
    title: "Registrar transferencia",
    detailTitle: "Detalhes da transferencia",
    categories: ["Transferencia de lote"],
  },
};

export const REPRODUCTION_CATEGORIES = [
  "Vaca de cria",
  "Vaca solteira",
  "Vaca falhada",
  "Vaca de invernar",
  "Vaquilhona 1 e 2 anos",
  "Novilhas",
];

export const SANITARY_VIAS = [
  "Subcutanea",
  "Intramuscular",
  "Oral",
  "Topica",
  "Intravenosa",
  "Pour-on",
  "Outra",
];

export const MEDIA_SUPPORTED_MOVEMENT_TYPES = new Set(["compra", "venda", "morte", "consumo", "ajuste"]);

export function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeFarmReferences(farm) {
  if (!farm || typeof farm !== "object") return farm;

  if (!Array.isArray(farm.categories) || !farm.categories.length) {
    farm.categories = STANDARD_FARM_CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      quantity: 0,
    }));
  } else {
    farm.categories = farm.categories.map((category, index) => ({
      id: category?.id || slugify(category?.name || `categoria-${index + 1}`),
      name: category?.name || `Categoria ${index + 1}`,
      quantity: Number(category?.quantity || 0),
    }));
  }

  const uniqueProducts = new Set(DEFAULT_SANITARY_PRODUCTS);
  if (Array.isArray(farm.sanitaryProducts)) {
    farm.sanitaryProducts.forEach((product) => {
      if (product) uniqueProducts.add(String(product));
    });
  }
  farm.sanitaryProducts = Array.from(uniqueProducts);

  if (!Array.isArray(farm.potreiros)) {
    farm.potreiros = [];
  }

  farm.potreiros = farm.potreiros
    .map((potreiro, index) => {
      if (typeof potreiro === "string") {
        return {
          id: slugify(potreiro) || `potreiro-${index + 1}`,
          name: potreiro,
          quantity: 0,
        };
      }

      return {
        id: potreiro?.id || slugify(potreiro?.name || `potreiro-${index + 1}`),
        name: potreiro?.name || `Potreiro ${index + 1}`,
        quantity: Number(potreiro?.quantity || 0),
      };
    })
    .filter((potreiro, index, list) => list.findIndex((item) => item.id === potreiro.id) === index);

  farm.movements = Array.isArray(farm.movements)
    ? farm.movements.map((movement) => ({
        ...movement,
        attachments: Array.isArray(movement.attachments) ? movement.attachments : [],
      }))
    : [];

  farm.sanitaryRecords = Array.isArray(farm.sanitaryRecords)
    ? farm.sanitaryRecords.map((record) => ({
        ...record,
        attachments: Array.isArray(record.attachments) ? record.attachments : [],
      }))
    : [];

  farm.reproductionRecords = Array.isArray(farm.reproductionRecords) ? farm.reproductionRecords : [];

  if (typeof farm.reproductionCodeSequence !== "number") {
    farm.reproductionCodeSequence = farm.reproductionRecords.length;
  }

  if (typeof farm.sanitaryCodeSequence !== "number") {
    farm.sanitaryCodeSequence = farm.sanitaryRecords.length;
  }

  if (typeof farm.movementCodeSequence !== "number") {
    farm.movementCodeSequence = farm.movements.length;
  }

  return farm;
}

export function getFarmCategoryOptions(farm, extraLabels = []) {
  const seen = new Set();
  const items = [];

  (farm?.categories || []).forEach((category) => {
    const name = String(category?.name || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ value: category.id || slugify(name), label: name, source: "farm" });
  });

  extraLabels.forEach((label) => {
    const name = String(label || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ value: slugify(name), label: name, source: "preset" });
  });

  return items;
}

export function getFarmPotreiroOptions(farm) {
  return (farm?.potreiros || []).map((potreiro) => ({
    value: potreiro.id,
    label: potreiro.name,
  }));
}

export function ensureCategoryRecord(farm, categoryName, fallbackId) {
  const cleanName = String(categoryName || "").trim();
  if (!cleanName) return null;

  const normalized = cleanName.toLowerCase();
  let category = (farm.categories || []).find((item) => String(item.name || "").trim().toLowerCase() === normalized);
  if (!category) {
    category = {
      id: fallbackId || slugify(cleanName),
      name: cleanName,
      quantity: 0,
    };
    farm.categories.push(category);
  }
  return category;
}

export function calculateMovementDelta(record) {
  const quantity = Number(record?.quantity || 0);
  const meta = MOVEMENT_TYPES.find((item) => item.value === record?.type);
  if (!meta) return 0;
  if (meta.value === "ajuste") {
    return Number(record?.delta ?? 0);
  }
  if (meta.value === "transferencia") {
    return 0;
  }
  return quantity * meta.direction;
}

export function applyMovementToFarm(farm, record, multiplier = 1) {
  if (!farm || !record) return;
  const category = ensureCategoryRecord(farm, record.categoryName, record.categoryId);
  if (!category) return;
  const delta = calculateMovementDelta(record) * multiplier;
  category.quantity = Math.max(0, Number(category.quantity || 0) + delta);
}

export function upsertMovementInData(payload, nextRecord, previousRecord = null) {
  const farms = payload?.farms || [];
  const nextFarm = farms.find((farm) => farm.id === nextRecord.farmId);
  if (!nextFarm) {
    throw new Error("Fazenda nao encontrada para salvar a movimentacao.");
  }

  if (previousRecord) {
    const previousFarm = farms.find((farm) => farm.id === previousRecord.farmId);
    if (previousFarm) {
      previousFarm.movements = (previousFarm.movements || []).filter((item) => item.id !== previousRecord.id);
      applyMovementToFarm(previousFarm, previousRecord, -1);
    }
  }

  nextFarm.movements = nextFarm.movements || [];
  const existingIndex = nextFarm.movements.findIndex((item) => item.id === nextRecord.id);
  if (existingIndex >= 0) {
    nextFarm.movements[existingIndex] = nextRecord;
  } else {
    nextFarm.movements.push(nextRecord);
  }
  applyMovementToFarm(nextFarm, nextRecord, 1);
}

export function deleteMovementFromData(payload, record) {
  const farm = payload?.farms?.find((item) => item.id === record?.farmId);
  if (!farm) return;
  farm.movements = (farm.movements || []).filter((item) => item.id !== record.id);
  applyMovementToFarm(farm, record, -1);
}

export function formatMovementTypeLabel(type) {
  return MOVEMENT_TYPES.find((item) => item.value === type)?.label || type || "Movimentacao";
}

export function getMovementSummary(records) {
  const summary = {
    compra: 0,
    venda: 0,
    nascimento: 0,
    morte: 0,
    consumo: 0,
    ajuste: 0,
    transferencia: 0,
    saldo: 0,
  };

  (records || []).forEach((record) => {
    if (summary[record.type] !== undefined) {
      summary[record.type] += Number(record.quantity || 0);
    }
    summary.saldo += calculateMovementDelta(record);
  });

  return summary;
}
