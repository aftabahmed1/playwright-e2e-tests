import { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
import { CartPage } from "./CartPage";

export class ProductPage extends BasePage {
  private readonly addToCartButton: Locator;
  private readonly productName: Locator;
  private readonly productPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = this.page.getByRole("link", { name: "Add to cart" });
    this.productName = this.page.locator(".name");
    this.productPrice = this.page.locator(".price-container");
  }

  /**
   * Add product to cart
   * @returns: Promise<CartPage> - Instance of CartPage
   */
  async addToCart(addItemCount: number): Promise<CartPage> {
    // should click once
    await this.addToCartButton.waitFor({ state: "visible" });
    await this.addToCartButton.click({ clickCount: addItemCount });

    return new CartPage(this.page);
  }

  /**
   * Get product details
   * @returns: Promise<{name: string, price: string}> - Product information
   */
  async getProductDetails(): Promise<{ name: string; price: string }> {
    const name = await this.productName.innerText();

    // Get the inner text and extract the numeric value
    const priceText = await this.productPrice.innerText();

    // Extract the numeric value (e.g., '790' from "$790 *includes tax")
    const price = priceText.match(/\d+/)?.[0] || ""; // Returns the first match of digits or an empty string if no match
    return {
      name,
      price,
    };
  }
}
