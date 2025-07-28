// src/routes/api/feedback/+server.ts - SERVER-ONLY CREDENTIALS
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function wordCount(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

async function getVertexAIAccessToken(): Promise<string> {
	const credentialsString = env.GOOGLE_APPLICATION_CREDENTIALS;

	if (!credentialsString) {
		throw new Error(
			'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set',
		);
	}

	let credentials: ServiceAccountCredentials;
	try {
		credentials = JSON.parse(credentialsString) as ServiceAccountCredentials;
	} catch {
		throw new Error('Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS');
	}

	// Create JWT payload
	const now = Math.floor(Date.now() / 1000);
	const payload: JWTPayload = {
		iss: credentials.client_email,
		scope: 'https://www.googleapis.com/auth/cloud-platform',
		aud: 'https://oauth2.googleapis.com/token',
		exp: now + 3600,
		iat: now,
	};

	// Create the JWT
	const jwt = await createJWT(credentials, payload);

	// Exchange JWT for access token
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: jwt,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Token request failed:', errorText);
		throw new Error(`Authentication failed: ${response.statusText}`);
	}

	const tokenData = await response.json();
	return tokenData.access_token;
}

interface ServiceAccountCredentials {
	client_email: string;
	private_key: string;
	private_key_id: string;
	project_id: string;
	type: string;
}

interface JWTPayload {
	iss: string;
	scope: string;
	aud: string;
	exp: number;
	iat: number;
}

interface JWTHeader {
	alg: string;
	typ: string;
	kid: string;
}

async function createJWT(
	credentials: ServiceAccountCredentials,
	payload: JWTPayload,
): Promise<string> {
	// Create header
	const header: JWTHeader = {
		alg: 'RS256',
		typ: 'JWT',
		kid: credentials.private_key_id,
	};

	// Base64URL encode header and payload
	const encodedHeader = base64URLEncode(JSON.stringify(header));
	const encodedPayload = base64URLEncode(JSON.stringify(payload));

	// Create signature input
	const signatureInput = `${encodedHeader}.${encodedPayload}`;

	// Import the private key
	const privateKey = await importPrivateKey(credentials.private_key);

	// Sign the JWT
	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		privateKey,
		new TextEncoder().encode(signatureInput),
	);

	// Encode signature
	const encodedSignature = base64URLEncode(signature);

	return `${signatureInput}.${encodedSignature}`;
}

function base64URLEncode(data: string | ArrayBuffer): string {
	let base64: string;

	if (typeof data === 'string') {
		base64 = btoa(data);
	} else {
		base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
	}

	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
	// Remove PEM header/footer and whitespace
	const privateKeyData = privateKeyPem
		.replace(/-----BEGIN PRIVATE KEY-----/, '')
		.replace(/-----END PRIVATE KEY-----/, '')
		.replace(/\s/g, '');

	// Convert base64 to ArrayBuffer
	const binaryKey = Uint8Array.from(atob(privateKeyData), (c) =>
		c.charCodeAt(0),
	);

	// Import the key
	return await crypto.subtle.importKey(
		'pkcs8',
		binaryKey.buffer,
		{
			name: 'RSASSA-PKCS1-v1_5',
			hash: 'SHA-256',
		},
		false,
		['sign'],
	);
}

export async function POST({ request }) {
	try {
		const {
			essayText,
			limit = 250,
			currentWordCount,
			// versionId,
			documentPrompt,
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

		const prompt = `You are a polished, brutal, professional writing coach who gives **substantial**, **actionable** feedback. Be very brutal and very honest and very harsh with your feedback, but they all have be truthful and constructive and actionable. There is no use giving harsh feedback if the writer can't follow through and do something with it.  

**Several detailed sections, praise or diagnose**  
   **A. Your strengths:** What's working well?  
   **B. Current state of essay**: If it's well-crafted (uses clear structure, vivid examples, runs under ${limit} words) → "This is stellar! Look everything over one more time, and you are ready to submit."  
   **C. How well does it address the prompt? Depending on how well the essay addresses, the prompt, give 1 praise or constructive criticism.
   **D. Areas to improve:** Be specific (e.g. "Paragraph 2 drifts—swap vague phrases for concrete examples.").  
   **E. Next steps:** At least two clear, implementable suggestions (grammar, conciseness, structure).
   **F. Conclude:** End with a positive encouragement like "Keep up the good work!"
   
**Length check**  
   • Essay is ${words} words; target is **${limit}** words.  
   • If blank → "Hey, nothing here yet—let's get typing!"  
   • If ${words} < ${limit / 1.25} → "At ${words} words, it's a bit short. Aim for around ${limit} words."  
   • If ${words} > ${limit} → "At ${words} words, it's too long. Let's tighten to the essentials."  
   
**Tone**  
   • Snappy and encouraging ("Love your hook!")  
   • Never random—always tie advice back to clarity, conciseness, grammar, or structure.

Return your answer as **HTML** with headings (\`<h4>\`) and bullet points (\`<ul><li>…</li></ul>\`), **no extra chatter**.

---

**Word Limit**: ${limit}
**Current Word Count**: ${words}

**Prompt**: ${documentPrompt || 'No prompt detected.'}

**Essay Text**  
\`\`\`
${essayText}
\`\`\`
`;

		// Get access token
		const accessToken = await getVertexAIAccessToken();

		// Call Vertex AI REST API
		const PROJECT_ID = env.GOOGLE_VERTEX_PROJECT || 'snappi-v1';
		const LOCATION = env.GOOGLE_VERTEX_LOCATION || 'us-central1';
		const MODEL = 'gemini-2.5-pro';

		const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

		console.log('Calling Vertex AI at:', url);

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [
					{
						role: 'user',
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					temperature: 0.7,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 8192,
				},
			}),
			signal: AbortSignal.timeout(60000),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Vertex AI error:', response.status, errorText);

			if (response.status === 429) {
				throw error(429, 'Too many requests. Please try again in a moment.');
			} else if (response.status === 401 || response.status === 403) {
				throw error(
					500,
					'AI service authentication failed. Check your service account permissions.',
				);
			} else {
				throw error(
					502,
					`AI service error: ${response.status} ${response.statusText}`,
				);
			}
		}

		const data = await response.json();
		console.log('Vertex AI response received');

		const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!feedback || feedback.trim().length === 0) {
			console.error(
				'Empty response from Vertex AI:',
				JSON.stringify(data, null, 2),
			);
			throw error(502, 'AI service returned empty response');
		}

		// Return just the feedback and word count - no database operations
		// if (versionId) {
		// 	const { error: supabaseError } = await supabase
		// 		.from('document_versions')
		// 		.update({
		// 			latest_ai_response: feedback,
		// 			updated_at: new Date(),
		// 		})
		// 		.eq('id', versionId);

		// 	if (supabaseError) {
		// 		console.error('Supabase error:', supabaseError);
		// 		// Don't fail the request if storage fails
		// 	}
		// }

		return json({
			feedback,
			wordCount: words,
		});
	} catch (e: unknown) {
		console.error('API error:', e);

		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}

		// Check if it's an authentication error
		if (e instanceof Error && e.message.includes('Authentication failed')) {
			throw error(
				500,
				'Service account authentication failed. Check your credentials.',
			);
		}

		throw error(502, 'Service temporarily unavailable');
	}
}
