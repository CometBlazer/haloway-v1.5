// src/routes/(app)/dashboard/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// ❌ Remove this import - we'll use locals.supabase instead
// import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	// Session is already validated by the layout, no need to check again
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	try {
		// ✅ Use locals.supabase which has the user's auth context
		// ✅ Remove .eq('user_id', session.user.id) - let RLS handle it
		const { data: documents, error: documentsError } = await locals.supabase
			.from('documents')
			.select('*')
			.eq('user_id', session.user.id) // Backup to ensure we only get the user's documents
			.order('updated_at', { ascending: false });

		if (documentsError) {
			console.error('Failed to load documents:', documentsError);
			throw error(500, 'Failed to load documents');
		}

		// For each document, get its current version and total version count
		const documentsWithVersionInfo = await Promise.all(
			(documents || []).map(async (doc) => {
				// Get current version if current_version_id exists
				let currentVersion = null;
				if (doc.current_version_id) {
					const { data: versionData } = await locals.supabase
						.from('document_versions')
						.select('*')
						.eq('id', doc.current_version_id)
						.single();
					currentVersion = versionData;
				}

				// Get total version count for this document
				const { count } = await locals.supabase
					.from('document_versions')
					.select('*', { count: 'exact', head: true })
					.eq('document_id', doc.id);

				return {
					...doc,
					current_version: currentVersion,
					versions_count: count || 0,
				};
			}),
		);

		// Process schools efficiently - NO async database calls in the map
		const schoolCounts = new Map<string, number>();

		// Single pass to count documents per school
		(documents || []).forEach((doc) => {
			if (doc.school && doc.school.trim().length > 0) {
				const schoolName = doc.school.trim();
				schoolCounts.set(schoolName, (schoolCounts.get(schoolName) || 0) + 1);
			}
		});

		// Get ALL school URL mappings in a single query (batch operation)
		const schoolNames = Array.from(schoolCounts.keys());
		const schoolUrlMappings = new Map<string, string>();

		if (schoolNames.length > 0) {
			// ✅ Use locals.supabase for schools table too
			const { data: schoolsData, error: schoolsError } = await locals.supabase
				.from('schools')
				.select('name, url_safe_name')
				.in('name', schoolNames);

			if (!schoolsError && schoolsData) {
				schoolsData.forEach((school) => {
					schoolUrlMappings.set(school.name, school.url_safe_name);
				});
			}
		}

		// Create school info objects with fallback URL generation (synchronous)
		const schoolsWithInfo = Array.from(schoolCounts.entries())
			.map(([schoolName, documentCount]) => {
				// Use database URL if available, otherwise generate fallback
				const urlSafeName =
					schoolUrlMappings.get(schoolName) ||
					schoolName
						.toLowerCase()
						.replace(/[^a-z0-9-]/g, '-')
						.replace(/-+/g, '-')
						.replace(/^-+|-+$/g, '');

				return {
					name: schoolName,
					urlSafeName,
					documentCount,
				};
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		return {
			documents: documentsWithVersionInfo,
			schools: schoolsWithInfo,
			session,
		};
	} catch (err) {
		console.error('Dashboard load error:', err);
		throw error(500, 'Failed to load dashboard');
	}
};

export const actions = {
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			await supabase.auth.signOut();
			return { type: 'redirect', location: '/' };
		}
	},

	deleteDocument: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const documentId = formData.get('documentId') as string;

		if (!documentId) {
			throw error(400, 'Document ID is required');
		}

		// ✅ Use locals.supabase and let RLS handle ownership verification
		const { data: document, error: docError } = await locals.supabase
			.from('documents')
			.select('id, user_id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			throw error(404, 'Document not found');
		}

		// RLS will ensure user can only access their own documents
		// But we can still do this check for explicit error messages
		if (document.user_id !== session.user.id) {
			throw error(403, "You don't have permission to delete this document");
		}

		// ✅ Use locals.supabase for delete
		// Delete document (cascades to versions and tags due to foreign key constraints)
		const { error: deleteError } = await locals.supabase
			.from('documents')
			.delete()
			.eq('id', documentId);

		if (deleteError) {
			throw error(500, `Failed to delete document: ${deleteError.message}`);
		}

		return { success: true };
	},

	updateProfile: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return fail(401, { errorMessage: 'Unauthorized' });
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const graduationYear = formData.get('graduationYear') as string;
		const referralSource = formData.get('referralSource') as string;
		const dreamSchool = formData.get('dreamSchool') as string;

		// Validation
		const errorFields: string[] = [];

		if (!fullName?.trim()) {
			errorFields.push('fullName');
		}
		if (!graduationYear?.trim()) {
			errorFields.push('graduationYear');
		}
		if (!referralSource?.trim()) {
			errorFields.push('referralSource');
		}

		if (errorFields.length > 0) {
			return fail(400, {
				errorMessage: 'Please fill in all required fields',
				errorFields,
				fullName,
				graduationYear,
				referralSource,
				dreamSchool,
			});
		}

		// Update profile - using supabaseServiceRole is correct here for admin operations
		const { error: updateError } = await locals.supabaseServiceRole
			.from('profiles')
			.update({
				full_name: fullName.trim(),
				graduation_year: parseInt(graduationYear.trim()),
				referral_source: referralSource.trim(),
				dream_school: dreamSchool?.trim() || null,
				updated_at: new Date(),
			})
			.eq('id', session.user.id);

		if (updateError) {
			console.error('Failed to update profile:', updateError);
			return fail(500, {
				errorMessage: 'Failed to update profile. Please try again.',
				fullName,
				graduationYear,
				referralSource,
				dreamSchool,
			});
		}

		return { success: true };
	},

	createDocument: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const school = formData.get('school') as string;
		const title = formData.get('title') as string;
		const prompt = formData.get('prompt') as string;
		const dueDate = formData.get('dueDate') as string;
		const status = formData.get('status') as string;

		if (!school || typeof school !== 'string' || school.trim().length === 0) {
			return fail(400, { error: { message: 'School is required' } });
		}

		try {
			// ✅ Use locals.supabase for document creation
			const { data: document, error: documentError } = await locals.supabase
				.from('documents')
				.insert({
					title: title?.trim() || `[${school.trim()} Essay]`,
					user_id: session.user.id,
					school: school.trim(),
					prompt: prompt?.trim() || null,
					due_date: dueDate ? new Date(dueDate) : null,
					status: status || 'not-started',
				})
				.select()
				.single();

			if (documentError) {
				console.error('Failed to create document:', documentError);
				return fail(500, { error: { message: 'Failed to create document' } });
			}

			// ✅ Use locals.supabase for version creation
			const { data: version, error: versionError } = await locals.supabase
				.from('document_versions')
				.insert({
					document_id: document.id,
					version_name: 'Version 1',
					content: {
						type: 'doc',
						content: [],
					},
					created_by: session.user.id,
				})
				.select()
				.single();

			if (versionError) {
				console.error('Failed to create version:', versionError);
				return fail(500, {
					error: { message: 'Failed to create document version' },
				});
			}

			// ✅ Use locals.supabase for document update
			const { error: updateError } = await locals.supabase
				.from('documents')
				.update({ current_version_id: version.id })
				.eq('id', document.id);

			if (updateError) {
				console.error('Failed to update document:', updateError);
			}

			// Import the validation function and redirect to the school-specific route
			const { getSchoolUrlSafeNameStrict } = await import(
				'$lib/utils/validation'
			);
			const schoolSlug = await getSchoolUrlSafeNameStrict(school.trim());

			throw redirect(
				303,
				`/schools/${schoolSlug}/write/${document.id}/${version.id}`,
			);
		} catch (err) {
			// If it's already a redirect, re-throw it
			if (
				err &&
				typeof err === 'object' &&
				'status' in err &&
				err.status === 303
			) {
				throw err;
			}

			console.error('Document creation error:', err);
			return fail(500, { error: { message: 'Failed to create document' } });
		}
	},

	createHalowayTutorial: async ({ locals }) => {
		// console.log('🔧 createHalowayTutorial: Starting function');

		const { session } = await locals.safeGetSession();
		// console.log('🔧 createHalowayTutorial: Session check:', {
		// 	hasSession: !!session,
		// 	userId: session?.user?.id,
		// });

		if (!session?.user?.id) {
			console.error('🔧 createHalowayTutorial: No session or user ID');
			throw error(401, 'Unauthorized');
		}

		const tutorialContent = {
			type: 'doc',
			content: [
				{
					type: 'heading',
					attrs: { level: 1 },
					content: [{ text: 'Welcome to Haloway', type: 'text' }],
				},
				{
					type: 'paragraph',
					content: [{ text: "We're so glad to have you here!", type: 'text' }],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "Haloway is like Google Docs but geared specifically for college applications. We have many things that Google Docs simply doesn't have: AI feedback (at the bottom), deadline managing up top in the toolbar, an essay status manager up top as well, a school dropdown, and 2 writing modes—",
							type: 'text',
						},
						{ text: 'Focus Mode', type: 'text', marks: [{ type: 'italic' }] },
						{ text: ' and', type: 'text' },
						{ text: ' Zen Mode', type: 'text', marks: [{ type: 'italic' }] },
						{
							text: ', which you can switch between using the switch in the top right of the page. Try it out!',
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: 'We also feature everything from Google Docs: autosave, version control (called a "Checkpoint manager," since you can customize the name and the content within every "checkpoint"), a nice sleek editor, a word counter (but unlike Google Docs, it\'s permanently there and it\'s colorful too!), and exporting functions. We also have rich text tools like ',
							type: 'text',
						},
						{ text: 'bold', type: 'text', marks: [{ type: 'bold' }] },
						{ text: ', ', type: 'text' },
						{ text: 'italicize', type: 'text', marks: [{ type: 'italic' }] },
						{ text: ', and ', type: 'text' },
						{ text: 'underline', type: 'text', marks: [{ type: 'underline' }] },
						{
							text: ", but we only included the tools that we felt could help organize within the editor as well as the ones that can be copied over to the Common App (hint: it's not that many). If you have Grammarly installed in your browser, be sure to enable it as well in Haloway.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
				},
				{
					type: 'paragraph',
					content: [
						{
							text: 'In the document heading, we have a prompt for a Harvard supplemental from the 2024-2025 app cycle. Click to edit it. Below is a sample response generated by ChatGPT. Feel free to play around with it to get a hang of Haloway. If you have any questions, contact us ',
							type: 'text',
						},
						{
							text: 'here ',
							type: 'text',
							marks: [
								{
									type: 'link',
									attrs: {
										rel: 'noopener noreferrer',
										href: 'https://haloway.co/contact',
										class: 'editor-link',
										target: '_blank',
									},
								},
							],
						},
						{
							text: '(you may need to hit the "open link" button in the toolbar). Happy writing, and good luck with your college applications!',
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{ text: 'Side note', type: 'text', marks: [{ type: 'italic' }] },
						{
							text: ': To create a horizontal divider, type 3 dashes in a row, like this without spaces: ---',
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{ text: 'Side note #2', type: 'text', marks: [{ type: 'italic' }] },
						{
							text: ': To get an accurate feel for the AI Feedback, first save a checkpoint using the checkpoint manager, then set the word limit to 100 words, and finally delete everything above the horizontal divider.',
							type: 'text',
						},
					],
				},
				{
					type: 'horizontalRule',
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "During a class discussion, I disagreed with a classmate who said standardized tests are the best measure of intelligence. I thought they were unfair and didn't show true potential. I told him they cause stress and ignore creativity. We argued but didn't resolve it, and eventually, the teacher moved on. I learned some people won't change their minds and it's better not to push too hard. This experience showed me people have different perspectives, and sometimes you just have to let it go even if you think you're right.",
							type: 'text',
						},
					],
				},
			],
		};

		// console.log(
		// 	'🔧 createHalowayTutorial: Tutorial content prepared, length:',
		// 	tutorialContent.content.length,
		// );

		try {
			// console.log('🔧 createHalowayTutorial: Attempting to create document...');

			// Create document with tutorial content
			const { data: document, error: docError } = await locals.supabase
				.from('documents')
				.insert({
					title: 'Haloway Tutorial (2 min read)',
					prompt:
						'Describe a time when you strongly disagreed with someone about an idea or issue. How did you communicate or engage with this person? What did you learn from this experience?',
					school: 'Harvard University',
					user_id: session.user.id,
					status: 'in-progress',
					word_count_limit: 500,
					due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
				})
				.select()
				.single();

			if (docError) {
				console.error(
					'🔧 createHalowayTutorial: Document creation failed:',
					docError,
				);
				throw docError;
			}

			// console.log('🔧 createHalowayTutorial: Document created successfully:', {
			// 	documentId: document.id,
			// 	title: document.title,
			// });

			// Create initial version with tutorial content
			// console.log('🔧 createHalowayTutorial: Creating document version...');

			const { data: version, error: versionError } = await locals.supabase
				.from('document_versions')
				.insert({
					document_id: document.id,
					version_name: 'Version 1',
					content: tutorialContent,
					created_by: session.user.id,
				})
				.select()
				.single();

			if (versionError) {
				console.error(
					'🔧 createHalowayTutorial: Version creation failed:',
					versionError,
				);
				throw versionError;
			}

			// console.log('🔧 createHalowayTutorial: Version created successfully:', {
			// 	versionId: version.id,
			// });

			// // Update document to set current_version_id
			// console.log(
			// 	'🔧 createHalowayTutorial: Updating document with current version...',
			// );

			const { error: updateError } = await locals.supabase
				.from('documents')
				.update({ current_version_id: version.id })
				.eq('id', document.id);

			if (updateError) {
				console.error(
					'🔧 createHalowayTutorial: Document update failed:',
					updateError,
				);
				throw updateError;
			}

			// console.log(
			// 	'🔧 createHalowayTutorial: Document updated with current version',
			// );
			// console.log('🔧 createHalowayTutorial: Function completed successfully');

			return { success: true };
		} catch (error) {
			console.error('🔧 createHalowayTutorial: Error occurred:', error);
			return { success: false, error: 'Failed to create tutorial' };
		}
	},

	createSamplePersonalStatement: async ({ locals }) => {
		// console.log('📝 createSamplePersonalStatement: Starting function');

		const { session } = await locals.safeGetSession();
		// console.log('📝 createSamplePersonalStatement: Session check:', {
		// 	hasSession: !!session,
		// 	userId: session?.user?.id,
		// });

		if (!session?.user?.id) {
			console.error('📝 createSamplePersonalStatement: No session or user ID');
			throw error(401, 'Unauthorized');
		}

		const sampleContent = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							text: "Ever since I was little, I've been obsessed with building. When I was six, I constructed a cardboard \"robot\" with spaghetti arms and googly eyes, convinced it would help my mom with chores. By middle school, I had upgraded to LEGO Mindstorms, spending weekends programming miniature forklifts to carry erasers across my desk. But what began as childlike curiosity grew into an identity I couldn't separate from myself: I'm a builder—not just of gadgets, but of ideas, connections, and solutions.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "In ninth grade, our school's aging website was constantly crashing. Students couldn't access schedules or announcements, and teachers were frustrated. I gathered a group of friends—some knew Python, others were artists—and we met every afternoon in the library, huddled over our laptops. I took the lead, designing a new site with a modern look and reliable backend. When we finally launched it, seeing the school community use what we'd created was exhilarating. For the first time, I realized building wasn't just about satisfying my own curiosity; it could make life better for others. ",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "That same year, I joined the robotics team. Unlike the solitary tinkering of my childhood, building robots demanded collaboration and compromise. During one competition, our drivetrain failed minutes before a match. Panic set in, but I focused our team: we divided tasks, brainstormed quick fixes, and rebuilt in under twenty minutes. We didn't win, but I learned how to build under pressure—and more importantly, how to build trust in a team.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: 'My identity as a builder extends beyond technology. Last summer, I volunteered at a local community center tutoring kids in math. I noticed some students were too shy to speak up, so I built games using recycled materials to turn arithmetic drills into playful competitions. Attendance improved, and students who once stayed silent started shouting answers with excitement. I saw firsthand how building a supportive environment could unlock potential in others.',
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: 'Yet, being a builder also means facing setbacks. When I tried to launch an app to help classmates organize extracurriculars, I hit countless obstacles: buggy code, lack of users, and skepticism from teachers. There were nights I wanted to give up. But each obstacle taught me more than success could. I learned how to debug problems not just in code, but in plans and communication. I discovered that resilience is as essential to building as creativity.',
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "Culturally, I carry my family's story of building from scratch. My parents emigrated with limited English and few resources, but they built a home through perseverance. They taught me that building isn't always about technology; it can mean constructing opportunities, communities, and futures. Their sacrifices instilled in me a sense of responsibility to create things that matter—not just to me, but to others.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "Looking ahead, I want to build solutions at the intersection of technology and social impact. Whether it's designing accessible educational tools or developing innovative ways to connect underserved communities, I see building as a lifelong mission. College will be a place to hone my skills, collaborate with diverse thinkers, and learn from mentors who can challenge me to build better.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: "My application would be incomplete without sharing this part of myself. Building is more than an interest—it's how I understand the world, contribute to my community, and envision the future. From cardboard robots to school websites to community programs, each project has been a step in discovering who I am: a builder dedicated to crafting solutions with heart, purpose, and an unshakeable drive to make things better.",
							type: 'text',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							text: '- "Sample Personal Statement", generated by ChatGPT',
							type: 'text',
						},
					],
				},
			],
		};

		// console.log(
		// 	'📝 createSamplePersonalStatement: Sample content prepared, paragraphs:',
		// 	sampleContent.content.length,
		// );

		try {
			// console.log(
			// 	'📝 createSamplePersonalStatement: Attempting to create document...',
			// );

			// Create document
			const { data: document, error: docError } = await locals.supabase
				.from('documents')
				.insert({
					title: 'Sample Personal Statement',
					prompt:
						'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
					school: 'Uncategorized',
					user_id: session.user.id,
					status: 'finished',
					word_count_limit: 650,
					due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
				})
				.select()
				.single();

			if (docError) {
				console.error(
					'📝 createSamplePersonalStatement: Document creation failed:',
					docError,
				);
				throw docError;
			}

			// console.log(
			// 	'📝 createSamplePersonalStatement: Document created successfully:',
			// 	{
			// 		documentId: document.id,
			// 		title: document.title,
			// 	},
			// );

			// Create initial version with sample content
			// console.log(
			// 	'📝 createSamplePersonalStatement: Creating document version...',
			// );

			const { data: version, error: versionError } = await locals.supabase
				.from('document_versions')
				.insert({
					document_id: document.id,
					content: sampleContent,
					created_by: session.user.id,
					version_name: 'Version 1',
				})
				.select()
				.single();

			if (versionError) {
				console.error(
					'📝 createSamplePersonalStatement: Version creation failed:',
					versionError,
				);
				throw versionError;
			}

			// console.log(
			// 	'📝 createSamplePersonalStatement: Version created successfully:',
			// 	{ versionId: version.id },
			// );

			// Update document to set current_version_id
			// console.log(
			// 	'📝 createSamplePersonalStatement: Updating document with current version...',
			// );

			const { error: updateError } = await locals.supabase
				.from('documents')
				.update({ current_version_id: version.id })
				.eq('id', document.id);

			if (updateError) {
				console.error(
					'📝 createSamplePersonalStatement: Document update failed:',
					updateError,
				);
				throw updateError;
			}

			// console.log(
			// 	'📝 createSamplePersonalStatement: Document updated with current version',
			// );
			// console.log(
			// 	'📝 createSamplePersonalStatement: Function completed successfully',
			// );

			return { success: true };
		} catch (error) {
			console.error('📝 createSamplePersonalStatement: Error occurred:', error);
			return {
				success: false,
				error: 'Failed to create sample personal statement',
			};
		}
	},
};
