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

/**
 * Converts a school name to a URL-safe slug
 * @param school - The school name to convert
 * @returns URL-safe slug
 */
export function schoolToSlug(school: string): string {
	return school.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Converts a URL slug back to a school name
 * @param slug - The URL slug to convert
 * @returns properly formatted school name
 */
export function slugToSchool(slug: string): string {
	return slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Validates and normalizes a school slug from URL parameters
 * @param slug - The school slug from URL to validate and normalize
 * @returns normalized school name for database storage
 */
export function validateAndNormalizeSchoolSlug(
	slug: string | null | undefined,
): string {
	if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
		throw new Error('School slug must be provided');
	}

	const normalized = slug.trim().toLowerCase();
	if (normalized.length < 1) {
		throw new Error('School slug must be at least 1 character long');
	}

	// Convert slug back to proper school name for database storage
	return slugToSchool(normalized);
}
