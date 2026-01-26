import { test, expect } from "../../../../utils/fixtures";
import { LoginPage } from "../../../../pages/ui/tiket/login.page";

test.describe("Login Page Test", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test("TIK001 - login with valid credentials", async ({ testData }) => {
    const { email, password, otp } = testData.data;

    await test.step("Given user go to login page and redirected to UNM login page", async () => {
      await loginPage.goto();
      await loginPage.expectToBeOnLoginPage();
    });

    await test.step("When user click continue with phone or email button", async () => {
      await loginPage.clickContinuePhoneOrEmailButton();
    });

    await test.step("And user continue login using email or phone and password", async () => {
      await loginPage.fillEmailOrPhone(email);
      await loginPage.fillPassword(password);
      await loginPage.clickLogin();
      await loginPage.fillOTP(otp);
    });

    await test.step("Then user is redirected to tiket Homepage", async () => {
      await loginPage.loginSuccessVerification();
    });
  });

  test("TIK002 - Login with invalid credentials", async ({ testData }) => {
    const { email, password } = testData.data;

    await test.step("When user click continue with phone or email button", async () => {
      await loginPage.clickContinuePhoneOrEmailButton();
    });

    await test.step("And user continue login using email but input wrong password", async () => {
      await loginPage.fillEmailOrPhone(email);
      await loginPage.fillPassword(password);
      await loginPage.clickLogin();
    });

    await test.step("Then user should see error message", async () => {
      await loginPage.loginFailedVerification();
    });
  });

  test("TIK003 - Login with phone number", async ({ testData }) => {
    const { phone, otp, email } = testData.data;

    await test.step("When user click continue with phone or email button", async () => {
      await loginPage.clickContinuePhoneOrEmailButton();
    });

    await test.step("And user continue login using phone number", async () => {
      await loginPage.fillEmailOrPhone(phone);
      await loginPage.fillOTP(otp);
      await loginPage.fillEmailIfNonEMV(email);
      await loginPage.clickPasskeyLater();
    });

    await test.step("Then user is redirected to tiket Homepage", async () => {
      await loginPage.loginSuccessVerification();
    });
  });
});
