// src/lib/analytics.ts
import { browser, dev } from '$app/environment';
import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';

// Google Analytics types
type GtagCommand = 'config' | 'event' | 'js' | 'consent';
type GtagConfigParams = {
	page_location?: string;
	page_title?: string;
	custom_map?: Record<string, string>;
};
type GtagEventParams = {
	event_category?: string;
	event_label?: string;
	value?: number;
	custom_parameter?: string;
};

// Extend the Window interface to include gtag and dataLayer
declare global {
	interface Window {
		gtag: (
			command: GtagCommand,
			targetId: string | Date,
			params?: GtagConfigParams | GtagEventParams,
		) => void;
		dataLayer: Array<unknown>;
	}
}

export const GA_MEASUREMENT_ID = PUBLIC_GA_MEASUREMENT_ID || 'G-D9X3SVXWRC';

export function initGA(): void {
	if (!browser || dev || !GA_MEASUREMENT_ID) return;

	// Load gtag script
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
	document.head.appendChild(script);

	// Initialize gtag
	window.dataLayer = window.dataLayer || [];
	window.gtag = function (
		command: GtagCommand,
		targetId: string | Date,
		params?: GtagConfigParams | GtagEventParams,
	) {
		window.dataLayer.push([command, targetId, params]);
	};

	window.gtag('js', new Date());
	window.gtag('config', GA_MEASUREMENT_ID);
}

export function trackPageView(url: string): void {
	if (!browser || dev || !window.gtag) return;

	window.gtag('config', GA_MEASUREMENT_ID, {
		page_location: url,
	});
}

export function trackEvent(
	action: string,
	category: string,
	label?: string,
	value?: number,
): void {
	if (!browser || dev || !window.gtag) return;

	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value: value,
	});
}
