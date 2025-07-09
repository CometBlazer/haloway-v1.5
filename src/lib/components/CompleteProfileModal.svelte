<script lang="ts">
	import type { Database } from '../../DatabaseDefinitions';
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		CheckCircle,
		User,
		GraduationCap,
		Users,
		Heart,
		ChevronDown,
	} from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	type Profile = Database['public']['Tables']['profiles']['Row'] | null;

	type FormResult = {
		errorFields?: string[];
		errorMessage?: string;
		fullName?: string;
		grade?: string;
		dreamSchool?: string;
		referralSource?: string;
		success?: boolean;
	} | null;

	export let open = true;
	export let userEmail = '';
	export let form: FormResult = null;
	export let profile: Profile = null;
	export let showCloseButton = false;

	const dispatch = createEventDispatcher();

	let loading = false;
	let progressValue = 0;

	// Form values with defaults from existing profile
	let fullName = profile?.full_name ?? '';
	let graduationYear = profile?.graduation_year ?? new Date().getFullYear();
	let dreamSchool = profile?.dream_school ?? '';
	let referralSource = profile?.referral_source ?? '';

	const fieldError = (liveForm: FormResult, name: string) => {
		let errors = liveForm?.errorFields ?? [];
		return errors.includes(name);
	};

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			loading = false;
			if (result.type === 'success') {
				// Profile completed successfully - tutorial documents are being created server-side
				dispatch('completed');
			}
		};
	};

	// Animate progress bar on mount
	onMount(() => {
		const duration = 700;
		const targetValue = 95;
		const startTime = Date.now();

		const animateProgress = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easeOut = 1 - Math.pow(1 - progress, 3);
			progressValue = Math.round(easeOut * targetValue);

			if (progress < 1) {
				requestAnimationFrame(animateProgress);
			}
		};

		setTimeout(() => {
			requestAnimationFrame(animateProgress);
		}, 300);
	});

	// Graduation year options (5 years behind and 10 years in front of current year)
	const currentYear = new Date().getFullYear();
	const graduationYearOptions = Array.from({ length: 16 }, (_, i) => {
		const year = currentYear - 5 + i;
		return { value: year.toString(), label: year.toString() };
	});

	// Referral source options
	const referralOptions = [
		{ value: 'friend', label: 'Friend or Family' },
		{ value: 'social_media', label: 'Social Media' },
		{ value: 'search', label: 'Search Engine' },
		{ value: 'school', label: 'School or Teacher' },
		{ value: 'ad', label: 'Advertisement' },
		{ value: 'other', label: 'Other' },
	];

	$: selectedGraduationYear = graduationYearOptions.find(
		(option) => option.value === graduationYear.toString(),
	);
	$: selectedReferral = referralOptions.find(
		(option) => option.value === referralSource,
	);
</script>

