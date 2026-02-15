import { test, expect } from "@playwright/test";
import { generatePhoneNumber, generateFullName, generateEmail } from "#utils/common-functions";
import { RegisterPage } from "#pages/ui/tiket/register.page";

test.describe("Register Page Test", () => {
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
    });

    test("REG001 - Register new user with random phone number", async ({ page }) => {
        const phone = generatePhoneNumber();
        const fullName = generateFullName();
        const email = generateEmail();
        const password = "Testing123";
        const otp = "123456";

        await test.step("Given user navigates to the login page", async () => {
            await registerPage.goto();
            await expect(page).toHaveURL(/.*bliblitiket\.com.*/);
        });

        await test.step("When user clicks Continue with Phone or Email", async () => {
            await registerPage.clickContinuePhoneOrEmail();
        });

        await test.step("And user enters a random phone number with 777 prefix", async () => {
            await registerPage.fillPhoneNumber(phone);
            await registerPage.clickContinue();
        });

        await test.step("And user fills in the registration form", async () => {
            await registerPage.waitForRegistrationForm();
            await registerPage.fillFullName(fullName);
            await registerPage.fillEmail(email);
            await registerPage.fillPassword(password);
            await registerPage.clickRegister();
        });

        await test.step("And user enters the OTP code", async () => {
            await registerPage.fillOTP(otp);
        });

        await test.step("Then registration is successful", async () => {
            await registerPage.expectRegistrationSuccess();
        });

        await test.step("And user dismisses any popups", async () => {
            await registerPage.dismissPopups();
        });

        await test.step("And user is redirected back to tiket.com", async () => {
            await registerPage.waitForRedirectToTiket();
            await expect(page).toHaveURL(/.*tiket\.com.*/);
        });
    });
});
