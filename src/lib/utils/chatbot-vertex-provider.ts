// src/lib/utils/chatbot-vertex-provider.ts
import { customProvider } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';

// Validate environment variables
const requiredEnvVars = {
	GOOGLE_VERTEX_PROJECT: process.env.GOOGLE_VERTEX_PROJECT,
	GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
	GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingVars.join(', ')}`,
	);
}

// Create vertex instance with error handling
let vertex;
try {
	vertex = createVertex({
		project: process.env.GOOGLE_VERTEX_PROJECT!,
		location: process.env.GOOGLE_VERTEX_LOCATION || 'us-central1',
		googleAuthOptions: {
			credentials: {
				client_email: process.env.GOOGLE_CLIENT_EMAIL!,
				private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
			},
		},
	});
} catch (error) {
	console.error('Failed to initialize Vertex AI:', error);
	throw new Error('Failed to initialize Vertex AI provider');
}

export const vertexProvider = customProvider({
	languageModels: {
		'chat-model': vertex('gemini-2.0-flash-exp'),
		'chat-model-pro': vertex('gemini-1.5-pro'),
		'chat-model-flash': vertex('gemini-1.5-flash'),
	},
});
