<!-- src/routes/(app)/background/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { toastStore } from '$lib/stores/toast';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Initialize form data with existing data if available
	let formData = {
		regionOfLiving: data.existingBackground?.region_of_living || '',
		firstGeneration: data.existingBackground?.first_generation || false,
		lowIncome: data.existingBackground?.low_income || false,
		otherHooks: data.existingBackground?.other_hooks || '',
		intendedMajor: data.existingBackground?.intended_major || '',
		classRank: data.existingBackground?.class_rank || '',
		apIbCollegeClasses: data.existingBackground?.ap_ib_college_classes || '',
		gpa: data.existingBackground?.gpa || '',
		testType: data.existingBackground?.test_type || '',
		sat: data.existingBackground?.sat || '',
		act: data.existingBackground?.act || '',
		challenges: data.existingBackground?.challenges || '',
		identityBackground: data.existingBackground?.identity_background || '',
		valuesBeliefs: data.existingBackground?.values_beliefs || '',
		personalQualities: data.existingBackground?.personal_qualities || '',
	};

	let hasUnsavedChanges = false;
	let initialFormData = {};
	let isSubmitting = false;

	// Track changes
	$: {
		if (Object.keys(initialFormData).length > 0) {
			hasUnsavedChanges =
				JSON.stringify(formData) !== JSON.stringify(initialFormData);
		}
	}

	onMount(() => {
		initialFormData = JSON.parse(JSON.stringify(formData));
	});

	// Handle form action results
	$: if (form) {
		if (form.success) {
			// Reset unsaved changes flag
			hasUnsavedChanges = false;
			initialFormData = JSON.parse(JSON.stringify(formData));

			// Show success toast
			toastStore.show(
				'Your responses have been saved successfully!',
				'success',
			);
		} else if (form.error) {
			// Show error toast
			toastStore.show(form.error, 'error');
		}
	}

	// Handle navigation away with unsaved changes
	beforeNavigate(({ cancel }) => {
		if (hasUnsavedChanges && !isSubmitting) {
			if (
				!confirm('You have unsaved changes. Are you sure you want to leave?')
			) {
				cancel();
			}
		}
	});

	// Handle browser refresh/close
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (hasUnsavedChanges && !isSubmitting) {
			event.preventDefault();
			event.returnValue = '';
			return '';
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	});

	// Handle form submission state
	// const handleSubmit = () => {
	// 	return enhance(() => {
	// 		isSubmitting = true;

	// 		return async ({ update }) => {
	// 			isSubmitting = false;
	// 			await update();
	// 		};
	// 	});
	// };
</script>

