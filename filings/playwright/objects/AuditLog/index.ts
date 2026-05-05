const AUDITLOG_COLUMNS = [
  "Action",
  "Role",
  "Action Taken By",
  "Created Date",
  "Amount",
];

class AuditLog {
  private elements() {
    return {
      columns: () => pw.get("thead").find("tr").eq(0).find("th"),
      filterRow: () => pw.get("thead").find("tr").eq(1),
      rows: () =>
        pw.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
      actionFilter: () => this.getElement().filterRow().find("th").eq(1),
      roleFilter: () => this.getElement().filterRow().find("th").eq(2),
      actionTakenByFilter: () => this.getElement().filterRow().find("th").eq(3),
      createdByFilter: () => this.getElement().filterRow().find("th").eq(4),
      amountFilter: () => this.getElement().filterRow().find("th").eq(5),
    };
  }
  getElement() {
    return this.elements();
  }

  findRowByAction(action: string, alias: string) {
    this.getElement()
      .rows()
      .then((rows) => {
        const $columns = rows.find("td");
        pw.wrap($columns.filter(`:contains(${action})`).eq(0), {
          timeout: 60000,
        }).as(alias);
      });
  }

  findRowByRole(role: string, alias: string) {
    this.getElement()
      .rows()
      .then((rows) => {
        const $columns = rows.find("td");
        pw.wrap($columns.filter(`:contains(${role})`).eq(0), {
          timeout: 60000,
        }).as(alias);
      });
  }

  findRowByActionTakenBy(actionTakenBy: string, alias: string) {
    this.getElement()
      .rows()
      .then((rows) => {
        const $columns = rows.find("td");
        pw.wrap($columns.filter(`:contains(${actionTakenBy})`).eq(0), {
          timeout: 60000,
        }).as(alias);
      });
  }

  findRowByCreatedDate(
    createdDate: { month: number; day: number; year: number },
    alias: string
  ) {
    const wantedDate = `${createdDate.month}-${createdDate.year}-${createdDate.day}`;
    this.getElement()
      .rows()
      .then((rows) => {
        const $columns = rows.find("td");
        pw.wrap($columns.filter(`:contains(${wantedDate})`).eq(0), {
          timeout: 60000,
        }).as(alias);
      });
  }

  expandCollapseRow(
    anchorColumn: string,
    anchorValue: string | { month: number; day: number; year: number }
  ) {
    switch (anchorColumn) {
      case "Action":
        if (typeof anchorValue === "string") {
          this.findRowByAction(anchorValue, "actionRow");
          pw.get("@actionRow").parent("tr").find("td").eq(0).find("a").click();
        } else {
          throw new Error("Invalid anchor value for Action column");
        }
        break;
      case "Role":
        if (typeof anchorValue === "string") {
          this.findRowByRole(anchorValue, "roleRow");
          pw.get("@roleRow").parent("tr").find("td").eq(0).find("a").click();
        } else {
          throw new Error("Invalid anchor value for Role column");
        }
        break;
      case "Action Taken By":
        if (typeof anchorValue === "string") {
          this.findRowByActionTakenBy(anchorValue, "actionTakenByRow");
          pw.get("@actionTakenByRow")
            .parent("tr")
            .find("td")
            .eq(0)
            .find("a")
            .click();
        } else {
          throw new Error("Invalid anchor value for Action Taken By column");
        }
        break;
      case "Created Date":
        if (typeof anchorValue === "object") {
          this.findRowByCreatedDate(anchorValue, "createdDateRow");
          pw.get("@createdDateRow")
            .parent("tr")
            .find("td")
            .eq(0)
            .find("a")
            .click();
        } else {
          throw new Error("Invalid anchor value for Created Date column");
        }
        break;
      default:
        break;
    }
  }
}

export default AuditLog;
