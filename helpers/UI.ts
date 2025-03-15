import { Cookie, Page } from "playwright";
import { CategoryPage, HomePage } from "../tests/UI/pages";
import crypto from "crypto";

// Helper function to add a product to the cart
export async function addProductToCart(
  homePage: HomePage,
  categoryPage: CategoryPage,
  productName: string
) {
  await homePage.selectCategory("Laptops");
  await categoryPage.selectProduct(productName);
}

export async function loginUsingStoredCookies(page: Page, cookies: Cookie[]) {
  if (cookies.length > 0) {
    await page.context().addCookies(cookies); // Set cookies into the page context
    await page.reload(); // reloading the page in order to make logging in effective
  }
}

export function generateUniqueCredentials(): {
  username: string;
  password: string;
} {
  const randomSuffix = generateRandomString(10); // Generate a random suffix to ensure uniqueness
  const username = `user${randomSuffix}`;
  const password = `pass${randomSuffix}`;
  return { username, password };
}

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}
