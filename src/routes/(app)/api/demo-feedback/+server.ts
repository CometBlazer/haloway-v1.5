// src/routes/api/demo-feedback/+server.ts - WORKING VERSION, NO GEMINI CALLS
import { json, error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

function wordCount(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

export async function POST({ request }) {
	try {
		const {
			essayText,
			limit = 250,
			currentWordCount,
			versionId,
		} = await request.json();

		// Validation
		if (!essayText || typeof essayText !== 'string') {
			throw error(400, 'Essay text is required');
		}

		if (essayText.length > 7500) {
			throw error(400, 'Essay too long (max ~1500 words)');
		}

		if (limit && (typeof limit !== 'number' || limit < 50 || limit > 2000)) {
			throw error(400, 'Invalid word limit (must be between 50-2000)');
		}

		// Use provided currentWordCount or calculate from text as fallback
		const words = currentWordCount ?? wordCount(essayText);

		// For now, let's use a smart mock that gives realistic feedback
		// This way you can test the component integration immediately
		let feedback = '';

		if (words === 0) {
			feedback =
				"<h4>Length Check</h4><p>Hey, nothing here yet—let's get typing!</p>";
		} else if (words < limit / 1.25) {
			feedback = `<h4>Length Check</h4>
<p>At ${words} words, it's a bit short. Aim for around ${limit} words.</p>

<h4>Strengths</h4>
<ul>
<li><strong>Strong foundation:</strong> You've got some solid ideas to work with here!</li>
<li><strong>Clear expression:</strong> Your writing style is engaging and easy to follow.</li>
</ul>

<h4>Areas to Improve</h4>
<ul>
<li><strong>Expand key points:</strong> Your main ideas could use more detailed examples and evidence.</li>
<li><strong>Add depth:</strong> Consider including specific anecdotes or data to support your arguments.</li>
</ul>

<h4>Next Steps</h4>
<ul>
<li><strong>Develop your examples:</strong> Take your strongest points and elaborate with concrete details.</li>
<li><strong>Connect the dots:</strong> Add transitions that help readers follow your reasoning.</li>
</ul>

<h4>Conclusion</h4>
<p>You're on the right track! Keep building on these ideas and you'll hit your target. Keep up the good work!</p>`;
		} else if (words > limit) {
			feedback = `<h4>Length Check</h4>
<p>At ${words} words, it's too long. Let's tighten to the essentials.</p>

<h4>Strengths</h4>
<ul>
<li><strong>Comprehensive coverage:</strong> You've clearly done your research and have lots to say!</li>
<li><strong>Rich detail:</strong> Your examples and explanations show deep understanding.</li>
</ul>

<h4>Areas to Improve</h4>
<ul>
<li><strong>Prioritize impact:</strong> Some excellent points are getting lost in the length—let your best ideas shine.</li>
<li><strong>Streamline sentences:</strong> Look for opportunities to say more with fewer words.</li>
</ul>

<h4>Next Steps</h4>
<ul>
<li><strong>Ruthless editing:</strong> Cut redundant phrases and combine related ideas.</li>
<li><strong>Focus on your strongest arguments:</strong> Keep the most compelling points and trim the rest.</li>
</ul>

<h4>Conclusion</h4>
<p>Great depth of knowledge! Now let's make every word count for maximum impact. Keep up the excellent work!</p>`;
		} else {
			feedback = `<h4>Length Check</h4>
<p>At ${words} words, you're good to go in terms of length.</p>

<h4>Strengths</h4>
<ul>
<li><strong>Excellent pacing:</strong> Your essay flows naturally from introduction to conclusion.</li>
<li><strong>Compelling voice:</strong> Your personality comes through while staying professional.</li>
<li><strong>Strong structure:</strong> Each paragraph builds logically on the previous one.</li>
</ul>

<h4>Polishedness</h4>
<p>This is stellar—ready to submit!</p>

<h4>Areas to Improve</h4>
<ul>
<li><strong>Final polish:</strong> One last proofread to catch any tiny typos or awkward phrases.</li>
<li><strong>Power conclusion:</strong> Make sure your ending leaves readers wanting to know more about you.</li>
</ul>

<h4>Next Steps</h4>
<ul>
<li><strong>Read aloud:</strong> Listen for any sentences that don't flow smoothly.</li>
<li><strong>Trust your voice:</strong> You've crafted something authentic and engaging!</li>
</ul>

<h4>Conclusion</h4>
<p>Outstanding work! You've hit all the marks with style and substance. Keep up the excellent work!</p>`;
		}

		feedback += `<h4>Note: This is a Demo Feedback</h4>`;

		// Simulate realistic API delay
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Store in database if versionId provided
		if (versionId) {
			const { error: supabaseError } = await supabase
				.from('document_versions')
				.update({
					latest_ai_response: feedback,
					updated_at: new Date(),
				})
				.eq('id', versionId);

			if (supabaseError) {
				console.error('Supabase error:', supabaseError);
				// Don't fail the request if storage fails
			}
		}

		return json({
			feedback,
			wordCount: words,
		});
	} catch (e: unknown) {
		console.error('API error:', e);

		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}

		throw error(502, 'Service temporarily unavailable');
	}
}
