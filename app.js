const STORAGE_KEY = "painelPecuario.v2";
const MOVEMENT_TYPES = [
  { value: "compra", label: "Compra", direction: 1 },
  { value: "venda", label: "Venda", direction: -1 },
  { value: "consumo", label: "Consumo", direction: -1 },
  { value: "nascimento", label: "Nascimento", direction: 1 },
  { value: "morte", label: "Morte", direction: -1 },
  { value: "ajuste", label: "Ajuste manual", direction: 0 }
];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
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
  { id: "terneiros-femeas", name: "Terneiros 1 a 2 anos - femeas" },
  { id: "bois-abate", name: "Bois de abate" },
  { id: "novilhas-entouradas", name: "Novilhas entouradas" },
  { id: "touros", name: "Touros" },
  { id: "vacas-invernar", name: "Vacas de invernar" },
  { id: "vacas-entouradas", name: "Vacas entouradas" }
];

const DEFAULT_SANITARY_PRODUCTS = ["Vacina aftosa", "Vermifugo", "Ivermectina"];
const DEFAULT_POTREIROS = [];
const LEGACY_POTREIRO_PLACEHOLDERS = ["Potreiro 1", "Potreiro 2", "Potreiro Norte"];
const PREMIUM_SALE_FARMS = new Set(["arapey", "chiquita"]);
const TOTAL_FARM_ID = "total";
const PDF_LOGO_PATH = "./assets/logo-da-luz.jpg";
const TECHNICAL_MANAGER_NAME = "Hugo Fabricio Fernandes Balbuena";
const DEFAULT_USERS = [
  { id: "user-da-luz", login: "Hugo Balbuena", password: "hugo123" }
];

