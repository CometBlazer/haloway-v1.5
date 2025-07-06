// src/lib/utils/ECPreviewGenerator.ts
// Client-side PDF generation for Common App-style activities preview

import type { Activity } from '$lib/types/activity';

// Type definitions for jsPDF - using any for the output method to match actual jsPDF behavior
interface JsPDFInstance {
	setFontSize(size: number): void;
	setTextColor(r: number, g: number, b: number): void;
	setFont(fontName?: string, fontStyle?: string): void;
	text(
		text: string | string[],
		x: number,
		y: number,
		options?: { align?: string },
	): void;
	splitTextToSize(text: string, maxWidth: number): string[];
	setFillColor(r: number, g: number, b: number): void;
	rect(
		x: number,
		y: number,
		width: number,
		height: number,
		style?: string,
	): void;
	addPage(): void;
	getNumberOfPages(): number;
	setPage(page: number): void;
	setDrawColor(r: number, g: number, b: number): void;
	line(x1: number, y1: number, x2: number, y2: number): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	output(type: string): any;
}

export interface PDFGeneratorOptions {
	studentName?: string;
	schoolYear?: string;
}

export class PDFPreviewGenerator {
	private doc!: JsPDFInstance; // Use definite assignment assertion
	private pageWidth: number = 210; // A4 width in mm
	private pageHeight: number = 297; // A4 height in mm
	private margin: number = 20;
	private currentY: number = 0;

	constructor(
		private activities: Activity[],
		private options: PDFGeneratorOptions = {},
	) {
		// Initialize jsPDF - you'll need to import this in your component
		// this.doc = new jsPDF();
	}

	generatePDF(jsPDFInstance: JsPDFInstance): Uint8Array {
		this.doc = jsPDFInstance;
		this.currentY = this.margin;

		// Add header notice
		this.addHeaderNotice();

		// Add title
		this.addTitle();

		// Add activities
		this.addActivities();

		// Add footer disclaimer
		this.addFooterDisclaimer();

		return this.doc.output('arraybuffer');
	}

	private addHeaderNotice(): void {
		this.doc.setFontSize(10);
		this.doc.setTextColor(150, 0, 0); // Dark red

		const noticeText =
			'PREVIEW ONLY: For the most accurate view of how Admissions Officers see your activities, use the actual Common Application.';
		const lines = this.doc.splitTextToSize(
			noticeText,
			this.pageWidth - this.margin * 2,
		);

		// Add light red background
		this.doc.setFillColor(255, 240, 240);
		this.doc.rect(
			this.margin - 5,
			this.currentY - 5,
			this.pageWidth - this.margin * 2 + 10,
			lines.length * 4 + 10,
			'F',
		);

		this.doc.text(lines, this.margin, this.currentY + 5);
		this.currentY += lines.length * 4 + 15;
	}

	private addTitle(): void {
		this.doc.setTextColor(0, 0, 0);
		this.doc.setFontSize(16);
		this.doc.setFont(undefined, 'bold');

		this.doc.text('Activities', this.pageWidth / 2, this.currentY, {
			align: 'center',
		});
		this.currentY += 15;

		if (this.options.studentName) {
			this.doc.setFontSize(12);
			this.doc.setFont(undefined, 'normal');
			this.doc.text(
				`Student: ${this.options.studentName}`,
				this.margin,
				this.currentY,
			);
			this.currentY += 8;
		}

		this.currentY += 10;
	}

	private addActivities(): void {
		this.activities.forEach((activity, index) => {
			// Check if we need a new page
			if (this.currentY > this.pageHeight - 60) {
				this.doc.addPage();
				this.currentY = this.margin;
			}

			this.addSingleActivity(activity, index + 1);
			this.currentY += 8; // Space between activities
		});
	}

