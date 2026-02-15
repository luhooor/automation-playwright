/**
 * Common helper functions for test data generation.
 *
 * Usage:
 *   import { generatePhoneNumber, generateFullName, generateEmail } from "#utils/common-functions";
 */

import { faker } from "@faker-js/faker";

/**
 * Generate a random phone number with prefix "777".
 * Country code "+62" is pre-filled by the UI, so only the local number is returned.
 * Local number: "777" + 5–10 random digits → 8–13 local digits.
 *
 * @param prefix - Phone prefix (default: "777")
 * @param minRandomDigits - Minimum random digits after prefix (default: 5)
 * @param maxRandomDigits - Maximum random digits after prefix (default: 10)
 */
export function generatePhoneNumber(
    prefix = "777",
    minRandomDigits = 5,
    maxRandomDigits = 10,
): string {
    const randomDigits = faker.string.numeric({
        length: { min: minRandomDigits, max: maxRandomDigits },
    });
    return `${prefix}${randomDigits}`;
}

/**
 * Generate a random full name (first + last).
 */
export function generateFullName(): string {
    return `${faker.person.firstName()} ${faker.person.lastName()}`;
}

/**
 * Generate a random email address with the given domain.
 * Appends a timestamp to ensure uniqueness.
 *
 * @param domain - Email domain (default: "@tiket-dummy.com")
 */
export function generateEmail(domain = "@tiket-dummy.com"): string {
    const username = faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, "");
    const timestamp = Date.now();
    return `${username}${timestamp}${domain}`;
}
