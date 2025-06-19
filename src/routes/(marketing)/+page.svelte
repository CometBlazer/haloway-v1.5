<script lang="ts">
	// import * as Section from '$lib/components/landing/section';
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
	} from "./../../config"
  
	import { PenLine, ArrowRight, Lock, Check, X } from "lucide-svelte"
  
	import AuroraBackground from "$lib/components/AuroraBackground.svelte"
  
	const ldJson = {
	  "@context": "https://schema.org",
	  "@type": "WebSite",
	  name: WebsiteName,
	  url: WebsiteBaseUrl,
	}
	const jsonldScript = `<script type="application/ld+json">${
	  JSON.stringify(ldJson) + "<"
	}/script>`
  
	const schools = [
	  {
		name: "Harvard",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532874/harvard-min_t6lqkm.jpg",
		showOnMobile: true,
	  },
	  {
		name: "MIT",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/mit-min_zydu0g.jpg",
		showOnMobile: false,
	  },
	  {
		name: "Stanford",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/stanford-min_pjicnr.jpg",
		showOnMobile: true,
	  },
	  {
		name: "Yale",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532880/yale-min_z7n3rs.jpg",
		showOnMobile: false,
	  },
	  {
		name: "Princeton",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532875/princeton-min_tl4yak.jpg",
		showOnMobile: true,
	  },
	  {
		name: "UCLA",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532877/ucla-min_y6bll1.jpg",
		showOnMobile: true,
	  },
	  // {
	  //   name: "Brown",
	  //   image:
	  //     "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/brown-min_isutma.jpg",
	  //   showOnMobile: false,
	  // },
	  {
		name: "UPenn",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532878/upenn-min_xwiyr5.jpg",
		showOnMobile: false,
	  },
	  {
		name: "Cornell",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/cornell-min_oakaim.jpg",
		showOnMobile: false,
	  },
	  {
		name: "Duke",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532873/duke-min_v9rnsi.jpg",
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
		name: "University of Florida",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532877/uf-min_qf891x.jpg",
		showOnMobile: false,
	  },
	  {
		name: "USC",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532878/usc-min_te0xvx.jpg",
		showOnMobile: true,
	  },
	  {
		name: "And more",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/w_800,f_auto,q_auto/v1747532876/student-min_qcyjat.jpg",
		showOnMobile: true,
	  },
	]
  
	const featuresData = [
	  {
		title: "Integrated Editor & Export",
		description:
		  "Write in a familiar writing environment but with rich text formatting, easy draft management, and a beautiful distraction-free interface to help you craft perfect essays. Copy-paste directly into Common App when you're ready to submit.",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/v1750270312/editor4_ecvzzg.png",
		// "https://res.cloudinary.com/dqdasxxho/image/upload/v1750269497/editor_zj9qvi.png",
		imageAlt: "Haloway essay editor interface",
		ctaText: "Try the Editor",
		ctaLink: "/dashboard/write",
	  },
	  {
		title: "Essay Dashboard & Organization",
		description:
		  "Manage all your college essays in your essay dashboard. Track deadlines, organize by essay status, and never lose track of your application progress again.",
		image:
		  "https://res.cloudinary.com/dqdasxxho/image/upload/v1750269808/dashboard2_g5ypzy.png",
		imageAlt: "Haloway dashboard showing organized essays",
		ctaText: "View Dashboard",
		ctaLink: "/dashboard",
	  },
	  {
		title: "Backups & Checkpoints",
		description:
		  "Download your essays to save a local copy or upload them to Google Docs. Use checkpoints to track your progress and restore any previous version with a single click.",
		image:
		  // "https://res.cloudinary.com/dqdasxxho/image/upload/v1750269499/version-control-cropped_rry8jn.png",
		  "https://res.cloudinary.com/dqdasxxho/image/upload/v1750286065/haloway_version_control_product_screenshot_fstidc.png",
		imageAlt: "Checkpoint manager showing version history",
		ctaText: "Try the Checkpoint Manager",
		ctaLink: "/dashboard/write",
	  },
	]
  
	const comparisonFeatures = [
	  {
		name: "Rich-text Editing",
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
		name: "Draft Version Manager",
		haloway: true,
		notion: false,
		word: true,
		googleDocs: true,
	  },
	  {
		name: "UI Customization",
		haloway: true,
		notion: true,
		word: false,
		googleDocs: false,
	  },
	  {
		name: "Built-in Deadline Tracking",
		haloway: true,
		notion: false,
		word: false,
		googleDocs: false,
	  },
	  {
		name: "Status Tracking",
		haloway: true,
		notion: false,
		word: false,
		googleDocs: false,
	  },
	]