<Dialog.Root bind:open closeOnEscape={false} closeOnOutsideClick={false}>
	<Dialog.Content
		class="max-h-[90vh] max-w-2xl overflow-y-auto"
		{showCloseButton}
	>
		<div class="space-y-6 p-6">
			<!-- Header with progress -->
			<div class="space-y-4 text-center">
				<div class="flex items-center justify-center gap-2">
					<CheckCircle class="h-6 w-6 text-green-600" />
					<span class="text-lg font-semibold">Almost there!</span>
				</div>

				<!-- Progress Bar -->
				<div class="mx-auto w-full max-w-md">
					<div class="mb-2 flex justify-between text-sm text-muted-foreground">
						<span>Profile completion</span>
						<span>{progressValue}%</span>
					</div>
					<div class="h-2 w-full rounded-full bg-secondary">
						<div
							class="h-2 rounded-full bg-primary transition-all duration-300 ease-out"
							style="width: {progressValue}%"
						></div>
					</div>
				</div>

				<div class="space-y-2">
					<h1 class="text-3xl font-bold">Complete Your Profile</h1>
					<p class="text-lg text-muted-foreground">
						Just a few more details before we get started!
					</p>
					<p class="text-sm text-muted-foreground">
						We collect this data solely to understand how Haloway is being used.
						You can always update your profile later.
					</p>
				</div>
			</div>

			<!-- Form -->
			<form
				class="space-y-6"
				method="POST"
				action="?/updateProfile"
				use:enhance={handleSubmit}
			>
				<!-- Name Field -->
				<div class="space-y-2">
					<Label for="fullName" class="text-base font-medium">
						<User class="mr-2 inline h-4 w-4" />
						Your Name
						<span class="text-destructive">*</span>
					</Label>
					<Input
						id="fullName"
						name="fullName"
						type="text"
						placeholder="Enter your full name"
						bind:value={fullName}
						maxlength={50}
						required
						class={fieldError(form, 'fullName') ? 'border-destructive' : ''}
					/>
					{#if fieldError(form, 'fullName')}
						<p class="text-sm text-destructive">Please enter your name</p>
					{/if}
				</div>

				<!-- Graduation Year Field -->
				<div class="space-y-2">
					<Label for="graduationYear" class="text-base font-medium">
						<GraduationCap class="mr-2 inline h-4 w-4" />
						Your Graduation Year
						<span class="text-destructive">*</span>
					</Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								class="w-full justify-between {fieldError(
									form,
									'graduationYear',
								)
									? 'border-destructive'
									: ''}"
							>
								{selectedGraduationYear?.label || 'Select your graduation year'}
								<ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="max-h-[200px] w-full overflow-y-auto">
							{#each graduationYearOptions as option}
								<DropdownMenu.Item
									on:click={() => (graduationYear = parseInt(option.value))}
									class={graduationYear.toString() === option.value
										? 'bg-accent'
										: ''}
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<input type="hidden" name="graduationYear" value={graduationYear} />
					{#if fieldError(form, 'graduationYear')}
						<p class="text-sm text-destructive">
							Please select your graduation year
						</p>
					{/if}
				</div>

				<!-- Referral Source Field -->
				<div class="space-y-2">
					<Label for="referralSource" class="text-base font-medium">
						<Users class="mr-2 inline h-4 w-4" />
						How did you hear about us?
						<span class="text-destructive">*</span>
					</Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								class="w-full justify-between {fieldError(
									form,
									'referralSource',
								)
									? 'border-destructive'
									: ''}"
							>
								{selectedReferral?.label || 'Select an option'}
								<ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-full">
							{#each referralOptions as option}
								<DropdownMenu.Item
									on:click={() => (referralSource = option.value)}
									class={referralSource === option.value ? 'bg-accent' : ''}
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<input type="hidden" name="referralSource" value={referralSource} />
					{#if fieldError(form, 'referralSource')}
						<p class="text-sm text-destructive">
							Please select how you heard about us
						</p>
					{/if}
				</div>

				<!-- Dream School Field -->
				<div class="space-y-2">
					<Label for="dreamSchool" class="text-base font-medium">
						<Heart class="mr-2 inline h-4 w-4" />
						Your Dream School
						<span class="ml-2 text-sm text-muted-foreground">
							(Optional - it's okay if you don't know yet!)
						</span>
					</Label>
					<Input
						id="dreamSchool"
						name="dreamSchool"
						type="text"
						placeholder="e.g., Harvard, Stanford, State Flagship..."
						bind:value={dreamSchool}
						maxlength={100}
						class={fieldError(form, 'dreamSchool') ? 'border-destructive' : ''}
					/>
				</div>

				<!-- Error Message -->
				{#if form?.errorMessage}
					<Alert variant="destructive">
						<AlertDescription>{form.errorMessage}</AlertDescription>
					</Alert>
				{/if}

				<!-- Submit Button -->
				<div class="pt-4">
					<Button type="submit" class="w-full" size="lg" disabled={loading}>
						{#if loading}
							<div
								class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							Creating Profile...
						{:else}
							Create Profile & Continue
						{/if}
					</Button>
				</div>
			</form>

			<!-- User Info -->
			<div class="space-y-2 border-t pt-6 text-center">
				<p class="text-sm text-muted-foreground">
					Logged in as <span class="font-medium">{userEmail}</span>
				</p>
				<a href="/log-out" class="text-sm text-primary hover:underline">
					Sign out
				</a>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
