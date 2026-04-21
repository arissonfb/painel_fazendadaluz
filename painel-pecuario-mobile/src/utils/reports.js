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

export async function shareFarmReport(farm) {
  const movementSummary = getMovementSummary(farm?.movements || []);
  const reproductionSummary = calcReproStats(farm?.reproductionRecords || []);
  const totalAnimals = calcStockTotal(farm);
  const recentMovements = [...(farm?.movements || [])]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 10);
  const recentSanitary = [...(farm?.sanitaryRecords || [])]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 10);

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #1a2e1f; padding: 24px; }
          h1 { margin-bottom: 4px; color: #375b43; }
          h2 { margin-top: 28px; color: #375b43; }
          .muted { color: #56705c; margin-bottom: 18px; }
          .grid { display: flex; flex-wrap: wrap; gap: 12px; }
          .card { border: 1px solid #dae6dd; border-radius: 12px; padding: 12px; min-width: 160px; }
          .card strong { font-size: 20px; display: block; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #eaf2eb; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f2f5f2; }
          .attachments a { display: block; color: #375b43; text-decoration: none; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h1>${esc(farm?.name || "Fazenda")}</h1>
        <div class="muted">Relatorio mobile gerado em ${esc(new Date().toLocaleString("pt-BR"))}</div>
        <div class="grid">
          <div class="card"><strong>${esc(totalAnimals)}</strong>Animais no estoque</div>
          <div class="card"><strong>${esc((farm?.movements || []).length)}</strong>Movimentacoes</div>
          <div class="card"><strong>${esc((farm?.sanitaryRecords || []).length)}</strong>Registros sanitarios</div>
          <div class="card"><strong>${esc(reproductionSummary.taxa)}%</strong>Taxa de prenhez</div>
        </div>
        <h2>Resumo de movimentacoes</h2>
        <div class="grid">
          <div class="card"><strong>${esc(movementSummary.compra)}</strong>Compras</div>
          <div class="card"><strong>${esc(movementSummary.venda)}</strong>Vendas</div>
          <div class="card"><strong>${esc(movementSummary.nascimento)}</strong>Nascimentos</div>
          <div class="card"><strong>${esc(movementSummary.morte)}</strong>Mortes</div>
          <div class="card"><strong>${esc(movementSummary.saldo)}</strong>Saldo liquido</div>
        </div>
        <h2>Movimentacoes recentes</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Codigo</th>
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
                    ? record.attachments.map((attachment) => `<a href="${esc(attachment.url)}">${esc(attachment.name || attachment.url)}</a>`).join("")
                    : "-"}
                </td>
              </tr>
            `).join("") : `<tr><td colspan="6">Sem movimentacoes registradas.</td></tr>`}
          </tbody>
        </table>
        <h2>Sanitario recente</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Codigo</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Qtd.</th>
              <th>Anexos</th>
            </tr>
          </thead>
          <tbody>
            ${recentSanitary.length ? recentSanitary.map((record) => `
              <tr>
                <td>${esc(fmtDate(record.date))}</td>
                <td>${esc(record.code || "-")}</td>
                <td>${esc(record.product || record.name || "-")}</td>
                <td>${esc(record.categoryName || "-")}</td>
                <td>${esc(record.quantity || 0)}</td>
                <td class="attachments">
                  ${Array.isArray(record.attachments) && record.attachments.length
                    ? record.attachments.map((attachment) => `<a href="${esc(attachment.url)}">${esc(attachment.name || attachment.url)}</a>`).join("")
                    : "-"}
                </td>
              </tr>
            `).join("") : `<tr><td colspan="6">Sem registros sanitarios.</td></tr>`}
          </tbody>
        </table>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
  return null;
}
