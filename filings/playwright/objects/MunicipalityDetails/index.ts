import { type Locator, type Page } from "@playwright/test";
import {
	waitForLoading
} from "../../support/native-helpers"

class MunicipalityDetails {
	municipalityName: String;

	constructor(private readonly page: Page, municipalityName?: String) {
		this.municipalityName = municipalityName ?? "City of Arrakis";
	}

	private elements() {
		return {
			Title: () => this.page.getByRole('heading', { name: `Municipality: ${this.municipalityName}` }),
			SelectSubscriptionsTab: () => this.page.getByText('Subscriptions'),
			SelectDetailsTab: () => this.page.getByText('Details'),
			customFieldInput: () => {
				return {
					Title: () => this.page.locator('div').filter({ hasText: /^Title\*$/ }),
					Name: () => this.page.locator('div').filter({ hasText: /^Name \*$/ }),
					Type: () => this.page.getByText('Typetext'),
					RemoveButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Remove" }),
				}
			},
			customFieldAddButton: () =>
				this.page.getByRole('button', { name: 'Add New Column' }),
			customFieldSaveButton: () =>
				this.page.getByRole('button', { name: 'Save' }),
		}
	}
	getElement() {
		return this.elements();
	}

	async searchCustomField(
		title: string,
		name: string
	): Promise<number> {
		const fields = this.getElement().customFieldInput();

		const titleCount = await fields.Title().count();

		for (let i = 0; i < titleCount; i++) {
			const currentTitle = await fields
				.Title()
				.nth(i)
				.locator('input')
				.inputValue();

			const currentName = await fields
				.Name()
				.nth(i)
				.locator('input')
				.inputValue();

			if (
				currentTitle === title &&
				currentName === name
			) {
				return i;
			}
		}

		return -1;
	}

	async findLatestCustomFieldIndex(): Promise<number> {
		const fields = this.getElement().customFieldInput();
		const count = await fields.Title().count();
		return count - 1;
	}

	async addCustomField(
		title: string,
		name: string,
		type: string
	) {
		// Add a new custom field first.
		await this.getElement()
			.customFieldAddButton()
			.click({ force: true });

		// The newly added field should now be the latest field.
		const newCustomIndex =
			await this.findLatestCustomFieldIndex();

		const fields = this.getElement().customFieldInput();

		// Enter Title.
		await fields
			.Title()
			.nth(newCustomIndex)
			.locator('input')
			.fill(title);

		// Enter Name.
		await fields
			.Name()
			.nth(newCustomIndex)
			.locator('input')
			.fill(name);

		// Open Type dropdown.
		await fields
			.Type()
			.nth(newCustomIndex)
			.click();

		// Select requested Type from the dropdown <li>.
		await this.page
			.locator('li')
			.filter({ hasText: type })
			.click();

		// Save changes.
		await this.getElement()
			.customFieldSaveButton()
			.click({ force: true });
	}

	async removeCustomField(
		title: string,
		name: string,
		type: string
	) {
		const fields = this.getElement().customFieldInput();

		// Find the matching custom field.
		const newCustomIndex =
			await this.searchCustomField(title, name);

		if (newCustomIndex === -1) {
			throw new Error(
				`Custom field not found: Title="${title}", Name="${name}"`
			);
		}

		// Remove matching custom field.
		await fields
			.RemoveButton()
			.nth(newCustomIndex)
			.click({ force: true });
	}

}

export default MunicipalityDetails;