const IMPORTED_SANITARY_RECORDS = {
  arapey: [
    { sourceId: "img-sanitario-2025-12-01-chacra10-touros", date: "2025-12-01", quantity: 75, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra do 10", product: "Nexlander", notes: "" },
    { sourceId: "img-sanitario-2025-11-29-laspampas-terneiras", date: "2025-11-29", quantity: 74, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Las Pampas", product: "Fluron Gold", notes: "" },
    { sourceId: "img-sanitario-2025-11-27-molino-bois-pre-gordo", date: "2025-11-27", quantity: 66, categoryId: "bois-pre-gordo", categoryName: "Bois pre gordo", potreiro: "Molino", product: "Insemax", notes: "" },
    { sourceId: "img-sanitario-2025-11-27-tapera-terneiras", date: "2025-11-27", quantity: null, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Tapera", product: "Carbeson", notes: "Faltou conta." },
    { sourceId: "img-sanitario-2025-11-27-campo7-vaca-primipara", date: "2025-11-27", quantity: null, categoryId: "vaca-primipara", categoryName: "Vaca primipara", potreiro: "Campo 7", product: "Carbeson", notes: "Faltou conta. Campo 3 e 7 se juntaram no 7 / ficou 265 vacas primiparas." },
    { sourceId: "img-sanitario-2025-10-25-campo10e1-vacas-parindo", date: "2025-10-25", quantity: 176, categoryId: "vacas-parindo", categoryName: "Vacas parindo", potreiro: "Campo 10 e 1", product: "FC 30 + Amitraz + ABA 1%", notes: "166 terneiros + 9 touros." },
    { sourceId: "img-sanitario-2025-11-20-campo8-vacas-cria", date: "2025-11-20", quantity: 253, categoryId: "vacas-cria", categoryName: "Vacas cria", potreiro: "Campo 8", product: "FC 30 + Amitraz + ABA 1%", notes: "238 terneiros + 9 touros." },
    { sourceId: "img-sanitario-2025-11-19-campo7-vacas-cria", date: "2025-11-19", quantity: 111, categoryId: "vacas-cria", categoryName: "Vacas cria", potreiro: "Campo 7", product: "FC 30 + Amitraz + ABA 1%", notes: "92 terneiros." },
    { sourceId: "img-sanitario-2025-11-17-cerrillada-terneiros", date: "2025-11-17", quantity: 392, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "Nexlander", notes: "685 total + 1 vaca cria." },
    { sourceId: "img-sanitario-2025-11-17-cerrillada-novilhos", date: "2025-11-17", quantity: 294, categoryId: "novilhos", categoryName: "Novilhos", potreiro: "Cerrillada", product: "Nexlander", notes: "" },
    { sourceId: "img-sanitario-2025-11-17-campo6-vaca-de-cria", date: "2025-11-17", quantity: 109, categoryId: "vaca-de-cria", categoryName: "Vaca de cria", potreiro: "Campo 6", product: "FC 30 + Amitraz + ABA 1%", notes: "48 terneiros 3 touros." },
    { sourceId: "img-sanitario-2025-11-17-campo5-vaca-plantel", date: "2025-11-17", quantity: 138, categoryId: "vaca-plantel", categoryName: "Vaca plantel", potreiro: "Campo 5", product: "FC 30 + Amitraz + ABA 1%", notes: "146 terneiros 5 touros." },
    { sourceId: "img-sanitario-2025-11-13-chacra10-touros", date: "2025-11-13", quantity: 75, categoryId: "touros", categoryName: "Touros", potreiro: "Chacra 10", product: "Fluron Gold + Iver 4%", notes: "" },
    { sourceId: "img-sanitario-2025-11-11-campo2-terneiras", date: "2025-11-11", quantity: 372, categoryId: "terneiras", categoryName: "Terneiras", potreiro: "Campo 2", product: "FC 30 + Abamectina 1% + Levamisol", notes: "Foram para Tapera / faltou 2." },
    { sourceId: "img-sanitario-2025-11-11-campo3-vacas", date: "2025-11-11", quantity: 154, categoryId: "vacas", categoryName: "Vacas", potreiro: "Campo 3", product: "FC 30 + Abamectina 1%", notes: "151 terneiros 5 touros." },
    { sourceId: "img-sanitario-2025-11-10-costa-vacas-solteiras", date: "2025-11-10", quantity: 211, categoryId: "vacas-solteiras", categoryName: "Vacas solteiras", potreiro: "Costa", product: "FC 30", notes: "Toque / sairam 12 prenha." },
    { sourceId: "img-sanitario-2025-11-10-pedreira-vaquillons", date: "2025-11-10", quantity: 361, categoryId: "vaquillons", categoryName: "Vaquillons", potreiro: "Pedreira", product: "FC 30", notes: "Toque / todas vazias." },
    { sourceId: "img-sanitario-2025-11-04-cerrillada-novilhos", date: "2025-11-04", quantity: 283, categoryId: "novilhos", categoryName: "Novilhos", potreiro: "Cerrillada", product: "FC 30 + Levamisol + Flok 1%", notes: "Total 681 - faltam 2." },
    { sourceId: "img-sanitario-2025-11-04-cerrillada-terneiros", date: "2025-11-04", quantity: 398, categoryId: "terneiros", categoryName: "Terneiros", potreiro: "Cerrillada", product: "FC 30 + Levamisol + Flok 1%", notes: "" },
    { sourceId: "img-sanitario-2025-10-31-pedreira-rincon-vaquillonas", date: "2025-10-31", quantity: 396, categoryId: "vaquillonas", categoryName: "Vaquillonas", potreiro: "Pedreira (Rincon)", product: "Furius + Flok 1%", notes: "Faltaria 1." },
    { sourceId: "img-sanitario-2025-10-31-costa-rincon-vacas-solteiras", date: "2025-10-31", quantity: 186, categoryId: "vacas-solteiras", categoryName: "Vacas solteiras", potreiro: "Costa (Rincon)", product: "Furius + Flok 1%", notes: "2 a mais do lote." },
    { sourceId: "img-sanitario-2025-10-30-tapera-rincon-vacas-invernada", date: "2025-10-30", quantity: 60, categoryId: "vacas-invernada", categoryName: "Vacas invernada", potreiro: "Tapera (Rincon)", product: "Maximo", notes: "Observacao da imagem: 3 esta com cria ao pe; 2 sao arrena." },
    { sourceId: "img-sanitario-2025-10-30-molino-rincon-bois-pre-gordo", date: "2025-10-30", quantity: 66, categoryId: "bois-pre-gordo", categoryName: "Bois pre gordo", potreiro: "Molino (Rincon)", product: "Maximo + Moxidectina", notes: "3 estao no 4." },
    { sourceId: "img-sanitario-2025-10-30-laspampas-terneiros-0-1", date: "2025-10-30", quantity: 74, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Las Pampas", product: "Furius + Flok 1%", notes: "Morreu 1." },
    { sourceId: "img-sanitario-2025-10-29-cerrillada-terneiros-0-1", date: "2025-10-29", quantity: 396, categoryId: "terneiros-0-1", categoryName: "Terneiros 0-1", potreiro: "Cerrillada", product: "Furius + Iver + Nitroxinil", notes: "" }
  ]
};

const seedData = {
  selectedFarmId: "arapey",
  auth: {
    sessionUserId: "",
    users: DEFAULT_USERS.map((user) => ({ ...user }))
  },
  farms: {
    arapey: {
      id: "arapey",
      name: "Arapey",
      declaredTotal: 3015,
      note: "Controle inicial carregado com os grupos informados e ajuste de conferencia para manter o total declarado.",
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
        { id: "ajuste-inicial", name: "Ajuste inicial de conferencia", quantity: 20 }
      ],
      movements: [],
      sanitaryRecords: []
    },
    chiquita: {
      ...createStandardFarm("chiquita", "Chiquita")
    },
    "passa-da-guarda": {
      ...createStandardFarm("passa-da-guarda", "Passa da Guarda")
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
  appInitialized: false
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
    ranking: null
  },
  userEditingId: null,
  userEditingMode: null
};

const elements = {
  authShell: document.getElementById("authShell"),
  pageShell: document.getElementById("pageShell"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginFeedback: document.getElementById("loginFeedback"),
  farmSwitch: document.getElementById("farmSwitch"),
  dashboardTab: document.getElementById("dashboardTab"),
  sanitaryTab: document.getElementById("sanitaryTab"),
  dashboardView: document.getElementById("dashboardView"),
  sanitaryView: document.getElementById("sanitaryView"),
  heroMetrics: document.getElementById("heroMetrics"),
  visualHerdGrid: document.getElementById("visualHerdGrid"),
  globalSummaryGrid: document.getElementById("globalSummaryGrid"),
  globalFarmBreakdown: document.getElementById("globalFarmBreakdown"),
  globalPanelKicker: document.getElementById("globalPanelKicker"),
  globalPanelTitle: document.getElementById("globalPanelTitle"),
  globalPanelChip: document.getElementById("globalPanelChip"),
  summaryGrid: document.getElementById("summaryGrid"),
  periodSummary: document.getElementById("periodSummary"),
  salesSummary: document.getElementById("salesSummary"),
  salesTableBody: document.getElementById("salesTableBody"),
  inventoryTableBody: document.getElementById("inventoryTableBody"),
  movementsTableBody: document.getElementById("movementsTableBody"),
  discrepancyNote: document.getElementById("discrepancyNote"),
  insightList: document.getElementById("insightList"),
  heroFarmName: document.getElementById("heroFarmName"),
  heroFarmNote: document.getElementById("heroFarmNote"),
  yearFilter: document.getElementById("yearFilter"),
  monthFilter: document.getElementById("monthFilter"),
  inventoryUpdatedLabel: document.getElementById("inventoryUpdatedLabel"),
  movementDialog: document.getElementById("movementDialog"),
  movementDialogTitle: document.getElementById("movementDialogTitle"),
  movementForm: document.getElementById("movementForm"),
  movementType: document.getElementById("movementType"),
  movementDate: document.getElementById("movementDate"),
  movementCategory: document.getElementById("movementCategory"),
  movementQuantity: document.getElementById("movementQuantity"),
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
  movementValueWrap: document.getElementById("movementValueWrap"),
  movementValueLabel: document.getElementById("movementValueLabel"),
  movementValue: document.getElementById("movementValue"),
  movementNotes: document.getElementById("movementNotes"),
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
  dashboardPotreroSummary: document.getElementById("dashboardPotreroSummary"),
  editStockDialog: document.getElementById("editStockDialog"),
  editStockForm: document.getElementById("editStockForm"),
  editStockButton: document.getElementById("editStockButton"),
  closeEditStockDialog: document.getElementById("closeEditStockDialog"),
  editFarmName: document.getElementById("editFarmName"),
  editDeclaredTotal: document.getElementById("editDeclaredTotal"),
  editStockList: document.getElementById("editStockList"),
  addPotreroButton: document.getElementById("addPotreroButton"),
  potreroStockList: document.getElementById("potreroStockList"),
  exportPdfButton: document.getElementById("exportPdfButton"),
  currentUserLabel: document.getElementById("currentUserLabel"),
  manageUsersButton: document.getElementById("manageUsersButton"),
  logoutButton: document.getElementById("logoutButton"),
  adjustButton: document.getElementById("adjustButton"),
  addCategoryButton: document.getElementById("addCategoryButton"),
  closeMovementDialog: document.getElementById("closeMovementDialog"),
  closeCategoryDialog: document.getElementById("closeCategoryDialog"),
  manageUsersDialog: document.getElementById("manageUsersDialog"),
  userEditorPanel: document.getElementById("userEditorPanel"),
  userEditorTitle: document.getElementById("userEditorTitle"),
  editUserLogin: document.getElementById("editUserLogin"),
  editUserPassword: document.getElementById("editUserPassword"),
  saveUserEditsButton: document.getElementById("saveUserEditsButton"),
  cancelUserEditButton: document.getElementById("cancelUserEditButton"),
  manageUsersForm: document.getElementById("manageUsersForm"),
  closeManageUsersDialog: document.getElementById("closeManageUsersDialog"),
  newUserLogin: document.getElementById("newUserLogin"),
  newUserPassword: document.getElementById("newUserPassword"),
  userList: document.getElementById("userList"),
  pdfOptionsDialog: document.getElementById("pdfOptionsDialog"),
  pdfOptionsForm: document.getElementById("pdfOptionsForm"),
  closePdfOptionsDialog: document.getElementById("closePdfOptionsDialog"),
  pdfFarmList: document.getElementById("pdfFarmList")
};

boot();

function boot() {
  try {
    bindEvents();
    renderAuthState();
    if (isAuthenticated()) {
      initializeAppShell();
      render();
    }
  } catch (error) {
    console.error("Falha na inicializacao do painel:", error);
    showStartupError(error);
  }
}

function initializeAppShell() {
  if (!runtime.appInitialized) {
    populateMonthFilter();
    runtime.appInitialized = true;
  }

  state.filters.year = String(getPreferredYearForFarm(getFarm()));
  populateYearFilter();
}

function loadData() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const freshData = ensureDataShape(cloneSeedData());
      freshData.auth.sessionUserId = "";
      return freshData;
    }

    const parsedData = ensureDataShape(JSON.parse(stored));
    parsedData.auth.sessionUserId = "";
    return parsedData;
  } catch (error) {
    runtime.storageEnabled = false;
    console.warn("Armazenamento local indisponivel. O painel vai funcionar sem persistencia.", error);
    const fallbackData = ensureDataShape(cloneSeedData());
    fallbackData.auth.sessionUserId = "";
    return fallbackData;
  }
}

function saveData() {
  if (!runtime.storageEnabled) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (error) {
    runtime.storageEnabled = false;
    console.warn("Nao foi possivel salvar localmente. A sessao segue sem persistencia.", error);
  }
}

function getCurrentUser() {
  return state.data.auth.users.find((user) => user.id === state.data.auth.sessionUserId) || null;
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  elements.authShell.hidden = Boolean(currentUser);
  elements.pageShell.hidden = !currentUser;
  document.body.classList.toggle("login-mode", !currentUser);
  elements.currentUserLabel.textContent = currentUser ? `Usuario: ${currentUser.login}` : "Usuario";
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
}

function openManageUsersDialog() {
  renderUserList();
  elements.newUserLogin.value = "";
  elements.newUserPassword.value = "";
  elements.manageUsersDialog.showModal();
}

function renderUserList() {
  const currentUser = getCurrentUser();
  elements.userList.innerHTML = state.data.auth.users.map((user) => `
    <article class="user-row">
      <div>
        <strong>${escapeHtml(user.login)}</strong>
        <span>${user.id === currentUser?.id ? "Usuario em uso agora" : "Acesso local salvo no navegador"}</span>
      </div>
      <div class="user-row-actions">
        <button type="button" class="ghost-btn" data-edit-user-id="${user.id}">Editar</button>
        <button type="button" class="ghost-btn" data-reset-user-id="${user.id}">Resetar senha</button>
      </div>
    </article>
  `).join("");
  closeUserEditor();
}

function handleUserListInteraction(event) {
  const editTrigger = event.target.closest("[data-edit-user-id]");
  if (editTrigger) {
    openUserEditor(editTrigger.dataset.editUserId, false);
    return;
  }

  const resetTrigger = event.target.closest("[data-reset-user-id]");
  if (resetTrigger) {
    openUserEditor(resetTrigger.dataset.resetUserId, true);
  }
}

function openUserEditor(userId, resetOnly = false) {
  const user = state.data.auth.users.find((item) => item.id === userId);
  if (!user) {
    return;
  }

  state.userEditingId = userId;
  state.userEditingMode = resetOnly ? "reset" : "edit";
  elements.userEditorPanel.hidden = false;
  elements.userEditorTitle.textContent = resetOnly ? `Redefinir senha de ${user.login}` : `Editar ${user.login}`;
  elements.editUserLogin.value = user.login;
  elements.editUserPassword.value = "";
  elements.editUserPassword.placeholder = resetOnly ? "Digite a nova senha" : "Nova senha (opcional)";
  elements.editUserPassword.required = resetOnly;
}

function closeUserEditor() {
  state.userEditingId = null;
  state.userEditingMode = null;
  elements.userEditorPanel.hidden = true;
  elements.editUserLogin.value = "";
  elements.editUserPassword.value = "";
  elements.editUserPassword.required = false;
}

function handleUserEditSave() {
  if (!state.userEditingId) {
    return;
  }

  const user = state.data.auth.users.find((item) => item.id === state.userEditingId);
  if (!user) {
    return;
  }

  const nextLogin = elements.editUserLogin.value.trim();
  const nextPassword = elements.editUserPassword.value;

  if (!nextLogin) {
    alert("O login nao pode ficar vazio.");
    return;
  }

  if (state.data.auth.users.some((item) => item.id !== user.id && normalizeText(item.login) === normalizeText(nextLogin))) {
    alert("Ja existe outro usuario com esse login.");
    return;
  }

  if (state.userEditingMode === "reset" && !nextPassword) {
    alert("Digite uma nova senha para redefinir a senha deste usuario.");
    return;
  }

  user.login = nextLogin;
  if (nextPassword) {
    user.password = nextPassword;
  }

  saveData();
  renderUserList();
  renderAuthState();

  if (user.id === state.data.auth.sessionUserId) {
    elements.currentUserLabel.textContent = `Usuario: ${user.login}`;
  }

  if (nextPassword) {
    alert("Senha atualizada com sucesso.");
  }

  closeUserEditor();
}

function handleManageUsersSubmit(event) {
  event.preventDefault();
  const login = elements.newUserLogin.value.trim();
  const password = elements.newUserPassword.value;

  if (!login || !password) {
    return;
  }

  if (state.data.auth.users.some((user) => normalizeText(user.login) === normalizeText(login))) {
    alert("Ja existe um usuario com esse login.");
    return;
  }

  state.data.auth.users.push({
    id: slugify(`${login}-${Date.now()}`),
    login,
    password
  });

  saveData();
  elements.newUserLogin.value = "";
  elements.newUserPassword.value = "";
  renderUserList();
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
    sanitaryRecords
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
  const years = [
    ...farm.movements.map((movement) => new Date(movement.date).getFullYear()),
    ...farm.sanitaryRecords.map((record) => new Date(record.date).getFullYear())
  ].filter((year) => Number.isFinite(year));

  return years.length ? Math.max(...years) : today.getFullYear();
}

function isPremiumSaleFarm(farm) {
  return PREMIUM_SALE_FARMS.has(farm.id);
}

function createStandardFarm(id, name) {
  return {
    id,
    name,
    declaredTotal: 0,
    note: "Estrutura pronta para receber o inventario inicial e futuras mudancas de manejo.",
    sanitaryProducts: [...DEFAULT_SANITARY_PRODUCTS],
    potreiros: normalizePotreroEntries([], DEFAULT_POTREIROS),
    categories: STANDARD_FARM_CATEGORIES.map((category) => ({
      ...category,
      quantity: 0
    })),
    movements: [],
    sanitaryRecords: []
  };
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.manageUsersButton.addEventListener("click", openManageUsersDialog);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.manageUsersForm.addEventListener("submit", handleManageUsersSubmit);
  elements.userList.addEventListener("click", handleUserListInteraction);
  elements.saveUserEditsButton.addEventListener("click", handleUserEditSave);
  elements.cancelUserEditButton.addEventListener("click", closeUserEditor);
  elements.closeManageUsersDialog.addEventListener("click", () => elements.manageUsersDialog.close());

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      renderActiveView();
    });
  });

  elements.yearFilter.addEventListener("change", (event) => {
    state.filters.year = event.target.value;
    render();
  });

  elements.monthFilter.addEventListener("change", (event) => {
    state.filters.month = event.target.value;
    render();
  });

  elements.movementType.addEventListener("change", () => {
    updateMovementFormForType(elements.movementType.value);
  });

  elements.movementSaleMode.addEventListener("change", updateSaleFieldVisibility);
  [
    elements.movementLivePrice,
    elements.movementLiveKg,
    elements.movementCarcassPrice,
    elements.movementCarcassKg
  ].forEach((input) => {
    input.addEventListener("input", updateSaleComputedValue);
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

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => openMovementDialog(button.dataset.type));
  });

  elements.adjustButton.addEventListener("click", () => openMovementDialog("ajuste"));
  elements.editStockButton.addEventListener("click", openEditStockDialog);
  elements.addCategoryButton.addEventListener("click", openCategoryDialog);
  elements.editFarmName.addEventListener("change", handleEditFarmChange);
  elements.addPotreroButton.addEventListener("click", handleAddPotreroRow);
  elements.potreroStockList.addEventListener("click", handlePotreroListInteraction);
  elements.closeMovementDialog.addEventListener("click", () => elements.movementDialog.close());
  elements.closeCategoryDialog.addEventListener("click", () => elements.categoryDialog.close());
  elements.closeEditStockDialog.addEventListener("click", () => elements.editStockDialog.close());
  elements.exportPdfButton.addEventListener("click", openPdfOptionsDialog);
  elements.closePdfOptionsDialog.addEventListener("click", () => elements.pdfOptionsDialog.close());
  elements.pdfOptionsForm.addEventListener("submit", handlePdfOptionsSubmit);
  elements.pdfOptionsForm.querySelectorAll('input[name="pdfScope"]').forEach((input) => {
    input.addEventListener("change", updatePdfScopeMode);
  });

  elements.movementForm.addEventListener("submit", handleMovementSubmit);
  elements.categoryForm.addEventListener("submit", handleCategorySubmit);
  elements.sanitaryForm.addEventListener("submit", handleSanitarySubmit);
  elements.editStockForm.addEventListener("submit", handleEditStockSubmit);
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

