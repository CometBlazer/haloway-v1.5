<script lang="ts">
	import * as Section from '$lib/components/landing/section';
	// import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import TextLoop from '$lib/components/TextLoop.svelte';
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

	import {
		MessageSquare, // for doc-chat
		Check, // for check
		MessageCircle, // for chat
		Edit, // for edit
		GripVertical, // for drag
		Book, // for book
		Download, // for export
		History, // for history
		FileText, // for document
		CheckCircle, // for export check icon
		PenLine,
		// ArrowUpRight,
		// BookText,
		Lock,
		BookOpenCheck,
		// X,
		ArrowRight,
	} from 'lucide-svelte';

	import AuroraBackground from '$lib/components/AuroraBackground.svelte';
	// import { Button } from '$lib/components/ui/button';

	const ldJson = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: WebsiteName,
		url: WebsiteBaseUrl,
	};
	const jsonldScript = `<script type="application/ld+json">${
		JSON.stringify(ldJson) + '<'
	}/script>`;

	const featuresData = [
		{
			title: 'Ask admissions questions based on your profile',
			description:
				'Quickly find answers to your admissions questions, from choosing extracurriculars and drafting cold emails to selecting recommendation letter teachers to comparing schools, all tailored to your situation.',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754849197/Screenshot_2025-08-09_223100_zf4fim.png',
			imageAlt: 'Haloway admissions Q&A interface',
			ctaText: 'Ask a question',
			ctaLink: '/schools/uncategorized/write',
		},
		{
			title: 'Brainstorm outlines with an essay assistant',
			description:
				"Talk to an assistant that helps you organize your thoughts and turn ideas into a clear, actionable outline. Overcome writer's block and gain insight into exactly what admissions officers are looking for in each response.",
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754849197/Screenshot_2025-08-10_140350_ast3ne.png',
			imageAlt: 'Haloway essay brainstorming interface',
			ctaText: 'Start brainstorming',
			ctaLink: '/dashboard',
		},
		{
			title: 'Get realtime, actionable feedback on essays',
			description:
				"See exactly what to fix in your essays with clear suggestions on clarity, structure, and flow so every draft is stronger than the last. Get a fresh set of eyes on your essays with feedback that's unique to your writing, not generic advice.",
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754795402/Screenshot_2025-08-08_135459_kfgg2w.png',
			imageAlt: 'Haloway essay feedback interface',
			ctaText: "Get Clara's feedback",
			ctaLink: '/schools/uncategorized/write',
		},
	];

	const teamMembers = [
		{
			name: 'Dan',
			description:
				'Your personal essay brainstorming partner. Dan helps turn your ideas into clear, structured outlines and ensures you know exactly what admissions officers are looking for in each prompt.',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754688614/dan-essay-coach-profile_wa6y5k.png',
			alt: 'Dan, the essay brainstorming bot',
		},
		{
			name: 'Chloe',
			description:
				'Your go-to admissions Q&A expert. Whether you need clarity on the application process or a polished cold email to a professor, Chloe gives you tailored, actionable advice every time.',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754688613/Chloe-headshot-2_fggiag.png',
			alt: 'Chloe, the admissions Q&A bot',
		},
		{
			name: 'Clara',
			description:
				'Your second set of eyes for essay feedback. Clara gives you specific, unique advice on clarity, structure, and flow, so every draft you write is stronger than the last.',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png',
			alt: 'Clara, the essay feedback bot',
		},
	];

	// Define the valid icon types
	type IconType =
		| 'doc-chat'
		| 'check'
		| 'chat'
		| 'edit'
		| 'drag'
		| 'book'
		| 'export'
		| 'history'
		| 'document';
	type ExportIconType = 'check' | 'document';

	// Icon mapping function that returns Lucide components
	function getIconComponent(iconType: IconType) {
		const icons = {
			'doc-chat': MessageSquare,
			check: Check,
			chat: MessageCircle,
			edit: Edit,
			drag: GripVertical,
			book: Book,
			export: Download,
			history: History,
			document: FileText,
		};
		return icons[iconType] || icons['check'];
	}

	// Export icon mapping for small icons
	function getExportIconComponent(iconType: ExportIconType) {
		const exportIcons = {
			check: CheckCircle,
			document: FileText,
		};
		return exportIcons[iconType] || exportIcons['document'];
	}

	// Your bentoGridData stays the same, just update the interface
	interface BentoGridItem {
		id: number;
		title: string;
		description: string;
		icon: IconType;
		gradient: string;
		backgroundGradient: string;
		image: string | null;
		imageAlt: string;
		size: 'medium' | 'large';
		row: number;
		sampleActivities?: Array<{
			text: string;
			category: string;
		}>;
		exportOptions?: Array<{
			name: string;
			subtitle: string;
			color: string;
			icon: ExportIconType;
		}>;
		exportFeatures?: Array<{
			text: string;
			color: string;
		}>;
	}

	// Bento Grid Configuration
	const bentoGridData: BentoGridItem[] = [
		{
			id: 1,
			title: 'Built-in document chatbot',
			description:
				'Ask questions right in your document about your essay without switching tabs.',
			icon: 'doc-chat' as IconType, // Add type assertion
			gradient: 'from-color-info to-color-success',
			backgroundGradient: 'from-color-info/5 to-color-success/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754795402/Screenshot_2025-08-08_135334_pf2d0d.png',
			imageAlt: 'Document chatbot preview',
			size: 'medium' as const, // Add const assertion for literal types
			row: 1,
		},
		{
			id: 2,
			title: 'Realtime, actionable feedback on essays',
			description:
				"See exactly what to fix, whether it's clarity, structure, and flow, with guidance that's unique to your writing.",
			icon: 'check' as IconType,
			gradient: 'from-color-accent to-color-warning',
			backgroundGradient: 'from-color-accent/5 to-color-warning/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754795402/Screenshot_2025-08-08_135459_kfgg2w.png',
			imageAlt: 'Realtime feedback preview',
			size: 'large' as const,
			row: 1,
		},
		{
			id: 3,
			title: 'Ask admissions questions',
			description:
				'Get clear answers on ECs, LORs, cold emails, school comparisons, and more — tailored to your situation.',
			icon: 'chat' as IconType,
			gradient: 'from-color-primary to-color-accent',
			backgroundGradient: 'from-color-primary/5 to-color-accent/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754849195/Screenshot_2025-08-09_223339_ulryrj.png',
			imageAlt: 'Admissions Q&A preview',
			size: 'large' as const,
			row: 2,
		},
		{
			id: 4,
			title: 'Rich-text editor with autosave',
			description:
				'Write with formatting tools and never lose your work with automatic cloud saves.',
			icon: 'edit' as IconType,
			gradient: 'from-blue-500 to-cyan-500',
			backgroundGradient: 'from-blue-500/5 to-cyan-500/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754849542/Screenshot_2025-08-10_140524_c9nf98.png',
			imageAlt: 'Rich text editor preview',
			size: 'medium' as const,
			row: 2,
		},
		{
			id: 5,
			title: 'Drag-and-drop activities organizer',
			description:
				'Order your extracurriculars and achievements to highlight what matters most.',
			icon: 'drag' as IconType,
			gradient: 'from-emerald-500 to-green-500',
			backgroundGradient: 'from-emerald-500/5 to-green-500/5',
			image: null,
			imageAlt: '',
			size: 'medium' as const,
			row: 3,
			sampleActivities: [
				{
					text: 'Debate Team Captain: Led weekly practices, state finalist',
					category: 'Leadership',
				},
				{
					text: 'Community Tutoring: 120+ hrs math tutoring for middle schoolers',
					category: 'Service',
				},
				{
					text: 'App Dev Club: Built budgeting app, 500+ downloads',
					category: 'STEM',
				},
			],
		},
		{
			id: 6,
			title: 'Organize essays by school & deadline',
			description:
				'One place for essays, status, and timelines — sort by school, track deadlines, and stay on top of every draft.',
			icon: 'book' as IconType,
			gradient: 'from-purple-500 to-pink-500',
			backgroundGradient: 'from-purple-500/5 to-pink-500/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1750269808/dashboard2_g5ypzy.png',
			imageAlt: 'Organizer preview',
			size: 'large' as const,
			row: 3,
		},
		{
			id: 7,
			title: 'Seamless export',
			description:
				"Copy into Common App or export to DOC/TXT when you're ready. One-click exports preserve all your formatting and structure.",
			icon: 'export' as IconType,
			gradient: 'from-color-info to-color-success',
			backgroundGradient: 'from-color-info/5 to-color-success/5',
			image: null,
			imageAlt: '',
			size: 'large' as const,
			row: 4,
			exportOptions: [
				{
					name: 'Common App',
					subtitle: 'Direct paste',
					color: 'bg-orange-500',
					icon: 'check' as ExportIconType,
				},
				{
					name: 'Word Doc',
					subtitle: 'Full formatting',
					color: 'bg-blue-600',
					icon: 'document' as ExportIconType,
				},
				{
					name: 'Plain Text',
					subtitle: 'Clean copy',
					color: 'bg-gray-600',
					icon: 'document' as ExportIconType,
				},
			],
			exportFeatures: [
				{ text: 'Character count preserved', color: 'bg-green-500' },
				{ text: 'Formatting maintained', color: 'bg-blue-500' },
				{ text: 'Download from editor', color: 'bg-purple-500' },
				{ text: 'Copy to clipboard', color: 'bg-orange-500' },
			],
		},
		{
			id: 8,
			title: 'Draft history & checkpoints',
			description: 'Save milestones and restore any version with one click.',
			icon: 'history' as IconType,
			gradient: 'from-color-accent to-color-warning',
			backgroundGradient: 'from-color-accent/5 to-color-warning/5',
			image:
				'https://res.cloudinary.com/dqdasxxho/image/upload/v1754849194/Screenshot_2025-08-10_140604_aqldsj.png',
			imageAlt: 'Version history preview',
			size: 'medium' as const,
			row: 4,
		},
	];

	let currentRoleIndex = 0;
	const roles = ['Consultant', 'Copilot', 'Coach'];

	onMount(() => {
		const interval = setInterval(() => {
			currentRoleIndex = (currentRoleIndex + 1) % roles.length;
		}, 2500);

		return () => clearInterval(interval);
	});
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
			class="relative z-10 mt-24 flex flex-col items-center justify-center py-8 text-center sm:py-12"
		>
			<div class="mb-4 mt-6 max-w-7xl px-4 sm:mb-6 sm:mt-10 md:mt-20">
				<!-- Two Column Layout -->
				<div
					class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
				>
					<!-- Left Column - Text Content -->
					<div class="flex flex-col text-center lg:text-left">
						<a
							href="/extracurricular-organizer"
							class="mb-6 inline-flex w-fit items-center gap-1 self-center rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary sm:px-3 sm:text-base md:text-sm lg:self-start"
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
								/><path d="M5 3v4" /><path d="M19 17v4" /><path
									d="M3 5h4"
								/><path d="M17 19h4" /></svg
							>
							New! Try Our Free Extracurriculars Organizer
							<ArrowRight class="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
						</a>

						<h1
							class="mb-4 text-3xl font-bold leading-relaxed tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
						>
							Haloway, Your <span
								class="sm:decoration-6 underline decoration-color-info decoration-4 md:decoration-8 lg:decoration-[10px]"
								>Ethical</span
							>
							AI College
							<TextLoop
								items={roles}
								interval={3000}
								typeSpeed={80}
								deleteSpeed={40}
								pauseTime={3000}
								className="text-color-primary font-bold"
							/>
						</h1>

						<h2 class="mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl">
							Your admissions copilot to navigate the college application
							journey with ease.
						</h2>

						<div
							class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
						>
							<a href="/register">
								<div class="glow-container">
									<button class="glow-button">
										Start for free
										<PenLine class="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
									</button>
								</div>
							</a>
						</div>
					</div>

					<!-- Right Column - Product Image -->
					<div
						class="hero-content-fade hidden justify-center lg:flex lg:justify-end"
					>
						<div class="relative w-full max-w-lg">
							<img
								src="https://res.cloudinary.com/dqdasxxho/image/upload/v1754333956/Haloway_hero_image_cwv3b6.png"
								alt="Haloway College Application Platform"
								class="h-auto rounded-2xl shadow-2xl"
							/>
							<!-- <div
								class="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-color-primary/10 to-color-accent/10"
							></div> -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</AuroraBackground>
