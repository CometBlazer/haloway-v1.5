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
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
	} from '$lib/components/ui/command';
	import {
		Popover,
		PopoverContent,
		PopoverTrigger,
	} from '$lib/components/ui/popover';
	// import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import {
		GripVertical,
		// Trophy,
		Copy,
		Trash2,
		// Star,
		Users,
		Calendar,
		Clock,
		// BookOpen,
		Check,
		GraduationCap,
		Palette,
		Dumbbell,
		Shield,
		Briefcase,
		Heart,
		Computer,
		Globe,
		Music,
		MessageSquare,
		Leaf,
		Home,
		Plane,
		Languages,
		FileText,
		// Megaphone,
		Rainbow,
		Piano,
		Mic,
		Church,
		FlaskConical,
		Bot,
		Sparkles,
		Calculator,
		Scale,
		Vote,
		Drama,
		DollarSign,
		Puzzle,
		ChevronsUpDown,
	} from 'lucide-svelte';
	import WordCounter from '$lib/components/Editor/WordCounter.svelte';
	import type { Activity } from '$lib/types/activity';

	export let activity: Activity;
	export let position: number = 1; // Position in the list (1, 2, 3, etc.)

	const dispatch = createEventDispatcher<{
		delete: { id: string };
		update: { id: string; activity: Partial<Activity> };
	}>();

	// Activity type configuration with icons, names, and colors
	const activityTypes = {
		Academic: {
			icon: GraduationCap,
			name: 'Academic',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			borderColor: 'border-blue-200',
		},
		Art: {
			icon: Palette,
			name: 'Art',
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
			borderColor: 'border-purple-200',
		},
		'Athletics: Club': {
			icon: Users,
			name: 'Athletics: Club',
			color: 'text-green-600',
			bgColor: 'bg-green-100',
			borderColor: 'border-green-200',
		},
		'Athletics: JV/Varsity': {
			icon: Dumbbell,
			name: 'Athletics: JV/Varsity',
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-100',
			borderColor: 'border-emerald-200',
		},
		'Career-Oriented': {
			icon: Briefcase,
			name: 'Career-Oriented',
			color: 'text-slate-600',
			bgColor: 'bg-slate-100',
			borderColor: 'border-slate-200',
		},
		'Community Service (Volunteer)': {
			icon: Heart,
			name: 'Community Service (Volunteer)',
			color: 'text-red-600',
			bgColor: 'bg-red-100',
			borderColor: 'border-red-200',
		},
		'Computer/Technology': {
			icon: Computer,
			name: 'Computer/Technology',
			color: 'text-cyan-600',
			bgColor: 'bg-cyan-100',
			borderColor: 'border-cyan-200',
		},
		Cultural: {
			icon: Globe,
			name: 'Cultural',
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
			borderColor: 'border-orange-200',
		},
		Dance: {
			icon: Music,
			name: 'Dance',
			color: 'text-pink-600',
			bgColor: 'bg-pink-100',
			borderColor: 'border-pink-200',
		},
		'Debate/Speech': {
			icon: MessageSquare,
			name: 'Debate/Speech',
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-100',
			borderColor: 'border-indigo-200',
		},
		Environmental: {
			icon: Leaf,
			name: 'Environmental',
			color: 'text-green-600',
			bgColor: 'bg-green-100',
			borderColor: 'border-green-200',
		},
		'Family Responsibilities': {
			icon: Home,
			name: 'Family Responsibilities',
			color: 'text-amber-600',
			bgColor: 'bg-amber-100',
			borderColor: 'border-amber-200',
		},
		'Foreign Exchange': {
			icon: Plane,
			name: 'Foreign Exchange',
			color: 'text-sky-600',
			bgColor: 'bg-sky-100',
			borderColor: 'border-sky-200',
		},
		'Foreign Language': {
			icon: Languages,
			name: 'Foreign Language',
			color: 'text-violet-600',
			bgColor: 'bg-violet-100',
			borderColor: 'border-violet-200',
		},
		Internship: {
			icon: Briefcase,
			name: 'Internship',
			color: 'text-gray-600',
			bgColor: 'bg-gray-100',
			borderColor: 'border-gray-200',
		},
		'Journalism/Publication': {
			icon: FileText,
			name: 'Journalism/Publication',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			borderColor: 'border-blue-200',
		},
		'Junior R.O.T.C.': {
			icon: Shield,
			name: 'Junior R.O.T.C.',
			color: 'text-red-600',
			bgColor: 'bg-red-100',
			borderColor: 'border-red-200',
		},
		LGBT: {
			icon: Rainbow,
			name: 'LGBT',
			color: 'text-pink-600',
			bgColor: 'bg-pink-100',
			borderColor: 'border-pink-200',
		},
		'Music: Instrumental': {
			icon: Piano,
			name: 'Music: Instrumental',
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
			borderColor: 'border-purple-200',
		},
		'Music: Vocal': {
			icon: Mic,
			name: 'Music: Vocal',
			color: 'text-fuchsia-600',
			bgColor: 'bg-fuchsia-100',
			borderColor: 'border-fuchsia-200',
		},
		Religious: {
			icon: Church,
			name: 'Religious',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-100',
			borderColor: 'border-yellow-200',
		},
		Research: {
			icon: FlaskConical,
			name: 'Research',
			color: 'text-teal-600',
			bgColor: 'bg-teal-100',
			borderColor: 'border-teal-200',
		},
		Robotics: {
			icon: Bot,
			name: 'Robotics',
			color: 'text-slate-600',
			bgColor: 'bg-slate-100',
			borderColor: 'border-slate-200',
		},
		'School Spirit': {
			icon: Sparkles,
			name: 'School Spirit',
			color: 'text-rose-600',
			bgColor: 'bg-rose-100',
			borderColor: 'border-rose-200',
		},
		'Science/Math': {
			icon: Calculator,
			name: 'Science/Math',
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-100',
			borderColor: 'border-emerald-200',
		},
		'Social Justice': {
			icon: Scale,
			name: 'Social Justice',
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
			borderColor: 'border-orange-200',
		},
		'Student Gov.t./Politics': {
			icon: Vote,
			name: 'Student Gov.t./Politics',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			borderColor: 'border-blue-200',
		},
		'Theater/Drama': {
			icon: Drama,
			name: 'Theater/Drama',
			color: 'text-red-600',
			bgColor: 'bg-red-100',
			borderColor: 'border-red-200',
		},
		'Work (paid)': {
			icon: DollarSign,
			name: 'Work (paid)',
			color: 'text-green-600',
			bgColor: 'bg-green-100',
			borderColor: 'border-green-200',
		},
		'Other Club/Activity': {
			icon: Puzzle,
			name: 'Other Club/Activity',
			color: 'text-gray-600',
			bgColor: 'bg-gray-100',
			borderColor: 'border-gray-200',
		},
	};

	let isDeleting = false;
	let copySuccess = {
		organizationName: false,
		positionDescription: false,
		activityDescription: false,
	};
	let comboboxOpen = false;

	function handleDelete() {
		isDeleting = true;
		// Wait for animation to complete before dispatching delete
		setTimeout(() => {
			dispatch('delete', { id: activity.id });
		}, 300);
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

	function copyToClipboard(text: string, field: keyof typeof copySuccess) {
		navigator.clipboard.writeText(text).then(() => {
			console.log('Copied to clipboard:', text);
			copySuccess[field] = true;
			setTimeout(() => {
				copySuccess[field] = false;
			}, 2000);
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

	// Get the appropriate icon component and styling
	$: selectedActivityType =
		activityTypes[activity.activityType as keyof typeof activityTypes] ||
		activityTypes['Other Club/Activity'];
	$: IconComponent = selectedActivityType.icon;
	$: activityTypesList = Object.values(activityTypes);
</script>

<div
	class="sortable-item group mb-6 w-full rounded-2xl {isDeleting
		? 'animate-scale-out'
		: ''}"
	data-id={activity.id}
>
	<Card
		class="w-full rounded-2xl border-2 border-border/50 bg-card/50 shadow-sm backdrop-blur-sm"
	>
		<CardHeader class="pb-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<!-- Activity Position Number - Top Left -->
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

		<CardContent class="pb-6">
			<!-- Three Column Layout for Large Screens -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
				<!-- Section 1: Activity Type & Leadership -->
				<div class="space-y-4">
					<!-- Activity Type with Large Icon -->
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div
								class="rounded-xl border {selectedActivityType.borderColor} {selectedActivityType.bgColor} p-3"
							>
								<svelte:component
									this={IconComponent}
									class="h-7 w-7 {selectedActivityType.color}"
								/>
							</div>
							<div class="flex-1">
								<Label
									class="mb-1 block text-sm font-semibold text-foreground/80"
									>Activity Type<span class="text-destructive">*</span></Label
								>
								<Popover bind:open={comboboxOpen}>
									<PopoverTrigger asChild let:builder>
										<Button
											builders={[builder]}
											variant="outline"
											role="combobox"
											aria-expanded={comboboxOpen}
											class="h-9 w-full justify-between rounded-xl border-border/60 bg-background/80 px-3 hover:bg-background/90 focus:border-primary/60"
										>
											{#if activity.activityType}
												<div class="flex items-center gap-2">
													<svelte:component
														this={selectedActivityType.icon}
														class="h-4 w-4 {selectedActivityType.color}"
													/>
													<span class="truncate"
														>{selectedActivityType.name}</span
													>
												</div>
											{:else}
												<span class="text-muted-foreground"
													>Select activity type...</span
												>
											{/if}
											<ChevronsUpDown
												class="ml-2 h-4 w-4 shrink-0 opacity-50"
											/>
										</Button>
									</PopoverTrigger>
									<PopoverContent class="w-[300px] p-0" align="start">
										<Command>
											<CommandInput placeholder="Search activity types..." />
											<CommandList>
												<CommandEmpty>No activity type found.</CommandEmpty>
												<CommandGroup>
													{#each activityTypesList as activityType}
														<CommandItem
															value={activityType.name}
															onSelect={() => {
																handleUpdate('activityType', activityType.name);
																comboboxOpen = false;
															}}
															class="flex items-center gap-2"
														>
															<svelte:component
																this={activityType.icon}
																class="h-4 w-4 {activityType.color}"
															/>
															<span>{activityType.name}</span>
															<Check
																class={cn(
																	'ml-auto h-4 w-4',
																	activity.activityType === activityType.name
																		? 'opacity-100'
																		: 'opacity-0',
																)}
															/>
														</CommandItem>
													{/each}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>

					<!-- Organization Name -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label
								for="organizationName-{activity.id}"
								class="text-xs font-medium text-muted-foreground/60"
							>
								Organization Name
							</Label>
							<div class="flex items-center gap-2">
								<WordCounter
									currentWordCount={(activity.organizationName || '').length}
									wordLimit={100}
									size="sm"
								/>
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									on:click={() =>
										copyToClipboard(
											activity.organizationName || '',
											'organizationName',
										)}
									type="button"
								>
									<span class="flex h-3 w-3 items-center justify-center">
										{#if copySuccess.organizationName}
											<Check class="h-3 w-3 text-green-500" />
										{:else}
											<Copy class="h-3 w-3" />
										{/if}
									</span>
								</Button>
							</div>
						</div>
						<div class="relative">
							<Textarea
								id="organizationName-{activity.id}"
								value={activity.organizationName}
								on:input={(e) =>
									handleUpdate('organizationName', e.currentTarget.value)}
								placeholder="Organization Name"
								maxlength={150}
								rows={2}
								class="resize-none rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
							/>
						</div>
					</div>

					<!-- Timing of Participation -->
					<div class="space-y-3">
						<Label
							class="flex items-center text-sm font-semibold text-foreground/80"
						>
							<Calendar class="mr-2 h-4 w-4" />
							Timing of Participation<span class="text-destructive">*</span>
						</Label>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="timing-schoolYear-{activity.id}"
									checked={activity.timingOfParticipation?.schoolYear || false}
									onCheckedChange={(checked) =>
										handleTimingChange('schoolYear', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="timing-schoolYear-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									School Year
								</Label>
							</div>
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="timing-schoolBreak-{activity.id}"
									checked={activity.timingOfParticipation?.schoolBreak || false}
									onCheckedChange={(checked) =>
										handleTimingChange('schoolBreak', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="timing-schoolBreak-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									School Breaks
								</Label>
							</div>
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="timing-allYear-{activity.id}"
									checked={activity.timingOfParticipation?.allYear || false}
									onCheckedChange={(checked) =>
										handleTimingChange('allYear', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="timing-allYear-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									All Year Round
								</Label>
							</div>
						</div>
					</div>
				</div>

				<!-- Section 2: Activity Description & Time -->
				<div class="space-y-4">
					<!-- Position/Leadership Description -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label
								for="position-{activity.id}"
								class="text-xs font-medium text-muted-foreground/60"
							>
								Position/Leadership Role<span class="text-destructive">*</span>
							</Label>
							<div class="flex items-center gap-2">
								<WordCounter
									currentWordCount={(activity.positionDescription || '').length}
									wordLimit={50}
									size="sm"
								/>
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									on:click={() =>
										copyToClipboard(
											activity.positionDescription || '',
											'positionDescription',
										)}
									type="button"
								>
									<span class="flex h-3 w-3 items-center justify-center">
										{#if copySuccess.positionDescription}
											<Check class="h-3 w-3 text-green-500" />
										{:else}
											<Copy class="h-3 w-3" />
										{/if}
									</span>
								</Button>
							</div>
						</div>
						<div class="relative">
							<Input
								id="position-{activity.id}"
								type="text"
								value={activity.positionDescription || ''}
								on:input={(e) => {
									handleUpdate('positionDescription', e.currentTarget.value);
								}}
								placeholder="Position/Leadership Role (e.g., President,...)"
								maxlength={50}
								class="h-9 rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
							/>
						</div>
					</div>

					<!-- Activity Description -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label
								for="activityDescription-{activity.id}"
								class="text-xs font-medium text-muted-foreground/60"
							>
								Activity Description<span class="text-destructive">*</span>
							</Label>
							<div class="flex items-center gap-2">
								<WordCounter
									currentWordCount={(activity.activityDescription || '').length}
									wordLimit={150}
									size="sm"
								/>
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									on:click={() =>
										copyToClipboard(
											activity.activityDescription || '',
											'activityDescription',
										)}
									type="button"
								>
									<span class="flex h-3 w-3 items-center justify-center">
										{#if copySuccess.activityDescription}
											<Check class="h-3 w-3 text-green-500" />
										{:else}
											<Copy class="h-3 w-3" />
										{/if}
									</span>
								</Button>
							</div>
						</div>
						<div class="relative">
							<Textarea
								id="activityDescription-{activity.id}"
								value={activity.activityDescription}
								on:input={(e) =>
									handleUpdate('activityDescription', e.currentTarget.value)}
								placeholder="Activity Description - Describe your activity and achievements..."
								maxlength={150}
								rows={5}
								class="resize-vertical rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Participation Details -->
				<div class="space-y-4">
					<!-- Time Commitment -->
					<div class="space-y-3">
						<Label
							class="flex items-center gap-2 text-sm font-semibold text-foreground/80"
						>
							<Clock class="h-4 w-4" />
							Time Commitment
						</Label>
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1">
								<Label
									for="hoursPerWeek-{activity.id}"
									class="text-xs font-medium text-muted-foreground/60"
								>
									Hours per Week<span class="text-destructive">*</span>
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
									class="h-9 rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
								/>
							</div>
							<div class="space-y-1">
								<Label
									for="weeksPerYear-{activity.id}"
									class="text-xs font-medium text-muted-foreground/60"
								>
									Weeks per Year<span class="text-destructive">*</span>
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
									class="h-9 rounded-xl border-border/60 bg-background/80 focus:border-primary/60"
								/>
							</div>
						</div>
					</div>

					<!-- Participation Levels -->
					<div class="space-y-3">
						<Label
							class="flex items-center text-sm font-semibold text-foreground/80"
						>
							<Users class="mr-2 h-4 w-4" />
							Participation Grade Levels<span class="text-destructive">*</span>
						</Label>
						<div class="grid grid-cols-2 gap-2">
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="grade-9-{activity.id}"
									checked={activity.participationLevels?.['9'] || false}
									onCheckedChange={(checked) =>
										handleParticipationLevelChange('9', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="grade-9-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									Grade 9
								</Label>
							</div>
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="grade-10-{activity.id}"
									checked={activity.participationLevels?.['10'] || false}
									onCheckedChange={(checked) =>
										handleParticipationLevelChange('10', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="grade-10-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									Grade 10
								</Label>
							</div>
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="grade-11-{activity.id}"
									checked={activity.participationLevels?.['11'] || false}
									onCheckedChange={(checked) =>
										handleParticipationLevelChange('11', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="grade-11-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									Grade 11
								</Label>
							</div>
							<div
								class="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-muted/30"
							>
								<Checkbox
									id="grade-12-{activity.id}"
									checked={activity.participationLevels?.['12'] || false}
									onCheckedChange={(checked) =>
										handleParticipationLevelChange('12', !!checked)}
									class="rounded-md"
								/>
								<Label
									for="grade-12-{activity.id}"
									class="cursor-pointer text-xs font-medium"
								>
									Grade 12
								</Label>
							</div>
						</div>
					</div>

					<!-- College Participation -->
					<div class="space-y-3">
						<div class="rounded-xl border border-border/30 bg-muted/20 p-3">
							<div class="flex items-center space-x-2">
								<Checkbox
									id="college-{activity.id}"
									checked={activity.collegeParticipation || false}
									onCheckedChange={(checked) =>
										handleUpdate('collegeParticipation', checked)}
									class="rounded-md"
								/>
								<Label
									for="college-{activity.id}"
									class="cursor-pointer text-xs font-medium leading-relaxed"
								>
									I intend to participate in a similar activity in college.
								</Label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</div>

<style>
	@keyframes scale-out {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(0.8);
			opacity: 0;
		}
	}

	.animate-scale-out {
		animation: scale-out 0.3s ease-in-out forwards;
	}
</style>
