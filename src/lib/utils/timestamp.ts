// src/lib/utils/timestamp.ts

export interface TimeFormatOptions {
	detectUserPreference?: boolean;
	force24Hour?: boolean | null;
	removeLeadingZeros?: boolean;
	showSeconds?: boolean;
}

/**
 * Detect if user prefers 24-hour format based on their locale/system
 */
export function detectTimeFormatPreference(): boolean {
	try {
		// Create a test date and format it with the user's locale
		const testDate = new Date(2024, 0, 1, 13, 0, 0); // 1 PM
		const formatted = testDate.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
		});

		// If it contains 'PM' or 'AM', user prefers 12-hour format
		// If it shows '13:00' or similar, user prefers 24-hour format
		return (
			!formatted.toLowerCase().includes('pm') &&
			!formatted.toLowerCase().includes('am')
		);
	} catch {
		// Fallback to 12-hour format if detection fails
		console.warn('Time format detection failed, defaulting to 12-hour format');
		return false;
	}
}

/**
 * Format time only, removing leading zeros and handling 12/24 hour preference
 */
export function formatTimeOnly(
	date: Date,
	use24Hour: boolean,
	showSeconds: boolean = false,
): string {
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = showSeconds
		? `:${date.getSeconds().toString().padStart(2, '0')}`
		: '';

	if (use24Hour) {
		// 24-hour format: "9:45" or "13:30"
		const hours = date.getHours();
		return `${hours}:${minutes}${seconds}`;
	} else {
		// 12-hour format: "9:45 AM" or "1:30 PM"
		let hours = date.getHours();
		const ampm = hours >= 12 ? 'PM' : 'AM';

		// Convert to 12-hour format
		hours = hours % 12;
		hours = hours ? hours : 12; // 0 should be 12

		return `${hours}:${minutes}${seconds} ${ampm}`;
	}
}

/**
 * Format date in compact format without leading zeros
 */
export function formatDateCompact(date: Date): string {
	const month = date.getMonth() + 1; // Remove leading zero
	const day = date.getDate(); // Remove leading zero
	const year = date.getFullYear().toString().slice(-2); // Last 2 digits

	return `${month}/${day}/${year}`;
}

/**
 * Main timestamp formatting function for chat messages
 * Shows time only for today's messages, date + time for older messages
 */
export function formatMessageTimestamp(timestamp: string | Date): string {
	const messageDate =
		timestamp instanceof Date ? timestamp : new Date(timestamp);
	const today = new Date();

	// Check if the message is from today
	const isToday = messageDate.toDateString() === today.toDateString();

	// Detect user's time format preference
	const userPrefers24Hour = detectTimeFormatPreference();

	if (isToday) {
		// Just show time for today's messages
		return formatTimeOnly(messageDate, userPrefers24Hour);
	} else {
		// Show date and time for older messages
		const dateStr = formatDateCompact(messageDate);
		const timeStr = formatTimeOnly(messageDate, userPrefers24Hour);
		return `${dateStr} ${timeStr}`;
	}
}

/**
 * More flexible timestamp formatting with custom options
 */
export function formatTimestampWithOptions(
	timestamp: string | Date,
	options: TimeFormatOptions = {},
): string {
	const messageDate =
		timestamp instanceof Date ? timestamp : new Date(timestamp);
	const today = new Date();
	const isToday = messageDate.toDateString() === today.toDateString();

	const defaultOptions: Required<TimeFormatOptions> = {
		detectUserPreference: true,
		force24Hour: null,
		removeLeadingZeros: true,
		showSeconds: false,
	};

	const config = { ...defaultOptions, ...options };

	// Determine time format
	let use24Hour: boolean;
	if (config.force24Hour !== null) {
		use24Hour = config.force24Hour;
	} else if (config.detectUserPreference) {
		use24Hour = detectTimeFormatPreference();
	} else {
		use24Hour = false; // Default to 12-hour
	}

	if (isToday) {
		return formatTimeOnly(messageDate, use24Hour, config.showSeconds);
	} else {
		const dateStr = config.removeLeadingZeros
			? formatDateCompact(messageDate)
			: messageDate.toLocaleDateString([], {
					month: '2-digit',
					day: '2-digit',
					year: '2-digit',
				});
		const timeStr = formatTimeOnly(messageDate, use24Hour, config.showSeconds);
		return `${dateStr} ${timeStr}`;
	}
}

/**
 * Utility to check if a timestamp is from today
 */
export function isToday(timestamp: string | Date): boolean {
	const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
	const today = new Date();
	return date.toDateString() === today.toDateString();
}

/**
 * Utility to check if a timestamp is from yesterday
 */
export function isYesterday(timestamp: string | Date): boolean {
	const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return date.toDateString() === yesterday.toDateString();
}

/**
 * Advanced formatting with relative dates (Today, Yesterday, etc.)
 */
export function formatRelativeTimestamp(timestamp: string | Date): string {
	const messageDate =
		timestamp instanceof Date ? timestamp : new Date(timestamp);
	const userPrefers24Hour = detectTimeFormatPreference();
	const timeStr = formatTimeOnly(messageDate, userPrefers24Hour);

	if (isToday(messageDate)) {
		return timeStr;
	} else if (isYesterday(messageDate)) {
		return `Yesterday ${timeStr}`;
	} else {
		// For older messages, show date
		const dateStr = formatDateCompact(messageDate);
		return `${dateStr} ${timeStr}`;
	}
}