function render() {
  if (!isAuthenticated()) {
    return;
  }

  const farm = getFarm();
  renderFarmSwitch();
  renderGlobalSummary();
  syncMovementTypeOptions();
  syncCategoryOptions();
  syncSanitaryFormOptions();
  renderHero(farm);
  renderHeroMetrics(farm);
  renderSummaryCards(farm);
  renderVisualHerdGrid(farm);
  renderInventoryTable(farm);
  renderPeriodSummary(farm);
  renderSalesAnalysis(farm);
  renderMovementsTable(farm);
  renderSanitarySummary(farm);
  renderSanitaryTable(farm);
  renderPotreroSummaries(farm);
  renderInsights(farm);
  renderCharts(farm);
  renderActiveView();
  elements.inventoryUpdatedLabel.textContent = `Atualizado em ${formatDate(new Date().toISOString().slice(0, 10))}`;
}

function renderFarmSwitch() {
  elements.farmSwitch.innerHTML = "";
  Object.values(state.data.farms).forEach((farm) => {
    const button = document.createElement("button");
    button.className = `farm-btn ${farm.id === state.data.selectedFarmId ? "active" : ""}`;
    button.textContent = farm.name;
    button.addEventListener("click", () => {
      state.data.selectedFarmId = farm.id;
      saveData();
      render();
    });
    elements.farmSwitch.appendChild(button);
  });

  const totalButton = document.createElement("button");
  totalButton.className = `farm-btn ${TOTAL_FARM_ID === state.data.selectedFarmId ? "active" : ""}`;
  totalButton.textContent = "Total";
  totalButton.addEventListener("click", () => {
    state.data.selectedFarmId = TOTAL_FARM_ID;
    saveData();
    render();
  });
  elements.farmSwitch.appendChild(totalButton);
}

