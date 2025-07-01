<script lang="ts">
	import { page } from '$app/stores';
	import {
		WebsiteBaseUrl,
		WebsiteDescription,
		WebsiteName,
		WebsiteKeywords,
	} from '../../config';

	export let title: string = WebsiteName;
	export let description: string = WebsiteDescription;
	export let keywords: string = WebsiteKeywords;
	$: pageTitle = title === WebsiteName ? title : `${title} | ${WebsiteName}`;
	$: canonicalUrl = `${WebsiteBaseUrl}${$page.url.pathname}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/static/favicon.png" />
	<meta property="og:site_name" content={WebsiteName} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="/static/favicon.png" />
</svelte:head>
