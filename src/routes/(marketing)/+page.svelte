<script lang="ts">
	import * as Section from '$lib/components/landing/section';
	// import Features from './components/sections/features/features.svelte';
	// import HeroSection from './components/sections/hero.svelte';
	// import LogosCloud from './components/sections/logos-cloud.svelte';
	// import Pricing from './components/sections/pricing.svelte';
	// import Testimonials from './components/sections/testimonials.svelte';

	// export let data;

	// const { prices } = data;
	import {
		WebsiteName,
		WebsiteBaseUrl,
		WebsiteDescription,
		WebsiteSlogan,
	} from './../../config';

	import { PenLine, ArrowRight, Lock, Check, X } from 'lucide-svelte';

	import AuroraBackground from '$lib/components/AuroraBackground.svelte';

	const ldJson = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: WebsiteName,
		url: WebsiteBaseUrl,
	};
	const jsonldScript = `<script type="application/ld+json">${
		JSON.stringify(ldJson) + '<'
	}/script>`;

	const schools = [
		{
			name: 'Harvard',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532874/harvard-min_t6lqkm.jpg',
			showOnMobile: true,
		},
		{
			name: 'MIT',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/mit-min_zydu0g.jpg',
			showOnMobile: false,
		},
		{
			name: 'Stanford',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/stanford-min_pjicnr.jpg',
			showOnMobile: true,
		},
		{
			name: 'Yale',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532880/yale-min_z7n3rs.jpg',
			showOnMobile: false,
		},
		{
			name: 'Princeton',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/princeton-min_tl4yak.jpg',
			showOnMobile: true,
		},
		{
			name: 'UCLA',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532877/ucla-min_y6bll1.jpg',
			showOnMobile: true,
		},
		// {
		//   name: "Brown",
		//   image:
		//     "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/brown-min_isutma.jpg",
		//   showOnMobile: false,
		// },
		{
			name: 'UPenn',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532878/upenn-min_xwiyr5.jpg',
			showOnMobile: false,
		},
		{
			name: 'Cornell',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/cornell-min_oakaim.jpg',
			showOnMobile: false,
		},
		{
			name: 'Duke',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/duke-min_v9rnsi.jpg',
			showOnMobile: false,
		},
		// {
		//   name: "WashU",
		//   image:
		//     "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532879/washu-min_etewmv.jpg",
		//   showOnMobile: false,
		// },
		// {
		//   name: "Georgetown",
		//   image:
		//     "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/georgetown-min_rivio4.jpg",
		//   showOnMobile: false,
		// },
		{
			name: 'University of Florida',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532877/uf-min_qf891x.jpg',
			showOnMobile: false,
		},
		{
			name: 'USC',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532878/usc-min_te0xvx.jpg',
			showOnMobile: true,
		},
		{
			name: 'And more',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532876/student-min_qcyjat.jpg',
			showOnMobile: true,
		},
	];

	const featuresData = [
		{
			title: 'Integrated Editor & Export',
			description:
				"Write in a familiar writing environment but with rich text formatting, easy draft management, and a beautiful distraction-free interface to help you craft perfect essays. Copy-paste directly into Common App when you're ready to submit.",
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1750270312/editor4_ecvzzg.png',
			// "https://res.cloudinary.com/dqdasxxho/image/upload/v1750269497/editor_zj9qvi.png",
			imageAlt: 'Haloway essay editor interface',
			ctaText: 'Try the Editor',
			ctaLink: '/dashboard/write',
		},
		{
			title: 'Essay Dashboard & Organization',
			description:
				'Manage all your college essays in your essay dashboard. Track deadlines, organize by essay status, and never lose track of your application progress again.',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1750269808/dashboard2_g5ypzy.png',
			imageAlt: 'Haloway dashboard showing organized essays',
			ctaText: 'View Dashboard',
			ctaLink: '/dashboard',
		},
		{
			title: 'Backups & Checkpoints',
			description:
				'Download your essays to save a local copy or upload them to Google Docs. Use checkpoints to track your progress and restore any previous version with a single click.',
			image:
				// "https://res.cloudinary.com/dqdasxxho/image/upload/v1750269499/version-control-cropped_rry8jn.png",
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1750286065/haloway_version_control_product_screenshot_fstidc.png',
			imageAlt: 'Checkpoint manager showing version history',
			ctaText: 'Try the Checkpoint Manager',
			ctaLink: '/dashboard/write',
		},
	];

	const comparisonFeatures = [
		{
			name: 'Rich-text Editing',
			haloway: true,
			notion: true,
			word: true,
			googleDocs: true,
		},
		// {
		//   name: "Realtime Autosave",
		//   haloway: true,
		//   notion: true,
		//   word: true,
		//   googleDocs: true,
		// },
		// {
		//   name: "Export to .DOC and .TXT",
		//   haloway: true,
		//   notion: false,
		//   word: true,
		//   googleDocs: true,
		// },
		{
			name: 'Draft Version Manager',
			haloway: true,
			notion: false,
			word: true,
			googleDocs: true,
		},
		{
			name: 'UI Customization',
			haloway: true,
			notion: true,
			word: false,
			googleDocs: false,
		},
		{
			name: 'Built-in Deadline Tracking',
			haloway: true,
			notion: false,
			word: false,
			googleDocs: false,
		},
		{
			name: 'Status Tracking',
			haloway: true,
			notion: false,
			word: false,
			googleDocs: false,
		},
	];
