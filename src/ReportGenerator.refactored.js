export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem todos os itens.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const isAdmin = user.role === 'ADMIN';
    let report = '';

    report += this.generateHeader(reportType, user);

    const { reportBody, total } = this.generateBody(reportType, user, items, isAdmin);
    report += reportBody;

    report += this.generateFooter(reportType, total);
    return report.trim();
  }

  // --- Geração do corpo do relatório ---
  generateBody(reportType, user, items, isAdmin) {
    let reportBody = '';
    let total = 0;

    for (const item of items) {
      const result = this.generateItemRow(reportType, user, item, isAdmin);
      if (result) {
        reportBody += result.row;
        total += result.value;
      }
    }

    return { reportBody, total };
  }

  // --- Processa cada item individualmente ---
  generateItemRow(reportType, user, item, isAdmin) {
    if (!this.shouldIncludeItem(user, item)) return null;

    if (isAdmin && item.value > 1000) {
      item.priority = true;
    }

    return {
      row: this.generateRow(reportType, item, user),
      value: item.value,
    };
  }

  // --- Helpers ---
  generateHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }
    // HTML
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
  }

  generateFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }
    // HTML
    return `</table>
<h3>Total: ${total}</h3>
</body></html>\n`;
  }

  shouldIncludeItem(user, item) {
    return user.role === 'ADMIN' || item.value <= 500;
  }

  generateRow(reportType, item, user) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    // HTML
    const trTag = item.priority
      ? `<tr style="font-weight:bold;">`
      : '<tr>';
    return `${trTag}<td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }
}
