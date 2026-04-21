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

const BASE_STYLE = `
  body { font-family: Arial, sans-serif; color: #1a2e1f; padding: 24px; }
  h1 { margin-bottom: 4px; color: #375b43; }
  h2 { margin-top: 28px; color: #375b43; border-bottom: 2px solid #dae6dd; padding-bottom: 6px; }
  .muted { color: #56705c; margin-bottom: 18px; font-size: 13px; }
  .grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
  .card { border: 1px solid #dae6dd; border-radius: 12px; padding: 12px 16px; min-width: 140px; }
  .card strong { font-size: 22px; display: block; margin-bottom: 4px; color: #1a2e1f; }
  .card span { font-size: 12px; color: #56705c; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border-bottom: 1px solid #eaf2eb; padding: 8px 6px; text-align: left; vertical-align: top; }
  th { background: #f2f5f2; font-weight: 700; color: #375b43; }
  tr:nth-child(even) td { background: #f9fbf9; }
  .attachments a { display: block; color: #375b43; text-decoration: none; margin-bottom: 4px; font-size: 12px; }
  .footer { margin-top: 32px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 8px; }
`;

export async function shareFarmReport(farm) {
  const movementSummary = getMovementSummary(farm?.movements || []);
  const reproductionSummary = calcReproStats(farm?.reproductionRecords || []);
  const totalAnimals = calcStockTotal(farm);
  const recentMovements = [...(farm?.movements || [])]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 15);

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <h1>${esc(farm?.name || "Fazenda")}</h1>
        <div class="muted">Relatório pecuário gerado em ${esc(new Date().toLocaleString("pt-BR"))}</div>

        <div class="grid">
          <div class="card"><strong>${esc(totalAnimals)}</strong><span>Animais no estoque</span></div>
          <div class="card"><strong>${esc((farm?.movements || []).length)}</strong><span>Movimentações</span></div>
          <div class="card"><strong>${esc((farm?.sanitaryRecords || []).length)}</strong><span>Registros sanitários</span></div>
          <div class="card"><strong>${esc(reproductionSummary.taxa)}%</strong><span>Taxa de prenhez</span></div>
        </div>

        <h2>Resumo de movimentações</h2>
        <div class="grid">
          <div class="card"><strong>${esc(movementSummary.compra)}</strong><span>Compras</span></div>
          <div class="card"><strong>${esc(movementSummary.venda)}</strong><span>Vendas</span></div>
          <div class="card"><strong>${esc(movementSummary.nascimento)}</strong><span>Nascimentos</span></div>
          <div class="card"><strong>${esc(movementSummary.morte)}</strong><span>Mortes</span></div>
          <div class="card"><strong>${esc(movementSummary.saldo)}</strong><span>Saldo líquido</span></div>
        </div>

        <h2>Reprodução</h2>
        <div class="grid">
          <div class="card"><strong>${esc(reproductionSummary.totalInsem)}</strong><span>Inseminações</span></div>
          <div class="card"><strong>${esc(reproductionSummary.totalEntour)}</strong><span>Entouradas</span></div>
          <div class="card"><strong>${esc(reproductionSummary.totalPrenha)}</strong><span>Prenhas</span></div>
          <div class="card"><strong>${esc(reproductionSummary.totalFalhada)}</strong><span>Falhadas</span></div>
          <div class="card"><strong>${esc(reproductionSummary.aguardando)}</strong><span>Aguardando</span></div>
        </div>

        <h2>Movimentações recentes</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Código</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Anexos</th>
            </tr>
          </thead>
          <tbody>
            ${recentMovements.length ? recentMovements.map((record) => `
              <tr>
                <td>${esc(fmtDate(record.date))}</td>
                <td>${esc(record.code || "-")}</td>
                <td>${esc(formatMovementTypeLabel(record.type))}</td>
                <td>${esc(record.categoryName || "-")}</td>
                <td>${esc(record.quantity || 0)}</td>
                <td class="attachments">
                  ${Array.isArray(record.attachments) && record.attachments.length
                    ? record.attachments.map((a) => `<a href="${esc(a.url)}">${esc(a.name || a.url)}</a>`).join("")
                    : "-"}
                </td>
              </tr>
            `).join("") : `<tr><td colspan="6">Sem movimentações registradas.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">Estabelecimentos Da Luz · Relatório Pecuário · ${esc(farm?.name || "")}</div>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
  return null;
}

export async function shareSanitaryReport(farm) {
  const records = [...(farm?.sanitaryRecords || [])]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const totalApplications = records.length;
  const treatedAnimals = records.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const uniqueProducts = new Set(records.map((r) => r.product).filter(Boolean)).size;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <h1>Relatório de Manejo Sanitário</h1>
        <div class="muted">
          Fazenda: <strong>${esc(farm?.name || "-")}</strong> &nbsp;·&nbsp;
          Gerado em ${esc(new Date().toLocaleString("pt-BR"))}
        </div>

        <div class="grid">
          <div class="card"><strong>${esc(totalApplications)}</strong><span>Aplicações</span></div>
          <div class="card"><strong>${esc(treatedAnimals)}</strong><span>Animais tratados</span></div>
          <div class="card"><strong>${esc(uniqueProducts)}</strong><span>Produtos distintos</span></div>
        </div>

        <h2>Registros sanitários</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Código</th>
              <th>Categoria</th>
              <th>Qtd.</th>
              <th>Produto</th>
              <th>Via</th>
              <th>Responsável</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${records.length ? records.map((record) => `
              <tr>
                <td>${esc(fmtDate(record.date))}</td>
                <td>${esc(record.code || "-")}</td>
                <td>${esc(record.categoryName || "-")}</td>
                <td>${esc(record.quantity || 0)}</td>
                <td>${esc(record.product || record.name || "-")}</td>
                <td>${esc(record.via || "-")}</td>
                <td>${esc(record.responsible || "-")}</td>
                <td>${esc(record.notes || "")}</td>
              </tr>
            `).join("") : `<tr><td colspan="8">Sem registros sanitários.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">Estabelecimentos Da Luz · Manejo Sanitário · ${esc(farm?.name || "")}</div>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
  return null;
}
