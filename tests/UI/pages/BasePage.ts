import { Page } from "@playwright/test";

/**
 * Base class
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Navigate to a page
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }
}
