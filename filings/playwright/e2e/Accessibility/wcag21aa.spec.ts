import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
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
    test("Login Page", async ({ page }) => {
        await page.goto("https://dev.azavargovapps.com/login");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("AGS Filing List Page", async ({ page }) => {
        await login({ accountType: "ags" });
        agsFilingGrid.init();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Filing List Page", async ({ page }) => {
        await login({ accountType: "municipal" });
        municipalFilingGrid.init();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Filing List Page", async ({ page }) => {
        await login({ accountType: "taxpayer" });
        taxpayerFilingGrid.init();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Edit Page", async ({ page }) => {
        await login({ accountType: "ags" });
        municipalityGrid.init();
        municipalityGrid.selectMunicipality("City of Arrakis");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Page", async ({ page }) => {
        await login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Modal Flow", async ({ page }) => {
        await login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Basic Information Step", async ({ page }) => {
        await login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Tax Information Step", async ({ page }) => {
        await login({ accountType: "taxpayer" });
        filing.goToSubmitFormsTab();
        filing.selectGovernment("City of Arrakis");
        filing.selectForm("Food and Beverage");
        filing.selectBusinessToFile("Arrakis Spice Company 13685");
        form.clickNextbutton();
        form.enterBasicInformation();
        form.clickNextbutton();
        form.enterTaxInformation();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Preparer Information Step", async ({ page }) => {
        await login({ accountType: "taxpayer" });
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
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Payment Page", async ({ page }) => {
        await login({ accountType: "taxpayer" });
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
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Taxpayer Submit Form Flow - Application Confirmation Page", async ({ page }) => {
        await login({ accountType: "taxpayer" });
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
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("AGS Audit Log Page", async ({ page }) => {
        await login({ accountType: "ags", accountIndex: 5 });
        agsFilingGrid.init();
        agsFilingGrid.checkAuditLog("Reference ID", "AAAARKEC");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("AGS Filing Requested Exports Page", async ({ page }) => {
        await login({ accountType: "ags", accountIndex: 8 });
        agsFilingGrid.init();
        agsFilingGrid.clickViewRequestedExtractButton();
        legacy.url().assert("include", "/filingsExtractRequests?");
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("AGS Specific Filing Page", async ({ page }) => {
        await login({ accountType: "ags", accountIndex: 9 });
        agsFilingGrid.init();
        agsFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Export Full Filing Data Modal", async ({ page }) => {
        await login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.getElement().exportButton().click();
        filingExportModal.selectExcelFileType();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Specific Filing Page", async ({ page }) => {
        await login({ accountType: "municipal", accountIndex: 2 });
        municipalFilingGrid.init();
        municipalFilingGrid.toggleActionButton(
            "View",
            "Reference ID",
            "AAAARKEC"
        );
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Approval Page", async ({ page }) => {
        await login({ accountType: "municipal" });
        govApprovalGrid.init();
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Approval Page - Message Modal", async ({ page }) => {
        await login({ accountType: "municipal", accountIndex: 3 });
        govApprovalGrid.init();
        govApprovalGrid.getElementOfColumn(
            "Message",
            "Reference ID",
            "AAAAUUKA",
            "message"
        );
        await checkAccessibility(undefined, customAccessibilityOptions);
    });
    test("Municipal Approval Review Page", async ({ page }) => {
        await login({ accountType: "municipal", accountIndex: 4 });
        govApprovalGrid.init();
        govApprovalGrid.filterColumn("Reference ID", "AAAAUUKA", "text", "Contains");
        await waitForLoading();
        legacy.get(`@${govApprovalGrid.userType}_${govApprovalGrid.defaultGridColumnsAlias}`)
            .assert("exist")
            .then((columnIndexes: any) => {
                const anchorColumnIndex = columnIndexes["Reference ID"];
                govApprovalGrid.getElement()
                    .rows()
                    .each(($row) => {
                        const $columns = $row.find("td");
                        if ($columns.eq(anchorColumnIndex).text() === "AAAAUUKA") {
                            legacy.wrap($columns).eq(0).find("input").click();
                        }
                    });
            });
        govApprovalGrid.clickStartApprovalForSelectedButton();
        await checkAccessibility(undefined, );
    });
});
