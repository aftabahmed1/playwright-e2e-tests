import { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
import { CheckoutPage } from "./CheckoutPage";
import { expect } from "@playwright/test";

export class CartPage extends BasePage {
  public cartItems: Locator;
  private readonly totalPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = this.page.locator("#tbodyid > tr");
    this.totalPrice = this.page.locator("#totalp");
  }

  /**
   * Initiate checkout process
   */
  async gotoCart() {
    await this.page.getByRole("link", { name: "Cart", exact: true }).click();
  }

  async placeOrder() {
    await this.page.getByRole("button", { name: "Place Order" }).click();
  }

  async proceedToCheckout() {
    return new CheckoutPage(this.page);
  }

  /**
   * Validate cart contents
   * @param expectedCount: number - Expected number of items
   * @param expectedTotal: string - Expected total price
   */
  async validateCart(
    expectedCount: number,
    expectedTotal: string
  ): Promise<void> {
    await this.gotoCart();
    // To avoid flakiness we are doing few assertions to add automatic waits
    await this.page.waitForSelector("#tbodyid > tr", { state: "attached" });
    const cart = this.cartItems.first();
    await cart.waitFor({ state: "visible", timeout: 5000 });

    await expect(cart).toBeVisible();
    await expect(this.cartItems).toHaveCount(expectedCount, { timeout: 20000 });
    await expect(this.totalPrice).toBeVisible();
    await expect(this.totalPrice).toHaveText(expectedTotal, { timeout: 20000 });
  }

  /**
   * Empty cart
   * @param expectedCount: number - Expected number of items
   */
  async isCartEmpty(): Promise<void> {
    const emptyCartCount = 0;
    await this.gotoCart();
    await expect(this.cartItems).toHaveCount(emptyCartCount, {
      timeout: 10000,
    });
    await expect(this.totalPrice).toBeHidden();
  }

  /**
   * removeItemFromCart
   * @param page
   * @param shouldWaitForVisibility: boolean
   * @returns: Promise<string | null>
   */
  async removeItemFromCart(page: Page): Promise<string | null> {
    // To avoid flakiness we are doing few assertions to add automatic waits
    const cart = this.cartItems.first();
    await cart.waitFor({ state: "visible", timeout: 5000 });
    await expect(cart).toBeVisible();

    // Define the locator for the total price
    await this.page.waitForSelector("#tbodyid > tr", { state: "attached" });
    const totalpLocator = page.locator("#totalp");
    await totalpLocator.waitFor({ state: "attached", timeout: 5000 });
    await totalpLocator.waitFor({ state: "visible", timeout: 5000 });

    // Click the delete button on the first product
    await page.getByRole("link", { name: "Delete" }).first().click();
    await page.waitForTimeout(1000);

    // Wait for the cart to update and verify the updated price
    const updatedTotal = await page.locator("#totalp").textContent();

    return updatedTotal;
  }
}
