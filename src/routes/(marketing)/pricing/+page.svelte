<script lang="ts">
	import * as Section from '$lib/components/landing/section';
	// import * as Card from '$lib/components/ui/card';
	// import Features from './components/sections/features/features.svelte';
	// import HeroSection from './components/sections/hero.svelte';
	// import LogosCloud from './components/sections/logos-cloud.svelte';
	import Pricing from '../components/sections/pricing.svelte';
	// import Testimonials from './components/sections/testimonials.svelte';

	export let data;

	const { prices } = data;
</script>

<Section.Root anchor="pricing">
	<Section.Header>
		<Section.Title>Pricing</Section.Title>
		<Section.Description class="text-balance">
			Currently we support subscription based pricing out of the box. However,
			you can extend the boilerplate to support one-time or custom pricing
			models.
		</Section.Description>
	</Section.Header>
	<Pricing {prices} />
</Section.Root>