<div class="mx-auto min-h-screen w-full max-w-5xl py-8">
	<div class="px-4">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-foreground md:text-5xl">
				Your Background Information
			</h1>
			<p class="text-muted-foreground">
				Please fill out the following information to help our AI understand your
				background better. All fields are optional! However, the more you share,
				the more helpful your responses may be.
			</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
			class="space-y-8"
		>
			<!-- Basic Information -->
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription
						>Tell us about your background and location</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<Label for="region">Region of Living</Label>
						<Input
							id="region"
							name="regionOfLiving"
							bind:value={formData.regionOfLiving}
							placeholder="South Korea, Northeastern United States, Bay Area, etc."
						/>
					</div>

					<div
						class="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0"
					>
						<div class="flex items-center space-x-2">
							<Checkbox
								id="firstGen"
								name="firstGeneration"
								bind:checked={formData.firstGeneration}
							/>
							<Label for="firstGen">First Generation</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox
								id="lowIncome"
								name="lowIncome"
								bind:checked={formData.lowIncome}
							/>
							<Label for="lowIncome">Low Income</Label>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="hooks"
							>Any other information that would help our AI better understand
							you</Label
						>
						<Textarea
							id="hooks"
							name="otherHooks"
							bind:value={formData.otherHooks}
							placeholder="Legacy at Cornell, Single parent, etc."
							rows={3}
						/>
					</div>
				</CardContent>
			</Card>

			<!-- Academics -->
			<Card>
				<CardHeader>
					<CardTitle>Academics</CardTitle>
					<CardDescription
						>Please enter your academic information</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="major">Intended Major</Label>
							<Input
								id="major"
								name="intendedMajor"
								bind:value={formData.intendedMajor}
								placeholder="Computer Science"
							/>
						</div>

						<div class="space-y-2">
							<Label for="rank">Class Rank</Label>
							<Input
								id="rank"
								name="classRank"
								bind:value={formData.classRank}
								placeholder="3/111"
							/>
						</div>

						<div class="space-y-2">
							<Label for="classes">Number of AP/IB/College Classes</Label>
							<Input
								id="classes"
								name="apIbCollegeClasses"
								bind:value={formData.apIbCollegeClasses}
								placeholder="20"
							/>
						</div>

						<div class="space-y-2">
							<Label for="gpa">GPA</Label>
							<Input
								id="gpa"
								name="gpa"
								bind:value={formData.gpa}
								placeholder="4.0"
							/>
							<p class="text-sm text-muted-foreground">
								Unweighted GPA on a 4.0 scale
							</p>
						</div>

						<div class="space-y-2">
							<Label for="testType">Test Type</Label>
							<select
								id="testType"
								name="testType"
								bind:value={formData.testType}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="">Select test type</option>
								<option value="SAT">SAT</option>
								<option value="ACT">ACT</option>
							</select>
						</div>

						{#if formData.testType === 'SAT'}
							<div class="space-y-2">
								<Label for="sat">SAT Score</Label>
								<Input
									id="sat"
									name="sat"
									bind:value={formData.sat}
									placeholder="1450"
								/>
								<p class="text-sm text-muted-foreground">
									Enter your highest SAT score (superscore if applicable)
								</p>
							</div>
						{/if}

						{#if formData.testType === 'ACT'}
							<div class="space-y-2">
								<Label for="act">ACT Score</Label>
								<Input
									id="act"
									name="act"
									bind:value={formData.act}
									placeholder="32"
								/>
								<p class="text-sm text-muted-foreground">
									Enter your highest composite ACT score (superscore if
									applicable)
								</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Personal -->
			<Card>
				<CardHeader>
					<CardTitle>Personal</CardTitle>
					<CardDescription
						>List some personal and unique details about your life. Remember,
						all responses are optional!</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<Label for="values">Values & Beliefs</Label>
						<Textarea
							id="values"
							name="valuesBeliefs"
							bind:value={formData.valuesBeliefs}
							placeholder="What principles, beliefs, or values are most important to you? How do these guide your actions and decisions?"
							rows={4}
						/>
					</div>

					<div class="space-y-2">
						<Label for="qualities">Personal Qualities and Characteristics</Label
						>
						<Textarea
							id="qualities"
							name="personalQualities"
							bind:value={formData.personalQualities}
							placeholder="How would you describe yourself? What unique qualities, strengths, or personality traits define you?"
							rows={4}
						/>
					</div>

					<div class="space-y-2">
						<Label for="identity">Identity & Background</Label>
						<Textarea
							id="identity"
							name="identityBackground"
							bind:value={formData.identityBackground}
							placeholder="How have your identity, culture, family background, or personal experiences shaped your values, perspectives, and goals?"
							rows={4}
						/>
					</div>

					<div class="space-y-2">
						<Label for="challenges">Challenges</Label>
						<Textarea
							id="challenges"
							name="challenges"
							bind:value={formData.challenges}
							placeholder="Describe any significant challenges, obstacles, or adversities you have faced in your life. How have these experiences shaped your perspective and influenced your personal growth?"
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			<!-- Submit Button -->
			<div class="flex justify-center pb-6">
				<Button type="submit" size="lg" class="px-8" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Responses'}
				</Button>
			</div>
		</form>
	</div>
</div>
