<!-- src/lib/components/ThemeSwitchButton.svelte -->
<script lang="ts">
	import { setMode, mode } from 'mode-watcher';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Sun, Moon, Monitor } from 'lucide-svelte';

	export let variant: 'button' | 'dropdown' = 'button';
	export let buttonMode: 'system' | 'light' | 'dark' | undefined = undefined;

	// For dropdown variant, we show all options
	// For button variant, we cycle between modes
	function toggleTheme() {
		if (variant === 'button') {
			switch ($mode) {
				case 'light':
					setMode('dark');
					break;
				case 'dark':
					setMode('system');
					break;
				// case 'system':
				default:
					setMode('light');
					break;
			}
		}
	}

	function setThemeMode() {
		if (buttonMode && variant === 'dropdown') {
			setMode(buttonMode);
		}
	}

	// Get current icon for button variant
	$: currentIcon = $mode === 'light' ? Sun : $mode === 'dark' ? Moon : Monitor;

	// Get icon for dropdown variant
	$: dropdownIcon =
		buttonMode === 'light' ? Sun : buttonMode === 'dark' ? Moon : Monitor;

	// Get text for dropdown variant
	$: dropdownText =
		buttonMode === 'light'
			? 'Light'
			: buttonMode === 'dark'
				? 'Dark'
				: 'System';
</script>

{#if variant === 'button'}
	<Button
		variant="ghost"
		size="icon"
		on:click={toggleTheme}
		class="transition-colors duration-200"
		aria-label="Toggle theme"
	>
		<svelte:component this={currentIcon} class="h-5 w-5" />
	</Button>
{:else if variant === 'dropdown'}
	<Button
		variant="ghost"
		class="w-full justify-start gap-2 text-base"
		on:click={setThemeMode}
	>
		<svelte:component this={dropdownIcon} class="h-4 w-4" />
		{dropdownText}
		{#if $mode === buttonMode}
			<div class="ml-auto h-2 w-2 rounded-full bg-primary"></div>
		{/if}
	</Button>
{/if}
