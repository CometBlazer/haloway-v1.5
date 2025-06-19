<script lang="ts">
  // DEPRECATED: This component is deprecated. Use the new TiptapEditor.svelte component instead.
  // This component uses Tipex, a wrapper around Tiptap, to create a rich text editor with a Notion-like style.
  // However, the TipTapEditor.svelte component is more flexible and customizable.
  import { Tipex } from "@friendofsvelte/tipex"
  import type { Editor } from "@tiptap/core"

  // Props for the component
  export let body = "<p>Start writing...</p>"
  export let editor: Editor | undefined = undefined

  // You can also export this to get the HTML content
  export function getHTML(): string {
    return editor?.getHTML() || ""
  }
</script>

<div class="editor-container">
  <Tipex
    {body}
    bind:tipex={editor}
    controls={false}
    floating
    class="notion-style-editor"
  />
</div>

<style>
  .editor-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    margin: 20px 0;
  }

  :global(.notion-style-editor) {
    font-family:
      ui-sans-serif,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    font-size: 16px;
    line-height: 1.6;
    background: #ffffff;
    border: 1px solid #f0f0f0;
  }

  /* Style the editor content area */
  :global(.notion-style-editor .tiptap) {
    padding: 60px 80px;
    min-height: 300px;
    outline: none;
    max-width: none;
  }

  /* Notion-like typography */
  :global(.notion-style-editor h1) {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 16px;
    padding: 8px 0;
    color: #111827;
  }

  :global(.notion-style-editor h2) {
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 32px 0 16px;
    padding: 6px 0;
    color: #111827;
  }

  :global(.notion-style-editor h3) {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 24px 0 12px;
    padding: 4px 0;
    color: #111827;
  }

  :global(.notion-style-editor p) {
    margin: 8px 0;
    padding: 4px 0;
    min-height: 1.5em;
    color: #374151;
  }

  /* Empty paragraph placeholder */
  :global(.notion-style-editor p.is-editor-empty:first-child::before) {
    content: "Type '/' for commands...";
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
    font-style: italic;
  }

  /* Lists */
  :global(.notion-style-editor ul, .notion-style-editor ol) {
    margin: 8px 0;
    padding-left: 28px;
  }

  :global(.notion-style-editor li) {
    margin: 4px 0;
    padding: 2px 0;
    color: #374151;
  }

  :global(.notion-style-editor ul li::marker) {
    color: #6b7280;
  }

  /* Blockquotes */
  :global(.notion-style-editor blockquote) {
    border-left: 3px solid #e5e7eb;
    padding-left: 20px;
    margin: 16px 0;
    color: #6b7280;
    font-style: italic;
    background: #f9fafb;
    padding: 16px 20px;
    border-radius: 6px;
  }

  /* Code blocks */
  :global(.notion-style-editor pre) {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    font-family: "Monaco", "Consolas", "Liberation Mono", "Courier New",
      monospace;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid #e5e7eb;
  }

  /* Inline code */
  :global(.notion-style-editor code) {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Monaco", "Consolas", "Liberation Mono", "Courier New",
      monospace;
    font-size: 0.9em;
    color: #dc2626;
    border: 1px solid #e5e7eb;
  }

  /* Bold and italic */
  :global(.notion-style-editor strong) {
    font-weight: 600;
    color: #111827;
  }

  :global(.notion-style-editor em) {
    font-style: italic;
    color: #374151;
  }

  /* Links */
  :global(.notion-style-editor a) {
    color: #2563eb;
    text-decoration: underline;
    text-decoration-color: #93c5fd;
    text-underline-offset: 2px;
  }

  :global(.notion-style-editor a:hover) {
    text-decoration-color: #2563eb;
  }

  /* Selection */
  :global(.notion-style-editor ::selection) {
    background: #dbeafe;
  }

  /* Focus state */
  :global(.notion-style-editor .tiptap:focus) {
    outline: none;
  }

  /* Floating menu styling */
  :global(.tipex-floating-menu) {
    background: var(--color-base-100);
    border: 1px solid var(--color-neutral);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 4px;
  }
</style>
