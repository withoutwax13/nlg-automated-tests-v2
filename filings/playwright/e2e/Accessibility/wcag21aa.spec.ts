import { test, expect } from '../../support/pwtest';
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
        pw.visit("https://dev.azavargovapps.com/login");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        pw.login({ accountType: "ags" });
        agsFilingGrid.init();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        pw.login({ accountType: "municipal" });
        municipalFilingGrid.init();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Filing List Page", { defaultCommandTimeout: 15000 }, () => {
        pw.login({ accountType: "taxpayer" });
        taxpayerFilingGrid.init();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test('Municipal Edit Page', { defaultCommandTimeout: 15000 }, () => {
        pw.login({ accountType: "ags" });
        municipalityGrid.init();
        municipalityGrid.selectMunicipality("City of Arrakis");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test('Taxpayer Submit Form Page', { defaultCommandTimeout: 15000 }, () => {
        pw.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Modal Flow", () => {
        pw.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Basic Information Step", () => {
        pw.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Tax Information Step", () => {
        pw.login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Preparer Information Step", () => {
        pw.login({ accountType: "taxpayer" });
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
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Payment Page", () => {
        pw.login({ accountType: "taxpayer" });
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
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Application Confirmation Page", () => {
        pw.login({ accountType: "taxpayer" });
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
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Audit Log Page", () => {
        pw.login({ accountType: "ags", accountIndex: 5 });
        agsFilingGrid.init();
        agsFilingGrid.checkAuditLog("Reference ID", "AAAARKEC");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Filing Requested Exports Page", () => {
        pw.login({ accountType: "ags", accountIndex: 8 });
        agsFilingGrid.init();
        agsFilingGrid.clickViewRequestedExtractButton();
        pw.url().should("include", "/filingsExtractRequests?");
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("AGS Specific Filing Page", () => {
        pw.login({ accountType: "ags", accountIndex: 9 });
        agsFilingGrid.init();
        agsFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Export Full Filing Data Modal", () => {
        pw.login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.getElement().exportButton().click();
        filingExportModal.selectExcelFileType();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Specific Filing Page", () => {
        pw.login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Page", () => {
        pw.login({ accountType: "municipal" });
        govApprovalGrid.init();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Page - Message Modal", () => {
        pw.login({ accountType: "municipal", accountIndex: 3 });
        govApprovalGrid.init();
        govApprovalGrid.getElementOfColumn(
            "Message",
            "Reference ID",
            "AAAAUUKA",
            "message"
        );
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
    test("Municipal Approval Review Page", () => {
        pw.login({ accountType: "municipal", accountIndex: 4 });
        govApprovalGrid.init();
        govApprovalGrid.filterColumn("Reference ID", "AAAAUUKA", "text", "Contains");
        pw.waitForLoading();
        pw.get(`@${govApprovalGrid.userType}_${govApprovalGrid.defaultGridColumnsAlias}`)
            .should("exist")
            .then((columnIndexes: any) => {
                const anchorColumnIndex = columnIndexes["Reference ID"];
                govApprovalGrid.getElement()
                    .rows()
                    .each(($row) => {
                        const $columns = $row.find("td");
                        if ($columns.eq(anchorColumnIndex).text() === "AAAAUUKA") {
                            pw.wrap($columns).eq(0).find("input").click();
                        }
                    });
            });
        govApprovalGrid.clickStartApprovalForSelectedButton();
        pw.checkAccessibility(null, customAccessibilityOptions);
    });
});