/**
 * Validation utilities for the application
 */

/**
 * Validates that a school name is valid (non-empty and has length >= 1)
 * @param school - The school name to validate
 * @returns true if valid, false otherwise
 */
export function isValidSchool(school: string | null | undefined): boolean {
	return typeof school === 'string' && school.trim().length >= 1;
}

/**
 * Validates and normalizes a school name
 * @param school - The school name to validate and normalize
 * @returns normalized school name or throws an error if invalid
 */
export function validateAndNormalizeSchool(
	school: string | null | undefined,
): string {
	if (!isValidSchool(school)) {
		throw new Error('School name must be at least 1 character long');
	}
	return school!.trim();
}

/**
 * Gets a default school value
 * @returns the default school value
 */
export function getDefaultSchool(): string {
	return 'uncategorized';
}
