// File: src/lib/types/activity.ts

// Make interfaces more flexible to work with Json type
export interface ParticipationLevels {
	'9'?: boolean;
	'10'?: boolean;
	'11'?: boolean;
	'12'?: boolean;
	// Allow additional properties for Json compatibility
	[key: string]: boolean | undefined;
}

export interface TimingOfParticipation {
	schoolYear?: boolean;
	schoolBreak?: boolean;
	allYear?: boolean;
	// Allow additional properties for Json compatibility
	[key: string]: boolean | undefined;
}

export interface Activity {
	id: string;
	activityType: string;
	positionDescription: string;
	organizationName: string;
	activityDescription: string;
	participationLevels: ParticipationLevels;
	timingOfParticipation: TimingOfParticipation;
	hoursPerWeek: number;
	weeksPerYear: number;
	collegeParticipation: boolean;
}
