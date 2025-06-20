<script lang="ts">
	import { page } from '$app/stores';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';

	// Custom labels for routes
	const routeLabels: Record<string, string> = {
		settings: 'Settings',
		profile: 'Profile',
		documents: 'Documents',
		// Add more custom labels as needed
	};

	$: parts = $page.url.pathname
		.split('/')
		.filter(Boolean)
		.filter((part) => part !== 'dashboard');

	// Function to get display label for a route
	const getLabel = (part: string) => {
		return routeLabels[part] || part.charAt(0).toUpperCase() + part.slice(1);
	};
</script>

<Breadcrumb.Root class="hidden md:flex">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#each parts as part, i}
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/{parts.slice(0, i + 1).join('/')}">
					{getLabel(part)}
				</Breadcrumb.Link>
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