	private addSingleActivity(activity: Activity, position: number): void {
		// Activity type and position
		this.doc.setFontSize(11);
		this.doc.setFont(undefined, 'bold');
		this.doc.setTextColor(0, 100, 200); // Blue color

		const activityHeader = `${position}. ${activity.activityType || 'Other Club/Activity'}`;
		this.doc.text(activityHeader, this.margin, this.currentY);
		this.currentY += 6;

		// Reset color to black
		this.doc.setTextColor(0, 0, 0);

		// Create two-column layout
		const leftColumnX = this.margin;
		const rightColumnX = this.pageWidth / 2 + 5;
		const columnWidth = this.pageWidth / 2 - this.margin - 5;

		// Left column
		let leftY = this.currentY;

		// Position/Leadership Role
		if (activity.positionDescription) {
			this.doc.setFont(undefined, 'bold');
			this.doc.setFontSize(10);
			this.doc.text('Position/Leadership Role:', leftColumnX, leftY);
			leftY += 4;

			this.doc.setFont(undefined, 'normal');
			const positionLines = this.doc.splitTextToSize(
				activity.positionDescription,
				columnWidth,
			);
			this.doc.text(positionLines, leftColumnX, leftY);
			leftY += positionLines.length * 4 + 3;
		}

		// Organization Name
		if (activity.organizationName) {
			this.doc.setFont(undefined, 'bold');
			this.doc.setFontSize(10);
			this.doc.text('Organization Name:', leftColumnX, leftY);
			leftY += 4;

			this.doc.setFont(undefined, 'normal');
			const orgLines = this.doc.splitTextToSize(
				activity.organizationName,
				columnWidth,
			);
			this.doc.text(orgLines, leftColumnX, leftY);
			leftY += orgLines.length * 4 + 3;
		}

		// Right column
		let rightY = this.currentY;

		// Time Commitment
		this.doc.setFont(undefined, 'bold');
		this.doc.setFontSize(10);
		this.doc.text('Time Commitment:', rightColumnX, rightY);
		rightY += 4;

		this.doc.setFont(undefined, 'normal');
		this.doc.text(
			`${activity.hoursPerWeek || 0} hrs/wk, ${activity.weeksPerYear || 0} wks/yr`,
			rightColumnX,
			rightY,
		);
		rightY += 7;

		// Participation Levels
		const participationLevels = this.getParticipationLevelsText(
			activity.participationLevels as Record<string, boolean>,
		);
		if (participationLevels) {
			this.doc.setFont(undefined, 'bold');
			this.doc.text('Grade Levels:', rightColumnX, rightY);
			rightY += 4;

			this.doc.setFont(undefined, 'normal');
			this.doc.text(participationLevels, rightColumnX, rightY);
			rightY += 7;
		}

		// Timing of Participation
		const timing = this.getTimingText(
			activity.timingOfParticipation as Record<string, boolean>,
		);
		if (timing) {
			this.doc.setFont(undefined, 'bold');
			this.doc.text('When:', rightColumnX, rightY);
			rightY += 4;

			this.doc.setFont(undefined, 'normal');
			const timingLines = this.doc.splitTextToSize(timing, columnWidth);
			this.doc.text(timingLines, rightColumnX, rightY);
			rightY += timingLines.length * 4 + 3;
		}

		// Activity Description (full width)
		this.currentY = Math.max(leftY, rightY) + 3;

		if (activity.activityDescription) {
			this.doc.setFont(undefined, 'bold');
			this.doc.setFontSize(10);
			this.doc.text(
				'Description of Activity/Achievement:',
				this.margin,
				this.currentY,
			);
			this.currentY += 4;

			this.doc.setFont(undefined, 'normal');
			const descLines = this.doc.splitTextToSize(
				activity.activityDescription,
				this.pageWidth - this.margin * 2,
			);
			this.doc.text(descLines, this.margin, this.currentY);
			this.currentY += descLines.length * 4 + 3;
		}

		// College Participation
		if (activity.collegeParticipation) {
			this.doc.setFont(undefined, 'italic');
			this.doc.setFontSize(9);
			this.doc.setTextColor(100, 100, 100);
			this.doc.text(
				'✓ Plans to participate in similar activity in college',
				this.margin,
				this.currentY,
			);
			this.currentY += 5;
			this.doc.setTextColor(0, 0, 0);
		}

		// Add separator line
		this.doc.setDrawColor(200, 200, 200);
		this.doc.line(
			this.margin,
			this.currentY,
			this.pageWidth - this.margin,
			this.currentY,
		);
		this.currentY += 5;
	}

	private getParticipationLevelsText(levels?: Record<string, boolean>): string {
		if (!levels) return '';

		const selectedLevels = Object.entries(levels)
			.filter(([_, selected]) => selected)
			.map(([grade, _]) => `Grade ${grade}`)
			.sort();

		return selectedLevels.join(', ');
	}

	private getTimingText(timing?: Record<string, boolean>): string {
		if (!timing) return '';

		const timingMap: Record<string, string> = {
			schoolYear: 'School Year',
			schoolBreak: 'School Breaks',
			allYear: 'All Year Round',
		};

		const selectedTiming = Object.entries(timing)
			.filter(([_, selected]) => selected)
			.map(([key, _]) => timingMap[key])
			.filter(Boolean);

		return selectedTiming.join(', ');
	}

	private addFooterDisclaimer(): void {
		// Go to last page if not already there
		const pageCount = this.doc.getNumberOfPages();
		if (pageCount > 1) {
			this.doc.setPage(pageCount);
		}

		// Position at bottom of page
		const disclaimerY = this.pageHeight - 30;

		this.doc.setFontSize(8);
		this.doc.setTextColor(100, 100, 100);
		this.doc.setFont(undefined, 'normal');

		const disclaimer =
			'DISCLAIMER: This preview is for organizational purposes only and is not affiliated with or endorsed by The Common Application, Inc. Common App is a registered trademark of The Common Application, Inc. To submit your activities, please use the official Common Application platform.';

		const lines = this.doc.splitTextToSize(
			disclaimer,
			this.pageWidth - this.margin * 2,
		);

		// Add light gray background
		this.doc.setFillColor(250, 250, 250);
		this.doc.rect(
			this.margin - 5,
			disclaimerY - 5,
			this.pageWidth - this.margin * 2 + 10,
			lines.length * 3 + 10,
			'F',
		);

		this.doc.text(lines, this.margin, disclaimerY);
	}
}

// Usage function to be called from your Svelte component
export function generateActivitiesPDF(
	activities: Activity[],
	options: PDFGeneratorOptions = {},
): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		try {
			// You'll need to dynamically import jsPDF in your component
			import('jspdf')
				.then(({ jsPDF }) => {
					const generator = new PDFPreviewGenerator(activities, options);
					const pdfBuffer = generator.generatePDF(
						new jsPDF() as unknown as JsPDFInstance,
					);
					resolve(pdfBuffer);
				})
				.catch(reject);
		} catch (error) {
			reject(error);
		}
	});
}

// Function to download the PDF - Fixed type issue
export function downloadPDF(
	pdfBuffer: Uint8Array,
	filename: string = 'activities-preview.pdf',
): void {
	const blob = new Blob([new Uint8Array(pdfBuffer)], {
		type: 'application/pdf',
	});
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
