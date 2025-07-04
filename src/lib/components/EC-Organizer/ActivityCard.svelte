<!-- ActivityCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue,
	} from '$lib/components/ui/select';
	import {
		GripVertical,
		Trophy,
		Copy,
		Trash2,
		Star,
		Users,
		// Calendar,
		Clock,
	} from 'lucide-svelte';
	import WordCounter from '$lib/components/Editor/WordCounter.svelte';
	import type { Activity } from '$lib/types/activity';

	export let activity: Activity;
	export let position: number = 1; // Position in the list (1, 2, 3, etc.)

	const dispatch = createEventDispatcher<{
		delete: { id: string };
		update: { id: string; activity: Partial<Activity> };
	}>();

	// Activity type icons mapping
	const activityIcons: Record<string, typeof import('lucide-svelte').Icon> = {
		Academic: Trophy,
		Arts: Star,
		Athletics: Users,
		'Community Service': Users,
		Leadership: Trophy,
		'Work/Career': Users,
		Other: Star,
	};

	function handleDelete() {
		dispatch('delete', { id: activity.id });
	}

	function handleUpdate(
		field: keyof Activity,
		value: string | number | boolean | Record<string, boolean>,
	) {
		dispatch('update', {
			id: activity.id,
			activity: { [field]: value },
		});
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			console.log('Copied to clipboard:', text);
		});
	}

	function handleParticipationLevelChange(
		grade: '9' | '10' | '11' | '12',
		checked: boolean,
	) {
		const levels = { ...activity.participationLevels };
		if (checked) {
			levels[grade] = true;
		} else {
			delete levels[grade];
		}
		handleUpdate('participationLevels', levels);
	}

	function handleTimingChange(
		timing: 'schoolYear' | 'schoolBreak' | 'allYear',
		checked: boolean,
	) {
		const timings = { ...activity.timingOfParticipation };
		if (checked) {
			timings[timing] = true;
		} else {
			delete timings[timing];
		}
		handleUpdate('timingOfParticipation', timings);
	}

	function getCharCount(text: string): number {
		return text ? text.length : 0;
	}

	// Get the appropriate icon component
	$: IconComponent = activityIcons[activity.activityType] || Star;
</script>

