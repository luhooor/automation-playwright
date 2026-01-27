import { Page, Locator, expect } from "@playwright/test";
import { getEnvironment } from "../../../../configs/env";
import { logger } from "../../../utils/logger";

export class LoginPage {
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly continuePhoneOrEmailButton: Locator;
    readonly emailOrPhoneInput: Locator;
    readonly continueButton: Locator;
    readonly otpInput: Locator;
    readonly passkeyLater: Locator;
    readonly errorMessage: Locator;
    readonly accountVerificationHeader: Locator;
    readonly accountVerificationEmailInput: Locator;
    readonly accountVerificationVerifyButton: Locator;

    constructor(private page: Page) {
        this.passwordInput = page.locator('[data-testid="txtPassword"]');
        this.loginButton = page.getByRole("button", { name: "Log in" });

        this.continuePhoneOrEmailButton = page.getByRole("button", {
            name: /Continue with Phone or Email|Lanjut dengan nomor HP atau email/i,
        });

        this.emailOrPhoneInput = page.getByRole("textbox", {
            name: /Phone number or email|Nomor HP atau email/i,
        });

        this.continueButton = page.getByRole("button", {
            name: /Continue|Lanjutkan/i,
        });
        this.otpInput = page.locator('[data-testid^="otp-input-"]');

        this.passkeyLater = page
            .locator("span", { hasText: "Nanti aja" })
            .first()
            .or(page.locator("span", { hasText: "Skip for now" }).first());

        this.errorMessage = page.locator("span", { hasText: /Email or password doesn't match.|Email atau kata sandi salah./i });
        this.accountVerificationHeader = page.getByRole("heading", { name: /Account Verification|Verifikasi Akun/i });
        this.accountVerificationEmailInput = page.locator("#email");
        this.accountVerificationVerifyButton = page.getByRole("button", { name: /Verify|Verifikasi/i });
    }

    async goto() {
        await this.page.goto("/login");
    }

    async clickContinuePhoneOrEmailButton() {
        await this.continuePhoneOrEmailButton.click();
    }

    async fillEmailOrPhone(emailOrPhone: string) {
        await expect(this.emailOrPhoneInput).toBeVisible();
        await this.emailOrPhoneInput.fill(emailOrPhone);
        await this.continueButton.click();
    }

    async fillOTP(otp: string) {
        try {
            await this.otpInput.first().waitFor({ state: "visible", timeout: 5000 });
            logger.info("OTP is visible, filling now...");
            const digits = otp.split("");
            for (let i = 0; i < digits.length; i++) {
                await this.otpInput.nth(i).fill(digits[i]);
            }
        } catch (e) {
            logger.warn("OTP input did not appear, skipping.");
        }

        await this.clickPasskeyLater();
    }

    async clickPasskeyLater() {
        try {
            await this.passkeyLater.waitFor({ state: "visible", timeout: 1000 });
            logger.info("Passkey later is visible, clicking now...");
            await this.passkeyLater.click();
        } catch (e) {
            logger.warn("Passkey later input did not appear, skipping.");
        }
    }

    async loginSuccessVerification() {
        const baseUrl = getBaseUrl();
        await expect(this.page).toHaveURL(new RegExp(`.*${baseUrl}.*`, "i"));
    }

    async loginFailedVerification() {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
        await expect(this.errorMessage).toBeVisible();
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async expectToBeOnLoginPage() {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
    }

    async fillEmailIfNonEMV(email: string) {
        try {
            await this.accountVerificationHeader.waitFor({ state: "visible", timeout: 5000 });
            logger.info("Account verification is visible, filling email now...");
            await this.accountVerificationEmailInput.fill(email);
            await this.accountVerificationVerifyButton.click();
        } catch (e) {
            logger.warn("Account verification is not visible, skipping.");
        }
    }
}

function getBaseUrl(): string | RegExp | ((url: URL) => boolean) {
    return getEnvironment().baseURL;
}