function renderGlobalSummary() {
  const isTotalView = state.data.selectedFarmId === TOTAL_FARM_ID;
  const farms = isTotalView ? getAllFarms() : [state.data.farms[state.data.selectedFarmId]].filter(Boolean);
  const totals = farms.reduce((accumulator, farm) => {
    const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
    accumulator.animais += getFarmTotal(farm);
    accumulator.entradas += monthly.byType.compra + monthly.byType.nascimento + monthly.adjustPositive;
    accumulator.saidas += monthly.byType.venda + monthly.byType.consumo + monthly.byType.morte + monthly.adjustNegative;
    accumulator.sanitario += getFilteredSanitaryRecords(farm).length;
    return accumulator;
  }, { animais: 0, entradas: 0, saidas: 0, sanitario: 0 });
  const selectedFarm = farms[0];

  elements.globalPanelKicker.textContent = isTotalView ? "Painel inicial" : "Fazenda selecionada";
  elements.globalPanelTitle.textContent = isTotalView ? "Consolidado das fazendas" : `Resumo de ${selectedFarm?.name || "fazenda"}`;
  elements.globalPanelChip.textContent = isTotalView ? "Grupo Da Luz" : selectedFarm?.name || "Fazenda";

  const cards = [
    {
      title: isTotalView ? "Animais em todas as fazendas" : "Animais da fazenda",
      value: formatInteger(totals.animais),
      detail: isTotalView ? "estoque consolidado do grupo" : `estoque atual de ${selectedFarm?.name || "fazenda"}`
    },
    {
      title: isTotalView ? "Entradas consolidadas" : "Entradas no periodo",
      value: formatInteger(totals.entradas),
      detail: isTotalView ? "compras, nascimentos e ajustes positivos" : "compras, nascimentos e ajustes positivos"
    },
    {
      title: isTotalView ? "Saidas consolidadas" : "Saidas no periodo",
      value: formatInteger(totals.saidas),
      detail: isTotalView ? "vendas, mortes, consumo e ajustes negativos" : "vendas, mortes, consumo e ajustes negativos"
    },
    {
      title: "Registros sanitarios",
      value: formatInteger(totals.sanitario),
      detail: isTotalView ? "manejos sanitarios no periodo filtrado" : `manejos sanitarios de ${selectedFarm?.name || "fazenda"}`
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
        <span>${formatInteger(sanitaryCount)} registro(s) sanitarios no periodo</span>
      </article>
    `;
  }).join("");
}

function renderActiveView() {
  const isDashboard = state.activeView === "dashboard";
  elements.dashboardView.hidden = !isDashboard;
  elements.sanitaryView.hidden = isDashboard;
  elements.dashboardTab.classList.toggle("active", isDashboard);
  elements.sanitaryTab.classList.toggle("active", !isDashboard);
}

function renderHero(farm) {
  const dominantCategory = getDominantCategory(farm);
  const dominantText = dominantCategory
    ? `${dominantCategory.name} lidera o rebanho com ${formatInteger(dominantCategory.quantity)} animais.`
    : "Estrutura pronta para acompanhar compras, vendas e manejo.";

  elements.heroFarmName.textContent = farm.name;
  elements.heroFarmNote.textContent = `${farm.note} ${dominantText}`;
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
      text: "lancamentos no ano filtrado"
    },
    {
      label: "Conferencia",
      value: discrepancy === 0 ? "OK" : `${discrepancy > 0 ? "+" : ""}${formatInteger(discrepancy)}`,
      text: discrepancy === 0 ? "estoque alinhado ao total declarado" : "diferenca entre estoque e total declarado"
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
    { title: "Entradas no periodo", value: formatInteger(purchasesAndBirths), detail: "Compras, nascimentos e ajustes positivos" },
    { title: "Saidas no periodo", value: formatInteger(salesAndLosses), detail: "Vendas, consumo, mortes e ajustes negativos" },
    { title: "Movimentacoes no ano", value: formatInteger(annualData.totalMovements), detail: `Lancamentos registrados em ${state.filters.year}` }
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

function renderInventoryTable(farm) {
  const total = getFarmTotal(farm) || 1;
  elements.inventoryTableBody.innerHTML = farm.categories.map((category) => {
    const share = (category.quantity / total) * 100;
    const status = category.quantity <= 20 ? { label: "Baixo", className: "risk" }
      : category.quantity <= 80 ? { label: "Atencao", className: "warn" }
      : { label: "Saudavel", className: "safe" };

    return `
      <tr>
        <td data-label="Categoria">${escapeHtml(category.name)}</td>
        <td data-label="Qtd.">${formatInteger(category.quantity)}</td>
        <td data-label="Participacao">${share.toFixed(1)}%</td>
        <td data-label="Status"><span class="status-pill ${status.className}">${status.label}</span></td>
      </tr>
    `;
  }).join("");
}

function renderPeriodSummary(farm) {
  const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
  const annual = summarizePeriod(farm, state.filters.year, "all");
  const valueText = annual.totalValue > 0 ? formatCurrency(annual.totalValue) : "Sem valor informado";

  const cards = [
    { title: state.filters.month === "all" ? "Saldo anual" : "Saldo do mes", value: `${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`, detail: "Variacao liquida entre entradas e saidas" },
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
      { title: "Vendas registradas", value: formatInteger(summary.count), detail: "lancamentos comerciais no periodo" },
      { title: "Faturamento", value: formatCurrency(summary.totalValue), detail: "valor calculado das vendas" },
      { title: "Kg vivo", value: formatWeight(summary.liveKg), detail: "peso vivo negociado" },
      { title: "Kg carcaca", value: formatWeight(summary.carcassKg), detail: "peso de carcaca negociado" }
    ]
    : [
      { title: "Vendas registradas", value: formatInteger(summary.count), detail: "lancamentos comerciais no periodo" },
      { title: "Faturamento", value: formatCurrency(summary.totalValue), detail: "valor calculado das vendas" },
      { title: "Kg vivo", value: formatWeight(summary.liveKg), detail: "peso vivo negociado" },
      { title: "Media R$/kg vivo", value: summary.liveKg > 0 ? formatCurrency(summary.totalValue / summary.liveKg) : formatCurrency(0), detail: "preco medio por kg vivo" }
    ];

  elements.salesSummary.innerHTML = cards.map((card) => `
    <article class="analytics-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  if (!summary.movements.length) {
    elements.salesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty-cell">Nenhuma venda encontrada para o periodo selecionado.</td>
      </tr>
    `;
    return;
  }

  elements.salesTableBody.innerHTML = summary.movements.slice(0, 10).map((movement) => `
    <tr>
      <td data-label="Data">${formatDate(movement.date)}</td>
      <td data-label="Categoria">${escapeHtml(movement.categoryName)}</td>
      <td data-label="Base">${escapeHtml(getSaleModeLabel(movement.saleDetails?.mode || "vivo"))}</td>
      <td data-label="Kg">${formatWeight(movement.saleDetails?.weightKg || 0)}</td>
      <td data-label="R$/kg">${formatCurrency(movement.saleDetails?.pricePerKg || 0)}</td>
      <td data-label="Total">${formatCurrency(movement.value || 0)}</td>
    </tr>
  `).join("");
}

function renderMovementsTable(farm) {
  const movements = [...farm.movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  if (!movements.length) {
    elements.movementsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty-cell">Ainda nao ha lancamentos para ${farm.name}. Use os botoes acima para iniciar o controle.</td>
      </tr>
    `;
    return;
  }

  elements.movementsTableBody.innerHTML = movements.map((movement) => `
    <tr>
      <td data-label="Data">${formatDate(movement.date)}</td>
      <td data-label="Tipo">${capitalize(movement.type)}</td>
      <td data-label="Categoria">${escapeHtml(movement.categoryName)}</td>
      <td data-label="Qtd.">${formatInteger(movement.quantity)}</td>
      <td data-label="Obs.">${escapeHtml(getMovementNotes(movement))}</td>
    </tr>
  `).join("");
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

function getSanitarySummary(farm) {
  const records = getFilteredSanitaryRecords(farm);
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

function getSaleModeLabel(mode) {
  return mode === "carcaca" ? "Kg carcaca" : "Kg vivo";
}

function getOperationalInsights(farm) {
  const total = getFarmTotal(farm);
  const biggestCategory = [...farm.categories].sort((a, b) => b.quantity - a.quantity)[0];
  const annual = summarizePeriod(farm, state.filters.year, "all");
  const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
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
      text: `Taxa calculada a partir das mortes registradas em ${state.filters.year}.`
    },
    {
      tag: "Recorte ativo",
      title: monthly.totalMovements ? `${monthly.totalMovements} lancamentos no periodo` : "Sem lancamentos no periodo",
      text: state.filters.month === "all" ? `Visao consolidada do ano de ${state.filters.year}.` : `Leitura mensal de ${MONTH_NAMES[Number(state.filters.month) - 1]} de ${state.filters.year}.`
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

  const cards = [
    {
      title: "Aplicacoes",
      value: formatInteger(totalApplications),
      detail: "registros sanitarios no periodo filtrado"
    },
    {
      title: "Animais tratados",
      value: formatInteger(treatedAnimals),
      detail: "somatorio informado nos registros"
    },
    {
      title: "Produtos usados",
      value: formatInteger(uniqueProducts),
      detail: "produtos diferentes no periodo"
    },
    {
      title: "Potreiros usados",
      value: formatInteger(uniquePotreiros),
      detail: "destinos registrados no periodo"
    },
    {
      title: "Ultimo manejo",
      value: latestRecord ? formatDate(latestRecord.date) : "-",
      detail: latestRecord ? latestRecord.product : "sem registro no periodo"
    }
  ];

  elements.sanitarySummary.innerHTML = cards.map((card) => `
    <article class="analytics-card">
      <p class="panel-kicker">${card.title}</p>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");
}

function renderSanitaryTable(farm) {
  const records = [...getFilteredSanitaryRecords(farm)]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!records.length) {
    elements.sanitaryTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty-cell">Nenhum registro sanitario encontrado para o periodo selecionado.</td>
      </tr>
    `;
    return;
  }

  elements.sanitaryTableBody.innerHTML = records.map((record) => `
    <tr>
      <td data-label="Data">${formatDate(record.date)}</td>
      <td data-label="Manejo">
        <div class="sanitary-main">
          <strong>${escapeHtml(record.categoryName)}</strong>
          <span>${formatMaybeQuantity(record.quantity)} cabecas</span>
        </div>
      </td>
      <td data-label="Destino e produto">
        <div class="sanitary-main">
          <strong>${escapeHtml(record.potreiro || "-")}</strong>
          <span>${escapeHtml(record.product)}</span>
        </div>
      </td>
      <td data-label="Origem">
        <span class="sanitary-origin ${record.sourceId ? "imported" : "manual"}">${record.sourceId ? "Importado" : "Manual"}</span>
      </td>
      <td data-label="Obs.">${escapeHtml(record.notes || "-")}</td>
      <td data-label="Acoes">
        <button type="button" class="table-action-btn" data-edit-sanitary-id="${record.id || record.sourceId}">Editar</button>
      </td>
    </tr>
  `).join("");
}

function renderPotreroSummaries(farm) {
  const totals = getPotreroTotals(farm);
  const balance = getPotreroBalance(farm);
  const scopeText = farm.id === TOTAL_FARM_ID ? "do rebanho consolidado" : "do rebanho atual desta fazenda";
  const cards = totals.length
    ? totals.map((item) => `
      <article class="potrero-card">
        <p class="panel-kicker">${escapeHtml(farm.id === TOTAL_FARM_ID ? (item.farmName || item.name) : item.name)}</p>
        <strong>${formatInteger(item.quantity)}</strong>
        <p>${farm.id === TOTAL_FARM_ID ? `${escapeHtml(item.name)} | ` : ""}${item.share.toFixed(1)}% ${scopeText}</p>
      </article>
    `).join("") + `
      <article class="potrero-card potrero-card-highlight">
        <p class="panel-kicker">${balance === 0 ? "Conferencia de lotacao" : balance > 0 ? "Saldo sem potreiro" : "Excedente nos potreiros"}</p>
        <strong>${balance === 0 ? "OK" : `${balance > 0 ? "+" : ""}${formatInteger(balance)}`}</strong>
        <p>${balance === 0
          ? farm.id === TOTAL_FARM_ID ? "A soma dos potreiros esta alinhada ao rebanho consolidado." : "A soma dos potreiros esta alinhada ao rebanho atual."
          : balance > 0
            ? farm.id === TOTAL_FARM_ID ? "Ainda ha animais no consolidado sem distribuicao registrada em potreiro." : "Ainda ha animais no estoque sem distribuicao registrada em potreiro."
            : farm.id === TOTAL_FARM_ID ? "A soma dos potreiros esta acima do estoque consolidado informado." : "A soma dos potreiros esta acima do estoque atual informado para a fazenda."}</p>
      </article>
    `
    : `
      <article class="potrero-card">
        <p class="panel-kicker">Sem cadastro</p>
        <strong>0</strong>
        <p>Cadastre os potreiros da fazenda para visualizar a lotacao atual.</p>
      </article>
    `;

  elements.dashboardPotreroSummary.innerHTML = cards;
}

function renderInsights(farm) {
  const insights = getOperationalInsights(farm);

  elements.insightList.innerHTML = insights.map((insight) => `
    <article class="insight-card">
      <span>${insight.tag}</span>
      <strong>${escapeHtml(insight.title)}</strong>
      <p>${escapeHtml(insight.text)}</p>
    </article>
  `).join("");
}

function renderCharts(farm) {
  renderInventoryChart(farm);
  renderMovementChart(farm);
  renderRankingChart(farm);
}

function renderInventoryChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("inventoryChart", "Grafico indisponivel no momento.");
    return;
  }

  const context = document.getElementById("inventoryChart");
  const labels = farm.categories.map((category) => category.name);
  const data = farm.categories.map((category) => category.quantity);

  if (state.charts.inventory) {
    state.charts.inventory.destroy();
  }

  state.charts.inventory = new Chart(context, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, index) => createRadialColor(context, COLORS[index % COLORS.length], index)),
        borderWidth: 0,
        hoverOffset: 12
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
        },
        tooltip: {
          callbacks: {
            label(chartContext) {
              const total = chartContext.dataset.data.reduce((sum, value) => sum + value, 0) || 1;
              const share = ((chartContext.raw / total) * 100).toFixed(1);
              return `${chartContext.label}: ${formatInteger(chartContext.raw)} (${share}%)`;
            }
          }
        }
      },
      cutout: "58%"
    },
    plugins: [centerTextPlugin(() => {
      const dominantCategory = getDominantCategory(farm);
      return {
        title: dominantCategory ? formatInteger(dominantCategory.quantity) : "0",
        subtitle: dominantCategory ? dominantCategory.name : "Sem dados"
      };
    })]
  });
}

