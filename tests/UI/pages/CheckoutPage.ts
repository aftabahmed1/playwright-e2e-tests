import { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";

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
    await element.waitFor({ state: "hidden" });
  }

  async confirmPurchase(
    page: Page,
    okButtonName: string,
    amount: string | null
  ) {
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
    await page
      .locator(".sa-confirm-button-container")
      .waitFor({ state: "visible" });
    // Click the OK button
    await this.clickElement(page, "button", okButtonName);
    await this.navigateTo("/index.html");
  }

  /**
   * Close confirmation modal
   * @returns: Promise<void>
   */
  async closeConfirmation(): Promise<void> {
    await this.okButton.waitFor({ state: "visible" });
    await this.okButton.click({ delay: 500 });
  }
}
