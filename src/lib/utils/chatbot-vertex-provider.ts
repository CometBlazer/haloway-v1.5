// src/lib/utils/chatbot-vertex-provider.ts
import { env } from '$env/dynamic/private';
import { createVertex } from '@ai-sdk/google-vertex';
import type { LanguageModelV1 } from '@ai-sdk/provider';

// Validate environment variables
const requiredEnvVars = {
	GOOGLE_VERTEX_PROJECT: env.GOOGLE_VERTEX_PROJECT,
	GOOGLE_CLIENT_EMAIL: env.GOOGLE_CLIENT_EMAIL,
	GOOGLE_PRIVATE_KEY: env.GOOGLE_PRIVATE_KEY,
};

console.log('Environment Variables Check:');
console.log(
	'GOOGLE_VERTEX_PROJECT:',
	env.GOOGLE_VERTEX_PROJECT ? 'SET' : 'MISSING',
);
console.log(
	'GOOGLE_CLIENT_EMAIL:',
	env.GOOGLE_CLIENT_EMAIL ? 'SET' : 'MISSING',
);
console.log(
	'GOOGLE_PRIVATE_KEY:',
	env.GOOGLE_PRIVATE_KEY
		? 'SET (length: ' + (env.GOOGLE_PRIVATE_KEY?.length || 0) + ')'
		: 'MISSING',
);

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
	console.error('Missing environment variables:', missingVars);
	throw new Error(
		`Missing required environment variables: ${missingVars.join(', ')}`,
	);
}

// Create vertex instance with error handling and proper typing
let vertexInstance: ReturnType<typeof createVertex>;
try {
	console.log(
		'Initializing Vertex AI with project:',
		env.GOOGLE_VERTEX_PROJECT,
	);

	vertexInstance = createVertex({
		project: env.GOOGLE_VERTEX_PROJECT!,
		location: env.GOOGLE_VERTEX_LOCATION || 'us-central1',
		googleAuthOptions: {
			credentials: {
				client_email: env.GOOGLE_CLIENT_EMAIL!,
				private_key: env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
			},
		},
	});

	console.log('Vertex AI initialized successfully');
} catch (error) {
	console.error('Failed to initialize Vertex AI:', error);
	console.error('Error details:', {
		project: env.GOOGLE_VERTEX_PROJECT,
		location: env.GOOGLE_VERTEX_LOCATION,
		hasClientEmail: !!env.GOOGLE_CLIENT_EMAIL,
		hasPrivateKey: !!env.GOOGLE_PRIVATE_KEY,
		privateKeyLength: env.GOOGLE_PRIVATE_KEY?.length,
	});
	throw new Error(
		`Failed to initialize Vertex AI provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
	);
}

// Create a typed function that returns a LanguageModelV1
export const vertexProvider = (modelId: string): LanguageModelV1 => {
	return vertexInstance(modelId);
};

// Alternative: Export the instance directly with proper typing
export const vertex = vertexInstance;