</script>

<svelte:head>
	<title>{WebsiteName} | {WebsiteSlogan}</title>
	<meta name="description" content={WebsiteDescription} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonldScript}
</svelte:head>

<Section.Root>
	<!-- Hero Section with Aurora Background -->
	<AuroraBackground showRadialGradient={true} className="mt-[-12rem]">
		<div
			class="relative z-10 flex flex-col items-center justify-center py-8 text-center sm:py-12"
		>
			<div
				class="hero-content-fade mb-4 mt-6 max-w-5xl px-4 sm:mb-6 sm:mt-10 md:mt-20"
			>
				<div
					class="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-sm font-semibold text-primary sm:mb-4 sm:px-3 sm:text-base"
				>
					<div class="flex items-center gap-1"></div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						class="sm:h-4 sm:w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
						/><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path
							d="M17 19h4"
						/></svg
					>
					Now in beta
				</div>

				<!-- <h1
			class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold px-2 tracking-tight leading-tight"
			>
			Finish your essays <span
				class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
				><span
				class="underline decoration-secondary decoration-4 sm:decoration-6 md:decoration-8 lg:decoration-[10px]"
				>faster</span
				> with Haloway.</span
			>
			</h1> -->

				<h2
					class="mx-auto mb-8 mt-4 max-w-4xl px-2 text-xl sm:mb-10 sm:mt-6 sm:text-2xl md:mb-12 md:mt-8 md:text-4xl lg:text-5xl"
				>
					Haloway: an easy-to-use writing platform to organize, write, and
					perfect your college application essays.
				</h2>
				<div
					class="mt-6 flex flex-col flex-wrap place-content-center gap-3 sm:mt-8 sm:flex-row sm:gap-4"
				>
					<a href="/dashboard">
						<div class="glow-container">
							<button class="glow-button">
								Start writing for free
								<PenLine class="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
							</button>
						</div>
					</a>
				</div>
				<!-- Add demo later -->
				<!-- <h2
			class="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl xl:text-3xl flex flex-col sm:flex-row items-center justify-center gap-2 px-4"
			>
			<span>Or just</span>
			<a href="/" target="_blank" class="link font-bold flex items-center"
				>try out this demo <ExternalLink
				class="ml-2 w-4 h-4 sm:w-5 sm:h-5"
				/></a
			>
			</h2> -->
			</div>
		</div>
	</AuroraBackground>
</Section.Root>

