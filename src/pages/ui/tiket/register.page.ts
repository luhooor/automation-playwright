import { Page, expect } from "@playwright/test";
import { logger } from "#utils/logger";
import { BasePage } from "#pages/base.page";

export class RegisterPage extends BasePage {
    private readonly CONTINUE_PHONE_OR_EMAIL_BUTTON = this.page.getByRole("button", {
        name: /Continue with Phone or Email|Lanjut dengan nomor HP atau email/i,
    });

    private readonly PHONE_OR_EMAIL_INPUT = this.page.getByRole("textbox", {
        name: /Phone number or email|Nomor HP or email/i,
    });

    private readonly CONTINUE_BUTTON = this.page.getByRole("button", {
        name: /^Continue$|^Lanjutkan$/i,
    });

    private readonly COMPLETE_DETAILS_HEADING = this.page.getByRole("heading", {
        name: /Complete your details|Lengkapi detail akun/i,
    });

    private readonly FULLNAME_INPUT = this.page.locator('[data-testid="txtFullname"]');
    private readonly EMAIL_INPUT = this.page.locator('[data-testid="txtEmail"]');
    private readonly PASSWORD_INPUT = this.page.locator('[data-testid="txtPassword"]');
    private readonly REGISTER_BUTTON = this.page.locator('[data-testid="btnSubmit"]');

    private readonly OTP_INPUT = this.page.locator('[data-testid^="otp-input-"]');

    private readonly SUCCESS_HEADING = this.page.getByRole("heading", {
        name: /Congrats! Your account is all set|Selamat! Akunmu sudah siap/i,
    });

    private readonly OK_BUTTON = this.page.getByRole("button", { name: /^OK$/i });

    private readonly SKIP_PASSKEY_BUTTON = this.page
        .getByRole("button", { name: /Skip for now/i })
        .or(this.page.locator("span", { hasText: "Nanti aja" }).first());

    private readonly CLOSE_PASSKEY_BUTTON = this.page
        .locator('[data-testid="modal-close-button"]');

    constructor(page: Page) {
        super(page);
    }


    async goto(): Promise<void> {
        await this.page.goto("/login");
    }


    async clickContinuePhoneOrEmail(): Promise<void> {
        await this.CONTINUE_PHONE_OR_EMAIL_BUTTON.click();
    }

    async fillPhoneNumber(phone: string): Promise<void> {
        await expect(this.PHONE_OR_EMAIL_INPUT).toBeVisible();
        await this.PHONE_OR_EMAIL_INPUT.fill(phone);
    }

    async clickContinue(): Promise<void> {
        await this.CONTINUE_BUTTON.click();
    }


    async waitForRegistrationForm(): Promise<void> {
        await expect(this.COMPLETE_DETAILS_HEADING).toBeVisible({ timeout: 10000 });
        logger.info("Registration form is visible");
    }

    async fillFullName(fullName: string): Promise<void> {
        await this.FULLNAME_INPUT.fill(fullName);
        logger.info(`Filled full name: ${fullName}`);
    }

    async fillEmail(email: string): Promise<void> {
        await this.EMAIL_INPUT.fill(email);
        logger.info(`Filled email: ${email}`);
    }

    async fillPassword(password: string): Promise<void> {
        await this.PASSWORD_INPUT.fill(password);
    }

    async clickRegister(): Promise<void> {
        await this.REGISTER_BUTTON.click();
        logger.info("Clicked Register button");
    }


    async fillOTP(otp: string): Promise<void> {
        await this.OTP_INPUT.first().waitFor({ state: "visible", timeout: 10000 });
        logger.info("OTP modal is visible, filling OTP...");

        const digits = otp.split("");
        for (let i = 0; i < digits.length; i++) {
            await this.OTP_INPUT.nth(i).fill(digits[i] ?? "");
        }
        logger.info("OTP filled successfully");
    }


    async expectRegistrationSuccess(): Promise<void> {
        await expect(this.SUCCESS_HEADING).toBeVisible({ timeout: 15000 });
        logger.info("Registration success message is visible");
    }

    async dismissPopups(): Promise<void> {
        try {
            await this.SKIP_PASSKEY_BUTTON.waitFor({ state: "visible", timeout: 5000 });
            logger.info("Passkey popup is visible, clicking Skip for now...");
            await this.SKIP_PASSKEY_BUTTON.click();
        } catch {
            logger.warn("Passkey popup did not appear, trying close button...");
            try {
                await this.CLOSE_PASSKEY_BUTTON.waitFor({ state: "visible", timeout: 2000 });
                await this.CLOSE_PASSKEY_BUTTON.click();
            } catch {
                logger.warn("No passkey popup to dismiss");
            }
        }

        try {
            await this.OK_BUTTON.waitFor({ state: "visible", timeout: 3000 });
            logger.info("OK button is visible, clicking...");
            await this.OK_BUTTON.click();
        } catch {
            logger.warn("OK button did not appear, skipping");
        }
    }

    async waitForRedirectToTiket(): Promise<void> {
        await this.page.waitForURL(/.*tiket\.com.*/, { timeout: 30000 });
        logger.info(`Redirected to: ${this.page.url()}`);
    }
}
