import { Page, Locator, expect } from "@playwright/test";
import { logger } from "#utils/logger";
import { getBaseUrl } from "#utils/test-helpers";

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

    constructor(private readonly page: Page) {
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

        this.errorMessage = page.locator("span", {
            hasText:
                /Email or password doesn't match.|Email atau kata sandi salah./i,
        });
        this.accountVerificationHeader = page.getByRole("heading", {
            name: /Account Verification|Verifikasi Akun/i,
        });
        this.accountVerificationEmailInput = page.locator("#email");
        this.accountVerificationVerifyButton = page.getByRole("button", {
            name: /Verify|Verifikasi/i,
        });
    }

    async goto(): Promise<void> {
        await this.page.goto("/login");
    }

    async clickContinuePhoneOrEmailButton(): Promise<void> {
        await this.continuePhoneOrEmailButton.click();
    }

    async fillEmailOrPhone(emailOrPhone: string): Promise<void> {
        if (!emailOrPhone) throw new Error("Email or phone is required");
        await expect(this.emailOrPhoneInput).toBeVisible();
        await this.emailOrPhoneInput.fill(emailOrPhone);
        await this.continueButton.click();
    }

    async fillOTP(otp: string): Promise<void> {
        try {
            await this.otpInput
                .first()
                .waitFor({ state: "visible", timeout: 5000 });
            logger.info("OTP is visible, filling now...");
            const digits = otp.split("");
            for (let i = 0; i < digits.length; i++) {
                await this.otpInput.nth(i).fill(digits[i] ?? "");
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.warn("OTP input did not appear, skipping.", {
                error: message,
            });
        }

        await this.clickPasskeyLater();
    }

    async clickPasskeyLater(): Promise<void> {
        try {
            await this.passkeyLater.waitFor({
                state: "visible",
                timeout: 1000,
            });
            logger.info("Passkey later is visible, clicking now...");
            await this.passkeyLater.click();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.warn("Passkey later input did not appear, skipping.", {
                error: message,
            });
        }
    }

    async loginSuccessVerification(): Promise<void> {
        const baseUrl = getBaseUrl();
        await expect(this.page).toHaveURL(new RegExp(`.*${baseUrl}.*`, "i"));
    }

    async loginFailedVerification(): Promise<void> {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
        await expect(this.errorMessage).toBeVisible();
    }

    async fillPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    async clickLogin(): Promise<void> {
        await this.loginButton.click();
    }

    async expectToBeOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
    }

    async fillEmailIfNonEMV(email: string): Promise<void> {
        try {
            await this.accountVerificationHeader.waitFor({
                state: "visible",
                timeout: 5000,
            });
            logger.info(
                "Account verification is visible, filling email now..."
            );
            await this.accountVerificationEmailInput.fill(email);
            await this.accountVerificationVerifyButton.click();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.warn("Account verification is not visible, skipping.", {
                error: message,
            });
        }
    }
}
