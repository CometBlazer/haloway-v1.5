// File: src/lib/types/activity.ts
export interface ParticipationLevels {
	'9'?: boolean;
	'10'?: boolean;
	'11'?: boolean;
	'12'?: boolean;
}

export interface TimingOfParticipation {
	schoolYear?: boolean;
	schoolBreak?: boolean;
	allYear?: boolean;
}

export interface Activity {
	id: string;
	activityType: string;
	organizationName: string;
	activityDescription: string;
	participationLevels: ParticipationLevels;
	timingOfParticipation: TimingOfParticipation;
	hoursPerWeek: number;
	weeksPerYear: number;
	collegeParticipation: boolean;
}