<!-- Features Showcase Section -->
<Section.Root anchor="features">
	<div
		class="from-color-base-100 to-color-base-200 relative overflow-hidden bg-gradient-to-b py-16 sm:py-20 lg:py-24"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5"
		></div>

		<div class="relative">
			<!-- First Feature: Integrated Editor -->
			<div
				class="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-16 lg:px-8 xl:gap-24"
			>
				<div
					class="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16"
				>
					<div>
						<div>
							<span
								class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg"
							>
								<svg
									class="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
							</span>
						</div>
						<div class="mt-6">
							<h2
								class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
							>
								{featuresData[0].title}
							</h2>
							<p
								class="mt-4 text-lg leading-relaxed text-base-content/70 sm:text-xl"
							>
								{featuresData[0].description}
							</p>
							<div class="mt-6">
								<a
									href={featuresData[0].ctaLink}
									class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-primary to-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-primary/90 hover:to-accent/90"
								>
									{featuresData[0].ctaText}
									<svg
										class="ml-2 h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 7l5 5m0 0l-5 5m5-5H6"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
				<div class="mt-12 sm:mt-16 lg:mt-0">
					<div class="px-4 sm:px-6 lg:relative lg:m-0 lg:h-full lg:px-0">
						<img
							class="w-full transform rounded-2xl shadow-2xl ring-1 ring-black/10 transition-transform duration-300 hover:scale-105 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
							src={featuresData[0].image}
							alt={featuresData[0].imageAlt}
							loading="lazy"
						/>
						<!-- Floating annotation for editor -->
						<div
							class="absolute right-8 top-8 hidden max-w-xs rounded-xl border border-gray-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-sm lg:block"
						>
							<div class="flex items-center gap-3">
								<div
									class="h-3 w-3 animate-pulse rounded-full bg-green-500"
								></div>
								<span class="text-sm font-medium text-gray-700"
									>Rich text editing with auto-save</span
								>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Second Feature: Dashboard Management -->
			<div class="mt-24">
				<div
					class="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-16 lg:px-8 xl:gap-24"
				>
					<div
						class="mx-auto max-w-xl px-4 sm:px-6 lg:col-start-2 lg:mx-0 lg:max-w-none lg:px-0 lg:py-20"
					>
						<div>
							<div>
								<span
									class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-info to-success shadow-lg"
								>
									<svg
										class="h-8 w-8 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
										/>
									</svg>
								</span>
							</div>
							<div class="mt-6">
								<h2
									class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
								>
									{featuresData[1].title}
								</h2>
								<p
									class="mt-4 text-lg leading-relaxed text-base-content/70 sm:text-xl"
								>
									{featuresData[1].description}
								</p>
								<div class="mt-6">
									<a
										href={featuresData[1].ctaLink}
										class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-info to-success px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-info/90 hover:to-success/90"
									>
										{featuresData[1].ctaText}
										<svg
											class="ml-2 h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 7l5 5m0 0l-5 5m5-5H6"
											/>
										</svg>
									</a>
								</div>
							</div>
						</div>
					</div>
					<div class="mt-12 sm:mt-16 lg:col-start-1 lg:mt-0">
						<div class="px-4 sm:px-6 lg:relative lg:m-0 lg:h-full lg:px-0">
							<img
								class="w-full transform rounded-2xl shadow-2xl ring-1 ring-black/10 transition-transform duration-300 hover:scale-105 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
								src={featuresData[1].image}
								alt={featuresData[1].imageAlt}
								loading="lazy"
							/>
							<!-- Floating annotation for dashboard -->
							<div
								class="absolute left-8 top-12 hidden max-w-xs rounded-xl border border-gray-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-sm lg:block"
							>
								<div class="flex items-center gap-3">
									<div
										class="h-3 w-3 animate-pulse rounded-full bg-blue-500"
									></div>
									<span class="text-sm font-medium text-gray-700"
										>Organize essays by school & deadline</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Third Feature: Version Control -->
			<div class="mt-24">
				<div
					class="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-16 lg:px-8 xl:gap-24"
				>
					<div
						class="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16"
					>
						<div>
							<div>
								<span
									class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-warning shadow-lg"
								>
									<svg
										class="h-8 w-8 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</span>
							</div>
							<div class="mt-6">
								<h2
									class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
								>
									{featuresData[2].title}
								</h2>
								<p
									class="mt-4 text-lg leading-relaxed text-base-content/70 sm:text-xl"
								>
									{featuresData[2].description}
								</p>
								<div class="mt-6">
									<a
										href={featuresData[2].ctaLink}
										class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-accent to-warning px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-accent/90 hover:to-warning/90"
									>
										{featuresData[2].ctaText}
										<svg
											class="ml-2 h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 7l5 5m0 0l-5 5m5-5H6"
											/>
										</svg>
									</a>
								</div>
							</div>
						</div>
					</div>
					<div class="mt-12 sm:mt-16 lg:mt-0">
						<div class="px-4 sm:px-6 lg:relative lg:m-0 lg:h-full lg:px-0">
							<img
								class="w-full transform rounded-2xl shadow-2xl ring-1 ring-black/10 transition-transform duration-300 hover:scale-105 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
								src={featuresData[2].image}
								alt={featuresData[2].imageAlt}
								loading="lazy"
							/>
							<!-- Floating annotation for version control -->
							<div
								class="absolute bottom-8 right-8 hidden max-w-xs rounded-xl border border-gray-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-sm lg:block"
							>
								<div class="flex items-center gap-3">
									<div
										class="h-3 w-3 animate-pulse rounded-full bg-orange-500"
									></div>
									<span class="text-sm font-medium text-gray-700"
										>Track changes & revert anytime</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Section Header -->
			<div class="mb-16 mt-32 text-center">
				<h2 class="mb-6 text-4xl text-base-content sm:text-5xl md:text-6xl">
					Better than <span
						class="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text font-bold text-transparent"
						>Google Docs</span
					>
				</h2>
				<p
					class="mx-auto max-w-3xl px-4 text-xl text-base-content/70 sm:text-2xl"
				>
					Built specifically for college apps with features that help you write,
					organize, and perfect your essays.
				</p>
			</div>

			<!-- Scroll Indicator -->
			<div class="mt-16 text-center">
				<div
					class="inline-flex animate-bounce cursor-pointer flex-col items-center gap-3"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
					>
						<svg
							class="h-9 w-9 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 14l-7 7m0 0l-7-7m7 7V3"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Schools Section -->
