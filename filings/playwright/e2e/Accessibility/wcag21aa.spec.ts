import { test, expect } from '@playwright/test';
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import FilingGrid from "../../objects/FilingGrid";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import Payment from "../../objects/Payment";
import FormPreview from "../../objects/FormPreview";
import ExportFiling from "../../objects/ExportFiling";
import ApprovalGrid from "../../objects/ApprovalGrid";

const customAccessibilityOptions = {
    includedImpacts: ['critical', 'serious'],
    runOnly: ['wcag21aa', 'best-practice'], // current standard implemented accross NLG
    generateReport: false,
};

const taxpayerFilingGrid = new FilingGrid({
    userType: "taxpayer",
});
const municipalityGrid = new MunicipalityGrid({
    userType: "ags",
});
const municipalFilingGrid = new FilingGrid({
    userType: "municipal"
});

const agsFilingGrid = new FilingGrid({
    userType: "ags",
    municipalitySelection: "City of Arrakis",
});
const filing = new Filing({ isResumingDraftApplication: false });
const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filingExportModal = new ExportFiling();
const govApprovalGrid = new ApprovalGrid({ userType: "municipal" });

test.describe.skip('Accessibility Tests', () => {
    test("Login Page", { defaultCommandTimeout: 15000 }, () => {
        cy.visit("https://dev.azavargovapps.com/login");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        cy.login({ accountType: "ags" });
        agsFilingGrid.init();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        cy.login({ accountType: "municipal" });
        municipalFilingGrid.init();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        cy.login({ accountType: "taxpayer" });
        taxpayerFilingGrid.init();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test('Municipal Edit Page', { defaultCommandTimeout: 15000 }, () => {
        cy.login({ accountType: "ags" });
        municipalityGrid.init();
        municipalityGrid.selectMunicipality("City of Arrakis");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test('Taxpayer Submit Form Page', { defaultCommandTimeout: 15000 }, () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Modal Flow", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Basic Information Step", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Tax Information Step", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Preparer Information Step", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        form.clickNextbutton();
        form.enterPreparerInformation();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Payment Page", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        form.clickNextbutton();
        form.enterPreparerInformation();
        form.clickNextbutton();
        formPreview.clickSubmitButton();
        payment.clickSavedPaymentMethods();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Application Confirmation Page", () => {
        cy.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        form.clickNextbutton();
        form.enterPreparerInformation();
        form.clickNextbutton();
        formPreview.clickSubmitButton();
        payment.clickSavedPaymentMethods();
        payment.selectSavedPaymentMethod(0);
        payment.clickTermsAndConditionsCheckbox();
        payment.clickFinishAndPayButton();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Audit Log Page", () => {
        cy.login({ accountType: "ags", accountIndex: 5 });
        agsFilingGrid.init();
        agsFilingGrid.checkAuditLog("Reference ID", "AAAARKEC");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Filing Requested Exports Page", () => {
        cy.login({ accountType: "ags", accountIndex: 8 });
        agsFilingGrid.init();
        agsFilingGrid.clickViewRequestedExtractButton();
        cy.url().should("include", "/filingsExtractRequests?");
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Specific Filing Page", () => {
        cy.login({ accountType: "ags", accountIndex: 9 });
        agsFilingGrid.init();
        agsFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Export Full Filing Data Modal", () => {
        cy.login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.getElement().exportButton().click();
        filingExportModal.selectExcelFileType();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Specific Filing Page", () => {
        cy.login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Page", () => {
        cy.login({ accountType: "municipal" });
        govApprovalGrid.init();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Page - Message Modal", () => {
        cy.login({ accountType: "municipal", accountIndex: 3 });
        govApprovalGrid.init();
        govApprovalGrid.getElementOfColumn(
            "Message",
            "Reference ID",
            "AAAAUUKA",
            "message"
        );
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Review Page", () => {
        cy.login({ accountType: "municipal", accountIndex: 4 });
        govApprovalGrid.init();
        govApprovalGrid.filterColumn("Reference ID", "AAAAUUKA", "text", "Contains");
        cy.waitForLoading();
        cy.get(`@${govApprovalGrid.userType}_${govApprovalGrid.defaultGridColumnsAlias}`)
            .should("exist")
            .then((columnIndexes: any) => {
                const anchorColumnIndex = columnIndexes["Reference ID"];
                govApprovalGrid.getElement()
                    .rows()
                    .each(($row) => {
                        const $columns = $row.find("td");
                        if ($columns.eq(anchorColumnIndex).text() === "AAAAUUKA") {
                            cy.wrap($columns).eq(0).find("input").click();
                        }
                    });
            });
        govApprovalGrid.clickStartApprovalForSelectedButton();
        cy.checkAccessibility(null, customAccessibilityOptions);
    });
});