function renderMovementChart(farm) {
  if (typeof window.Chart !== "function") {
    drawChartFallback("movementChart", "Grafico indisponivel no momento.");
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
    drawChartFallback("rankingChart", "Grafico indisponivel no momento.");
    return;
  }

  const context = document.getElementById("rankingChart");
  const categories = [...farm.categories]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

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

function openMovementDialog(initialType) {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda especifica para registrar movimentacoes.");
    return;
  }

  syncMovementTypeOptions(initialType);
  syncCategoryOptions();
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
  updateMovementFormForType(initialType);
  elements.movementDialog.showModal();
}

function openCategoryDialog() {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda especifica para adicionar uma categoria.");
    return;
  }

  elements.categoryName.value = "";
  elements.categoryInitialQuantity.value = "0";
  elements.categoryDialog.showModal();
}

function openEditStockDialog() {
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda especifica para editar o estoque.");
    return;
  }

  renderEditStockForm(state.data.selectedFarmId);
  elements.editStockDialog.showModal();
}

function renderEditStockForm(farmId) {
  const farm = state.data.farms[farmId];
  if (!farm) {
    return;
  }

  elements.editFarmName.innerHTML = getAllFarms().map((item) => `
    <option value="${item.id}" ${item.id === farm.id ? "selected" : ""}>${escapeHtml(item.name)}</option>
  `).join("");
  elements.editFarmName.value = farm.id;
  elements.editDeclaredTotal.value = String(farm.declaredTotal || getFarmTotal(farm));
  elements.editStockList.innerHTML = farm.categories.map((category) => `
    <div class="edit-stock-row" data-category-row data-category-id="${category.id}">
      <label class="edit-stock-main-field">
        Categoria
        <input
          type="text"
          maxlength="80"
          value="${escapeHtml(category.name)}"
          data-category-name
          aria-label="Nome da categoria ${escapeHtml(category.name)}"
          required
        >
        <p>Edite o nome da categoria e a quantidade atual do gado.</p>
      </label>
      <label>
        Quantidade atual
        <input
          type="number"
          min="0"
          step="1"
          value="${Number(category.quantity || 0)}"
          data-category-quantity
          aria-label="Quantidade de ${escapeHtml(category.name)}"
          required
        >
      </label>
    </div>
  `).join("");
  renderPotreroStockList(getPotreroEntries(farm));
}

