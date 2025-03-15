import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CategoryPage } from "./CategoryPage";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to category page
   * @param categoryName: string - Name of the category to select
   * @returns: Promise<CategoryPage> - Instance of CategoryPage
   */
  async selectCategory(categoryName: string): Promise<CategoryPage> {
    const categoryLink = this.page.locator(`a:has-text("${categoryName}")`);
    await categoryLink.waitFor({ state: "visible" });
    await categoryLink.click();
    return new CategoryPage(this.page);
  }
}