</Section.Root>

<!-- Features Showcase Section -->
<Section.Root anchor="demo-features">
	<div
		class="from-base-100 to-base-200 relative overflow-hidden bg-gradient-to-b py-16 sm:py-20 lg:py-24"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-color-primary/5"
		></div>

		<div class="relative">
			<!-- First Feature: Ask For Admissions Advice -->
			<div
				class="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-16 lg:px-8 xl:gap-24"
			>
				<div
					class="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16"
				>
					<div>
						<div>
							<span
								class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-color-primary to-color-accent shadow-lg"
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
								class="text-base-content text-3xl font-bold tracking-tight sm:text-4xl"
							>
								{featuresData[0].title}
							</h2>
							<p
								class="text-base-content/70 mt-4 text-lg leading-relaxed sm:text-xl"
							>
								{featuresData[0].description}
							</p>
							<div class="mt-6">
								<a
									href={featuresData[0].ctaLink}
									class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-color-primary to-color-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-color-primary/90 hover:to-color-accent/90"
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
									>Ask Chloe for admissions advice</span
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
									class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-color-info to-color-success shadow-lg"
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
									class="text-base-content text-3xl font-bold tracking-tight sm:text-4xl"
								>
									{featuresData[1].title}
								</h2>
								<p
									class="text-base-content/70 mt-4 text-lg leading-relaxed sm:text-xl"
								>
									{featuresData[1].description}
								</p>
								<div class="mt-6">
									<a
										href={featuresData[1].ctaLink}
										class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-color-info to-color-success px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-color-info/90 hover:to-color-success/90"
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
										>Chat with an essay assistant</span
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
									class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-color-accent to-color-warning shadow-lg"
								>
									<!-- <svg
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
									</svg> -->
									<BookOpenCheck class="h-8 w-8 text-white" />
								</span>
							</div>
							<div class="mt-6">
								<h2
									class="text-base-content text-3xl font-bold tracking-tight sm:text-4xl"
								>
									{featuresData[2].title}
								</h2>
								<p
									class="text-base-content/70 mt-4 text-lg leading-relaxed sm:text-xl"
								>
									{featuresData[2].description}
								</p>
								<div class="mt-6">
									<a
										href={featuresData[2].ctaLink}
										class="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-color-accent to-color-warning px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:from-color-accent/90 hover:to-color-warning/90"
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
										>See what still needs to be fixed</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Section Header -->
			<!-- <div class="mb-16 mt-32 text-center">
				<h2 class="text-base-content mb-6 text-4xl sm:text-5xl md:text-6xl">
					Better than <span
						class="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text font-bold text-transparent"
						>Google Docs</span
					>
				</h2>
				<p
					class="text-base-content/70 mx-auto max-w-3xl px-4 text-xl sm:text-2xl"
				>
					Built specifically for college apps with features that help you write,
					organize, and perfect your essays.
				</p>
			</div> -->

			<!-- Scroll Indicator -->
			<!-- <div class="mt-16 text-center">
				<div
					class="inline-flex animate-bounce cursor-pointer flex-col items-center gap-3"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-color-primary to-color-accent shadow-lg"
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
			</div> -->
		</div>
	</div>
