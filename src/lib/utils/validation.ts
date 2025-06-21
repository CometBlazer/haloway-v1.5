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
 * Converts a school name to a URL-safe slug (fallback for when no schools table entry exists)
 * @param school - The school name to convert
 * @returns URL-safe slug
 */
export function schoolToSlug(school: string): string {
	return school.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Converts a URL slug back to a school name (fallback)
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
 * Gets the URL-safe name for a school from the schools table
 * @param schoolName - The school name to get URL-safe name for
 * @returns URL-safe name from schools table, or fallback slug
 */
export async function getSchoolUrlSafeName(
	schoolName: string,
): Promise<string> {
	try {
		const { supabase } = await import('$lib/supabase');
		const { data, error } = await supabase
			.from('schools')
			.select('url_safe_name')
			.eq('name', schoolName)
			.single();

		if (error || !data) {
			// Log warning when school is not found in database
			console.warn(
				`School "${schoolName}" not found in schools table. Using fallback URL generation. Please add this school to the schools table.`,
			);
			// Fallback to generated slug if school not found in table
			return schoolToSlug(schoolName);
		}

		return data.url_safe_name;
	} catch (err) {
		// Log error for debugging
		console.error(
			`Error fetching URL-safe name for school "${schoolName}":`,
			err,
		);
		// Fallback to generated slug on any error
		return schoolToSlug(schoolName);
	}
}

/**
 * Gets the display name for a school from the schools table
 * @param urlSafeName - The URL-safe name to get display name for
 * @returns Display name from schools table, or fallback conversion
 */
export async function getSchoolDisplayName(
	urlSafeName: string,
): Promise<string> {
	try {
		const { supabase } = await import('$lib/supabase');
		const { data, error } = await supabase
			.from('schools')
			.select('name')
			.eq('url_safe_name', urlSafeName)
			.single();

		if (error || !data) {
			// Log warning when school is not found in database
			console.warn(
				`School with URL-safe name "${urlSafeName}" not found in schools table. Using fallback name conversion. Please add this school to the schools table.`,
			);
			// Fallback to converted slug if school not found in table
			return slugToSchool(urlSafeName);
		}

		return data.name;
	} catch (err) {
		// Log error for debugging
		console.error(
			`Error fetching display name for school URL "${urlSafeName}":`,
			err,
		);
		// Fallback to converted slug on any error
		return slugToSchool(urlSafeName);
	}
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

/**
 * Gets the display name for a school from the schools table (strict version)
 * @param urlSafeName - The URL-safe name to get display name for
 * @returns Display name from schools table, throws error if not found
 */
export async function getSchoolDisplayNameStrict(
	urlSafeName: string,
): Promise<string> {
	try {
		const { supabase } = await import('$lib/supabase');
		const { data, error } = await supabase
			.from('schools')
			.select('name')
			.eq('url_safe_name', urlSafeName)
			.single();

		if (error || !data) {
			throw new Error(
				`School with URL-safe name "${urlSafeName}" not found in schools table`,
			);
		}

		return data.name;
	} catch (err) {
		if (err instanceof Error) {
			throw err; // Re-throw our custom error
		}
		throw new Error(
			`Error fetching display name for school URL "${urlSafeName}": ${err}`,
		);
	}
}

/**
 * Gets the URL-safe name for a school from the schools table (strict version)
 * @param schoolName - The school name to get URL-safe name for
 * @returns URL-safe name from schools table, throws error if not found
 */
export async function getSchoolUrlSafeNameStrict(
	schoolName: string,
): Promise<string> {
	try {
		const { supabase } = await import('$lib/supabase');
		const { data, error } = await supabase
			.from('schools')
			.select('url_safe_name')
			.eq('name', schoolName)
			.single();

		if (error || !data) {
			throw new Error(`School "${schoolName}" not found in schools table`);
		}

		return data.url_safe_name;
	} catch (err) {
		if (err instanceof Error) {
			throw err; // Re-throw our custom error
		}
		throw new Error(
			`Error fetching URL-safe name for school "${schoolName}": ${err}`,
		);
	}
}