<div class="sortable-item group mb-8 w-full" data-id={activity.id}>
	<Card
		class="w-full rounded-2xl border-2 border-border/50 bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:shadow-xl"
	>
		<CardHeader class="pb-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<!-- Empty space where the old activity number was -->
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						class="h-9 w-9 rounded-xl p-0 text-destructive/70 opacity-0 transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
						on:click={handleDelete}
						type="button"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
					<div
						class="sortable-handle flex cursor-grab items-center justify-center rounded-xl p-2.5 transition-all duration-200 hover:bg-muted/80 active:scale-95 active:cursor-grabbing"
						role="button"
						tabindex="0"
						aria-label="Drag to reorder activity"
						title="Drag to reorder"
					>
						<GripVertical class="h-5 w-5 text-muted-foreground/70" />
					</div>
				</div>
			</div>
		</CardHeader>

		<CardContent class="pb-8">
			<!-- Three Column Layout for Large Screens -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
				<!-- Section 1: Activity Type & Leadership -->
				<div class="space-y-6">
					<!-- Activity Type with Large Icon -->
					<div class="space-y-4">
						<div class="mb-3 flex items-center gap-3">
							<div
								class="rounded-2xl border border-primary/20 bg-primary/10 p-3"
							>
								<svelte:component
									this={IconComponent}
									class="h-6 w-6 text-primary"
								/>
							</div>
							<div class="flex-1">
								<Label
									class="mb-2 block text-sm font-semibold text-foreground/80"
									>Activity Type</Label
								>
								<Select
									selected={{
										value: activity.activityType,
										label: activity.activityType,
									}}
									onSelectedChange={(selected) =>
										handleUpdate('activityType', selected?.value || '')}
								>
									<SelectTrigger
										class="rounded-xl border-border/60 focus:border-primary/60"
									>
										<SelectValue placeholder="Select activity type..." />
									</SelectTrigger>
									<SelectContent class="rounded-xl">
										<SelectItem value="Academic">Academic</SelectItem>
										<SelectItem value="Arts">Arts</SelectItem>
										<SelectItem value="Athletics">Athletics</SelectItem>
										<SelectItem value="Community Service"
											>Community Service</SelectItem
										>
										<SelectItem value="Leadership">Leadership</SelectItem>
										<SelectItem value="Work/Career">Work/Career</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					<!-- Position/Leadership Description -->
					<div class="space-y-3">
						<Label
							for="position-{activity.id}"
							class="text-sm font-semibold text-foreground/80"
						>
							Position/Leadership Role
						</Label>
						<div class="relative space-y-2">
							<Input
								id="position-{activity.id}"
								type="text"
								value={activity.positionDescription || ''}
								on:input={(e) => {
									handleUpdate('positionDescription', e.currentTarget.value);
								}}
								placeholder="e.g., President, Captain, Volunteer..."
								maxlength={50}
								class="rounded-xl border-border/60 bg-background/80 pr-20 focus:border-primary/60"
							/>
							<div class="flex items-center justify-between gap-2">
								<WordCounter
									currentWordCount={getCharCount(
										activity.positionDescription || '',
									)}
									wordLimit={50}
									size="sm"
								/>
								<Button
									variant="ghost"
									size="sm"
									class="h-7 rounded-lg px-2 text-xs hover:bg-muted/80"
									on:click={() =>
										copyToClipboard(activity.positionDescription || '')}
									type="button"
								>
									<Copy class="mr-1 h-3 w-3" />
									Copy
								</Button>
							</div>
						</div>
					</div>

					<!-- Organization Name -->
					<div class="space-y-3">
						<Label
							for="organizationName-{activity.id}"
							class="text-sm font-semibold text-foreground/80"
						>
							Organization Name
						</Label>
						<div class="relative space-y-2">
							<Textarea
								id="organizationName-{activity.id}"
								value={activity.organizationName}
								on:input={(e) =>
									handleUpdate('organizationName', e.currentTarget.value)}
								placeholder="Enter organization name..."
								maxlength={100}
								rows={2}
								class="resize-none rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
							/>
							<div class="flex items-center justify-between gap-2">
								<WordCounter
									currentWordCount={getCharCount(
										activity.organizationName || '',
									)}
									wordLimit={100}
									size="sm"
								/>
								{#if activity.organizationName}
									<Button
										variant="ghost"
										size="sm"
										class="h-7 rounded-lg px-2 text-xs hover:bg-muted/80"
										on:click={() => copyToClipboard(activity.organizationName)}
										type="button"
									>
										<Copy class="mr-1 h-3 w-3" />
										Copy
									</Button>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Section 2: Activity Description & Time -->
				<div class="space-y-6">
					<!-- Activity Description -->
					<div class="space-y-3">
						<Label
							for="activityDescription-{activity.id}"
							class="text-sm font-semibold text-foreground/80"
						>
							Activity Description
						</Label>
						<div class="relative space-y-2">
							<Textarea
								id="activityDescription-{activity.id}"
								value={activity.activityDescription}
								on:input={(e) =>
									handleUpdate('activityDescription', e.currentTarget.value)}
								placeholder="Describe your activity and achievements..."
								maxlength={150}
								rows={4}
								class="resize-vertical rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
							/>
							<div class="flex items-center justify-between gap-2">
								<WordCounter
									currentWordCount={getCharCount(
										activity.activityDescription || '',
									)}
									wordLimit={150}
									size="sm"
								/>
								{#if activity.activityDescription}
									<Button
										variant="ghost"
										size="sm"
										class="h-7 rounded-lg px-2 text-xs hover:bg-muted/80"
										on:click={() =>
											copyToClipboard(activity.activityDescription)}
										type="button"
									>
										<Copy class="mr-1 h-3 w-3" />
										Copy
									</Button>
								{/if}
							</div>
						</div>
					</div>

					<!-- Time Commitment -->
					<div class="space-y-4">
						<Label
							class="flex items-center gap-2 text-sm font-semibold text-foreground/80"
						>
							<Clock class="h-4 w-4" />
							Time Commitment
						</Label>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label
									for="hoursPerWeek-{activity.id}"
									class="text-xs font-medium text-muted-foreground"
								>
									Hours per Week
								</Label>
								<Input
									id="hoursPerWeek-{activity.id}"
									type="number"
									min="0"
									max="168"
									value={activity.hoursPerWeek || ''}
									on:input={(e) =>
										handleUpdate(
											'hoursPerWeek',
											parseInt(e.currentTarget.value) || 0,
										)}
									placeholder="0"
									class="rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
								/>
							</div>
							<div class="space-y-2">
								<Label
									for="weeksPerYear-{activity.id}"
									class="text-xs font-medium text-muted-foreground"
								>
									Weeks per Year
								</Label>
								<Input
									id="weeksPerYear-{activity.id}"
									type="number"
									min="0"
									max="52"
									value={activity.weeksPerYear || ''}
									on:input={(e) =>
										handleUpdate(
											'weeksPerYear',
											parseInt(e.currentTarget.value) || 0,
										)}
									placeholder="0"
									class="rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Section 3: Participation Details -->
				<div class="space-y-6">
					<!-- Participation Levels -->
					<div class="space-y-4">
						<!-- Participation Levels -->
						<div class="space-y-3">
							<Label>Participation Levels (Grade)</Label>
							<div class="grid grid-cols-2 gap-3">
								<div class="flex items-center space-x-2">
									<Checkbox
										id="grade-9-{activity.id}"
										checked={activity.participationLevels?.['9'] || false}
										onCheckedChange={(checked) =>
											handleParticipationLevelChange('9', !!checked)}
									/>
									<Label
										for="grade-9-{activity.id}"
										class="text-sm font-normal"
									>
										Grade 9
									</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox
										id="grade-10-{activity.id}"
										checked={activity.participationLevels?.['10'] || false}
										onCheckedChange={(checked) =>
											handleParticipationLevelChange('10', !!checked)}
									/>
									<Label
										for="grade-10-{activity.id}"
										class="text-sm font-normal"
									>
										Grade 10
									</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox
										id="grade-11-{activity.id}"
										checked={activity.participationLevels?.['11'] || false}
										onCheckedChange={(checked) =>
											handleParticipationLevelChange('11', !!checked)}
									/>
									<Label
										for="grade-11-{activity.id}"
										class="text-sm font-normal"
									>
										Grade 11
									</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox
										id="grade-12-{activity.id}"
										checked={activity.participationLevels?.['12'] || false}
										onCheckedChange={(checked) =>
											handleParticipationLevelChange('12', !!checked)}
									/>
									<Label
										for="grade-12-{activity.id}"
										class="text-sm font-normal"
									>
										Grade 12
									</Label>
								</div>
							</div>
						</div>

						<!-- Timing of Participation -->
						<div class="space-y-3">
							<Label>Timing of Participation</Label>
							<div class="space-y-2">
								<div class="flex items-center space-x-2">
									<Checkbox
										id="timing-schoolYear-{activity.id}"
										checked={activity.timingOfParticipation?.schoolYear ||
											false}
										onCheckedChange={(checked) =>
											handleTimingChange('schoolYear', !!checked)}
									/>
									<Label
										for="timing-schoolYear-{activity.id}"
										class="text-sm font-normal"
									>
										During school year
									</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox
										id="timing-schoolBreak-{activity.id}"
										checked={activity.timingOfParticipation?.schoolBreak ||
											false}
										onCheckedChange={(checked) =>
											handleTimingChange('schoolBreak', !!checked)}
									/>
									<Label
										for="timing-schoolBreak-{activity.id}"
										class="text-sm font-normal"
									>
										During school break
									</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox
										id="timing-allYear-{activity.id}"
										checked={activity.timingOfParticipation?.allYear || false}
										onCheckedChange={(checked) =>
											handleTimingChange('allYear', !!checked)}
									/>
									<Label
										for="timing-allYear-{activity.id}"
										class="text-sm font-normal"
									>
										All year
									</Label>
								</div>
							</div>
						</div>

						<!-- College Participation -->
						<div class="space-y-4">
							<div class="rounded-xl border border-border/30 bg-muted/20 p-4">
								<div class="flex items-center space-x-3">
									<Checkbox
										id="college-{activity.id}"
										checked={activity.collegeParticipation || false}
										onCheckedChange={(checked) =>
											handleUpdate('collegeParticipation', checked)}
										class="rounded-md"
									/>
									<Label
										for="college-{activity.id}"
										class="cursor-pointer text-sm font-medium leading-relaxed"
									>
										I plan to continue this activity in college
									</Label>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Activity Position Number - Bottom Right -->
				<div class="mt-6 flex justify-end border-t border-border/30 pt-4">
					<div
						class="flex items-center gap-2 text-sm font-medium text-muted-foreground/70"
					>
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						>
							{position}
						</div>
						Activity {position}
					</div>
				</div>
			</div></CardContent
		>
	</Card>
</div>