<div class="min-h-[60vh] py-12 sm:min-h-[70vh] sm:py-16">
	<div class="px-4 pb-6 pt-12 sm:px-7 sm:pb-8 sm:pt-20">
		<div class="mx-auto max-w-7xl text-center">
			<h1 class="px-2 text-2xl md:text-3xl lg:text-5xl">
				<span class="">Pick a school</span>
			</h1>
		</div>

		<div
			class="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 px-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
		>
			{#each schools.filter((school) => school.showOnMobile) as school (school.name)}
				<div
					class="card mx-auto w-full max-w-sm bg-base-200 shadow-xl transition-shadow hover:shadow-2xl sm:hidden"
				>
					<figure class="relative aspect-square overflow-hidden">
						<img
							src={school.image}
							alt={school.name}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</figure>

					<div class="card-body items-center p-4 text-center sm:p-6">
						<h2
							class="card-title mb-3 text-lg sm:mb-4 sm:text-xl lg:mb-6 lg:text-2xl"
						>
							{school.name}
						</h2>
						<a href="/dashboard/write" class="w-full">
							<button
								class="btn {school.name === 'And more'
									? 'btn-warning'
									: 'btn-primary'} btn-sm sm:btn-md w-full rounded-full text-sm text-primary-content sm:text-base lg:text-lg"
							>
								{school.name === 'And more' ? 'Choose another school' : 'Go'}
								<ArrowRight class="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
							</button>
						</a>
					</div>
				</div>
			{/each}

			{#each schools as school (school.name)}
				<div
					class="card mx-auto hidden w-full max-w-sm bg-base-200 shadow-xl transition-shadow hover:shadow-2xl sm:block"
				>
					<figure class="relative aspect-square overflow-hidden">
						<img
							src={school.image}
							alt={school.name}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</figure>

					<div class="card-body items-center p-4 text-center sm:p-6">
						<h2
							class="card-title mb-3 text-lg sm:mb-4 sm:text-xl lg:mb-6 lg:text-2xl"
						>
							{school.name}
						</h2>
						<a href="/dashboard/write" class="w-full">
							<button
								class="btn {school.name === 'And more'
									? 'btn-warning'
									: 'btn-primary'} btn-sm sm:btn-md w-full rounded-full text-sm text-primary-content sm:text-base lg:text-lg"
							>
								{school.name === 'And more' ? 'Choose another school' : 'Go'}
								<ArrowRight class="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
							</button>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Stress Section -->
