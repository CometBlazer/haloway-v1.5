import { WebsiteBaseUrl } from '../../config';
import { sortedBlogPosts } from '../(marketing)/blog/blog';

export async function GET() {
	const urls = ['', '/pricing', '/contact', '/legal/privacy', '/legal/terms'];

	const blogUrls = (sortedBlogPosts || []).map((post) => post.link);

	const allUrls = [...urls, ...blogUrls];

	const now = new Date().toISOString();
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allUrls
					.map(
						(url) => `
        <url>
            <loc>${WebsiteBaseUrl}${url}</loc>
            <lastmod>${now}</lastmod>
            <priority>${url === '' ? '1.0' : '0.8'}</priority>
        </url>`,
					)
					.join('')}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
