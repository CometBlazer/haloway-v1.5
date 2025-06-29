<script lang="ts">
	import {
		WebsiteBaseUrl,
		WebsiteDescription,
		WebsiteName,
	} from '../../config';
</script>

<svelte:head>
	<meta name="title" content={WebsiteName} />
	<meta name="description" content={WebsiteDescription} />
	<meta
		name="keywords"
		content="college essay writing, college essays, college essay help, college essay tips, college apps, college application, essay examples, essay writing service"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={WebsiteBaseUrl} />
</svelte:head>