<div class="hero relative mt-8 min-h-[80vh] overflow-hidden sm:mt-12">
	<img
		src="https://res.cloudinary.com/dqdasxxho/image/upload/v1747532915/stressed-student_ob1v8h.jpg"
		alt="Stressed student"
		class="absolute left-0 top-0 h-full w-full object-cover"
		style="z-index: -1;"
	/>

	<div
		class="absolute inset-0 bg-black"
		style="opacity: 0.55; z-index: 0;"
	></div>

	<div class="relative z-10 px-4 py-16 text-center sm:py-20">
		<div class="font-heading mx-auto max-w-5xl">
			<div>
				<h1
					class="mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text pb-2 text-4xl font-bold text-transparent sm:text-5xl"
				>
					Writing college essays is <span
						class="sm:decoration-5 underline decoration-secondary decoration-4 lg:decoration-[8px]"
						>stressful</span
					>.
				</h1>
				<h2 class="mt-4 pb-2 text-4xl font-bold text-white sm:text-5xl">
					It doesn't also have to be <span
						class="sm:decoration-5 underline decoration-secondary decoration-4 lg:decoration-[8px]"
						>disorganized</span
					>.
				</h2>
			</div>
			<!-- <div
		  class="mt-6 sm:mt-8 mb-8 sm:mb-12 text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto text-center px-2 sm:px-5"
		>
		  <p class="mb-4 text-white/90">
			Whether it's scattered Google Docs or lost Word files buried in
			folders, managing your essays shouldn't add to your stress.
		  </p>
		</div> -->

			<!-- Feature Comparison Table -->
			<div class="mx-auto mt-12 max-w-6xl sm:mt-16">
				<div
					class="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm sm:rounded-3xl sm:p-8 lg:p-10"
				>
					<h3 class="mb-8 text-2xl text-white sm:mb-10 sm:text-3xl lg:text-4xl">
						Why choose <span
							class="bg-gradient-to-r from-primary to-accent bg-clip-text font-semibold text-transparent"
							>{WebsiteName}</span
						>?
					</h3>

					<!-- Desktop Table -->
					<div
						class="hidden overflow-hidden rounded-xl border border-white/20 lg:block"
					>
						<table class="w-full table-fixed border-separate border-spacing-0">
							<thead>
								<tr class="bg-white/10 backdrop-blur-sm">
									<th
										class="w-1/5 p-4 text-left text-lg font-semibold text-white sm:p-6"
										>Feature</th
									>
									<th
										class="w-1/5 border-l border-white/10 bg-gradient-to-r from-primary/20 to-accent/20 p-4 text-center text-lg font-bold text-primary sm:p-6"
									>
										{WebsiteName}
									</th>
									<th
										class="w-1/5 border-l border-white/10 p-4 text-center text-lg font-semibold text-white/80 sm:p-6"
										>Google Docs</th
									>
									<th
										class="w-1/5 border-l border-white/10 p-4 text-center text-lg font-semibold text-white/80 sm:p-6"
										>Word</th
									>
									<th
										class="w-1/5 border-l border-white/10 p-4 text-center text-lg font-semibold text-white/80 sm:p-6"
										>Notion</th
									>
								</tr>
							</thead>
							<tbody>
								{#each comparisonFeatures as feature, index}
									<tr
										class="border-t border-white/10 {index % 2 === 0
											? 'bg-white/5'
											: 'bg-black/10'}"
									>
										<td class="p-4 font-medium text-white sm:p-6"
											>{feature.name}</td
										>

										<!-- Haloway -->
										<td
											class="border-l border-white/10 bg-gradient-to-r from-primary/10 to-accent/10 p-4 text-center sm:p-6"
										>
											{#if feature.haloway}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
												>
													<Check class="h-5 w-5 text-white" />
												</div>
											{:else}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
												>
													<X class="h-5 w-5 text-white" />
												</div>
											{/if}
										</td>

										<!-- Google Docs -->
										<td class="border-l border-white/10 p-4 text-center sm:p-6">
											{#if feature.googleDocs}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
												>
													<Check class="h-5 w-5 text-white" />
												</div>
											{:else}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
												>
													<X class="h-5 w-5 text-white" />
												</div>
											{/if}
										</td>

										<!-- Word -->
										<td class="border-l border-white/10 p-4 text-center sm:p-6">
											{#if feature.word}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
												>
													<Check class="h-5 w-5 text-white" />
												</div>
											{:else}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
												>
													<X class="h-5 w-5 text-white" />
												</div>
											{/if}
										</td>

										<!-- Notion -->
										<td class="border-l border-white/10 p-4 text-center sm:p-6">
											{#if feature.notion}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
												>
													<Check class="h-5 w-5 text-white" />
												</div>
											{:else}
												<div
													class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
												>
													<X class="h-5 w-5 text-white" />
												</div>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Mobile Cards -->
					<div class="space-y-6 lg:hidden">
						{#each comparisonFeatures as feature}
							<div
								class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
							>
								<h4 class="mb-4 text-center text-lg font-bold text-white">
									{feature.name}
								</h4>
								<div class="grid grid-cols-2 gap-3">
									<!-- Haloway Highlighted -->
									<div
										class="flex items-center justify-between rounded-md bg-gradient-to-r from-primary/50 to-accent/50 px-4 py-3"
									>
										<span class="font-semibold text-white">{WebsiteName}</span>
										{#if feature.haloway}
											<Check class="h-5 w-5 text-green-400" />
										{:else}
											<X class="h-5 w-5 text-red-400" />
										{/if}
									</div>

									<!-- Google Docs -->
									<div
										class="flex items-center justify-between rounded-md border border-white/10 px-4 py-3"
									>
										<span class="text-white/80">Google Docs</span>
										{#if feature.googleDocs}
											<Check class="h-5 w-5 text-green-400" />
										{:else}
											<X class="h-5 w-5 text-red-400" />
										{/if}
									</div>

									<!-- Word -->
									<div
										class="flex items-center justify-between rounded-md border border-white/10 px-4 py-3"
									>
										<span class="text-white/80">Word</span>
										{#if feature.word}
											<Check class="h-5 w-5 text-green-400" />
										{:else}
											<X class="h-5 w-5 text-red-400" />
										{/if}
									</div>

									<!-- Notion -->
									<div
										class="flex items-center justify-between rounded-md border border-white/10 px-4 py-3"
									>
										<span class="text-white/80">Notion</span>
										{#if feature.notion}
											<Check class="h-5 w-5 text-green-400" />
										{:else}
											<X class="h-5 w-5 text-red-400" />
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Privacy Section -->
<Section.Root anchor="security">
	<div
		class="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 text-white sm:py-20 lg:py-24"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"
		></div>
		<div
			class="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
		></div>

		<div class="relative z-10 mx-auto max-w-7xl px-4 text-center">
			<div
				class="rounded-3xl border border-gray-600/30 bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-12 lg:p-16"
			>
				<!-- Icon Group -->
				<!-- <div
			class="flex justify-center items-center gap-4 sm:gap-6 mb-8 sm:mb-10"
			>
			<div
				class="bg-gradient-to-r from-green-500 to-emerald-500 p-3 sm:p-4 rounded-2xl shadow-lg"
			>
				<Shield class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
			</div>
			<div
				class="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 sm:p-4 rounded-2xl shadow-lg"
			>
				<Lock class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
			</div>
			<div
				class="bg-gradient-to-r from-primary to-accent p-3 sm:p-4 rounded-2xl shadow-lg"
			>
				<svg
				class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
				/>
				</svg>
			</div>
			</div> -->

				<!-- Heading -->
				<!-- <h1
			class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 sm:mb-10 leading-tight"
			>
			<span class="text-white">Your essays are </span>
			<span
				class="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent underline decoration-green-400 decoration-4 sm:decoration-6 lg:decoration-[8px]"
				>private</span
			><span class="text-white">, </span>
			<span
				class="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent underline decoration-blue-400 decoration-4 sm:decoration-6 lg:decoration-[8px]"
				>safe</span
			><span class="text-white">, and </span>
			<span
				class="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent underline decoration-primary decoration-4 sm:decoration-6 lg:decoration-[8px]"
				>secure</span
			><span class="text-white">.</span>
			</h1> -->

				<h2
					class="mb-8 text-xl leading-tight text-gray-400 sm:mb-10 sm:text-2xl md:text-3xl"
				>
					Built with security and privacy in mind.
				</h2>
				<!-- Feature Grid -->
				<div class="mb-8 grid gap-6 sm:mb-10 sm:gap-8 md:grid-cols-2 lg:gap-10">
					<!-- Privacy Feature -->
					<div
						class="rounded-2xl border border-green-400/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 sm:p-8"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="rounded-lg bg-green-500/20 p-2">
								<svg
									class="h-6 w-6 text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
							</div>
							<h3 class="text-xl font-bold text-green-400 sm:text-2xl">
								Private by Design
							</h3>
						</div>
						<p class="text-base leading-relaxed text-gray-300 sm:text-lg">
							Your essays are stored securely with Row-Level Security (RLS), so
							only you can access your work. We never share, sell, or use your
							data beyond your dashboard. All essays are yours and yours only.
						</p>
					</div>

					<!-- Security Feature -->
					<div
						class="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 sm:p-8"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="rounded-lg bg-blue-500/20 p-2">
								<Lock class="h-6 w-6 text-blue-400" />
							</div>
							<h3 class="text-xl font-bold text-blue-400 sm:text-2xl">
								Protected and Secure
							</h3>
						</div>
						<p class="text-base leading-relaxed text-gray-300 sm:text-lg">
							All essays are encrypted in transit and at rest using
							industry-standard AES‑256/TLS, on a SOC 2 Type 2‑certified
							platform. Haloway follows industry-standard best practices to
							protect your writing from unauthorized access.
						</p>
					</div>

					<!-- Auto-save Feature -->
					<div
						class="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-6 sm:p-8"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="rounded-lg bg-primary/20 p-2">
								<svg
									class="h-6 w-6 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
									/>
								</svg>
							</div>
							<h3 class="text-xl font-bold text-primary sm:text-2xl">
								Auto-Save & Backup
							</h3>
						</div>
						<p class="text-base leading-relaxed text-gray-300 sm:text-lg">
							Your work is automatically saved to the cloud in real time, so
							you'll never lose progress.
						</p>
					</div>

					<!-- Export Feature -->
					<div
						class="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 sm:p-8"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="rounded-lg bg-purple-500/20 p-2">
								<svg
									class="h-6 w-6 text-purple-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 class="text-xl font-bold text-purple-400 sm:text-2xl">
								Easy Export
							</h3>
						</div>
						<p class="text-base leading-relaxed text-gray-300 sm:text-lg">
							Download your essays as DOC or TXT files to save them locally in
							Word or back them up to Google Docs.
						</p>
					</div>
				</div>

				<!-- Trust Indicators -->
				<div
					class="flex flex-col items-center justify-center gap-4 text-base sm:flex-row sm:gap-6 sm:text-lg"
				>
					<!-- <div class="flex items-center gap-2 text-gray-400">
				<svg
				class="w-5 h-5 text-green-400"
				fill="currentColor"
				viewBox="0 0 20 20"
				>
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd"
				/>
				</svg>
				<span>Built with privacy and security in mind.</span>
			</div> -->
					<!-- <div class="flex items-center gap-2 text-gray-400">
				<svg
				class="w-5 h-5 text-blue-400"
				fill="currentColor"
				viewBox="0 0 20 20"
				>
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd"
				/>
				</svg>
				<span>SOC 2 Certified</span>
			</div> -->
					<a
						href="/legal/privacy"
						class="flex items-center gap-2 font-bold text-gray-400 underline transition duration-300 hover:text-white"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Read our Privacy Policy
					</a>
				</div>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Final Call to Action -->
<div
	class="hero min-h-[50vh] bg-gradient-to-b from-base-100 to-base-200 sm:min-h-[60vh]"
>
	<div
		class="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32 lg:py-40"
	>
		<div class="relative max-w-4xl">
			<!-- Responsive illustration container -->
			<div
				class="relative mx-auto mb-6 w-[150px] sm:mb-8 sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[500px]"
			>
				<div class="aspect-square">
					<div class="absolute inset-0 rounded-full bg-white"></div>
					<img
						src="https://illustrations.popsy.co/purple/home-office.svg"
						alt="Home office illustration"
						class="relative z-10 h-full w-full object-contain"
						loading="lazy"
					/>
				</div>
			</div>

			<h1 class="mb-6 text-4xl font-bold sm:mb-8 md:text-5xl lg:text-6xl">
				Try {WebsiteName} for free today.
			</h1>

			<p
				class="mx-auto mb-8 max-w-3xl text-lg text-base-content/80 sm:mb-12 sm:text-xl md:text-2xl"
			>
				Experience a faster, more organized way to write your college essays. No
				credit card required to try.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a href="/dashboard">
					<button
						class="glow-button transform rounded-xl border-0 bg-gradient-to-r from-primary to-accent px-8 text-base text-base-100 transition-all duration-200 hover:-translate-y-1 hover:from-primary/90 hover:to-accent/90 sm:px-10 sm:text-lg"
					>
						Start writing
						<PenLine class="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
					</button>
				</a>

				<!-- Add demo later -->
				<!-- <div class="text-base-content/60 text-base sm:text-lg">
			or <a href="/" class="link font-semibold">try our demo</a>
		  </div> -->
			</div>
		</div>
	</div>
</div>

<!-- <div class="mb-40 flex flex-col gap-20">
	<Section.Root>
		<HeroSection />
	</Section.Root>
	<Section.Root>
		<Section.Header>
			<Section.Title>Logos Cloud</Section.Title>
			<Section.Description class="text-balance">
				To be honest, the below are just logos of tech stack used in this
				project. They don't work with me. Yet.
			</Section.Description>
		</Section.Header>
		<LogosCloud />
	</Section.Root>
	<Section.Root anchor="features">
		<Section.Header>
			<Section.Title>Features</Section.Title>
		</Section.Header>
		<Features />
	</Section.Root>
	<Section.Root>
		<Section.Header>
			<Section.Title>Testimonials</Section.Title>
		</Section.Header>
		<Testimonials />
	</Section.Root>
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
</div> -->

<style>
	.hero-content-fade {
		opacity: 0;
		transform: translateY(20px);
		animation: fadeInUp 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.glow-container {
		position: relative;
		padding: 3px;
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-accent)
		);
		border-radius: 0.9em;
		transition: all 0.4s ease;
		display: inline-block;
	}

	.glow-container::before {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		border-radius: 0.9em;
		z-index: -10;
		filter: blur(0);
		transition: filter 0.4s ease;
		background: transparent; /* Start with transparent */
	}

	.glow-container:hover::before {
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-accent)
		);
		filter: blur(1.2em);
	}

	.glow-container:active::before {
		filter: blur(0.2em);
	}

	.glow-button {
		font-size: 1rem;
		padding: 0.75rem 2rem;
		border-radius: 0.6em;
		border: none; /* Remove border */
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-accent)
		);
		color: var(--color-base-000);
		cursor: pointer;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Softer shadow */
		outline: none; /* Remove focus outline */
	}

	@media (min-width: 640px) {
		.glow-button {
			font-size: 1.125rem;
			padding: 1rem 2.5rem;
		}
	}

	@media (min-width: 768px) {
		.glow-button {
			font-size: 1.5rem;
			padding: 1rem 2rem;
		}
	}

	.glow-button:hover {
		transform: translateY(-2px);
		box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.4);
	}

	.glow-button:active {
		transform: translateY(0);
	}
</style>
