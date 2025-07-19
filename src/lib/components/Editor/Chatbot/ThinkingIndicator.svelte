<!-- src/lib/components/Editor/Chatbot/ThinkingIndicator.svelte -->
<script lang="ts">
	import { Brain, Loader2 } from 'lucide-svelte';

	export let thinkingSteps: string[] = [];
	export let currentStep = 0;
	export let isComplete = false;

	// Allow editing of thinking steps
	function updateStep(index: number, value: string) {
		thinkingSteps[index] = value;
		thinkingSteps = [...thinkingSteps];
	}

	function addStep() {
		thinkingSteps = [...thinkingSteps, 'New thinking step...'];
		currentStep = thinkingSteps.length - 1;
	}

	function removeStep(index: number) {
		thinkingSteps = thinkingSteps.filter((_, i) => i !== index);
		if (currentStep >= thinkingSteps.length) {
			currentStep = Math.max(0, thinkingSteps.length - 1);
		}
	}
</script>

<div
	class="space-y-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 p-4"
>
	<!-- Header -->
	<div class="flex items-center space-x-2">
		<div class="flex items-center space-x-2">
			<Brain class="h-4 w-4 text-blue-500" />
			<span class="text-sm font-medium text-muted-foreground">
				{isComplete ? 'Thinking Complete' : 'Thinking...'}
			</span>
		</div>

		{#if !isComplete}
			<Loader2 class="h-3 w-3 animate-spin text-blue-500" />
		{/if}
	</div>

	<!-- Thinking Steps -->
	<div class="space-y-2">
		{#each thinkingSteps as step, index (index)}
			<div class="flex items-start space-x-2">
				<!-- Step indicator -->
				<div class="mt-1 flex-shrink-0">
					<div
						class="h-2 w-2 rounded-full {index < currentStep
							? 'bg-green-500'
							: index === currentStep
								? 'animate-pulse bg-blue-500'
								: 'bg-muted-foreground/30'}"
					></div>
				</div>

				<!-- Editable step content -->
				<div class="flex-1">
					<textarea
						bind:value={step}
						on:input={(e) => updateStep(index, e.currentTarget.value)}
						class="min-h-[20px] w-full resize-none border-none bg-transparent text-xs leading-relaxed text-muted-foreground outline-none"
						rows="1"
						placeholder="Thinking step..."
					/>
				</div>

				<!-- Remove button -->
				<button
					on:click={() => removeStep(index)}
					class="flex-shrink-0 text-xs text-muted-foreground/50 transition-colors hover:text-red-500"
					aria-label="Remove step"
				>
					×
				</button>
			</div>
		{/each}

		<!-- Add step button -->
		<button
			on:click={addStep}
			class="text-xs text-blue-500 transition-colors hover:text-blue-600"
		>
			+ Add thinking step
		</button>
	</div>

	<!-- Progress bar -->
	<div class="h-1 w-full overflow-hidden rounded-full bg-muted-foreground/10">
		<div
			class="h-full bg-blue-500 transition-all duration-500 ease-out"
			style="width: {isComplete
				? 100
				: (currentStep / Math.max(thinkingSteps.length - 1, 1)) * 100}%"
		></div>
	</div>
</div>
