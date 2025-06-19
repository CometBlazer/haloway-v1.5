<script>
	import '../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Banner from "$lib/components/Banner.svelte"
  	import { WebsiteName } from "../../config"

	export let data;
</script>

<Banner
  text="{WebsiteName} is free during our beta — stay tuned for pricing plans coming soon!"
  showBullets={false}
/>


<div class="banner-offset flex flex-col min-h-screen">
  <Navbar user={data.user} />
  <div class="mt-12">
	<slot />
  </div>
  <div class="grow"></div>
  <Footer />
</div>



<style>
	:root {
		scroll-behavior: smooth;
	}

	:global(:root) {
    /* default in case JS hasn’t run yet */
    --banner-height: 0px;
  }

  .banner-offset {
    /* push everything below the banner */
    margin-top: var(--banner-height);
  }
</style>