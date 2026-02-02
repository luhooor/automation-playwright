import { Page, expect } from "@playwright/test";
import { logger } from "#utils/logger";
import { getBaseUrl } from "#utils/test-helpers";
import { BasePage } from "#pages/base.page";

export class LoginPage extends BasePage {

    private readonly PASSWORD_INPUT = this.page.locator('[data-testid="txtPassword"]');
    private readonly LOGIN_BUTTON = this.page.getByRole("button", { name: "Log in" });

    private readonly CONTINUE_PHONE_OR_EMAIL_BUTTON = this.page.getByRole("button", {
        name: /Continue with Phone or Email|Lanjut dengan nomor HP atau email/i,
    });

    private readonly EMAIL_OR_PHONE_INPUT = this.page.getByRole("textbox", {
        name: /Phone number or email|Nomor HP or email/i,
    });

    private readonly CONTINUE_BUTTON = this.page.getByRole("button", {
        name: /Continue|Lanjutkan/i,
    });

    private readonly OTP_INPUT = this.page.locator('[data-testid^="otp-input-"]');

    private readonly PASSKEY_LATER = this.page
        .locator("span", { hasText: "Nanti aja" })
        .first()
        .or(this.page.locator("span", { hasText: "Skip for now" }).first());

    private readonly ERROR_MESSAGE = this.page.locator("span", {
        hasText:
            /Email or password doesn't match.|Email atau kata sandi salah./i,
    });

    private readonly ACCOUNT_VERIFICATION_HEADER = this.page.getByRole("heading", {
        name: /Account Verification|Verifikasi Akun/i,
    });

    private readonly ACCOUNT_VERIFICATION_EMAIL_INPUT = this.page.locator("#email");
    private readonly ACCOUNT_VERIFICATION_VERIFY_BUTTON = this.page.getByRole("button", {
        name: /Verify|Verifikasi/i,
    });

    constructor(page: Page) {
        super(page);
    }

    async goto(): Promise<void> {
        await this.page.goto("/login");
    }

    async clickContinuePhoneOrEmailButton(): Promise<void> {
        await this.CONTINUE_PHONE_OR_EMAIL_BUTTON.click();
    }

    async fillEmailOrPhone(emailOrPhone: string): Promise<void> {
        if (!emailOrPhone) throw new Error("Email or phone is required");
        await expect(this.EMAIL_OR_PHONE_INPUT).toBeVisible();
        await this.EMAIL_OR_PHONE_INPUT.fill(emailOrPhone);
        await this.CONTINUE_BUTTON.click();
    }

    async fillOTP(otp: string): Promise<void> {
        try {
            await this.OTP_INPUT
                .first()
                .waitFor({ state: "visible", timeout: 5000 });
            logger.info("OTP is visible, filling now...");
            const digits = otp.split("");
            for (let i = 0; i < digits.length; i++) {
                await this.OTP_INPUT.nth(i).fill(digits[i] ?? "");
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
            await this.PASSKEY_LATER.waitFor({
                state: "visible",
                timeout: 1000,
            });
            logger.info("Passkey later is visible, clicking now...");
            await this.PASSKEY_LATER.click();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.warn("Passkey later input did not appear, skipping.");
        }
    }

    async loginSuccessVerification(): Promise<void> {
        const baseUrl = getBaseUrl();
        await expect(this.page).toHaveURL(new RegExp(`.*${baseUrl}.*`, "i"));
    }

    async loginFailedVerification(): Promise<void> {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
        await expect(this.ERROR_MESSAGE).toBeVisible();
    }

    async fillPassword(password: string): Promise<void> {
        await this.PASSWORD_INPUT.fill(password);
    }

    async clickLogin(): Promise<void> {
        await this.LOGIN_BUTTON.click();
    }

    async expectToBeOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/.*bliblitiket\.com/);
    }

    async fillEmailIfNonEMV(email: string): Promise<void> {
        try {
            await this.ACCOUNT_VERIFICATION_HEADER.waitFor({
                state: "visible",
                timeout: 5000,
            });
            logger.info(
                "Account verification is visible, filling email now..."
            );
            await this.ACCOUNT_VERIFICATION_EMAIL_INPUT.fill(email);
            await this.ACCOUNT_VERIFICATION_VERIFY_BUTTON.click();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.warn("Account verification is not visible, skipping.", {
                error: message,
            });
        }
    }
}
