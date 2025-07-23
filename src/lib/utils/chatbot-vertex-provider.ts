// src/lib/utils/chatbot-vertex-provider.ts
import { customProvider } from 'ai';
import { env } from '$env/dynamic/private';
import { createVertex } from '@ai-sdk/google-vertex';

// Validate environment variables - use env consistently
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

// Create vertex instance with error handling - use env consistently
let vertex;
try {
	console.log(
		'Initializing Vertex AI with project:',
		env.GOOGLE_VERTEX_PROJECT,
	);

	vertex = createVertex({
		project: env.GOOGLE_VERTEX_PROJECT!, // Use env instead of process.env
		location: env.GOOGLE_VERTEX_LOCATION || 'us-central1', // Use env
		googleAuthOptions: {
			credentials: {
				client_email: env.GOOGLE_CLIENT_EMAIL!, // Use env
				private_key: env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'), // Use env
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

export const vertexProvider = customProvider({
	languageModels: {
		'chat-model': vertex('gemini-2.5-pro'),
		'chat-model-pro': vertex('gemini-2.5-pro'),
		'chat-model-flash': vertex('gemini-2.5-flash'),
	},
});
