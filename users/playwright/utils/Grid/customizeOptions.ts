export const rearrangeColumns = () => {
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item")
      .each((_, $index) => {
        cy.get(".k-dialog")
          .find(".k-list-content")
          .find(".k-list-ul")
          .find(".k-list-item")
          .eq($index)
          .find("span")
          .eq(0)
          .find("i")
          .then(($dragIcon) => {
            if ($index !== 0) {
              const dataTransfer = new DataTransfer();
              cy.wrap($dragIcon)
                .trigger("mousedown", { which: 1 })
                .trigger("dragstart", { dataTransfer })
                .trigger("drag", { dataTransfer });
  
              cy.wrap($dragIcon)
                .parent() // Get the parent of the `i` element
                .parent() // Get the grandparent (the `.k-list-item`)
                .prev() // Get the next PREV `.k-list-item`
                .then(($target) => {
                  cy.wrap($target)
                    .trigger("dragover", { dataTransfer })
                    .trigger("drop", { dataTransfer });
                });
            }
          });
      });
  };
  export const freezeColumns = (isToggleFreeze: boolean, columnIndex: number[]) => {
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item ")
      .each(($el, $index) => {
        cy.wrap($el)
          .find("span")
          .eq(1)
          .invoke("text")
          .then(($text: string) => {
            cy.wrap($el)
              .find("span[role='switch']")
              .last()
              .invoke("attr", "aria-checked")
              .then((checked) => {
                // if the column is set to freeze, save the index of the column
                if (
                  checked === "true" &&
                  isToggleFreeze &&
                  columnIndex.includes($index)
                ) {
                  cy.wrap($el).find("span[role='switch']").last().click();
                }
                if (
                  checked === "false" &&
                  !isToggleFreeze &&
                  columnIndex.includes($index)
                ) {
                  cy.wrap($el).find("span[role='switch']").last().click();
                }
              });
          });
      });
  };
  export const freezeColumnsApproval = (isToggleFreeze: boolean, columnIndex: number[]) => {
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item ")
      .each(($el, $index) => {
        cy.wrap($el)
          .find("span")
          .eq(1)
          .invoke("text")
          .then(($text: string) => {
            cy.wrap($el)
              .find("span[role='switch']")
              .last()
              .invoke("attr", "aria-checked")
              .then((checked) => {
                // if the column is set to freeze, save the index of the column
                if (
                  checked === "true" &&
                  isToggleFreeze &&
                  columnIndex.includes($index + 1)
                ) {
                  cy.wrap($el).find("span[role='switch']").last().click();
                }
                if (
                  checked === "false" &&
                  !isToggleFreeze &&
                  columnIndex.includes($index + 1)
                ) {
                  cy.wrap($el).find("span[role='switch']").last().click();
                }
              });
          });
      });
  };
  
  export const verifyFreezeColumns = (enabledColumnCount: number, ) => {
    let trueSwitchCount = 0; // Counter for the number of enabled switches
  
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item ")
      .each(($el) => {
        cy.wrap($el)
          .find("span")
          .eq(1)
          .invoke("text")
          .then(($text: string) => {
            cy.wrap($el)
              .find("span[role='switch']")
              .last()
              .invoke("attr", "aria-checked")
              .then((checked) => {
                if (checked === "true") {
                  trueSwitchCount++; 
                  expect(trueSwitchCount).to.be.lte(enabledColumnCount); 
                } else {
                  // Verify the remaining have class 'k-disabled'
                  cy.wrap($el)
                    .find("span[role='switch']")
                    .last()
                    .should("have.class", "k-disabled");
                }
              });
          });
      })
      .then(() => {
        // Assert that exactly the expected number of columns have been enabled
        expect(trueSwitchCount).to.eq(enabledColumnCount);
      });
  };
  export const hideShowColumns = (isToggleHide: boolean, columnIndex: number[]) => {
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item ")
      .each(($el, $index) => {
        cy.wrap($el)
          .find("span")
          .eq(1)
          .invoke("text")
          .then(($text: string) => {
            cy.wrap($el)
              .find("span[role='switch']")
              .first()
              .invoke("attr", "aria-checked")
              .then((checked) => {
                // if the column is set to be visible, save the index of the column
                if (
                  checked === "true" &&
                  isToggleHide &&
                  columnIndex.includes($index)
                ) {
                  cy.wrap($el).find("span[role='switch']").first().click();
                }
                if (
                  checked === "false" &&
                  !isToggleHide &&
                  columnIndex.includes($index)
                ) {
                  cy.wrap($el).find("span[role='switch']").first().click();
                }
              });
          });
      });
  };
  export const hideShowColumnsApproval = (isToggleHide: boolean, columnIndex: number[]) => {
    cy.get(".k-dialog")
      .find(".k-list-content")
      .find(".k-list-ul")
      .find(".k-list-item ")
      .each(($el, $index) => {
        cy.wrap($el)
          .find("span")
          .eq(1)
          .invoke("text")
          .then(($text: string) => {
            cy.wrap($el)
              .find("span[role='switch']")
              .first()
              .invoke("attr", "aria-checked")
              .then((checked) => {
                // if the column is set to be visible, save the index of the column
                if (
                  checked === "true" &&
                  isToggleHide &&
                  columnIndex.includes($index +1 )
                ) {
                  cy.wrap($el).find("span[role='switch']").first().click();
                }
                if (
                  checked === "false" &&
                  !isToggleHide &&
                  columnIndex.includes($index + 1)
                ) {
                  cy.wrap($el).find("span[role='switch']").first().click();
                }
              });
          });
      });
  };