</Section.Root>

<!-- Meet the Haloway Team Section -->
<Section.Root anchor="team">
	<div
		class="from-base-100 to-base-200 relative overflow-hidden bg-gradient-to-b py-16 sm:py-20 lg:py-24"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-color-primary/5"
		></div>

		<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-12 text-center">
				<h2 class="text-base-content text-4xl font-bold sm:text-5xl">
					Meet Your Consultant Team
				</h2>
				<p
					class="text-base-content/70 mx-auto mt-4 max-w-2xl text-lg sm:text-xl"
				>
					Three focused assistants, each built for a specific part of your
					application.
				</p>
			</div>

			<!-- Grid -->
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each teamMembers as member}
					<div
						class="border-base-300/50 bg-base-100/80 supports-[backdrop-filter]:bg-base-100/60 group relative overflow-hidden
						rounded-3xl border p-8
						text-center shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
					>
						<div class="relative z-10">
							<img
								src={member.image}
								alt={member.alt}
								class="mx-auto mb-4 h-32 w-32 rounded-full object-cover shadow-md"
								loading="lazy"
							/>
							<h3 class="text-base-content text-xl font-semibold">
								{member.name}
							</h3>
							<p class="text-base-content/70 mt-3 text-sm">
								{member.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</Section.Root>

<!-- Bento Grid Features Section -->
<Section.Root anchor="features">
	<div
		class="from-base-100 to-base-200 relative overflow-hidden bg-gradient-to-b py-16 sm:py-20 lg:pb-24 lg:pt-20"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-color-accent/5"
		></div>

		<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-16 text-center">
				<h2
					class="text-base-content mb-6 text-4xl font-bold sm:text-5xl md:text-6xl"
				>
					Everything you need to <span
						class="bg-gradient-to-r from-color-primary to-color-accent bg-clip-text text-transparent"
						>succeed</span
					>
				</h2>
				<p class="text-base-content/70 mx-auto max-w-3xl text-xl sm:text-2xl">
					A look at our versatile platform, built specifically for college apps.
				</p>
			</div>

			<!-- Bento Grid (alternating layout) -->

			<div
				class="grid auto-rows-[1fr] grid-cols-1 gap-6 [grid-auto-flow:dense] md:grid-cols-3 lg:gap-8"
			>
				{#each bentoGridData as item}
					<div
						class="border-base-300/50 bg-base-100/80 supports-[backdrop-filter]:bg-base-100/60 group relative flex
			h-full flex-col overflow-hidden
			rounded-3xl border p-8 shadow-lg backdrop-blur transition-all
			duration-300 hover:-translate-y-2 hover:shadow-2xl {item.size === 'large'
							? 'md:col-span-2'
							: 'md:col-span-1'}"
					>
						<div
							class="absolute inset-0 bg-gradient-to-br {item.backgroundGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<div class="relative z-10 flex h-full flex-col">
							<div class="mb-4 flex items-center gap-4">
								<div
									class="flex {item.size === 'large'
										? 'h-12 w-12'
										: 'h-10 w-10'} items-center justify-center rounded-{item.size ===
									'large'
										? '2xl'
										: 'xl'} bg-gradient-to-r {item.gradient}"
								>
									<!-- Use Lucide icon component directly -->
									<svelte:component
										this={getIconComponent(item.icon)}
										class="{item.size === 'large'
											? 'h-6 w-6'
											: 'h-5 w-5'} text-white"
									/>
								</div>
								<h3
									class="text-base-content {item.size === 'large'
										? 'text-xl font-bold lg:text-2xl'
										: 'text-lg font-bold lg:text-xl'}"
								>
									{item.title}
								</h3>
							</div>
							<p
								class="text-base-content/70 mb-4 {item.size === 'large'
									? 'text-base lg:text-lg'
									: 'text-sm lg:text-base'}"
							>
								{item.description}
							</p>

							<!-- Regular Image -->
							{#if item.image}
								<div
									class="from-base-200 to-base-300 mt-auto {item.size ===
									'large'
										? 'h-64 lg:h-80'
										: 'h-52 lg:h-64'} overflow-hidden rounded-2xl bg-gradient-to-br"
								>
									<img
										src={item.image}
										alt={item.imageAlt}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
							{/if}

							<!-- Sample Activities (for drag-and-drop organizer) -->
							{#if item.sampleActivities}
								<div class="mt-auto space-y-2">
									{#each item.sampleActivities as activity}
										<div
											class="bg-base-100/80 border-base-300/60 flex items-center justify-between rounded-lg border p-3"
										>
											<span class="text-base-content/80 text-sm"
												>{activity.text}</span
											>
											<span class="text-base-content/60 text-xs"
												>{activity.category}</span
											>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Export Options (for seamless export) -->
							{#if item.exportOptions}
								<div class="mt-auto space-y-6">
									<!-- Export destinations -->
									<div class="grid grid-cols-3 gap-4">
										{#each item.exportOptions as option}
											<div
												class="bg-base-200/60 hover:bg-base-200/80 flex flex-col items-center rounded-xl p-4 transition-all duration-200"
											>
												<div
													class="mb-2 h-8 w-8 rounded-lg {option.color} flex items-center justify-center"
												>
													<!-- Use Lucide icon component for export options -->
													<svelte:component
														this={getExportIconComponent(option.icon)}
														class="h-4 w-4 text-white"
													/>
												</div>
												<span class="text-base-content/80 text-sm font-medium"
													>{option.name}</span
												>
												<span class="text-base-content/60 mt-1 text-xs"
													>{option.subtitle}</span
												>
											</div>
										{/each}
									</div>

									<!-- Export features with proper null checking -->
									{#if item.exportFeatures && item.exportFeatures.length > 0}
										<div class="grid grid-cols-2 gap-3">
											{#each item.exportFeatures as feature}
												<div
													class="bg-base-200/40 flex items-center gap-3 rounded-lg p-3"
												>
													<div
														class="h-2 w-2 rounded-full {feature.color}"
													></div>
													<span class="text-base-content/80 text-sm"
														>{feature.text}</span
													>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</Section.Root>

<!-- Features Cloud Section -->
<!-- <div class="bg-base-100 mx-auto max-w-7xl pb-16 sm:pb-20 lg:pb-24">
	<Section.Root>
		<div class="justify-around"></div>
	</Section.Root>
</div> -->

<!-- Ethical AI Section -->
<Section.Root anchor="ethical-ai">
	<div
		class="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-20"
	>
		<div class="mx-auto max-w-6xl">
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<!-- Text Content -->
				<div class="space-y-6">
					<!-- Section Title -->
					<div class="space-y-4">
						<h2
							class="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl"
						>
							Haloway Never Writes Essays For You
						</h2>
						<div class="h-1 w-20 rounded-full bg-color-primary"></div>
					</div>

					<!-- Main Text -->
					<div class="space-y-4 leading-relaxed text-gray-600">
						<p class="text-lg">
							We believe that having an AI write essays for you is not only
							unethical, but the output is boring and generic, the exact
							opposite of what admissions officers want to see.
						</p>

						<p class="text-lg">
							AI is ethical when it helps bring out your very own voice and
							personality, not when it replaces your authentic story with
							generic content.
						</p>

						<p class="text-lg">
							Think of Haloway as a teacher knowledgeable about the college
							admissions process. A good teacher won't write your essays for
							you, and neither will Haloway. Instead, Haloway provides guidance
							and feedback to help you succeed.
						</p>
					</div>

					<!-- Stats or Highlights -->
					<div class="grid grid-cols-2 gap-6 pt-6">
						<div class="text-center lg:text-left">
							<div class="text-3xl font-bold text-color-primary">100%</div>
							<div class="text-sm uppercase tracking-wider text-gray-500">
								Your Voice
							</div>
						</div>
						<div class="text-center lg:text-left">
							<div class="text-3xl font-bold text-color-primary">0%</div>
							<div class="text-sm uppercase tracking-wider text-gray-500">
								Generic AI Slop
							</div>
						</div>
					</div>
				</div>

				<!-- Image -->
				<div class="relative">
					<div class="relative">
						<!-- Background decoration -->
						<div
							class="absolute -right-6 -top-6 -z-10 h-full w-full rounded-2xl bg-color-primary/10"
						></div>

						<!-- Main image -->
						<img
							src="https://res.cloudinary.com/dqdasxxho/image/upload/v1754333956/Haloway_hero_image_1_gzcqwm.png"
							alt="Students working authentically on their essays"
							class="w-full rounded-2xl object-cover shadow-2xl"
						/>

						<!-- Floating badge -->
						<!-- <div
							class="absolute -bottom-6 -left-6 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm"
						>
							<div class="flex items-center space-x-3">
								<div
									class="h-3 w-3 animate-pulse rounded-full bg-red-500"
								></div>
								<span class="text-sm font-medium text-gray-900">
									0% Plagiarism
								</span>
							</div>
						</div> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Privacy Section -->
<Section.Root anchor="security">
	<div
		class="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 text-white sm:py-20 lg:py-24"
	>
		<!-- Background decoration -->
		<div
			class="absolute inset-0 bg-gradient-to-r from-color-primary/5 via-color-accent/5 to-color-primary/5"
		></div>
		<div
			class="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-color-primary/10 blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-color-accent/10 blur-3xl"
		></div>

		<div class="relative z-10 mx-auto max-w-7xl px-4 text-center">
			<div
				class="rounded-3xl border border-gray-600/30 bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-12 lg:p-16"
			>
				<h2
					class="mb-8 text-2xl font-bold leading-tight text-white/80 sm:mb-10 sm:text-3xl md:text-5xl"
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
							Your essays are stored securely with Row-Level Security (RLS), and
							we never share, sell, or use your data without your permission.
							All essays are yours and yours only.
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
						class="rounded-2xl border border-color-primary/20 bg-gradient-to-br from-color-primary/10 to-color-accent/10 p-6 sm:p-8"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="rounded-lg bg-color-primary/20 p-2">
								<svg
									class="h-6 w-6 text-color-primary"
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
							<h3 class="text-xl font-bold text-color-primary sm:text-2xl">
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
				<!-- <div
					class="flex flex-col items-center justify-center gap-4 text-base sm:flex-row sm:gap-6 sm:text-lg"
				>
					<a
						href="/legal/privacy"
						class="flex items-center gap-2 font-semibold text-gray-400 underline transition duration-300 hover:text-white"
					>
						<BookText class="h-5 w-5" />
						Read Our Privacy Policy
					</a>
				</div> -->
			</div>
		</div>
	</div>
</Section.Root>

<!-- Final Call to Action -->
<div class="hero min-h-[50vh] sm:min-h-[60vh]">
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
				Try {WebsiteName}
				<span
					class="sm:decoration-6 underline decoration-color-info decoration-4 md:decoration-8 lg:decoration-[10px]"
					>for free</span
				> today.
			</h1>

			<p
				class="text-base-content/80 mx-auto mb-8 max-w-3xl text-lg sm:mb-12 sm:text-xl md:text-2xl"
			>
				Get dedicated college admissions help whenever you need it. No credit
				card required.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a href="/dashboard">
					<button
						class="glow-button text-base-100 transform rounded-xl border-0 bg-gradient-to-r from-color-primary to-color-accent px-8 text-base transition-all duration-200 hover:-translate-y-1 hover:from-color-primary/90 hover:to-color-accent/90 sm:px-10 sm:text-lg"
					>
						Try free tier
						<PenLine class="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
					</button>
				</a>
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
			hsl(var(--color-primary)),
			hsl(var(--color-secondary))
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
		background: transparent;
	}

	.glow-container:hover::before {
		background: linear-gradient(
			90deg,
			hsl(var(--color-primary)),
			hsl(var(--color-primary))
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
		border: none;
		background: linear-gradient(
			90deg,
			hsl(var(--color-primary)),
			hsl(var(--color-secondary))
		);
		/* color: hsl(var(--color-base-000)); */
		color: black;
		cursor: pointer;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		outline: none;
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
