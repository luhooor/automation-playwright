import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/ui/tiket/login.page";

test.describe("Login Page Test", () => {
  let loginPage: LoginPage;

  // Setup - runs before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    await test.step("Given user go to login page and redirected to UNM login page", async () => {
      await loginPage.goto();
      await loginPage.expectToBeOnLoginPage();
    });
  });

  test("TIK001 - login with valid credentials", async () => {
    await test.step("When user click continue with phone or email button", async () => {
      await loginPage.clickContinuePhoneOrEmailButton();
    });

    await test.step("And user continue login using email or phone and password", async () => {
      await loginPage.fillEmailOrPhone("anak.gembala1@yopmail.com");
      await loginPage.fillPassword("Testing123");
      await loginPage.clickLogin();
      await loginPage.fillOTP("123456");
    });

    await test.step("Then user is redirected to tiket Homepage", async () => {
      await loginPage.loginSuccessVerification();
    });
  });
});
