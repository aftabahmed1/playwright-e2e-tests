import { expect, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { generateUniqueCredentials } from "../../../helpers/UI";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  async signUp() {
    const { username, password } = generateUniqueCredentials();
    await this.page.getByRole("link", { name: "Sign up" }).click();
    await this.page.getByRole("textbox", { name: "Username:" }).fill(username);
    await this.page.getByRole("textbox", { name: "Password:" }).fill(password);
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
      dialog.dismiss().catch(() => {});
      expect(dialog.message()).toBe("Sign up successful.");
    });
    await this.page.getByRole("button", { name: "Sign up" }).click();
    return {
      username,
      password,
    };
  }

  /**
   * function to make sign-up fail by using existing user credentials
   * @returns: {Promise<void>}
   */
  async failedSignUp() {
    const username = "testing123";
    const password = "testing123";
    await this.page.getByRole("link", { name: "Sign up" }).click();
    await this.page.getByRole("textbox", { name: "Username:" }).fill(username);
    await this.page.getByRole("textbox", { name: "Password:" }).fill(password);
    this.page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("This user already exist.");
    });
    await this.page.getByRole("button", { name: "Sign up" }).click();
  }

  /**
   * function for user login
   * @returns: {Promise<Cookie[]>}
   */
  async logIn({ username, password }: { username: string; password: string }) {
    await this.page.getByRole("link", { name: "Log in" }).click();
    await this.page.locator("#loginusername").fill(username);
    await this.page.locator("#loginpassword").fill(password);
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
      dialog.dismiss().catch(() => {});
    });
    await this.page.getByRole("button", { name: "Log in" }).click();
    await this.page.locator("#nameofuser").waitFor({ state: "visible" });

    return await this.page.context().cookies();
  }

  /**
   * function to make user logout
   */
  async logOut() {
    await this.page.locator("#nameofuser").waitFor({ state: "visible" });
    await this.page.getByRole("link", { name: "Log out" }).click();
  }

  /**
   * function to check if user is properly logout
   */
  async goBackAndCheckLogin() {
    await this.page.goBack();
    await this.page.locator("#nameofuser").waitFor({ state: "hidden" });
    await this.page.locator("#logout2").waitFor({ state: "hidden" });
  }
}
