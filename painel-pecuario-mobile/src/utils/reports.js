import * as Print from "expo-print";
import { calcReproStats, calcStockTotal, fmtDate } from "./farmUtils";
import { formatMovementTypeLabel, getMovementSummary } from "./livestock";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function fmtNum(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function fmtCur(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const BASE_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1a2e1f; background: #fff; }
  .cover {
    background: linear-gradient(160deg, #1b4d2f 60%, #2d7a4f);
    color: #f8f4ec;
    padding: 48px 32px 40px;
    min-height: 200px;
    page-break-after: always;
  }
  .cover-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #b8d4a8; text-transform: uppercase; margin-bottom: 8px; }
  .cover-title { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
  .cover-sub { font-size: 14px; color: #d4e8c8; margin-bottom: 20px; }
  .cover-meta { font-size: 12px; color: #c8deba; line-height: 1.8; }
  .cover-strip {
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-top: 24px; padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.2);
  }
  .cover-kpi { background: rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 18px; min-width: 130px; }
  .cover-kpi strong { display: block; font-size: 24px; font-weight: 800; }
  .cover-kpi span { font-size: 11px; color: #c8deba; }
  .page { padding: 28px 28px 20px; }
  h1 { font-size: 20px; font-weight: 800; color: #1b4d2f; margin-bottom: 4px; margin-top: 28px; border-bottom: 3px solid #1b4d2f; padding-bottom: 6px; }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 15px; font-weight: 700; color: #375b43; margin-top: 20px; margin-bottom: 6px; border-bottom: 2px solid #dae6dd; padding-bottom: 4px; }
  h3 { font-size: 13px; font-weight: 700; color: #56705c; margin-top: 14px; margin-bottom: 4px; }
  .muted { color: #56705c; font-size: 12px; margin-bottom: 12px; }
  .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
  .card { border: 1px solid #dae6dd; border-radius: 10px; padding: 10px 14px; min-width: 120px; }
  .card strong { font-size: 20px; display: block; margin-bottom: 2px; color: #1a2e1f; font-weight: 800; }
  .card span { font-size: 11px; color: #56705c; }
  .card.accent { border-color: #c98c4f; }
  .card.accent strong { color: #c98c4f; }
  .card.blue { border-color: #5b8db8; }
  .card.blue strong { color: #5b8db8; }
  .card.danger { border-color: #8c4b38; }
  .card.danger strong { color: #8c4b38; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th, td { border-bottom: 1px solid #eaf2eb; padding: 7px 6px; text-align: left; vertical-align: top; }
  th { background: #f2f5f2; font-weight: 700; color: #375b43; font-size: 11px; }
  tr:nth-child(even) td { background: #f9fbf9; }
  .farm-divider {
    background: #f2f5f0;
    border-left: 5px solid #1b4d2f;
    padding: 14px 18px;
    margin: 24px 0 14px;
    border-radius: 0 8px 8px 0;
    page-break-before: auto;
  }
  .farm-divider h2 { border: none; padding: 0; margin: 0 0 2px; font-size: 17px; color: #1b4d2f; }
  .farm-divider span { font-size: 12px; color: #56705c; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .badge-green { background: #d6e5da; color: #1b4d2f; }
  .badge-red { background: #f5ddd8; color: #8c4b38; }
  .badge-blue { background: #d8e8f5; color: #2d5b8c; }
  .badge-gold { background: #f5e8d0; color: #8c6b38; }
  .footer { margin-top: 32px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 8px; text-align: center; }
`;

function buildConsolidatedCards(farms) {
  const totalAnimals = farms.reduce((s, f) => s + calcStockTotal(f), 0);
  const totalMov = farms.reduce((s, f) => s + (f.movements?.length || 0), 0);
  const totalSan = farms.reduce((s, f) => s + (f.sanitaryRecords?.length || 0), 0);
  const reproStats = calcReproStats(farms.flatMap((f) => f.reproductionRecords || []));
  return { totalAnimals, totalMov, totalSan, reproStats };
}

function buildFarmMovSummary(farm) {
  const summary = getMovementSummary(farm.movements || []);
  const totalValue = (farm.movements || []).reduce((s, m) => s + Number(m.value || 0), 0);
  const saleValue = (farm.movements || []).filter((m) => m.type === "venda").reduce((s, m) => s + Number(m.value || 0), 0);
  const buyValue = (farm.movements || []).filter((m) => m.type === "compra").reduce((s, m) => s + Number(m.value || 0), 0);
  return { ...summary, totalValue, saleValue, buyValue };
}

export async function shareFarmReport(farms) {
  const farmsArr = Array.isArray(farms) ? farms : [farms];
  const { totalAnimals, totalMov, totalSan, reproStats } = buildConsolidatedCards(farmsArr);
  const now = new Date().toLocaleString("pt-BR");

  const coverHtml = `
    <div class="cover">
      <div class="cover-eyebrow">Painel Pecuário · Relatório Gerencial</div>
      <div class="cover-title">Estabelecimentos Da Luz</div>
      <div class="cover-sub">${farmsArr.length === 1 ? farmsArr[0].name : `${farmsArr.length} fazendas consolidadas`}</div>
      <div class="cover-meta">
        Gerado em: ${esc(now)}<br>
        Fazendas incluídas: ${esc(farmsArr.map((f) => f.name).join(", "))}
      </div>
      <div class="cover-strip">
        <div class="cover-kpi"><strong>${esc(fmtNum(totalAnimals))}</strong><span>Animais no estoque</span></div>
        <div class="cover-kpi"><strong>${esc(fmtNum(totalMov))}</strong><span>Movimentações</span></div>
        <div class="cover-kpi"><strong>${esc(fmtNum(totalSan))}</strong><span>Registros sanitários</span></div>
        <div class="cover-kpi"><strong>${esc(reproStats.taxa)}%</strong><span>Taxa de prenhez</span></div>
      </div>
    </div>
  `;

  const allMovements = farmsArr.flatMap((f) =>
    (f.movements || []).map((m) => ({ ...m, farmName: f.name }))
  ).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const consolidatedSection = `
    <h1>Resumo consolidado — todas as fazendas</h1>
    <p class="muted">Gerado em ${esc(now)}</p>

    <div class="grid">
      <div class="card"><strong>${esc(fmtNum(totalAnimals))}</strong><span>Animais no estoque</span></div>
      <div class="card accent"><strong>${esc(fmtNum(totalMov))}</strong><span>Movimentações registradas</span></div>
      <div class="card blue"><strong>${esc(fmtNum(totalSan))}</strong><span>Registros sanitários</span></div>
      <div class="card danger"><strong>${esc(reproStats.taxa)}%</strong><span>Taxa de prenhez</span></div>
    </div>

    <h2>Estoque por fazenda</h2>
    <table>
      <thead><tr><th>Fazenda</th><th>Animais</th><th>Movimentações</th><th>Saldo período</th><th>Compras</th><th>Vendas</th><th>Nascimentos</th></tr></thead>
      <tbody>
        ${farmsArr.map((f) => {
          const s = buildFarmMovSummary(f);
          return `<tr>
            <td><strong>${esc(f.name)}</strong></td>
            <td>${esc(fmtNum(calcStockTotal(f)))}</td>
            <td>${esc(fmtNum(f.movements?.length || 0))}</td>
            <td>${s.saldo >= 0 ? "+" : ""}${esc(fmtNum(s.saldo))}</td>
            <td>${esc(fmtNum(s.compra))}</td>
            <td>${esc(fmtNum(s.venda))}</td>
            <td>${esc(fmtNum(s.nascimento))}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>

    <h2>Reprodução consolidada</h2>
    <div class="grid">
      <div class="card"><strong>${esc(reproStats.totalInsem)}</strong><span>Inseminações</span></div>
      <div class="card"><strong>${esc(reproStats.totalEntour)}</strong><span>Entouradas</span></div>
      <div class="card"><strong>${esc(reproStats.totalPrenha)}</strong><span>Prenhas confirmadas</span></div>
      <div class="card"><strong>${esc(reproStats.totalFalhada)}</strong><span>Falhadas</span></div>
      <div class="card"><strong>${esc(reproStats.aguardando)}</strong><span>Aguardando diagnóstico</span></div>
    </div>
  `;

  const farmsDetailHtml = farmsArr.map((farm) => {
    const s = buildFarmMovSummary(farm);
    const reproFarm = calcReproStats(farm.reproductionRecords || []);
    const recentMov = [...(farm.movements || [])]
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 20);

    return `
      <div class="farm-divider">
        <h2>${esc(farm.name)}</h2>
        <span>${esc(fmtNum(calcStockTotal(farm)))} animais em estoque · ${esc(fmtNum(farm.movements?.length || 0))} movimentações</span>
      </div>

      <h3>Estoque por categoria</h3>
      <table>
        <thead><tr><th>Categoria</th><th>Quantidade</th></tr></thead>
        <tbody>
          ${(farm.categories || []).filter((c) => c.quantity > 0).map((c) => `
            <tr><td>${esc(c.name)}</td><td>${esc(fmtNum(c.quantity))}</td></tr>
          `).join("") || "<tr><td colspan='2'>Sem categorias com animais</td></tr>"}
        </tbody>
      </table>

      <h3>Resumo de movimentações</h3>
      <div class="grid">
        <div class="card"><strong>${esc(fmtNum(s.compra))}</strong><span>Compras</span></div>
        <div class="card danger"><strong>${esc(fmtNum(s.venda))}</strong><span>Vendas</span></div>
        <div class="card"><strong>${esc(fmtNum(s.nascimento))}</strong><span>Nascimentos</span></div>
        <div class="card danger"><strong>${esc(fmtNum(s.morte))}</strong><span>Mortes</span></div>
        <div class="card ${s.saldo >= 0 ? "" : "danger"}"><strong>${s.saldo >= 0 ? "+" : ""}${esc(fmtNum(s.saldo))}</strong><span>Saldo líquido</span></div>
      </div>

      <h3>Resultado financeiro</h3>
      <div class="grid">
        <div class="card blue"><strong>${esc(fmtCur(s.buyValue))}</strong><span>Custo de compras</span></div>
        <div class="card accent"><strong>${esc(fmtCur(s.saleValue))}</strong><span>Receita de vendas</span></div>
        <div class="card ${s.saleValue - s.buyValue >= 0 ? "" : "danger"}">
          <strong>${esc(fmtCur(s.saleValue - s.buyValue))}</strong><span>Resultado líquido</span>
        </div>
      </div>

      <h3>Reprodução</h3>
      <div class="grid">
        <div class="card"><strong>${esc(reproFarm.totalInsem)}</strong><span>Inseminações</span></div>
        <div class="card"><strong>${esc(reproFarm.totalEntour)}</strong><span>Entouradas</span></div>
        <div class="card"><strong>${esc(reproFarm.totalPrenha)}</strong><span>Prenhas</span></div>
        <div class="card"><strong>${esc(reproFarm.taxa)}%</strong><span>Taxa de prenhez</span></div>
      </div>

      <h3>Movimentações recentes (últimas 20)</h3>
      <table>
        <thead>
          <tr><th>Data</th><th>Código</th><th>Tipo</th><th>Categoria</th><th>Qtd.</th><th>Valor</th></tr>
        </thead>
        <tbody>
          ${recentMov.length ? recentMov.map((m) => `
            <tr>
              <td>${esc(fmtDate(m.date))}</td>
              <td>${esc(m.code || "-")}</td>
              <td>${esc(formatMovementTypeLabel(m.type))}</td>
              <td>${esc(m.categoryName || "-")}</td>
              <td>${esc(fmtNum(m.quantity || 0))}</td>
              <td>${m.value ? esc(fmtCur(m.value)) : "-"}</td>
            </tr>
          `).join("") : `<tr><td colspan='6'>Sem movimentações registradas.</td></tr>`}
        </tbody>
      </table>
    `;
  }).join("");

  const recentAllHtml = allMovements.length > 0 ? `
    <h1>Últimas movimentações — todas as fazendas</h1>
    <table>
      <thead>
        <tr><th>Data</th><th>Fazenda</th><th>Código</th><th>Tipo</th><th>Categoria</th><th>Qtd.</th><th>Valor</th></tr>
      </thead>
      <tbody>
        ${allMovements.slice(0, 30).map((m) => `
          <tr>
            <td>${esc(fmtDate(m.date))}</td>
            <td>${esc(m.farmName)}</td>
            <td>${esc(m.code || "-")}</td>
            <td>${esc(formatMovementTypeLabel(m.type))}</td>
            <td>${esc(m.categoryName || "-")}</td>
            <td>${esc(fmtNum(m.quantity || 0))}</td>
            <td>${m.value ? esc(fmtCur(m.value)) : "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : "";

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        ${coverHtml}
        <div class="page">
          ${consolidatedSection}
          ${farmsDetailHtml}
          ${recentAllHtml}
          <div class="footer">Estabelecimentos Da Luz · Painel Pecuário · Relatório Gerencial · ${esc(now)}</div>
        </div>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
}

export async function shareSanitaryReport(farms) {
  const farmsArr = Array.isArray(farms) ? farms : [farms];
  const now = new Date().toLocaleString("pt-BR");

  const allRecords = farmsArr.flatMap((f) =>
    (f.sanitaryRecords || []).map((r) => ({ ...r, farmName: f.name }))
  ).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const totalApplications = allRecords.length;
  const treatedAnimals = allRecords.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const uniqueProducts = new Set(allRecords.map((r) => r.product).filter(Boolean)).size;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="cover">
          <div class="cover-eyebrow">Painel Pecuário · Relatório Sanitário</div>
          <div class="cover-title">Estabelecimentos Da Luz</div>
          <div class="cover-sub">${farmsArr.length === 1 ? farmsArr[0].name : `${farmsArr.length} fazendas consolidadas`}</div>
          <div class="cover-meta">
            Gerado em: ${esc(now)}<br>
            Fazendas: ${esc(farmsArr.map((f) => f.name).join(", "))}
          </div>
          <div class="cover-strip">
            <div class="cover-kpi"><strong>${esc(fmtNum(totalApplications))}</strong><span>Aplicações totais</span></div>
            <div class="cover-kpi"><strong>${esc(fmtNum(treatedAnimals))}</strong><span>Animais tratados</span></div>
            <div class="cover-kpi"><strong>${esc(fmtNum(uniqueProducts))}</strong><span>Produtos distintos</span></div>
          </div>
        </div>

        <div class="page">
          <h1>Resumo consolidado — sanitário</h1>
          <p class="muted">Gerado em ${esc(now)}</p>

          <div class="grid">
            <div class="card blue"><strong>${esc(fmtNum(totalApplications))}</strong><span>Aplicações totais</span></div>
            <div class="card"><strong>${esc(fmtNum(treatedAnimals))}</strong><span>Animais tratados</span></div>
            <div class="card accent"><strong>${esc(fmtNum(uniqueProducts))}</strong><span>Produtos distintos</span></div>
          </div>

          <h2>Por fazenda</h2>
          <table>
            <thead><tr><th>Fazenda</th><th>Aplicações</th><th>Animais tratados</th><th>Produtos distintos</th></tr></thead>
            <tbody>
              ${farmsArr.map((f) => {
                const recs = f.sanitaryRecords || [];
                const animals = recs.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
                const prods = new Set(recs.map((r) => r.product).filter(Boolean)).size;
                return `<tr>
                  <td><strong>${esc(f.name)}</strong></td>
                  <td>${esc(fmtNum(recs.length))}</td>
                  <td>${esc(fmtNum(animals))}</td>
                  <td>${esc(fmtNum(prods))}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>

          ${farmsArr.map((farm) => {
            const records = [...(farm.sanitaryRecords || [])]
              .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
            if (!records.length) return "";
            return `
              <div class="farm-divider">
                <h2>${esc(farm.name)}</h2>
                <span>${esc(fmtNum(records.length))} registros · ${esc(fmtNum(records.reduce((s, r) => s + (Number(r.quantity) || 0), 0)))} animais tratados</span>
              </div>
              <table>
                <thead>
                  <tr><th>Data</th><th>Código</th><th>Categoria</th><th>Qtd.</th><th>Produto</th><th>Via</th><th>Responsável</th><th>Observações</th></tr>
                </thead>
                <tbody>
                  ${records.map((r) => `
                    <tr>
                      <td>${esc(fmtDate(r.date))}</td>
                      <td>${esc(r.code || "-")}</td>
                      <td>${esc(r.categoryName || "-")}</td>
                      <td>${esc(fmtNum(r.quantity || 0))}</td>
                      <td>${esc(r.product || r.name || "-")}</td>
                      <td>${esc(r.via || "-")}</td>
                      <td>${esc(r.responsible || "-")}</td>
                      <td>${esc(r.notes || "")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `;
          }).join("")}

          <div class="footer">Estabelecimentos Da Luz · Painel Pecuário · Manejo Sanitário · ${esc(now)}</div>
        </div>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
}
