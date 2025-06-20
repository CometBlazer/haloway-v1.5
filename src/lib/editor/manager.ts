// 📁 src/lib/editor/manager.ts
import type { Editor } from '@tiptap/core';

export class EditorContentManager {
	static loadContent(editor: Editor, versionContent: unknown): void {
		if (!editor) return;

		try {
			let parsedContent: unknown;

			if (
				!versionContent ||
				versionContent === '' ||
				(typeof versionContent === 'object' &&
					Object.keys(versionContent).length === 0)
			) {
				parsedContent = { type: 'doc', content: [] };
			} else if (typeof versionContent === 'string') {
				try {
					const jsonContent = JSON.parse(versionContent);
					if (
						jsonContent &&
						typeof jsonContent === 'object' &&
						jsonContent.type === 'doc'
					) {
						parsedContent = jsonContent;
					} else {
						parsedContent = {
							type: 'doc',
							content: [
								{
									type: 'paragraph',
									content: [{ type: 'text', text: versionContent }],
								},
							],
						};
					}
				} catch {
					parsedContent = {
						type: 'doc',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: versionContent }],
							},
						],
					};
				}
			} else {
				parsedContent = versionContent;
			}

			// Use the editor's setContent method with a properly typed object
			editor.commands.setContent(parsedContent as Record<string, unknown>);
			console.log('Content loaded and initialized');
		} catch (error) {
			console.error('Failed to load checkpoint content:', error);
			const emptyContent: Record<string, unknown> = {
				type: 'doc',
				content: [],
			};
			editor.commands.setContent(emptyContent);
			throw error;
		}
	}
}
