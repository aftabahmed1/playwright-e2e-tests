import { test, expect, Cookie } from "@playwright/test";

import {
  CategoryPage,
  CheckoutPage,
  HomePage,
  LoginPage,
  ProductPage,
} from "../pages";

import { dateFomrat, products, validPaymentData } from "../../../fixtures/productData";
import { addProductToCart, loginUsingStoredCookies } from "../../../helpers/UI";

test.describe("Demoblaze", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30000 });
  });

  test.describe("purchase without login", () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
      homePage = new HomePage(page);
    });

    test("Should validate purchase journey @smoke @regression", async ({
      page,
    }) => {
      const categoryPage = await test.step("Select category", async () => {
        const productCateogry = products[0].category;
        return homePage.selectCategory(productCateogry);
      });

      const productPage = await test.step("Select product", async () => {
        const productName = products[0].name;
        return categoryPage.selectProduct(productName);
      });

      const productDetails =
        await test.step("Get product details", async () => {
          return productPage.getProductDetails();
        });

      const cartPage = await test.step("Add to cart", async () => {
        return productPage.addToCart(1);
      });

      await test.step("Validate cart contents", async () => {
        await cartPage.validateCart(1, productDetails.price);
      });

      await test.step("Proceed to checkout", async () => {
        return cartPage.placeOrder();
      });

      const checkoutPage = await test.step("Proceed to checkout", async () => {
        return cartPage.proceedToCheckout();
      });

      await test.step("Complete purchase", async () => {
        return checkoutPage.completePurchase({
          name: validPaymentData.Name,
          country: validPaymentData.Country,
          city: validPaymentData.City,
          card: validPaymentData.CardNumber,
          month: validPaymentData.Month,
          year: validPaymentData.Year,
        });
      });

      await test.step("Validate data of user after purchase", async () => {
        const orderDetails = page.locator("p.lead.text-muted");

        // Assert that the element is visible
        await expect(orderDetails).toBeVisible();

        // Define expected values
        await expect(orderDetails).toContainText(
          `Amount: ${validPaymentData.Amount}`
        );
        await expect(orderDetails).toContainText(
          `Card Number: ${validPaymentData.CardNumber}`
        );
        await expect(orderDetails).toContainText(
          `Name: ${validPaymentData.Name}`
        );
        await expect(orderDetails).toContainText(
          `Date: ${validPaymentData.Date}`
        );
      });

      await test.step("Return to homepage", async () => {
        await checkoutPage.closeConfirmation();
        expect(await homePage.getCurrentUrl()).toContain("index.html");
      });
    });

    test("Should validate Form edge cases @smoke @regression", async ({
      page,
    }) => {
      const checkoutPage = new CheckoutPage(page);

      await test.step("Test empty form submission", async () => {
        await checkoutPage.navigateTo("/cart.html");
        await page.getByRole("link", { name: "Cart" }).click();
        await page.getByRole("button", { name: "Place Order" }).click();
        page.once("dialog", (dialog) => {
          expect(dialog.message()).toContain(
            "Please fill out Name and Creditcard."
          );
          dialog.accept();
          dialog.dismiss().catch(() => {});
        });
        await page.getByRole("button", { name: "Purchase" }).click();
        await page
          .getByRole("dialog", { name: "Place order" })
          .getByLabel("Close")
          .click();
      });

      await test.step("Test the date is in correct format and current date matching ", async () => {
        await page.getByRole("button", { name: "Place Order" }).click();
        await page.locator("#name").fill("323232");
        await page.locator("#card").fill("abggghhhhh");
        await page.getByRole("button", { name: "Purchase" }).click();
        const sweetAlert = page.locator(".sweet-alert");

        await expect(sweetAlert).toBeVisible({ timeout: 5000 });

        const alertText = await sweetAlert.innerText();

        expect(alertText).toContain(dateFomrat);

        await expect(page.locator("body")).toContainText("OK");
      });
    });

    test("Should check total of cart respective to items price @regression", async ({
      page,
    }) => {
      let totalPrice: string | number;
      let addTotalItemsBy = 2;

      const productName = products[0].name;
      const productCateogry = products[0].category;

      const category = await homePage.selectCategory(productCateogry);

      const product = await category.selectProduct(productName);

      const productDetails = await product.getProductDetails();
      totalPrice = Number(productDetails.price) * addTotalItemsBy;

      const cart = await product.addToCart(addTotalItemsBy);
      await cart.gotoCart();

      const url = await cart.getCurrentUrl();
      expect(url).toContain("/cart");

      const cartTotal = await page.locator("#totalp").textContent();

      expect(cartTotal).toBe(String(totalPrice));
    });
  });

  test.describe("Login", () => {
    let loginPage: LoginPage;

    // Storing login credentails, so it can be used throughout the code
    const cookies: Cookie[] = [];

    test.beforeAll(async ({ browser }) => {
      // Create a browser context
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("/");

      loginPage = new LoginPage(page);
      const { username, password } = await loginPage.signUp();
      const login = await loginPage.logIn({ username, password });
      await context.close();
      cookies.push(login[1]);
    });

    test.beforeEach(({ page }) => {
      loginPage = new LoginPage(page);
    });

    test("Should remove one item cart, order placement, and verifying cart items after logout/login @regression", async ({
      page,
    }) => {
      test.setTimeout(90000); // Set global timeout to 90 seconds

      // Page objects are initialized here, scoped for the entire test
      const homePage = new HomePage(page);
      const categoryPage = new CategoryPage(page);
      const checkoutPage = new CheckoutPage(page);
      const productPage = new ProductPage(page);

      await test.step("login using cookies", async () => {
        await loginUsingStoredCookies(page, cookies);
      });

      const cart = await test.step("Add product to a cart", async () => {
        const product = products[0];
        await addProductToCart(homePage, categoryPage, product.name);
        // adding 2 times the product, hence passing 2 as count
        const productToCart = await productPage.addToCart(2);
        return productToCart;
      });

      await test.step("should place order, remove cart item, complete order flow and validate cart items with login and logout flow ", async () => {
        await cart.gotoCart();
        const cartAmount = await cart.removeItemFromCart(page);
        await cart.placeOrder();

        // Complete the order
        await checkoutPage.completePurchase({
          name: validPaymentData.Name,
          country: validPaymentData.Country,
          city: validPaymentData.City,
          card: validPaymentData.CardNumber,
          month: validPaymentData.Month,
          year: validPaymentData.Year,
        });

        await checkoutPage.confirmPurchase(page, "Purchase", "OK", cartAmount);
      });

      await test.step("should add item and logout to check if cart is empty", async () => {
        // add item in the cart
        await addProductToCart(homePage, categoryPage, products[0].name);
        await productPage.addToCart(1);

        // Log out again and check cart should be empty
        await loginPage.logOut();
        await cart.gotoCart();
        await cart.isCartEmpty();
      });

      await test.step("should retain cart items after re-login", async () => {
        // Log back in and validate the cart
        await loginUsingStoredCookies(page, cookies);
        await cart.gotoCart();
        await expect(cart.cartItems).toHaveCount(1);
      });

      await test.step("should remove the item from cart and check cart is empty", async () => {
        await cart.removeItemFromCart(page);
        await cart.isCartEmpty();
      });
    });

    test("Should not signup when the user already exists @smoke", async () => {
      await loginPage.failedSignUp();
    });

    test("Should log-out correctly", async ({ page }) => {
      await loginUsingStoredCookies(page, cookies);
      await loginPage.logOut();
      await loginPage.goBackAndCheckLogin();
    });
  });
});
