/**
 * Base page class for all page objects.
 *
 * Provides common functionality including:
 * - Mobile detection via the `isMobile` getter (cached)
 * - Access to the Playwright Page instance
 *
 * Usage:
 *   export class MyPage extends BasePage {
 *       constructor(page: Page) {
 *           super(page);
 *       }
 *
 *       async doSomething(): Promise<void> {
 *           if (this.isMobile) {
 *               // Mobile-specific flow
 *           } else {
 *               // Desktop flow
 *           }
 *       }
 *   }
 */

import { Page } from "@playwright/test";

const MOBILE_BREAKPOINT = 768;

export abstract class BasePage {
    private _isMobile?: boolean;

    constructor(protected readonly page: Page) {}

    /**
     * Returns true if the current viewport width is below the mobile breakpoint.
     * The value is computed once and cached for the lifetime of the page object.
     */
    get isMobile(): boolean {
        if (this._isMobile === undefined) {
            const viewportWidth = this.page.viewportSize()?.width ?? 1920;
            this._isMobile = viewportWidth < MOBILE_BREAKPOINT;
        }
        return this._isMobile;
    }
}