function handleEditFarmChange() {
  renderEditStockForm(elements.editFarmName.value);
}

function createPotreroStockRow(entry = {}) {
  const name = String(entry.name || "").trim();
  const quantity = normalizePotreroQuantity(entry.quantity);
  const potreroId = entry.id || createPotreroId(name || "potreiro");

  return `
    <div class="potrero-stock-row" data-potrero-row data-potrero-id="${escapeHtml(potreroId)}">
      <label>
        Nome do potreiro
        <input
          type="text"
          maxlength="80"
          value="${escapeHtml(name)}"
          data-potrero-name
          placeholder="Ex.: Potreiro Norte"
          required
        >
      </label>
      <label>
        Quantidade de animais
        <input
          type="number"
          min="0"
          step="1"
          value="${quantity}"
          data-potrero-quantity
          placeholder="0"
          required
        >
      </label>
      <button type="button" class="ghost-btn potrero-remove-btn" data-remove-potrero-id="${escapeHtml(potreroId)}">Remover</button>
    </div>
  `;
}

function renderPotreroStockList(entries = []) {
  const potreiros = entries.length ? entries : [];
  elements.potreroStockList.innerHTML = potreiros.length
    ? potreiros.map((entry) => createPotreroStockRow(entry)).join("")
    : "";
}

function handleAddPotreroRow() {
  elements.potreroStockList.insertAdjacentHTML("beforeend", createPotreroStockRow());
  const lastNameInput = elements.potreroStockList.querySelector('[data-potrero-row]:last-child [data-potrero-name]');
  lastNameInput?.focus();
}

function handlePotreroListInteraction(event) {
  const removeTrigger = event.target.closest("[data-remove-potrero-id]");
  if (!removeTrigger) {
    return;
  }

  removeTrigger.closest("[data-potrero-row]")?.remove();
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
  elements.sanitarySubmitButton.textContent = "Atualizar registro sanitario";
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
  const farm = getFarm();
  const typeMeta = MOVEMENT_TYPES.find((item) => item.value === type);
  elements.movementDialogTitle.textContent = typeMeta ? `Registrar ${typeMeta.label.toLowerCase()}` : "Registrar movimentacao";
  elements.adjustDirectionWrap.hidden = type !== "ajuste";
  const isSale = type === "venda";
  const isPremiumFarm = isPremiumSaleFarm(farm);

  elements.movementSaleModeWrap.hidden = !isSale || !isPremiumFarm;
  elements.movementSaleHint.hidden = !isSale;
  elements.movementValueWrap.hidden = false;
  elements.movementValue.readOnly = isSale;
  elements.movementValueLabel.textContent = isSale ? "Total calculado" : "Valor total (opcional)";
  elements.movementValue.placeholder = isSale ? "Calculado automaticamente" : "0,00";
  if (!isSale) {
    elements.movementValue.value = "";
  }
  updateSaleFieldVisibility();
}

function updateSaleFieldVisibility() {
  const farm = getFarm();
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

  const farm = getFarm();
  const saleMode = isPremiumSaleFarm(farm) ? elements.movementSaleMode.value : "vivo";
  const pricePerKg = Number(saleMode === "carcaca" ? elements.movementCarcassPrice.value : elements.movementLivePrice.value);
  const weightKg = Number(saleMode === "carcaca" ? elements.movementCarcassKg.value : elements.movementLiveKg.value);
  const total = Number.isFinite(pricePerKg) && Number.isFinite(weightKg) ? pricePerKg * weightKg : 0;
  elements.movementValue.value = total > 0 ? total.toFixed(2) : "";
}

