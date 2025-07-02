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
	import { GripVertical, BookOpen, Copy, Trash2 } from 'lucide-svelte';
	import type { Activity } from '$lib/types/activity';

	export let activity: Activity;
	export let isDragging: boolean = false;

	const dispatch = createEventDispatcher<{
		delete: { id: string };
		update: { id: string; activity: Partial<Activity> };
	}>();

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
		timing: 'school_year' | 'school_break' | 'all_year',
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
</script>

<div class="group mb-6 w-full" class:opacity-50={isDragging}>
	<Card class="w-full transition-shadow duration-200 hover:shadow-lg">
		<CardHeader class="pb-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<BookOpen class="h-5 w-5 text-primary" />
					<span class="text-sm font-medium text-muted-foreground">
						Activity #{activity.id.slice(-4)}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						class="h-8 w-8 p-0 text-destructive opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
						on:click={handleDelete}
						data-no-drag="true"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
					<div
						class="cursor-grab p-1 active:cursor-grabbing"
						data-drag-handle="true"
					>
						<GripVertical class="h-5 w-5 text-muted-foreground" />
					</div>
				</div>
			</div>
		</CardHeader>

		<CardContent
			class="grid grid-cols-1 gap-6 lg:grid-cols-2"
			data-no-drag="true"
		>
			<!-- Left Column -->
			<div class="space-y-4">
				<!-- Activity Type -->
				<div class="space-y-2">
					<Label for="activityType-{activity.id}">Activity Type</Label>
					<Select
						value={activity.activityType}
						onValueChange={(value) => handleUpdate('activityType', value || '')}
					>
						<SelectTrigger id="activityType-{activity.id}">
							<SelectValue placeholder="Select activity type..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="option1">Option 1</SelectItem>
							<SelectItem value="option2">Option 2</SelectItem>
							<SelectItem value="option3">Option 3</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<!-- Organization Name -->
				<div class="space-y-2">
					<Label for="organizationName-{activity.id}">Organization Name</Label>
					<div class="relative">
						<Input
							id="organizationName-{activity.id}"
							type="text"
							value={activity.organizationName}
							on:input={(e) =>
								handleUpdate('organizationName', e.currentTarget.value)}
							placeholder="Enter organization name..."
							class="pr-16"
						/>
						<div
							class="absolute right-2 top-2 flex items-center gap-1 rounded bg-background/80 px-1 text-xs text-muted-foreground"
						>
							<span>{activity.organizationName?.length || 0}</span>
							{#if activity.organizationName}
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									on:click={() => copyToClipboard(activity.organizationName)}
								>
									<Copy class="h-3 w-3" />
								</Button>
							{/if}
						</div>
					</div>
				</div>

				<!-- Activity Description -->
				<div class="space-y-2">
					<Label for="activityDescription-{activity.id}"
						>Activity Description</Label
					>
					<div class="relative">
						<Textarea
							id="activityDescription-{activity.id}"
							value={activity.activityDescription}
							on:input={(e) =>
								handleUpdate('activityDescription', e.currentTarget.value)}
							placeholder="Describe your activity..."
							rows={3}
							class="pr-16"
						/>
						<div
							class="absolute right-2 top-2 flex items-center gap-1 rounded bg-background/80 px-1 text-xs text-muted-foreground"
						>
							<span>{activity.activityDescription?.length || 0}</span>
							{#if activity.activityDescription}
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									on:click={() => copyToClipboard(activity.activityDescription)}
								>
									<Copy class="h-3 w-3" />
								</Button>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="space-y-4">
				<!-- Participation Levels -->
				<div class="space-y-3">
					<Label>Participation Levels (Grade)</Label>
					<div class="grid grid-cols-2 gap-3">
						{#each ['9', '10', '11', '12'] as grade}
							<div class="flex items-center space-x-2">
								<Checkbox
									id="grade-{grade}-{activity.id}"
									checked={activity.participationLevels?.[grade] || false}
									onCheckedChange={(checked) =>
										handleParticipationLevelChange(grade, checked)}
								/>
								<Label
									for="grade-{grade}-{activity.id}"
									class="text-sm font-normal"
								>
									Grade {grade}
								</Label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Timing of Participation -->
				<div class="space-y-3">
					<Label>Timing of Participation</Label>
					<div class="space-y-2">
						{#each [{ key: 'school_year', label: 'During school year' }, { key: 'school_break', label: 'During school break' }, { key: 'all_year', label: 'All year' }] as timing}
							<div class="flex items-center space-x-2">
								<Checkbox
									id="timing-{timing.key}-{activity.id}"
									checked={activity.timingOfParticipation?.[timing.key] ||
										false}
									onCheckedChange={(checked) =>
										handleTimingChange(timing.key, checked)}
								/>
								<Label
									for="timing-{timing.key}-{activity.id}"
									class="text-sm font-normal"
								>
									{timing.label}
								</Label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Hours and Weeks -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="hoursPerWeek-{activity.id}">Hours per Week</Label>
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
						/>
					</div>
					<div class="space-y-2">
						<Label for="weeksPerYear-{activity.id}">Weeks per Year</Label>
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
						/>
					</div>
				</div>

				<!-- College Participation -->
				<div class="space-y-3">
					<div class="flex items-center space-x-2">
						<Checkbox
							id="college-{activity.id}"
							checked={activity.collegeParticipation || false}
							onCheckedChange={(checked) =>
								handleUpdate('collegeParticipation', checked)}
						/>
						<Label for="college-{activity.id}" class="text-sm font-normal">
							I intend to participate in a similar activity in college
						</Label>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
