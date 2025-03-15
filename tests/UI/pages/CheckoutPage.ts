import { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
import { HomePage } from "./HomePage";

export class CheckoutPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly countryInput: Locator;
  private readonly cityInput: Locator;
  private readonly cardInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly purchaseButton: Locator;
  private readonly okButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.page.locator("#name");
    this.countryInput = this.page.locator("#country");
    this.cityInput = this.page.locator("#city");
    this.cardInput = this.page.locator("#card");
    this.monthInput = this.page.locator("#month");
    this.yearInput = this.page.locator("#year");
    this.purchaseButton = this.page.getByRole("button", { name: "Purchase" });
    this.okButton = this.page.getByRole("button", { name: "OK" });
  }

  /**
   * Complete purchase with valid data
   * @param orderData: object - Order details
   */
  async completePurchase(orderData: {
    name: string;
    country: string;
    city: string;
    card: string;
    month: string;
    year: string;
  }): Promise<void> {
    await this.fillForm(orderData);
    await this.purchaseButton.click();
  }

  private async fillForm(data: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(data)) {
      const locator = this[`${field}Input` as keyof this] as Locator;
      if (value) await locator.fill(value);
    }
  }

  async clickElement(
    page: Page,
    role: "button",
    name: string,
    timeout: number = 5000
  ) {
    const element = page.getByRole(role, { name });
    await element.waitFor({ state: "visible", timeout });
    await element.click();
  }

  async confirmPurchase(
    page: Page,
    purchaseButtonName: string,
    okButtonName: string,
    amount: string | null
  ) {
    // Click the purchase button
    await this.clickElement(page, "button", purchaseButtonName);

    // Wait for the item text to appear and assert it matches the pattern (e.g., contains an ID that is a number)
    const itemTextLocator = page.locator(`text=/Id: \\d+Amount: ${amount}/`); // Use regex to match the dynamic ID
    await itemTextLocator.waitFor({ state: "visible", timeout: 5000 }); // Wait for element visibility
    const itemText = await itemTextLocator.textContent();

    // Assert the ID value is a digit (using a regex)
    const regex = /\d+/; // Regex to match one or more digits
    if (!regex.test(itemText || "")) {
      throw new Error(
        `Item text "${itemText}" does not contain a valid ID with digits.`
      );
    }

    // Click the item
    await itemTextLocator.click();

    // Click the OK button
    await this.clickElement(page, "button", okButtonName);
  }

  /**
   * Close confirmation modal
   * @returns: Promise<HomePage> - Return to homepage
   */
  async closeConfirmation(): Promise<HomePage> {
    await this.okButton.click();
    return new HomePage(this.page);
  }
}