function syncCategoryOptions() {
  const farm = getFarm();
  elements.movementCategory.innerHTML = farm.categories.map((category) => `
    <option value="${category.id}">${escapeHtml(category.name)}</option>
  `).join("");
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

function handleMovementSubmit(event) {
  event.preventDefault();
  const farm = getFarm();
  const type = elements.movementType.value;
  const quantity = Number(elements.movementQuantity.value);
  const adjustDirection = elements.adjustDirection.value;
  const date = elements.movementDate.value;
  const categoryId = elements.movementCategory.value;
  const notes = elements.movementNotes.value.trim();
  const category = farm.categories.find((item) => item.id === categoryId);
  let value = Number(elements.movementValue.value || 0);
  let saleDetails = null;

  if (!category || !date || !quantity || quantity < 1) {
    return;
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
    saleDetails = {
      mode: saleMode,
      pricePerKg,
      weightKg
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

  category.quantity += delta;
  farm.movements.push({
    id: createMovementId(),
    type,
    date,
    categoryId,
    categoryName: category.name,
    quantity,
    delta,
    value,
    saleDetails,
    notes
  });

  if (farm.declaredTotal === 0) {
    farm.declaredTotal = getFarmTotal(farm);
  }

  saveData();
  populateYearFilter();
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

function handleSanitarySubmit(event) {
  event.preventDefault();
  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    alert("Selecione uma fazenda especifica para registrar ou editar o manejo sanitario.");
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
  elements.sanitarySubmitButton.textContent = "Salvar registro sanitario";
  updateSanitaryProductMode();
  updateSanitaryPotreroMode();
  render();
}

function handleEditStockSubmit(event) {
  event.preventDefault();
  const farm = state.data.farms[elements.editFarmName.value];
  if (!farm) {
    alert("Selecione uma fazenda valida para salvar.");
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
      alert(`Informe uma quantidade valida para o potreiro ${name}.`);
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
  state.data.selectedFarmId = farm.id;
  saveData();
  elements.editStockDialog.close();
  render();
}

function summarizePeriod(farm, year, month) {
  const summary = {
    totalMovements: 0,
    netChange: 0,
    totalValue: 0,
    adjustPositive: 0,
    adjustNegative: 0,
    saleValue: 0,
    byType: { compra: 0, venda: 0, consumo: 0, nascimento: 0, morte: 0, ajuste: 0 }
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
  });

  return summary;
}

function getFilteredSanitaryRecords(farm) {
  return farm.sanitaryRecords.filter((record) => {
    const recordDate = new Date(record.date);
    const recordYear = String(recordDate.getFullYear());
    const recordMonth = String(recordDate.getMonth() + 1).padStart(2, "0");
    const matchesYear = recordYear === String(state.filters.year);
    const matchesMonth = state.filters.month === "all" || recordMonth === state.filters.month;
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
    return `A fazenda ${farm.name} ainda nao possui total declarado. O sistema esta usando o estoque atual como referencia operacional.`;
  }

  const difference = farm.declaredTotal - computedTotal;
  if (difference === 0) {
    return `Inventario alinhado ao total declarado de ${formatInteger(farm.declaredTotal)} animais.`;
  }

  return `Atencao: o total declarado para ${farm.name} e ${formatInteger(farm.declaredTotal)} animais, mas o estoque atual mostra ${formatInteger(computedTotal)}. Diferenca de ${formatInteger(difference)} animais.`;
}

function openPdfOptionsDialog() {
  elements.pdfOptionsForm.reset();
  renderPdfFarmOptions(state.data.selectedFarmId === TOTAL_FARM_ID ? getAllFarms().map((farm) => farm.id) : [state.data.selectedFarmId]);
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
    const currentFarmInput = elements.pdfFarmList.querySelector(`input[name="pdfFarmIds"][value="${state.data.selectedFarmId}"]`);
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

  if (state.data.selectedFarmId === TOTAL_FARM_ID) {
    return getAllFarms().map((farm) => farm.id);
  }

  return [state.data.selectedFarmId];
}

function handlePdfOptionsSubmit(event) {
  event.preventDefault();
  const farmIds = getSelectedPdfFarmIds();

  if (!farmIds.length) {
    alert("Selecione pelo menos uma fazenda para gerar o PDF.");
    return;
  }

  elements.pdfOptionsDialog.close();
  exportPdfReport(farmIds);
}

async function addPdfHeader(doc, farm, periodLabel, monthly) {
  try {
    const imageData = await loadAssetAsDataUrl(PDF_LOGO_PATH);
    doc.addImage(imageData, "JPEG", 14, 10, 22, 22);
  } catch (error) {
    console.warn("Nao foi possivel carregar o logo para o PDF.", error);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Estabelecimentos Da Luz", 42, 18);
  doc.setFontSize(15);
  doc.text(`Relatorio Pecuario - ${farm.name}`, 42, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Periodo analisado: ${periodLabel}`, 42, 33);
  doc.text(`Responsavel tecnico: ${TECHNICAL_MANAGER_NAME}`, 42, 39);
  doc.text(`Movimentacoes no periodo: ${formatInteger(monthly.totalMovements)}`, 14, 50);
  doc.text(`Saldo do periodo: ${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`, 92, 50);
  return 56;
}

function addPdfFooters(doc) {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(220, 209, 193);
    doc.line(14, 286, 196, 286);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(112, 94, 76);
    doc.text(`Estabelecimentos Da Luz | Responsavel tecnico: ${TECHNICAL_MANAGER_NAME}`, 14, 291);
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: "right" });
    doc.setTextColor(45, 35, 25);
  }
}

function appendExecutivePdfTable(doc, farm, monthly, discrepancy, topY) {
  const registeredPotreiros = getPotreroEntries(farm).length;
  const registeredAnimals = getRegisteredPotreroAnimals(farm);
  const potreroBalance = getPotreroBalance(farm);
  doc.autoTable({
    startY: topY + 4,
    head: [["Indicador executivo", "Valor"]],
    body: [
      ["Estoque atual", `${formatInteger(getFarmTotal(farm))} animais`],
      ["Total declarado", farm.declaredTotal ? `${formatInteger(farm.declaredTotal)} animais` : "Nao informado"],
      ["Conferencia de estoque", discrepancy === 0 ? "Alinhado" : `${discrepancy > 0 ? "+" : ""}${formatInteger(discrepancy)} animais`],
      ["Potreiros cadastrados", formatInteger(registeredPotreiros)],
      ["Animais distribuidos em potreiros", `${formatInteger(registeredAnimals)} animais`],
      ["Saldo da distribuicao", potreroBalance === 0 ? "Alinhado" : `${potreroBalance > 0 ? "+" : ""}${formatInteger(potreroBalance)} animais`],
      ["Movimentacoes no periodo", formatInteger(monthly.totalMovements)],
      ["Saldo do periodo", `${monthly.netChange > 0 ? "+" : ""}${formatInteger(monthly.netChange)}`],
      ["Responsavel tecnico", TECHNICAL_MANAGER_NAME]
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
      ["Compras no periodo", formatInteger(monthly.byType.compra)],
      ["Vendas no periodo", formatInteger(monthly.byType.venda)],
      ["Faturamento de vendas", formatCurrency(saleSummary.totalValue)],
      ["Consumo no periodo", formatInteger(monthly.byType.consumo)],
      ["Nascimentos no periodo", formatInteger(monthly.byType.nascimento)],
      ["Mortes no periodo", formatInteger(monthly.byType.morte)],
      ["Movimentacoes no ano", formatInteger(annual.totalMovements)],
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
      ["Kg carcaca negociado", formatWeight(saleSummary.carcassKg)],
      ["Preco medio kg vivo", saleSummary.liveKg > 0 ? formatCurrency(saleSummary.totalValue / saleSummary.liveKg) : formatCurrency(0)]
    ],
    theme: "striped",
    headStyles: { fillColor: [201, 140, 79] }
  });
}

function appendSaleDetailsPdfTable(doc, saleSummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Categoria", "Base", "Kg", "R$/kg", "Total"]],
    body: saleSummary.movements.length
      ? saleSummary.movements.map((movement) => [
        formatDate(movement.date),
        movement.categoryName,
        getSaleModeLabel(movement.saleDetails?.mode || "vivo"),
        formatWeight(movement.saleDetails?.weightKg || 0),
        formatCurrency(movement.saleDetails?.pricePerKg || 0),
        formatCurrency(movement.value || 0)
      ])
      : [["-", "-", "-", "-", "-", "Sem vendas no periodo"]],
    theme: "striped",
    headStyles: { fillColor: [201, 140, 79] }
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

function appendSanitarySummaryPdfTable(doc, sanitarySummary) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Indicador sanitario", "Valor"]],
    body: [
      ["Aplicacoes no periodo", formatInteger(sanitarySummary.totalApplications)],
      ["Animais tratados", formatInteger(sanitarySummary.treatedAnimals)],
      ["Produtos utilizados", formatInteger(sanitarySummary.uniqueProducts)],
      ["Potreiros utilizados", formatInteger(sanitarySummary.uniquePotreiros)],
      ["Ultimo manejo", sanitarySummary.latestRecord ? `${formatDate(sanitarySummary.latestRecord.date)} - ${sanitarySummary.latestRecord.product}` : "Sem registro"]
    ],
    theme: "striped",
    headStyles: { fillColor: [55, 91, 67] }
  });
}

function appendSanitaryDetailsPdfTable(doc, sanitaryRecords) {
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Data", "Categoria", "Qtd.", "Potreiro", "Produto", "Observacoes"]],
    body: sanitaryRecords.length
      ? sanitaryRecords.map((record) => [
        formatDate(record.date),
        record.categoryName,
        formatMaybeQuantity(record.quantity),
        record.potreiro || "-",
        record.product,
        record.notes || "-"
      ])
      : [["-", "-", "-", "-", "Sem registros sanitarios no periodo", "-"]],
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
    head: [["Data", "Tipo", "Categoria", "Qtd.", "Valor", "Observacao"]],
    body: recentMovements.length
      ? recentMovements.map((movement) => [
        formatDate(movement.date),
        capitalize(movement.type),
        movement.categoryName,
        formatInteger(movement.quantity),
        movement.value ? formatCurrency(movement.value) : "-",
        getMovementNotes(movement)
      ])
      : [["-", "-", "-", "-", "-", "Sem movimentacoes recentes"]],
    theme: "striped",
    headStyles: { fillColor: [138, 75, 56] }
  });
}

function appendConsolidatedPdfIntro(doc, farms, periodLabel) {
  const totals = farms.reduce((summary, farm) => {
    const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
    const saleSummary = summarizeSalePeriod(farm, state.filters.year, state.filters.month);
    const sanitarySummary = getSanitarySummary(farm);
    summary.animals += getFarmTotal(farm);
    summary.allocatedAnimals += getRegisteredPotreroAnimals(farm);
    summary.potreiros += getPotreroEntries(farm).length;
    summary.movements += monthly.totalMovements;
    summary.salesValue += saleSummary.totalValue;
    summary.sanitaryRecords += sanitarySummary.totalApplications;
    return summary;
  }, { animals: 0, allocatedAnimals: 0, potreiros: 0, movements: 0, salesValue: 0, sanitaryRecords: 0 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Estabelecimentos Da Luz", 14, 18);
  doc.setFontSize(16);
  doc.text("Relatorio consolidado de fazendas", 14, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Periodo analisado: ${periodLabel}`, 14, 36);
  doc.text(`Responsavel tecnico: ${TECHNICAL_MANAGER_NAME}`, 14, 42);

  doc.autoTable({
    startY: 50,
    head: [["Indicador consolidado", "Valor"]],
    body: [
      ["Fazendas selecionadas", formatInteger(farms.length)],
      ["Estoque consolidado", `${formatInteger(totals.animals)} animais`],
      ["Potreiros cadastrados", formatInteger(totals.potreiros)],
      ["Animais alocados em potreiros", `${formatInteger(totals.allocatedAnimals)} animais`],
      ["Movimentacoes no periodo", formatInteger(totals.movements)],
      ["Faturamento de vendas", formatCurrency(totals.salesValue)],
      ["Registros sanitarios", formatInteger(totals.sanitaryRecords)]
    ],
    theme: "striped",
    headStyles: { fillColor: [76, 64, 50] }
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Fazenda", "Estoque", "Potreiros", "Alocados", "Mov.", "Vendas", "Sanitario"]],
    body: farms.map((farm) => {
      const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
      const saleSummary = summarizeSalePeriod(farm, state.filters.year, state.filters.month);
      const sanitarySummary = getSanitarySummary(farm);
      return [
        farm.name,
        formatInteger(getFarmTotal(farm)),
        formatInteger(getPotreroEntries(farm).length),
        formatInteger(getRegisteredPotreroAnimals(farm)),
        formatInteger(monthly.totalMovements),
        formatCurrency(saleSummary.totalValue),
        formatInteger(sanitarySummary.totalApplications)
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [51, 92, 67] }
  });
}

async function appendFarmPdfSection(doc, farm, periodLabel) {
  const monthly = summarizePeriod(farm, state.filters.year, state.filters.month);
  const annual = summarizePeriod(farm, state.filters.year, "all");
  const saleSummary = summarizeSalePeriod(farm, state.filters.year, state.filters.month);
  const sanitarySummary = getSanitarySummary(farm);
  const sanitaryRecords = [...getFilteredSanitaryRecords(farm)].sort((a, b) => new Date(a.date) - new Date(b.date));
  const potreroTotals = getPotreroTotals(farm);
  const recentMovements = [...farm.movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);
  const insights = getOperationalInsights(farm);
  const discrepancy = getDiscrepancy(farm);
  const topY = await addPdfHeader(doc, farm, periodLabel, monthly);

  appendExecutivePdfTable(doc, farm, monthly, discrepancy, topY);
  appendInventoryPdfTable(doc, farm);
  appendOperationalPdfTable(doc, monthly, annual, saleSummary);
  appendSaleSummaryPdfTable(doc, saleSummary);
  appendSaleDetailsPdfTable(doc, saleSummary);
  appendPotreroPdfTable(doc, potreroTotals);
  appendSanitarySummaryPdfTable(doc, sanitarySummary);
  appendSanitaryDetailsPdfTable(doc, sanitaryRecords);
  appendInsightsPdfTable(doc, insights);
  appendRecentMovementsPdfTable(doc, recentMovements);
}

function getPdfFileName(farms) {
  if (farms.length === 1) {
    return `relatorio-${slugify(farms[0].name)}-${state.filters.year}.pdf`;
  }

  return `relatorio-fazendas-da-luz-${state.filters.year}.pdf`;
}

async function exportPdfReport(farmIds = [state.data.selectedFarmId]) {
  const farms = farmIds.map((farmId) => state.data.farms[farmId]).filter(Boolean);
  if (!farms.length) {
    alert("Nenhuma fazenda valida foi selecionada para o PDF.");
    return;
  }

  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    alert("A biblioteca de PDF nao foi carregada. Verifique sua conexao e tente novamente.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  if (typeof doc.autoTable !== "function") {
    alert("O modulo de tabela do PDF nao foi carregado. Verifique sua conexao e tente novamente.");
    return;
  }

  const periodLabel = state.filters.month === "all" ? `Ano de ${state.filters.year}` : `${MONTH_NAMES[Number(state.filters.month) - 1]} de ${state.filters.year}`;

  if (farms.length > 1) {
    appendConsolidatedPdfIntro(doc, farms, periodLabel);
  }

  for (const [index, farm] of farms.entries()) {
    if (index > 0 || farms.length > 1) {
      doc.addPage();
    }
    await appendFarmPdfSection(doc, farm, periodLabel);
  }

  addPdfFooters(doc);

  doc.save(getPdfFileName(farms));
}

function cloneSeedData() {
  if (typeof structuredClone === "function") {
    return structuredClone(seedData);
  }

  return JSON.parse(JSON.stringify(seedData));
}

function ensureDataShape(data) {
  if (!data.farms || typeof data.farms !== "object") {
    data.farms = {};
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
    login: user.login || `Usuario ${index + 1}`,
    password: user.password || ""
  }));
  data.auth.users = data.auth.users.map((user) => {
    if (user.id === "user-da-luz") {
      return {
        ...user,
        login: "Hugo Balbuena",
        password: "hugo123"
      };
    }

    return user;
  });
  if (!data.auth.users.some((user) => user.id === data.auth.sessionUserId)) {
    data.auth.sessionUserId = "";
  }

  Object.entries(seedData.farms).forEach(([farmId, farmTemplate]) => {
    if (!data.farms[farmId]) {
      data.farms[farmId] = cloneDeep(farmTemplate);
    }
  });

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
    if (!Array.isArray(farm.sanitaryProducts) || !farm.sanitaryProducts.length) {
      farm.sanitaryProducts = [...DEFAULT_SANITARY_PRODUCTS];
    }
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
    farm.sanitaryRecords = farm.sanitaryRecords.map((record) => ({
      ...record,
      id: record.id || record.sourceId || createMovementId(),
      potreiro: record.potreiro || "Sem potreiro"
    }));
    pruneLegacyPotreiros(farm);
  });

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

  return data;
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

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f5ede1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#776552";
  context.font = "16px Manrope";
  context.textAlign = "center";
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
          <p class="panel-kicker">Falha na inicializacao</p>
          <h2>O painel encontrou um erro ao abrir</h2>
        </div>
      </div>
      <div class="note-box">
        Verifique a conexao com a internet e recarregue a pagina. Detalhe tecnico: ${escapeHtml(message)}
      </div>
    </section>
  `;
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
