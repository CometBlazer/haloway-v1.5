<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		superForm,
		type Infer,
		type SuperValidated,
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from '~icons/lucide/loader-circle';
	import Eye from '~icons/lucide/eye';
	import EyeOff from '~icons/lucide/eye-off';
	import { formSchema, type FormSchema } from './schema';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema),
	});

	const { form: formData, enhance, submitting } = form;

	// Add state for password visibility
	let showPassword = false;

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<form method="POST" use:enhance class="grid gap-4">
	<Form.Errors {form} />
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label class="mb-2">Email</Form.Label>
			<Input
				{...attrs}
				type="email"
				placeholder="name@example.com"
				required
				bind:value={$formData.email}
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Password</Form.Label>
			<div class="relative">
				<Input
					{...attrs}
					type={showPassword ? 'text' : 'password'}
					placeholder="••••••••"
					required
					bind:value={$formData.password}
					class="pr-10"
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
					on:click={togglePasswordVisibility}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{#if showPassword}
						<EyeOff class="h-4 w-4" />
					{:else}
						<Eye class="h-4 w-4" />
					{/if}
				</Button>
			</div>
		</Form.Control>
		<Form.FieldErrors />
		<Form.Description class="text-right text-xs"
			>At least 6 characters long</Form.Description
		>
	</Form.Field>
	<Form.Button class="w-full" disabled={$submitting}>
		{#if $submitting}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			Creating an account…
		{:else}
			Create an account
		{/if}
	</Form.Button>

	<div class="text-center text-xs text-muted-foreground">
		<a href="/forgot-password" class="text-primary hover:underline"
			>Forgot your password?</a
		>
	</div>
</form>
