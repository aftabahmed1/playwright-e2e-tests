import { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
import { ProductPage } from "./ProductPage";

export class CategoryPage extends BasePage {
  private readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = this.page.locator(".card-title a");
  }

  /**
   * Select product from category listing
   * @param productName: string - Name of product to select
   * @returns: Promise<ProductPage> - Instance of ProductPage
   */
  async selectProduct(productName: string): Promise<ProductPage> {
    await this.productLinks.filter({ hasText: productName }).first().click();
    return new ProductPage(this.page);
  }
}
