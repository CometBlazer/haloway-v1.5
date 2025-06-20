<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import {
		superForm,
		type Infer,
		type SuperValidated,
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from '~icons/lucide/loader-circle';
	import ChevronDown from '~icons/lucide/chevron-down';
	import { infoFormSchema, type InfoFormSchema } from './schema';

	export let data: SuperValidated<Infer<InfoFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(infoFormSchema),
		resetForm: false,
	});

	const { form: formData, enhance, submitting, tainted, message } = form;

	const gradeOptions: Array<{
		value: '9' | '10' | '11' | '12' | 'other';
		label: string;
	}> = [
		{ value: '9', label: '9' },
		{ value: '10', label: '10' },
		{ value: '11', label: '11' },
		{ value: '12', label: '12' },
		{ value: 'other', label: 'Other' },
	];

	const referralOptions: Array<{
		value: 'friend' | 'social_media' | 'search' | 'school' | 'ad' | 'other';
		label: string;
	}> = [
		{ value: 'friend', label: 'Friend or Family' },
		{ value: 'social_media', label: 'Social Media' },
		{ value: 'search', label: 'Search Engine' },
		{ value: 'school', label: 'School or Teacher' },
		{ value: 'ad', label: 'Advertisement' },
		{ value: 'other', label: 'Other' },
	];

	// Helper function to get label from value
	function getGradeLabel(value: string): string {
		const option = gradeOptions.find((opt) => opt.value === value);
		return option ? option.label : 'Select your grade';
	}

	function getReferralLabel(value: string): string {
		const option = referralOptions.find((opt) => opt.value === value);
		return option ? option.label : 'Select how you heard about us';
	}
</script>

<Card.Root>
	<form method="POST" action="?/updateProfile" use:enhance>
		<Card.Header>
			<Card.Title>Profile Information</Card.Title>
			<Card.Description>
				Update your personal information and preferences.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<Form.Field {form} name="full_name">
				<Form.Control let:attrs>
					<Form.Label>Full Name</Form.Label>
					<Input
						{...attrs}
						type="text"
						placeholder="Your full name"
						maxlength={50}
						required
						bind:value={$formData.full_name}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="grade">
				<Form.Control let:attrs>
					<Form.Label>Grade</Form.Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								class="w-[200px] justify-between"
								type="button"
							>
								{getGradeLabel($formData.grade)}
								<ChevronDown class="h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-[200px]">
							{#each gradeOptions as option}
								<DropdownMenu.Item
									on:click={() => ($formData.grade = option.value)}
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<input type="hidden" name={attrs.name} bind:value={$formData.grade} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="dream_school">
				<Form.Control let:attrs>
					<Form.Label
						>Dream School <span class="text-muted-foreground">(Optional)</span
						></Form.Label
					>
					<Input
						{...attrs}
						type="text"
						placeholder="Your dream school"
						maxlength={100}
						bind:value={$formData.dream_school}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="referral_source">
				<Form.Control let:attrs>
					<Form.Label>How did you hear about us?</Form.Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								class="w-[280px] justify-between"
								type="button"
							>
								{getReferralLabel($formData.referral_source)}
								<ChevronDown class="h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-[280px]">
							{#each referralOptions as option}
								<DropdownMenu.Item
									on:click={() => ($formData.referral_source = option.value)}
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<input
						type="hidden"
						name={attrs.name}
						bind:value={$formData.referral_source}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="subscribed_to_emails">
				<Form.Control let:attrs>
					<Form.Label>Email Notifications</Form.Label>
					<RadioGroup.Root
						value={$formData.subscribed_to_emails ? 'true' : 'false'}
						onValueChange={(value) => {
							$formData.subscribed_to_emails = value === 'true';
						}}
						class="flex flex-col space-y-2"
					>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="true" id="subscribed" />
							<Label for="subscribed" class="text-sm font-normal">
								Yes, I want to receive email updates and notifications
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="false" id="unsubscribed" />
							<Label for="unsubscribed" class="text-sm font-normal">
								No, please don't send me email updates
							</Label>
						</div>
					</RadioGroup.Root>
					<input
						type="hidden"
						name={attrs.name}
						bind:value={$formData.subscribed_to_emails}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer class="flex gap-2">
			<Form.Button disabled={$submitting || !$tainted}>
				{#if $submitting}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Updating profile…
				{:else}
					Update Profile
				{/if}
			</Form.Button>
			{#if $message?.success}
				<p class="text-xs text-green-700">{$message.success}</p>
			{:else if !$tainted}
				<span class="text-xs italic text-muted-foreground"> No changes </span>
			{/if}
		</Card.Footer>
	</form>
</Card.Root>