</script>
  
  <svelte:head>
	<title>{WebsiteName} | {WebsiteSlogan}</title>
	<meta name="description" content={WebsiteDescription} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonldScript}
  </svelte:head>
  
  <!-- Hero Section with Aurora Background -->
  <AuroraBackground showRadialGradient={true} className="mt-[-12rem]">
	<div class="flex flex-col items-center justify-center text-center py-8 sm:py-12 relative z-10">
	  <div
		class="max-w-5xl mt-6 sm:mt-10 md:mt-20 mb-4 sm:mb-6 px-4 hero-content-fade"
	  >
		<div
		  class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-sm sm:text-base font-semibold rounded-full bg-primary/10 text-primary mb-3 sm:mb-4"
		>
		  <div class="flex items-center gap-1"></div>
		  <svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			class="sm:w-4 sm:h-4"
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
		  class="mt-4 sm:mt-6 md:mt-8 mb-8 sm:mb-10 md:mb-12 text-xl sm:text-2xl md:text-4xl lg:text-5xl max-w-4xl mx-auto px-2"
		>
		  Haloway: an easy-to-use writing platform to organize, write, and perfect
		  your college application essays.
		</h2>
		<div
		  class="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 place-content-center"
		>
		  <a href="/dashboard">
			<div class="glow-container">
			  <button class="glow-button">
				Start writing for free
				<PenLine class="ml-1 w-4 h-4 sm:w-5 sm:h-5" />
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
  
  <!-- Features Section -->
  <!-- <div class="bg-base-100 pb-10 sm:pb-16 lg:pb-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
		<div
		  class="flex flex-col items-left sm:items-center text-left sm:text-center gap-4 sm:gap-6"
		>
		  <FileStack
			class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 text-info"
		  />
		  <div class="card">
			<div class="card-body p-0">
			  <h3
				class="card-title justify-left sm:justify-center text-lg sm:text-xl"
			  >
				Better than Google Docs
			  </h3>
			  <p class="text-base sm:text-lg">
				A familiar writing environment but with rich text editing, easy
				draft management, seamless version control, and a beautiful
				distraction-free interface to help you craft perfect essays.
			  </p>
			</div>
		  </div>
		</div>
  
		<div
		  class="flex flex-col items-end sm:items-center text-end sm:text-center gap-4 sm:gap-6"
		>
		  <House
			class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 text-primary"
		  />
		  <div class="card">
			<div class="card-body p-0">
			  <h3
				class="card-title justify-end sm:justify-center text-lg sm:text-xl"
			  >
				Save Your Number of Open Tabs
			  </h3>
			  <p class="text-base sm:text-lg">
				No need to switch back and forth between drafts. Efficiently
				organize your essays and drafts with customizable tags—filter and
				find exactly what you need, when you need it.
			  </p>
			</div>
		  </div>
		</div>
  
		<div
		  class="flex flex-col items-right sm:items-center text-left sm:text-center gap-4 sm:gap-6"
		>
		  <AlarmClockCheck
			class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 text-accent"
		  />
		  <div class="card">
			<div class="card-body p-0">
			  <h3
				class="card-title justify-left sm:justify-center text-lg sm:text-xl"
			  >
				Never Miss a Deadline
			  </h3>
			  <p class="text-base sm:text-lg">
				Set reminders and deadlines for each essay. Get notified when it's
				time to start writing or when a deadline is approaching.
			  </p>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </div> -->
  
  <!-- Features Showcase Section -->
  <div
	class="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-base-100 to-base-200"
  >
	<!-- Background decoration -->
	<div
	  class="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5"
	></div>
  
	<div class="relative">
	  <!-- First Feature: Integrated Editor -->
	  <div
		class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-16 xl:gap-24"
	  >
		<div
		  class="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0"
		>
		  <div>
			<div>
			  <span
				class="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-primary to-accent shadow-lg"
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
				class="text-3xl sm:text-4xl font-bold tracking-tight text-base-content"
			  >
				{featuresData[0].title}
			  </h2>
			  <p
				class="mt-4 text-lg sm:text-xl text-base-content/70 leading-relaxed"
			  >
				{featuresData[0].description}
			  </p>
			  <div class="mt-6">
				<a
				  href={featuresData[0].ctaLink}
				  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 transform hover:-translate-y-1"
				>
				  {featuresData[0].ctaText}
				  <svg
					class="ml-2 w-5 h-5"
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
		  <div class="px-4 sm:px-6 lg:px-0 lg:m-0 lg:relative lg:h-full">
			<img
			  class="w-full rounded-2xl shadow-2xl ring-1 ring-black/10 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none transform hover:scale-105 transition-transform duration-300"
			  src={featuresData[0].image}
			  alt={featuresData[0].imageAlt}
			  loading="lazy"
			/>
			<!-- Floating annotation for editor -->
			<div
			  class="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 max-w-xs hidden lg:block"
			>
			  <div class="flex items-center gap-3">
				<div
				  class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
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
		  class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-16 xl:gap-24"
		>
		  <div
			class="px-4 max-w-xl mx-auto sm:px-6 lg:py-20 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2"
		  >
			<div>
			  <div>
				<span
				  class="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-info to-success shadow-lg"
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
				  class="text-3xl sm:text-4xl font-bold tracking-tight text-base-content"
				>
				  {featuresData[1].title}
				</h2>
				<p
				  class="mt-4 text-lg sm:text-xl text-base-content/70 leading-relaxed"
				>
				  {featuresData[1].description}
				</p>
				<div class="mt-6">
				  <a
					href={featuresData[1].ctaLink}
					class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-info to-success hover:from-info/90 hover:to-success/90 transition-all duration-200 transform hover:-translate-y-1"
				  >
					{featuresData[1].ctaText}
					<svg
					  class="ml-2 w-5 h-5"
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
		  <div class="mt-12 sm:mt-16 lg:mt-0 lg:col-start-1">
			<div class="px-4 sm:px-6 lg:px-0 lg:m-0 lg:relative lg:h-full">
			  <img
				class="w-full rounded-2xl shadow-2xl ring-1 ring-black/10 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none transform hover:scale-105 transition-transform duration-300"
				src={featuresData[1].image}
				alt={featuresData[1].imageAlt}
				loading="lazy"
			  />
			  <!-- Floating annotation for dashboard -->
			  <div
				class="absolute top-12 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 max-w-xs hidden lg:block"
			  >
				<div class="flex items-center gap-3">
				  <div
					class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
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
		  class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-16 xl:gap-24"
		>
		  <div
			class="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0"
		  >
			<div>
			  <div>
				<span
				  class="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-accent to-warning shadow-lg"
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
				  class="text-3xl sm:text-4xl font-bold tracking-tight text-base-content"
				>
				  {featuresData[2].title}
				</h2>
				<p
				  class="mt-4 text-lg sm:text-xl text-base-content/70 leading-relaxed"
				>
				  {featuresData[2].description}
				</p>
				<div class="mt-6">
				  <a
					href={featuresData[2].ctaLink}
					class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-accent to-warning hover:from-accent/90 hover:to-warning/90 transition-all duration-200 transform hover:-translate-y-1"
				  >
					{featuresData[2].ctaText}
					<svg
					  class="ml-2 w-5 h-5"
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
			<div class="px-4 sm:px-6 lg:px-0 lg:m-0 lg:relative lg:h-full">
			  <img
				class="w-full rounded-2xl shadow-2xl ring-1 ring-black/10 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none transform hover:scale-105 transition-transform duration-300"
				src={featuresData[2].image}
				alt={featuresData[2].imageAlt}
				loading="lazy"
			  />
			  <!-- Floating annotation for version control -->
			  <div
				class="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 max-w-xs hidden lg:block"
			  >
				<div class="flex items-center gap-3">
				  <div
					class="w-3 h-3 bg-orange-500 rounded-full animate-pulse"
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
	  <div class="text-center mt-32 mb-16">
		<h2 class="text-4xl sm:text-5xl md:text-6xl text-base-content mb-6">
		  Better than <span
			class="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold"
			>Google Docs</span
		  >
		</h2>
		<p
		  class="text-xl sm:text-2xl text-base-content/70 max-w-3xl mx-auto px-4"
		>
		  Built specifically for college apps with features that help you write,
		  organize, and perfect your essays.
		</p>
	  </div>
  
	  <!-- Scroll Indicator -->
	  <div class="text-center mt-16">
		<div
		  class="inline-flex flex-col items-center gap-3 animate-bounce cursor-pointer"
		>
		  <div
			class="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg"
		  >
			<svg
			  class="w-9 h-9 text-white"
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
  
  <!-- Schools Section -->
  <div class="min-h-[60vh] sm:min-h-[70vh] py-12 sm:py-16">
	<div class="pt-12 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-7">
	  <div class="max-w-7xl mx-auto text-center">
		<h1 class="text-2xl md:text-3xl lg:text-5xl px-2">
		  <span class="">Pick a school</span>
		</h1>
	  </div>
  
	  <div
		class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 max-w-7xl mx-auto px-4"
	  >
		{#each schools.filter((school) => school.showOnMobile) as school (school.name)}
		  <div
			class="card bg-base-200 w-full max-w-sm mx-auto shadow-xl hover:shadow-2xl transition-shadow sm:hidden"
		  >
			<figure class="relative aspect-square overflow-hidden">
			  <img
				src={school.image}
				alt={school.name}
				class="w-full h-full object-cover"
				loading="lazy"
			  />
			</figure>
  
			<div class="card-body items-center text-center p-4 sm:p-6">
			  <h2
				class="card-title text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 lg:mb-6"
			  >
				{school.name}
			  </h2>
			  <a href="/dashboard/write" class="w-full">
				<button
				  class="btn {school.name === 'And more'
					? 'btn-warning'
					: 'btn-primary'} btn-sm sm:btn-md rounded-full w-full text-sm text-primary-content sm:text-base lg:text-lg"
				>
				  {school.name === "And more" ? "Choose another school" : "Go"}
				  <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
				</button>
			  </a>
			</div>
		  </div>
		{/each}
  
		{#each schools as school (school.name)}
		  <div
			class="card bg-base-200 w-full max-w-sm mx-auto shadow-xl hover:shadow-2xl transition-shadow hidden sm:block"
		  >
			<figure class="relative aspect-square overflow-hidden">
			  <img
				src={school.image}
				alt={school.name}
				class="w-full h-full object-cover"
				loading="lazy"
			  />
			</figure>
  
			<div class="card-body items-center text-center p-4 sm:p-6">
			  <h2
				class="card-title text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 lg:mb-6"
			  >
				{school.name}
			  </h2>
			  <a href="/dashboard/write" class="w-full">
				<button
				  class="btn {school.name === 'And more'
					? 'btn-warning'
					: 'btn-primary'} btn-sm sm:btn-md rounded-full w-full text-sm text-primary-content sm:text-base lg:text-lg"
				>
				  {school.name === "And more" ? "Choose another school" : "Go"}
				  <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
				</button>
			  </a>
			</div>
		  </div>
		{/each}
	  </div>
	</div>
  </div>
  
  <!-- Stress Section -->
  <div class="hero min-h-[80vh] mt-8 sm:mt-12 relative overflow-hidden">
	<img
	  src="https://res.cloudinary.com/dqdasxxho/image/upload/v1747532915/stressed-student_ob1v8h.jpg"
	  alt="Stressed student"
	  class="absolute top-0 left-0 w-full h-full object-cover"
	  style="z-index: -1;"
	/>
  
	<div
	  class="absolute inset-0 bg-black"
	  style="opacity: 0.55; z-index: 0;"
	></div>
  
	<div class="text-center relative z-10 px-4 py-16 sm:py-20">
	  <div class="max-w-5xl mx-auto font-heading">
		<div>
		  <h1
			class="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mt-4 pb-2"
		  >
			Writing college essays is <span
			  class="underline decoration-secondary decoration-4 sm:decoration-5 lg:decoration-[8px]"
			  >stressful</span
			>.
		  </h1>
		  <h2 class="text-4xl sm:text-5xl font-bold text-white mt-4 pb-2">
			It doesn't also have to be <span
			  class="underline decoration-secondary decoration-4 sm:decoration-5 lg:decoration-[8px]"
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
		<div class="mt-12 sm:mt-16 max-w-6xl mx-auto">
		  <div
			class="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10"
		  >
			<h3 class="text-2xl sm:text-3xl lg:text-4xl text-white mb-8 sm:mb-10">
			  Why choose <span
				class="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
				>{WebsiteName}</span
			  >?
			</h3>
  
			<!-- Desktop Table -->
			<div
			  class="hidden lg:block overflow-hidden rounded-xl border border-white/20"
			>
			  <table class="w-full table-fixed border-separate border-spacing-0">
				<thead>
				  <tr class="bg-white/10 backdrop-blur-sm">
					<th
					  class="w-1/5 text-left p-4 sm:p-6 text-white font-semibold text-lg"
					  >Feature</th
					>
					<th
					  class="w-1/5 text-center p-4 sm:p-6 text-primary font-bold text-lg bg-gradient-to-r from-primary/20 to-accent/20 border-l border-white/10"
					>
					  {WebsiteName}
					</th>
					<th
					  class="w-1/5 text-center p-4 sm:p-6 text-white/80 font-semibold text-lg border-l border-white/10"
					  >Google Docs</th
					>
					<th
					  class="w-1/5 text-center p-4 sm:p-6 text-white/80 font-semibold text-lg border-l border-white/10"
					  >Word</th
					>
					<th
					  class="w-1/5 text-center p-4 sm:p-6 text-white/80 font-semibold text-lg border-l border-white/10"
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
					  <td class="p-4 sm:p-6 text-white font-medium"
						>{feature.name}</td
					  >
  
					  <!-- Haloway -->
					  <td
						class="text-center p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-l border-white/10"
					  >
						{#if feature.haloway}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full"
						  >
							<Check class="w-5 h-5 text-white" />
						  </div>
						{:else}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full"
						  >
							<X class="w-5 h-5 text-white" />
						  </div>
						{/if}
					  </td>
  
					  <!-- Google Docs -->
					  <td class="text-center p-4 sm:p-6 border-l border-white/10">
						{#if feature.googleDocs}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full"
						  >
							<Check class="w-5 h-5 text-white" />
						  </div>
						{:else}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full"
						  >
							<X class="w-5 h-5 text-white" />
						  </div>
						{/if}
					  </td>
  
					  <!-- Word -->
					  <td class="text-center p-4 sm:p-6 border-l border-white/10">
						{#if feature.word}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full"
						  >
							<Check class="w-5 h-5 text-white" />
						  </div>
						{:else}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full"
						  >
							<X class="w-5 h-5 text-white" />
						  </div>
						{/if}
					  </td>
  
					  <!-- Notion -->
					  <td class="text-center p-4 sm:p-6 border-l border-white/10">
						{#if feature.notion}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full"
						  >
							<Check class="w-5 h-5 text-white" />
						  </div>
						{:else}
						  <div
							class="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full"
						  >
							<X class="w-5 h-5 text-white" />
						  </div>
						{/if}
					  </td>
					</tr>
				  {/each}
				</tbody>
			  </table>
			</div>
  
			<!-- Mobile Cards -->
			<div class="lg:hidden space-y-6">
			  {#each comparisonFeatures as feature}
				<div
				  class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
				>
				  <h4 class="text-white font-bold text-lg mb-4 text-center">
					{feature.name}
				  </h4>
				  <div class="grid grid-cols-2 gap-3">
					<!-- Haloway Highlighted -->
					<div
					  class="rounded-md bg-gradient-to-r from-primary/50 to-accent/50 px-4 py-3 flex items-center justify-between"
					>
					  <span class="text-white font-semibold">{WebsiteName}</span>
					  {#if feature.haloway}
						<Check class="w-5 h-5 text-green-400" />
					  {:else}
						<X class="w-5 h-5 text-red-400" />
					  {/if}
					</div>
  
					<!-- Google Docs -->
					<div
					  class="rounded-md border border-white/10 px-4 py-3 flex items-center justify-between"
					>
					  <span class="text-white/80">Google Docs</span>
					  {#if feature.googleDocs}
						<Check class="w-5 h-5 text-green-400" />
					  {:else}
						<X class="w-5 h-5 text-red-400" />
					  {/if}
					</div>
  
					<!-- Word -->
					<div
					  class="rounded-md border border-white/10 px-4 py-3 flex items-center justify-between"
					>
					  <span class="text-white/80">Word</span>
					  {#if feature.word}
						<Check class="w-5 h-5 text-green-400" />
					  {:else}
						<X class="w-5 h-5 text-red-400" />
					  {/if}
					</div>
  
					<!-- Notion -->
					<div
					  class="rounded-md border border-white/10 px-4 py-3 flex items-center justify-between"
					>
					  <span class="text-white/80">Notion</span>
					  {#if feature.notion}
						<Check class="w-5 h-5 text-green-400" />
					  {:else}
						<X class="w-5 h-5 text-red-400" />
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
  <div
	class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden"
  >
	<!-- Background decoration -->
	<div
	  class="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"
	></div>
	<div
	  class="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
	></div>
	<div
	  class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
	></div>
  
	<div class="max-w-7xl mx-auto px-4 text-center relative z-10">
	  <div
		class="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 lg:p-16 shadow-2xl"
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
		  class="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-10 leading-tight text-gray-400"
		>
		  Built with security and privacy in mind.
		</h2>
		<!-- Feature Grid -->
		<div class="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10">
		  <!-- Privacy Feature -->
		  <div
			class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-2xl p-6 sm:p-8"
		  >
			<div class="flex items-center gap-3 mb-4">
			  <div class="bg-green-500/20 p-2 rounded-lg">
				<svg
				  class="w-6 h-6 text-green-400"
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
			  <h3 class="text-xl sm:text-2xl font-bold text-green-400">
				Private by Design
			  </h3>
			</div>
			<p class="text-gray-300 text-base sm:text-lg leading-relaxed">
			  Your essays are stored securely with Row-Level Security (RLS), so
			  only you can access your work. We never share, sell, or use your
			  data beyond your dashboard. All essays are yours and yours only.
			</p>
		  </div>
  
		  <!-- Security Feature -->
		  <div
			class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-2xl p-6 sm:p-8"
		  >
			<div class="flex items-center gap-3 mb-4">
			  <div class="bg-blue-500/20 p-2 rounded-lg">
				<Lock class="w-6 h-6 text-blue-400" />
			  </div>
			  <h3 class="text-xl sm:text-2xl font-bold text-blue-400">
				Protected and Secure
			  </h3>
			</div>
			<p class="text-gray-300 text-base sm:text-lg leading-relaxed">
			  All essays are encrypted in transit and at rest using
			  industry-standard AES‑256/TLS, on a SOC 2 Type 2‑certified platform.
			  Haloway follows industry-standard best practices to protect your
			  writing from unauthorized access.
			</p>
		  </div>
  
		  <!-- Auto-save Feature -->
		  <div
			class="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 sm:p-8"
		  >
			<div class="flex items-center gap-3 mb-4">
			  <div class="bg-primary/20 p-2 rounded-lg">
				<svg
				  class="w-6 h-6 text-primary"
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
			  <h3 class="text-xl sm:text-2xl font-bold text-primary">
				Auto-Save & Backup
			  </h3>
			</div>
			<p class="text-gray-300 text-base sm:text-lg leading-relaxed">
			  Your work is automatically saved to the cloud in real time, so
			  you'll never lose progress.
			</p>
		  </div>
  
		  <!-- Export Feature -->
		  <div
			class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl p-6 sm:p-8"
		  >
			<div class="flex items-center gap-3 mb-4">
			  <div class="bg-purple-500/20 p-2 rounded-lg">
				<svg
				  class="w-6 h-6 text-purple-400"
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
			  <h3 class="text-xl sm:text-2xl font-bold text-purple-400">
				Easy Export
			  </h3>
			</div>
			<p class="text-gray-300 text-base sm:text-lg leading-relaxed">
			  Download your essays as DOC or TXT files to save them locally in
			  Word or back them up to Google Docs.
			</p>
		  </div>
		</div>
  
		<!-- Trust Indicators -->
		<div
		  class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-base sm:text-lg"
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
			class="text-gray-400 hover:text-white underline transition duration-300 flex items-center gap-2 font-bold"
		  >
			<svg
			  class="w-4 h-4"
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
  
  <!-- Final Call to Action -->
  <div
	class="hero min-h-[50vh] sm:min-h-[60vh] bg-gradient-to-b from-base-100 to-base-200"
  >
	<div class="flex flex-col items-center justify-center text-center py-24 sm:py-32 lg:py-40 px-4">
	  <div class="max-w-4xl relative">
		<!-- Responsive illustration container -->
		<div
		  class="relative w-[150px] sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[500px] mx-auto mb-6 sm:mb-8"
		>
		  <div class="aspect-square">
			<div class="absolute inset-0 bg-white rounded-full"></div>
			<img
			  src="https://illustrations.popsy.co/purple/home-office.svg"
			  alt="Home office illustration"
			  class="w-full h-full relative z-10 object-contain"
			  loading="lazy"
			/>
		  </div>
		</div>
  
		<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
		  Try {WebsiteName} for free today.
		</h1>
  
		<p
		  class="text-lg sm:text-xl md:text-2xl text-base-content/80 mb-8 sm:mb-12 max-w-3xl mx-auto"
		>
		  Experience a faster, more organized way to write your college essays. No
		  credit card required to try.
		</p>
  
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
		  <a href="/dashboard">
			<button
			  class="glow-button rounded-xl px-8 sm:px-10 text-base-100 bg-gradient-to-r from-primary to-accent border-0 text-base sm:text-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200 transform hover:-translate-y-1"
			>
			  Start writing
			  <PenLine class="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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
	  content: "";
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
