<!-- src/lib/components/Editor/TiptapEditor.svelte -->
<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import TextStyle from '@tiptap/extension-text-style';
	import Link from '@tiptap/extension-link';
	import Typography from '@tiptap/extension-typography';
	import CharacterCount from '@tiptap/extension-character-count';
	import Underline from '@tiptap/extension-underline';
	import Placeholder from '@tiptap/extension-placeholder';
	import HorizontalRule from '@tiptap/extension-horizontal-rule';
	import {
		Undo2,
		Redo2,
		Link2,
		Link2Off,
		ExternalLink,
		X,
		Copy,
		Check,
	} from 'lucide-svelte';
	import { browser } from '$app/environment';

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	/**
	 * The editor content
	 */
	export let body = '';

	let element: HTMLDivElement;
	let editor: Editor;

	// Export the editor so parent components can access it
	export { editor };

	// Read mode toggle
	export let zenMode = false;

	// Word count
	export let wordCountLimit = 250;
	export let wordCount = 0;

	// Bubble menu variables
	let bubbleMenuElement: HTMLDivElement;
	let showBubbleMenu = false;
	let bubbleMenuTop = 0;
	let bubbleMenuLeft = 0;

	// Copy functionality
	let copySuccess = false;
	let copyTimeout: NodeJS.Timeout | null = null;

	// Dropdown states
	let showTransformDropdown = false;
	let showMainDropdown = false;
	let showMobileMenu = false;

	let iosScrollTimeout: NodeJS.Timeout | null = null;

	// Word count reactive variables
	$: {
		if (editor) {
			wordCount = editor.storage.characterCount.words() || 0;
			// Dispatch word count updates
			dispatch('wordCount', wordCount);
		}
	}
	$: percentage = Math.min(100, Math.round((100 / wordCountLimit) * wordCount));
	$: isNearLimit = wordCount >= wordCountLimit * 0.8;
	$: isAtLimit = wordCount == wordCountLimit;
	$: isOverLimit = wordCount > wordCountLimit;

	// Toggle read-only mode
	function toggleZenMode() {
		zenMode = !zenMode;
		if (editor) {
			// editor.setEditable(!readOnly)

			// Close any open dropdowns when switching to read-only
			if (zenMode) {
				showBubbleMenu = false;
				showTransformDropdown = false;
				showMainDropdown = false;
				showMobileMenu = false;
			}
		}
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				TextStyle,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'editor-link',
						target: '_blank',
						rel: 'noopener noreferrer',
					},
				}),
				Typography,
				CharacterCount,
				Underline,
				Placeholder.configure({
					placeholder:
						'Then start drafting! AI feedback (when it becomes available) will be at the bottom.',
				}),
				HorizontalRule,
				// We're using a modified version of StarterKit to exclude unwanted features
				StarterKit.configure({
					bulletList: false, // Remove bullet lists
					orderedList: false, // Remove ordered lists
					code: false, // Remove inline code
					codeBlock: false, // Remove code blocks
					blockquote: false, // Remove blockquotes
					strike: false, // Remove strikethrough
					horizontalRule: false, // We'll use our own HorizontalRule extension
				}),
			],
			content: '', // Start empty, will be set by parent
			editable: true,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
				updateBubbleMenu();
			},
			onUpdate: () => {
				// Update the body prop when content changes
				body = editor.getHTML();
				// Dispatch update event to parent component
				dispatch('update', body);
			},
			onSelectionUpdate: () => {
				updateBubbleMenu();
			},
		});
		if (!browser) return;
		// Add click listener for dropdown closing
		document.addEventListener('click', handleClickOutside);
		window.addEventListener('scroll', handleScroll, true); // Use capture phase
		window.addEventListener('resize', handleScroll);
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}

		// Clean up timeout
		if (iosScrollTimeout) {
			clearTimeout(iosScrollTimeout);
			iosScrollTimeout = null;
		}

		if (copyTimeout) {
			clearTimeout(copyTimeout);
			copyTimeout = null;
		}

		// Only remove event listeners in browser
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleScroll);
		}
	});

	// Watch for changes to body prop and update editor content
	// This is handled by the parent component now, not here
	// The parent will call editor.commands.setContent() directly

	// Watch for changes to readOnly prop and update editor editable state
	// $: if (editor && editor.isEditable !== !readOnly) {
	//   editor.setEditable(!readOnly)
	// }

	function updateBubbleMenu() {
		if (!browser || !showBubbleMenu) return;

		// Completely disable bubble menu on iOS devices
		// Only check for iOS in browser environment
		const isIOS =
			browser &&
			(/iPad|iPhone|iPod/.test(navigator.userAgent) ||
				(navigator.userAgent.includes('Mac') && 'ontouchend' in document));

		if (isIOS) {
			showBubbleMenu = false;
			return;
		}

		const { selection } = editor.state;
		const { from, empty } = selection;

		if (empty) {
			showBubbleMenu = false;
			return;
		}

		// Your existing positioning code for non-iOS devices
		requestAnimationFrame(() => {
			const { view } = editor;
			const coord = view.coordsAtPos(from);

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const bubbleMenuWidth = 280;
			const bubbleMenuHeight = 50;
			const offset = 10;

			let top = coord.top - bubbleMenuHeight - offset;
			let left = coord.left - bubbleMenuWidth / 2;

			if (left < offset) {
				left = offset;
			} else if (left + bubbleMenuWidth > viewportWidth - offset) {
				left = viewportWidth - bubbleMenuWidth - offset;
			}

			if (top < offset) {
				top = coord.bottom + offset;
			}

			if (top + bubbleMenuHeight > viewportHeight - offset) {
				top = Math.max(offset, viewportHeight - bubbleMenuHeight - offset);
			}

			bubbleMenuTop = top;
			bubbleMenuLeft = left;
			showBubbleMenu = true;
		});
	}

	// Simplified scroll handler
	function handleScroll() {
		if (showBubbleMenu) {
			updateBubbleMenu();
		}
	}

	// Link functions
	function setLink() {
		if (!editor) return;

		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		// update link
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}

	function openLink() {
		if (!editor) return;

		const linkAttributes = editor.getAttributes('link');
		if (linkAttributes.href) {
			window.open(linkAttributes.href, '_blank', 'noopener,noreferrer');
		}
	}

	// Close mobile menu when clicking away
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;

		if (!target.closest('.turn-into-container')) {
			showMainDropdown = false;
		}

		if (!target.closest('.transform-container')) {
			showTransformDropdown = false;
		}

		if (
			!target.closest('.mobile-menu-container') &&
			!target.closest('.mobile-menu-button')
		) {
			showMobileMenu = false;
		}
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		// if (readOnly) return
		showMobileMenu = !showMobileMenu;
	}

	// Copy all text function
	async function copyAllText() {
		if (!editor || !browser) return;

		try {
			// Get plain text content from the editor
			const textContent = editor.getText();

			// Copy to clipboard
			await navigator.clipboard.writeText(textContent);

			// Show success feedback
			copySuccess = true;

			// Clear any existing timeout
			if (copyTimeout) {
				clearTimeout(copyTimeout);
			}

			// Reset success state after 2 seconds
			copyTimeout = setTimeout(() => {
				copySuccess = false;
				copyTimeout = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text:', err);
			// Fallback for older browsers
			try {
				const textContent = editor.getText();
				const textArea = document.createElement('textarea');
				textArea.value = textContent;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);

				copySuccess = true;
				if (copyTimeout) {
					clearTimeout(copyTimeout);
				}
				copyTimeout = setTimeout(() => {
					copySuccess = false;
					copyTimeout = null;
				}, 2000);
			} catch (fallbackErr) {
				console.error('Fallback copy also failed:', fallbackErr);
			}
		}
	}

	// Unified button classes
	const buttonClasses =
		'flex items-center justify-center border-none bg-transparent rounded-md cursor-pointer transition-all duration-150 ease-in-out';

	const standardButtonClasses = `${buttonClasses} w-8 h-8 font-medium text-sm`;

	const textButtonClasses = `${buttonClasses} gap-2 px-2 h-8 text-sm`;

	const dropdownOptionClasses = `${buttonClasses} gap-3 w-full px-3 py-2 text-left text-sm`;

	// Icon size for lucide icons, to match text B, I, U
	const iconSize = 22; // Experiment with this size (20, 22, 24)
</script>

<!-- Bubble Menu - Only show when not in read-only mode -->
{#if showBubbleMenu && editor}
	<div
		bind:this={bubbleMenuElement}
		class="menu-container bubble-menu fixed"
		style="top: {bubbleMenuTop}px; left: {bubbleMenuLeft}px;"
	>
		<button
			on:click={() => editor.chain().focus().toggleBold().run()}
			class="{standardButtonClasses} editor-btn"
			class:active={editor.isActive('bold')}
			class:active-highlight={editor.isActive('bold')}
		>
			<strong class="font-bold">B</strong>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleItalic().run()}
			class="{standardButtonClasses} editor-btn"
			class:active={editor.isActive('italic')}
			class:active-highlight={editor.isActive('italic')}
		>
			<em class="italic">I</em>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleUnderline().run()}
			class="{standardButtonClasses} editor-btn"
			class:active={editor.isActive('underline')}
			class:active-highlight={editor.isActive('underline')}
		>
			<u class="underline">U</u>
		</button>

		<div class="menu-separator"></div>

		<div class="flex items-center gap-1">
			<button
				on:click={setLink}
				class="{textButtonClasses} editor-btn"
				class:active={editor.isActive('link')}
				class:active-highlight={editor.isActive('link')}
				title="Add link"
			>
				<Link2 size={iconSize - 4} />
			</button>
			<button
				on:click={() => editor.chain().focus().unsetLink().run()}
				disabled={!editor.isActive('link')}
				class="{textButtonClasses} editor-btn"
				title="Remove link"
			>
				<Link2Off size={iconSize - 4} />
			</button>
			<button
				on:click={openLink}
				disabled={!editor.isActive('link')}
				class="{textButtonClasses} editor-btn"
				title="Open link"
			>
				<ExternalLink size={iconSize - 4} />
			</button>
		</div>

		<div class="menu-separator"></div>

		<!-- Transform dropdown -->
		<div class="transform-container relative">
			<button
				class="{textButtonClasses} editor-btn"
				on:click={() => (showTransformDropdown = !showTransformDropdown)}
			>
				<span class="transform-icon w-5 text-center font-semibold">⟲</span>
				<!-- <span>Turn into</span> -->
			</button>

			{#if showTransformDropdown}
				<div class="dropdown-container">
					<button
						class="{dropdownOptionClasses} dropdown-item"
						class:active={editor.isActive('paragraph')}
						class:active-highlight={editor.isActive('paragraph')}
						on:click={() => {
							editor.chain().focus().setParagraph().run();
							showTransformDropdown = false;
						}}
					>
						<span class="option-icon w-6 text-center font-semibold">¶</span>
						<span class="option-label flex-1">Paragraph</span>
					</button>
					<button
						class="{dropdownOptionClasses} dropdown-item"
						class:active={editor.isActive('heading', { level: 1 })}
						class:active-highlight={editor.isActive('heading', { level: 1 })}
						on:click={() => {
							editor.chain().focus().toggleHeading({ level: 1 }).run();
							showTransformDropdown = false;
						}}
					>
						<span class="option-icon w-6 text-center font-semibold">H1</span>
						<span class="option-label flex-1">Heading 1</span>
					</button>
					<button
						class="{dropdownOptionClasses} dropdown-item"
						class:active={editor.isActive('heading', { level: 2 })}
						class:active-highlight={editor.isActive('heading', { level: 2 })}
						on:click={() => {
							editor.chain().focus().toggleHeading({ level: 2 }).run();
							showTransformDropdown = false;
						}}
					>
						<span class="option-icon w-6 text-center font-semibold">H2</span>
						<span class="option-label flex-1">Heading 2</span>
					</button>
					<button
						class="{dropdownOptionClasses} dropdown-item"
						class:active={editor.isActive('heading', { level: 3 })}
						class:active-highlight={editor.isActive('heading', { level: 3 })}
						on:click={() => {
							editor.chain().focus().toggleHeading({ level: 3 }).run();
							showTransformDropdown = false;
						}}
					>
						<span class="option-icon w-6 text-center font-semibold">H3</span>
						<span class="option-label flex-1">Heading 3</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if editor}
	<!-- Modern Toolbar - Hidden in Zen mode -->
	{#if !zenMode}
		<div class="control-group mb-4">
			<div
				class="menu-container modern-toolbar flex items-center justify-start"
			>
				<!-- Basic formatting - Always visible -->
				<div class="toolbar-group flex items-center gap-0.5">
					<button
						on:click={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						class="{standardButtonClasses} editor-btn"
						class:active={editor.isActive('bold')}
						class:active-highlight={editor.isActive('bold')}
						title="Bold (Ctrl+B)"
					>
						<strong class="text-xl font-bold">B</strong>
					</button>
					<button
						on:click={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						class="{standardButtonClasses} editor-btn"
						class:active={editor.isActive('italic')}
						class:active-highlight={editor.isActive('italic')}
						title="Italic (Ctrl+I)"
					>
						<em class="text-xl italic">I</em>
					</button>
					<button
						on:click={() => editor.chain().focus().toggleUnderline().run()}
						disabled={!editor.can().chain().focus().toggleUnderline().run()}
						class="{standardButtonClasses} editor-btn"
						class:active={editor.isActive('underline')}
						class:active-highlight={editor.isActive('underline')}
						title="Underline (Ctrl+U)"
					>
						<u class="text-xl underline">U</u>
					</button>
				</div>

				<div class="menu-separator"></div>

				<!-- Undo/Redo buttons - Always visible -->
				<div class="toolbar-group flex items-center gap-0.5">
					<button
						on:click={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().chain().focus().undo().run()}
						class="{standardButtonClasses} editor-btn"
						title="Undo (Ctrl+Z)"
					>
						<Undo2 size={iconSize} />
					</button>
					<button
						on:click={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().chain().focus().redo().run()}
						class="{standardButtonClasses} editor-btn"
						title="Redo (Ctrl+Y)"
					>
						<Redo2 size={iconSize} />
					</button>
				</div>

				<!-- MD+ TIER: Show "Turn into" dropdown and Horizontal Rule -->
				<div class="hidden md:flex md:items-center">
					<div class="menu-separator"></div>
					<div class="turn-into-container relative">
						<button
							class="{textButtonClasses} editor-btn"
							on:click={() => (showMainDropdown = !showMainDropdown)}
							title="Turn into H1, H2, H3, or Paragraph"
						>
							<span class="transform-icon w-5 text-center font-semibold">⟲</span
							>
							<span class="hidden lg:inline">Turn into</span>
						</button>
						{#if showMainDropdown}
							<div class="dropdown-container">
								<button
									class="{dropdownOptionClasses} dropdown-item w-full"
									class:active={editor.isActive('paragraph')}
									class:active-highlight={editor.isActive('paragraph')}
									on:click={() => {
										editor.chain().focus().setParagraph().run();
										showMainDropdown = false;
									}}
								>
									<span class="option-icon w-6 text-center font-semibold"
										>¶</span
									>
									<span class="option-label flex-1">Paragraph</span>
								</button>
								<button
									class="{dropdownOptionClasses} dropdown-item w-full"
									class:active={editor.isActive('heading', { level: 1 })}
									class:active-highlight={editor.isActive('heading', {
										level: 1,
									})}
									on:click={() => {
										editor.chain().focus().toggleHeading({ level: 1 }).run();
										showMainDropdown = false;
									}}
								>
									<span class="option-icon w-6 text-center font-semibold"
										>H1</span
									>
									<span class="option-label flex-1">Heading 1</span>
								</button>
								<button
									class="{dropdownOptionClasses} dropdown-item w-full"
									class:active={editor.isActive('heading', { level: 2 })}
									class:active-highlight={editor.isActive('heading', {
										level: 2,
									})}
									on:click={() => {
										editor.chain().focus().toggleHeading({ level: 2 }).run();
										showMainDropdown = false;
									}}
								>
									<span class="option-icon w-6 text-center font-semibold"
										>H2</span
									>
									<span class="option-label flex-1">Heading 2</span>
								</button>
								<button
									class="{dropdownOptionClasses} dropdown-item w-full"
									class:active={editor.isActive('heading', { level: 3 })}
									class:active-highlight={editor.isActive('heading', {
										level: 3,
									})}
									on:click={() => {
										editor.chain().focus().toggleHeading({ level: 3 }).run();
										showMainDropdown = false;
									}}
								>
									<span class="option-icon w-6 text-center font-semibold"
										>H3</span
									>
									<span class="option-label flex-1">Heading 3</span>
								</button>
							</div>
						{/if}
					</div>

					<div class="menu-separator"></div>
					<button
						on:click={() => editor.chain().focus().setHorizontalRule().run()}
						class="{standardButtonClasses} editor-btn"
						title="Insert horizontal rule"
					>
						<span class="text-xl">—</span>
					</button>
				</div>

				<!-- LG+ TIER: Show Link buttons -->
				<div class="hidden md:flex md:items-center">
					<div class="menu-separator"></div>
					<div class="flex items-center gap-1">
						<button
							on:click={setLink}
							class="{textButtonClasses} editor-btn"
							class:active={editor.isActive('link')}
							class:active-highlight={editor.isActive('link')}
							title="Add link"
						>
							<span class="hidden xl:inline">Add Link</span>
							<Link2 size={iconSize - 4} />
						</button>
						<button
							on:click={openLink}
							disabled={!editor.isActive('link')}
							class="{textButtonClasses} editor-btn"
							title="Open link"
						>
							<span class="hidden xl:inline">Open Link</span>
							<ExternalLink size={iconSize - 4} />
						</button>
						<button
							on:click={() => editor.chain().focus().unsetLink().run()}
							disabled={!editor.isActive('link')}
							class="{textButtonClasses} editor-btn"
							title="Remove link"
						>
							<span class="hidden xl:inline">Remove Link</span>
							<Link2Off size={iconSize - 4} />
						</button>
					</div>
				</div>

				<!-- XL+ TIER: Show Clear Formatting -->
				<div class="hidden md:flex md:items-center">
					<div class="menu-separator"></div>
					<button
						class="{textButtonClasses} editor-btn clear-btn"
						on:click={() =>
							editor.chain().focus().unsetAllMarks().clearNodes().run()}
						title="Clear formatting"
						><span class="hidden xl:inline">Clear Formatting</span>
						<X size={iconSize - 4} />
					</button>
					<button
						class="copy-all-button {textButtonClasses} editor-btn"
						class:copy-success={copySuccess}
						on:click={copyAllText}
						title="Copy all text to clipboard"
					>
						{#if copySuccess}
							<Check size={16} class="text-green-500" />
							<span class="copy-button-text hidden xl:inline">Copied!</span>
						{:else}
							<Copy size={16} />
							<span class="copy-button-text hidden xl:inline">Copy All</span>
						{/if}
					</button>
				</div>

				<!-- Mobile Three Dots Menu (Visible only on small screens) -->
				<div class="flex items-center md:hidden">
					<div class="menu-separator"></div>
					<div class="mobile-menu-container relative">
						<button
							class="{standardButtonClasses} mobile-menu-button editor-btn"
							on:click={toggleMobileMenu}
							class:active={showMobileMenu}
							class:active-highlight={showMobileMenu}
							title="More options"
						>
							<span class="dots-icon">⋯</span>
						</button>

						{#if showMobileMenu}
							<div class="mobile-dropdown-container dropdown-container">
								<!-- Text Style Options -->
								<div class="mobile-menu-section">
									<span class="mobile-menu-section-title">Text Style</span>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										class:active={editor.isActive('paragraph')}
										class:active-highlight={editor.isActive('paragraph')}
										on:click={() => {
											editor.chain().focus().setParagraph().run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-6 text-center font-semibold"
											>¶</span
										>
										<span class="option-label flex-1">Paragraph</span>
									</button>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										class:active={editor.isActive('heading', { level: 1 })}
										class:active-highlight={editor.isActive('heading', {
											level: 1,
										})}
										on:click={() => {
											editor.chain().focus().toggleHeading({ level: 1 }).run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-6 text-center font-semibold"
											>H1</span
										>
										<span class="option-label flex-1">Heading 1</span>
									</button>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										class:active={editor.isActive('heading', { level: 2 })}
										class:active-highlight={editor.isActive('heading', {
											level: 2,
										})}
										on:click={() => {
											editor.chain().focus().toggleHeading({ level: 2 }).run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-6 text-center font-semibold"
											>H2</span
										>
										<span class="option-label flex-1">Heading 2</span>
									</button>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										class:active={editor.isActive('heading', { level: 3 })}
										class:active-highlight={editor.isActive('heading', {
											level: 3,
										})}
										on:click={() => {
											editor.chain().focus().toggleHeading({ level: 3 }).run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-6 text-center font-semibold"
											>H3</span
										>
										<span class="option-label flex-1">Heading 3</span>
									</button>
								</div>

								<div class="mobile-menu-section">
									<span class="mobile-menu-section-title">Insert</span>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										on:click={() => {
											editor.chain().focus().setHorizontalRule().run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-5 text-center font-semibold"
											>—</span
										>
										<span class="option-label flex-1">Horizontal Rule</span>
									</button>
								</div>

								<div class="mobile-menu-section">
									<span class="mobile-menu-section-title">Links</span>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										class:active={editor.isActive('link')}
										class:active-highlight={editor.isActive('link')}
										on:click={() => {
											setLink();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-5 text-center font-semibold">
											<Link2 size={iconSize - 4} />
										</span>
										<span class="option-label flex-1">Add Link</span>
									</button>
									<button
										on:click={() => {
											openLink();
											showMobileMenu = false;
										}}
										disabled={!editor.isActive('link')}
										class="{dropdownOptionClasses} dropdown-item"
										title="Open link"
									>
										<span class="option-icon w-5 text-center font-semibold">
											<ExternalLink size={iconSize - 4} />
										</span>
										<span class="option-label flex-1">Open Link</span>
									</button>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										disabled={!editor.isActive('link')}
										on:click={() => {
											editor.chain().focus().unsetLink().run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-5 text-center font-semibold">
											<Link2Off size={iconSize - 4} />
										</span>
										<span class="option-label flex-1">Remove Link</span>
									</button>
								</div>

								<div class="mobile-menu-section">
									<span class="mobile-menu-section-title">Formatting</span>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										on:click={() => {
											editor.chain().focus().unsetAllMarks().clearNodes().run();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-5 text-center font-semibold"
											><X size={iconSize - 4} /></span
										>
										<span class="option-label flex-1">Clear Formatting</span>
									</button>
									<button
										class="{dropdownOptionClasses} dropdown-item"
										on:click={() => {
											copyAllText();
											showMobileMenu = false;
										}}
									>
										<span class="option-icon w-5 text-center font-semibold">
											{#if copySuccess}
												<Check size={iconSize - 4} class="text-green-500" />
											{:else}
												<Copy size={iconSize - 4} />
											{/if}
										</span>
										<span class="option-label flex-1">Copy All Text</span>
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Editor Controls (Word Count and Zen/Focus Mode Toggle) -->
	<div class="editor-controls mb-2 flex items-center justify-between">
		<!-- Word Count Display -->
		<div
			class="word-count-display"
			class:limit-near={isNearLimit}
			class:limit-reached={isAtLimit}
			class:limit-over={isOverLimit}
		>
			<svg height="20" width="20" viewBox="0 0 20 20">
				<circle r="10" cx="10" cy="10" fill="hsl(var(--color-base-300))" />
				<circle
					r="5"
					cx="10"
					cy="10"
					fill="transparent"
					stroke="currentColor"
					stroke-width="10"
					stroke-dasharray="{(percentage * 31.4) / 100} 31.4"
					transform="rotate(-90) translate(-20)"
				/>
				<circle r="6" cx="10" cy="10" fill="hsl(var(--color-base-100))" />
			</svg>
			<span class="word-count-text">
				{wordCount} words {isOverLimit
					? '(limit reached)'
					: `/ ${wordCountLimit} limit`}
			</span>
		</div>

		<!-- Zen/Focus Mode Toggle -->
		<div class="toggle-container">
			{#if zenMode}
				<button
					class="copy-all-button {textButtonClasses} editor-btn"
					class:copy-success={copySuccess}
					on:click={copyAllText}
					title="Copy all text to clipboard"
				>
					{#if copySuccess}
						<Check size={16} class="text-green-500" />
					{:else}
						<Copy size={16} />
					{/if}
				</button>
			{/if}
			<span class="toggle-label">{zenMode ? 'Zen Mode' : 'Focus Mode'}</span>
			<label class="toggle-switch">
				<input
					type="checkbox"
					class="toggle-input"
					checked={!zenMode}
					on:change={toggleZenMode}
					aria-label={zenMode ? 'Switch to Focus Mode' : 'Switch to Zen Mode'}
				/>
				<span class="toggle-slider"></span>
			</label>
		</div>
	</div>
{/if}

<div
	bind:this={element}
	class="editor-content"
	class:zen-mode-active={zenMode}
></div>

<style>
	/* Base Variables */
	:root {
		--menu-shadow:
			0 1px 1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
		--dropdown-shadow:
			0 12px 16px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
		--active-bg: hsl(var(--color-primary) / 0.1);
		--active-color: hsl(var(--color-primary));
		--hover-bg: hsl(var(--color-base-200));
		--toolbar-spacing: 0.5rem;
		--menu-separator-margin: 0.5rem;
	}

	/* Shared Menu Container Styles */
	.menu-container {
		display: flex;
		align-items: center;
		gap: var(--toolbar-spacing);
		padding: 0.5rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 15px;
		box-shadow: var(--menu-shadow);
	}

	.bubble-menu {
		z-index: 1000;
	}

	.modern-toolbar {
		padding: 0.75rem 0.875rem;
		border-radius: 19px;
		margin-bottom: 1.25rem;
	}

	.menu-separator {
		width: 1px;
		height: 24px;
		background: hsl(var(--color-neutral));
		margin: 0 var(--menu-separator-margin);
	}

	/* Button Styles */
	.editor-btn {
		color: hsl(var(--color-base-content));
		transition: all 0.2s ease;
	}

	.editor-btn:hover:not(:disabled) {
		background: var(--hover-bg);
	}

	.editor-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.editor-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.active-highlight {
		background: var(--active-bg) !important;
		color: var(--active-color) !important;
	}

	.clear-btn {
		background: hsl(var(--color-base-100));
	}

	.clear-btn:hover {
		background: hsl(var(--color-base-200));
	}

	/* Dropdown Styles */
	.dropdown-container {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		min-width: 180px;
		background: hsl(var(--color-base-100));
		border: 1px solid hsl(var(--color-neutral));
		border-radius: 0.5rem;
		padding: 0.5rem;
		box-shadow: var(--dropdown-shadow);
		z-index: 1000;
	}

	.dropdown-item {
		color: hsl(var(--color-base-content));
		transition: all 0.2s ease;
	}

	.dropdown-item:hover:not(:disabled) {
		background: hsl(var(--color-base-200));
	}

	.dropdown-item:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.mobile-dropdown-container {
		right: 0;
		left: auto;
		width: 240px;
		max-width: 90vw;
		padding: 0.75rem;
	}

	.mobile-menu-section {
		margin-bottom: 1rem;
	}

	.mobile-menu-section:last-child {
		margin-bottom: 0;
	}

	.mobile-menu-section-title {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: hsl(var(--color-neutral-content));
		margin-bottom: 0.5rem;
		padding-left: 0.5rem;
	}

	.dots-icon {
		font-size: 1.5rem;
		line-height: 1;
		font-weight: bold;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Word Count Display */
	.word-count-display {
		align-items: center;
		color: hsl(var(--color-neutral-content));
		display: flex;
		font-size: 0.75rem;
		gap: 0.5rem;
	}

	.word-count-display svg {
		color: hsl(var(--color-primary));
	}

	.word-count-display.limit-near svg {
		color: hsl(var(--color-warning));
	}

	.word-count-display.limit-reached svg {
		color: hsl(var(--color-info));
	}

	.word-count-display.limit-over svg {
		color: hsl(var(--color-error));
	}

	/* Editor Controls */
	.editor-controls {
		padding: 0.5rem;
		border-radius: 0.375rem;
		margin-bottom: 0.75rem;
	}

	/* Toggle Switch */
	.toggle-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.toggle-label {
		font-size: 0.875rem;
		color: hsl(var(--color-base-content));
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
	}

	.toggle-input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: hsl(var(--color-base-300));
		transition: 0.3s;
		border-radius: 24px;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: hsl(var(--color-base-000));
		transition: 0.3s;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.toggle-input:checked + .toggle-slider {
		background-color: hsl(var(--color-primary));
	}

	.toggle-input:focus + .toggle-slider {
		box-shadow: 0 0 1px hsl(var(--color-primary));
	}

	.toggle-input:checked + .toggle-slider:before {
		transform: translateX(20px);
	}

	/* Editor Content Styles */
	:global(.tiptap) {
		background: hsl(var(--color-base-premium));
		font-family: var(--font-sans);
		line-height: 1.75;
		color: hsl(var(--color-base-content));
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
		border-radius: 18px;
		outline: none;
		transition: box-shadow 0.2s ease;
		border: 1px solid hsl(var(--color-base-300));
	}

	:global(.tiptap:focus-within) {
		box-shadow:
			0 0 0 4px hsl(var(--color-primary) / 0.15),
			0 10px 40px rgba(0, 0, 0, 0.06);
		border-color: hsl(var(--color-primary) / 0.5);
	}

	:global(.tiptap.ProseMirror-readonly) {
		background-color: hsl(var(--color-base-100));
		cursor: default;
	}

	:global(.tiptap.ProseMirror-readonly a) {
		cursor: pointer;
	}

	:global(.tiptap) :global(*) {
		margin: 0;
	}

	:global(.tiptap) :global(*:first-child) {
		margin-top: 0;
	}

	:global(.tiptap) :global(p) {
		margin-bottom: 1.25rem;
	}

	:global(.tiptap) :global(hr) {
		height: 2px;
		background-color: hsl(var(--color-base-300));
		border: none;
		margin: 2rem 0;
	}

	:global(.tiptap) :global(h1),
	:global(.tiptap) :global(h2),
	:global(.tiptap) :global(h3),
	:global(.tiptap) :global(h4),
	:global(.tiptap) :global(h5),
	:global(.tiptap) :global(h6) {
		line-height: 1.2;
		margin-top: 2.25rem;
		margin-bottom: 1.25rem;
		text-wrap: pretty;
		font-weight: 700;
		color: hsl(var(--color-base-content));
	}

	:global(.tiptap) :global(h1) {
		font-size: 1.8rem;
		margin-top: 3rem;
	}

	:global(.tiptap) :global(h2) {
		font-size: 1.5rem;
		margin-top: 2.5rem;
	}

	:global(.tiptap) :global(h3) {
		font-size: 1.3rem;
		margin-top: 2.25rem;
	}

	:global(.tiptap) :global(h4) {
		font-size: 1.15rem;
		margin-top: 2rem;
	}

	:global(.tiptap) :global(h5) {
		font-size: 1.05rem;
		margin-top: 1.75rem;
	}

	:global(.tiptap) :global(h6) {
		font-size: 1rem;
		margin-top: 1.5rem;
		font-style: italic;
	}

	:global(.tiptap) :global(h1 + *),
	:global(.tiptap) :global(h2 + *),
	:global(.tiptap) :global(h3 + *),
	:global(.tiptap) :global(h4 + *),
	:global(.tiptap) :global(h5 + *),
	:global(.tiptap) :global(h6 + *) {
		margin-top: 0;
	}

	:global(.tiptap .is-editor-empty:first-child::before) {
		color: hsl(var(--color-base-400));
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		font-style: italic;
	}

	:global(.tiptap) :global(a),
	:global(.tiptap) :global(.editor-link) {
		color: hsl(var(--color-primary));
		text-decoration: underline;
		text-decoration-thickness: 1.5px;
		text-underline-offset: 2px;
	}

	:global(.tiptap) :global(a:hover),
	:global(.tiptap) :global(.editor-link:hover) {
		color: hsl(var(--color-accent));
		cursor: text;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.editor-controls {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.toggle-container {
			align-self: flex-end;
		}

		.word-count-display {
			font-size: 0.7rem;
		}
	}

	/* Touch handling */
	.editor-btn,
	.dropdown-item,
	.toggle-switch {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.menu-container {
			border-width: 2px;
		}

		.dropdown-container {
			border-width: 2px;
		}

		:global(.tiptap) {
			border-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}
</style>
