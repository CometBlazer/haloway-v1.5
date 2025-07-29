<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
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

	// Form data
	let formData = {
		regionOfLiving: '',
		firstGeneration: false,
		lowIncome: false,
		otherHooks: '',
		intendedMajor: '',
		classRank: '',
		apIbCollegeClasses: '',
		gpa: '',
		testType: '', // 'SAT' or 'ACT'
		sat: '',
		act: '',
		challenges: '',
		identityBackground: '',
		valuesBeliefs: '',
		personalQualities: '',
	};

	let hasUnsavedChanges = false;
	let initialFormData = {};

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

	// Handle navigation away with unsaved changes
	beforeNavigate(({ cancel }) => {
		if (hasUnsavedChanges) {
			if (
				!confirm('You have unsaved changes. Are you sure you want to leave?')
			) {
				cancel();
			}
		}
	});

	// Handle browser refresh/close
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (hasUnsavedChanges) {
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

	function handleSubmit() {
		console.log('Form submitted with data:', formData);

		// Reset unsaved changes flag
		hasUnsavedChanges = false;
		initialFormData = JSON.parse(JSON.stringify(formData));

		// Show success toast using your custom toast system
		toastStore.show('Your responses have been saved successfully!', 'success');
	}
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

		<form on:submit|preventDefault={handleSubmit} class="space-y-8">
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
							bind:value={formData.regionOfLiving}
							placeholder="South Korea, Northeastern United States, Bay Area, etc."
						/>
					</div>

					<div
						class="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0"
					>
						<div class="flex items-center space-x-2">
							<Checkbox id="firstGen" bind:checked={formData.firstGeneration} />
							<Label for="firstGen">First Generation</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox id="lowIncome" bind:checked={formData.lowIncome} />
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
								bind:value={formData.intendedMajor}
								placeholder="Computer Science"
							/>
						</div>

						<div class="space-y-2">
							<Label for="rank">Class Rank</Label>
							<Input
								id="rank"
								bind:value={formData.classRank}
								placeholder="3/111"
							/>
						</div>

						<div class="space-y-2">
							<Label for="classes">Number of AP/IB/College Classes</Label>
							<Input
								id="classes"
								bind:value={formData.apIbCollegeClasses}
								placeholder="20"
							/>
						</div>

						<div class="space-y-2">
							<Label for="gpa">GPA</Label>
							<Input id="gpa" bind:value={formData.gpa} placeholder="4.0" />
							<p class="text-sm text-muted-foreground">
								Unweighted GPA on a 4.0 scale
							</p>
						</div>

						<div class="space-y-2">
							<Label for="testType">Test Type</Label>
							<select
								id="testType"
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
								<Input id="sat" bind:value={formData.sat} placeholder="1450" />
							</div>
						{/if}

						{#if formData.testType === 'ACT'}
							<div class="space-y-2">
								<Label for="act">ACT Score</Label>
								<Input id="act" bind:value={formData.act} placeholder="32" />
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
						>List some personal and unique details about your life</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<Label for="challenges">Challenges</Label>
						<Textarea
							id="challenges"
							bind:value={formData.challenges}
							placeholder="Describe any significant challenges, obstacles, or adversities you have faced in your life. How have these experiences shaped your perspective and influenced your personal growth?"
							rows={4}
						/>
					</div>

					<div class="space-y-2">
						<Label for="identity">Identity & Background</Label>
						<Textarea
							id="identity"
							bind:value={formData.identityBackground}
							placeholder="How have your identity, culture, family background, or personal experiences shaped your values, perspectives, and goals?"
							rows={4}
						/>
					</div>

					<div class="space-y-2">
						<Label for="values">Values & Beliefs</Label>
						<Textarea
							id="values"
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
							bind:value={formData.personalQualities}
							placeholder="How would you describe yourself? What unique qualities, strengths, or personality traits define you?"
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			<!-- Submit Button -->
			<div class="flex justify-center pt-6">
				<Button type="submit" size="lg" class="px-8">Save Responses</Button>
			</div>
		</form>
	</div>
</div>
