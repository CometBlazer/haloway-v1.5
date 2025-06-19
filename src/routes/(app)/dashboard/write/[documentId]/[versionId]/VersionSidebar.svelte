<!-- src/routes/(admin)/account/(menu)/write/[documentId]/[versionId]/VersionSidebar.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation"
  import { createEventDispatcher } from "svelte"
  import { formatDistanceToNow } from "date-fns"
  import { Bookmark, X, History, Edit2, Copy, Trash2 } from "lucide-svelte"
  import type { ComponentVersion } from "../../../../../../../DatabaseDefinitions"
  import { enhance } from "$app/forms"

  export let documentId: string
  export let currentVersionId: string
  export let versions: ComponentVersion[]

  const dispatch = createEventDispatcher<{
    createVersion: { name: string }
    renameVersion: { id: string; name: string }
    duplicateVersion: string
    deleteVersion: string
    closeSidebar: void
  }>()

  let isCreatingVersion = false
  let newVersionName = ""
  let renamingVersionId: string | null = null
  let tempVersionName = ""

  // Loading states
  let isCreatingLoading = false
  let isRenamingLoading = false
  let isDuplicatingId: string | null = null
  let isDeletingId: string | null = null

  const focus = (node: HTMLElement) => {
    node.focus()
    return {}
  }

  // Enhanced submit function for form enhancement
  const handleCreateVersion = ({
    formData,
    cancel,
  }: {
    formData: FormData
    cancel: () => void
  }) => {
    isCreatingLoading = true

    // Optional: Add any pre-submit validation here
    const name = formData.get("name") as string
    if (!name?.trim()) {
      cancel()
      isCreatingLoading = false
      return
    }

    return async ({
      result,
      update,
    }: {
      result: { type: string; data?: { version?: ComponentVersion } }
      update: () => Promise<void>
    }) => {
      isCreatingLoading = false

      if (result.type === "success" && result.data?.version) {
        const version = result.data.version as ComponentVersion
        // Update the versions array in-memory
        versions = [version, ...versions]
        // Navigate to the new version
        await goto(`/account/write/${documentId}/${version.id}`, {
          replaceState: true,
        })
        // Reset form state
        newVersionName = ""
        isCreatingVersion = false
      } else if (result.type === "failure") {
        // Handle validation errors
        console.error("Failed to create checkpoint:", result.data)
        // You might want to show the error to the user
      } else {
        // Handle other error types
        console.error("Unexpected result:", result)
      }

      // Update the page data if needed
      await update()
    }
  }

  function handleRenameVersion() {
    if (renamingVersionId && tempVersionName.trim()) {
      isRenamingLoading = true
      dispatch("renameVersion", {
        id: renamingVersionId,
        name: tempVersionName,
      })
      // Reset state after delay
      setTimeout(() => {
        renamingVersionId = null
        tempVersionName = ""
        isRenamingLoading = false
      }, 1000)
    }
  }

  function handleDuplicateVersion(versionId: string) {
    isDuplicatingId = versionId
    dispatch("duplicateVersion", versionId)
    // Reset after delay
    setTimeout(() => {
      isDuplicatingId = null
    }, 1000)
  }

  function handleDeleteVersion(versionId: string) {
    if (
      confirm(
        "Are you sure you want to permanently delete this checkpoint? This action cannot be undone.",
      )
    ) {
      isDeletingId = versionId
      dispatch("deleteVersion", versionId)
      // Reset after delay
      setTimeout(() => {
        isDeletingId = null
      }, 1000)
    }
  }

  function startRename(version: (typeof versions)[0]) {
    renamingVersionId = version.id
    tempVersionName = version.version_name
  }

  function cancelRename() {
    renamingVersionId = null
    tempVersionName = ""
    isRenamingLoading = false
  }

  // Navigate to version - simplified approach without form submission
  function navigateToVersion(versionId: string) {
    if (versionId === currentVersionId) {
      // Already on this version, just close sidebar
      closeSidebar()
      return
    }

    // Navigate directly - the server load function will handle setting current_version_id
    goto(`/account/write/${documentId}/${versionId}`)
    closeSidebar()
  }

  function closeSidebar() {
    dispatch("closeSidebar")
  }

  // Get current version name for display
  $: currentVersion = versions.find((v) => v.id === currentVersionId)
  $: currentVersionName = currentVersion?.version_name || "Unknown Checkpoint"

  // Parse dates safely
  function parseDate(dateString: string): Date {
    try {
      return new Date(dateString)
    } catch {
      return new Date()
    }
  }

  // Sort versions by updated_at desc (most recent first)
  $: sortedVersions = [...versions].sort((a, b) => {
    // 1) always put the "current" checkpoint first
    if (a.id === currentVersionId) return -1
    if (b.id === currentVersionId) return 1
    // 2) otherwise, sort by updated_at descending
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
</script>

<div class="checkpoint-sidebar">
  <!-- Header -->
  <div class="sidebar-header">
    <div class="header-content">
      <div class="header-icon">
        <History size={20} class="text-primary" />
      </div>
      <div class="header-text">
        <h2 class="sidebar-title">Checkpoint Manager</h2>
        <p class="sidebar-description">
          Current: <span class="current-checkpoint">{currentVersionName}</span>
        </p>
      </div>
    </div>

    <button
      type="button"
      class="btn btn-ghost btn-circle btn-sm"
      on:click={closeSidebar}
      aria-label="Close checkpoint sidebar"
    >
      <X size={18} />
    </button>
  </div>

  <!-- Status Messages -->
  {#if isCreatingLoading || isRenamingLoading || isDuplicatingId || isDeletingId}
    <div class="status-section">
      {#if isCreatingLoading}
        <div class="status-message creating">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Creating checkpoint...</span>
        </div>
      {/if}

      {#if isRenamingLoading}
        <div class="status-message renaming">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Renaming checkpoint...</span>
        </div>
      {/if}

      {#if isDuplicatingId}
        <div class="status-message duplicating">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Duplicating checkpoint...</span>
        </div>
      {/if}

      {#if isDeletingId}
        <div class="status-message deleting">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Deleting checkpoint...</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Create New Checkpoint -->
  <div class="create-section">
    {#if isCreatingVersion}
      <form
        method="POST"
        action="?/createVersion"
        use:enhance={handleCreateVersion}
        class="create-form"
      >
        <input type="hidden" name="documentId" value={documentId} />

        <div class="form-control">
          <label for="checkpoint-name" class="label">
            <span class="label-text font-semibold mb-2 mr-2"
              >Checkpoint Name:</span
            >
          </label>
          <input
            id="checkpoint-name"
            name="name"
            type="text"
            bind:value={newVersionName}
            on:keydown={(e) => {
              if (e.key === "Escape") {
                isCreatingVersion = false
                newVersionName = ""
              }
            }}
            class="input input-bordered"
            placeholder="e.g., First draft complete"
            use:focus
            disabled={isCreatingLoading}
            required
          />
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            class="btn btn-primary flex-1"
            disabled={!newVersionName.trim() || isCreatingLoading}
          >
            {#if isCreatingLoading}
              <span class="loading loading-spinner loading-sm"></span>
              Creating…
            {:else}
              <Bookmark size={16} />
              Save Checkpoint
            {/if}
          </button>

          <button
            type="button"
            class="btn btn-ghost"
            on:click={() => {
              isCreatingVersion = false
              newVersionName = ""
            }}
            disabled={isCreatingLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    {:else}
      <button
        type="button"
        class="btn btn-primary w-full"
        on:click={() => {
          // generate your default timestamped name
          const now = new Date()
          newVersionName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          isCreatingVersion = true
        }}
        disabled={isCreatingLoading}
      >
        <Bookmark size={18} />
        Save Checkpoint
      </button>

      <div class="create-hint">
        Capture your current progress. You can always come back to this
        checkpoint or start from here again.
      </div>
    {/if}
  </div>

  <!-- Checkpoints List -->
  <div class="checkpoints-section">
    <div class="section-header">
      <h3 class="section-title">Your Checkpoints</h3>
      <span class="badge badge-neutral">{versions.length}</span>
    </div>

    <div class="checkpoints-list">
      {#each sortedVersions as version (version.id)}
        <div
          class="checkpoint-card"
          class:current={version.id === currentVersionId}
          class:deleting={isDeletingId === version.id}
        >
          {#if renamingVersionId === version.id}
            <!-- Rename Mode -->
            <div class="rename-form">
              <div class="form-control">
                <input
                  type="text"
                  bind:value={tempVersionName}
                  on:keydown={(e) => {
                    if (e.key === "Enter") handleRenameVersion()
                    if (e.key === "Escape") cancelRename()
                  }}
                  class="input input-bordered input-sm"
                  placeholder="Checkpoint name"
                  use:focus
                  disabled={isRenamingLoading}
                />
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  on:click={handleRenameVersion}
                  disabled={!tempVersionName.trim() || isRenamingLoading}
                >
                  {#if isRenamingLoading}
                    <span class="loading loading-spinner loading-xs"></span>
                    Saving...
                  {:else}
                    Save
                  {/if}
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-ghost"
                  on:click={cancelRename}
                  disabled={isRenamingLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          {:else}
            <!-- Normal Display Mode -->
            <div class="checkpoint-content">
              <!-- Main Info (Clickable) -->
              <button
                type="button"
                class="checkpoint-main"
                on:click={() => navigateToVersion(version.id)}
                disabled={isDeletingId === version.id}
              >
                <div class="checkpoint-header">
                  <div class="checkpoint-name">
                    {version.version_name}
                  </div>
                  {#if version.id === currentVersionId}
                    <span class="badge badge-primary badge-sm">Current</span>
                  {/if}
                </div>

                <div class="checkpoint-meta">
                  <div class="checkpoint-timestamps">
                    <span class="checkpoint-time created">
                      Created {formatDistanceToNow(
                        parseDate(version.created_at),
                        {
                          addSuffix: true,
                        },
                      )}
                    </span>
                    <span class="checkpoint-time edited">
                      Last edited {formatDistanceToNow(
                        parseDate(version.updated_at),
                        {
                          addSuffix: true,
                        },
                      )}
                    </span>
                  </div>
                </div>
              </button>

              <!-- Actions -->
              <div class="checkpoint-actions">
                <button
                  type="button"
                  class="action-btn"
                  on:click={() => startRename(version)}
                  disabled={isDeletingId === version.id || isRenamingLoading}
                  title="Rename Checkpoint"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  class="action-btn"
                  on:click={() => handleDuplicateVersion(version.id)}
                  disabled={isDuplicatingId === version.id ||
                    isDeletingId === version.id}
                  title="Duplicate Checkpoint"
                >
                  {#if isDuplicatingId === version.id}
                    <span class="loading loading-spinner loading-xs"></span>
                  {:else}
                    <Copy size={14} />
                  {/if}
                </button>

                {#if versions.length > 1 && version.id !== currentVersionId && !version.id.startsWith("temp-")}
                  <button
                    type="button"
                    class="action-btn delete"
                    on:click={() => handleDeleteVersion(version.id)}
                    disabled={isDeletingId === version.id}
                    title="Delete Checkpoint"
                  >
                    {#if isDeletingId === version.id}
                      <span class="loading loading-spinner loading-xs"></span>
                    {:else}
                      <Trash2 size={14} />
                    {/if}
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .checkpoint-sidebar {
    height: 100vh;
    width: 380px;
    background: var(--color-base-100);
    border-left: 1px solid var(--color-base-300);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .sidebar-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-base-200);
    background: var(--color-base-50);
  }

  .header-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1;
  }

  .header-icon {
    padding: 0.5rem;
    background: var(--color-primary-50);
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .sidebar-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-base-content);
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
  }

  .sidebar-description {
    font-size: 0.875rem;
    color: var(--color-base-content-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .current-checkpoint {
    font-weight: 500;
    color: var(--color-primary);
  }

  /* Status Section */
  .status-section {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-base-200);
    background: var(--color-base-50);
  }

  .status-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0;
  }

  .status-message.creating {
    color: var(--color-primary);
  }

  .status-message.renaming {
    color: var(--color-primary);
  }

  .status-message.duplicating {
    color: var(--color-primary);
  }

  .status-message.deleting {
    color: var(--color-error);
  }

  /* Create Section */
  .create-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-base-200);
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .create-hint {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: var(--color-base-content-tertiary);
    line-height: 1.4;
    font-style: italic;
  }

  /* Checkpoints Section */
  .checkpoints-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem 0.75rem 1.5rem;
  }

  .section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-base-content);
    margin: 0;
  }

  .checkpoints-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Checkpoint Cards */
  .checkpoint-card {
    border: 1px solid var(--color-base-200);
    border-radius: 0.75rem;
    background: var(--color-base-100);
    transition: all 0.2s ease;
  }

  .checkpoint-card:hover {
    border-color: var(--color-base-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .checkpoint-card.current {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
    box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.1);
  }

  .checkpoint-card.deleting {
    opacity: 0.6;
    pointer-events: none;
  }

  .checkpoint-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .checkpoint-main {
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s ease;
  }

  .checkpoint-main:hover:not(:disabled) {
    opacity: 0.8;
  }

  .checkpoint-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .checkpoint-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-base-content);
    line-height: 1.3;
    flex: 1;
  }

  .checkpoint-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkpoint-timestamps {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .checkpoint-time {
    font-size: 0.8125rem;
    color: var(--color-base-content-secondary);
  }

  .checkpoint-time.created {
    opacity: 0.8;
  }

  .checkpoint-time.edited {
    font-weight: 500;
    color: var(--color-primary);
  }

  .checkpoint-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-base-200);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-base-content-secondary);
  }

  .action-btn:hover:not(:disabled) {
    background: var(--color-base-200);
    color: var(--color-base-content);
  }

  .action-btn.delete {
    color: var(--color-error-secondary);
  }

  .action-btn.delete:hover:not(:disabled) {
    background: var(--color-error-50);
    color: var(--color-error);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Rename Form */
  .rename-form {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Scrollbar */
  .checkpoints-list::-webkit-scrollbar {
    width: 6px;
  }

  .checkpoints-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .checkpoints-list::-webkit-scrollbar-thumb {
    background: var(--color-base-300);
    border-radius: 3px;
  }

  .checkpoints-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-base-400);
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .checkpoint-sidebar {
      width: 100vw;
    }

    .sidebar-header {
      padding: 1rem;
    }

    .create-section {
      padding: 1rem;
    }

    .checkpoints-list {
      padding: 0 1rem 1rem 1rem;
    }

    .section-header {
      padding: 0.75rem 1rem 0.5rem 1rem;
    }
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .sidebar-header {
      background: var(--color-base-200);
    }

    .status-section {
      background: var(--color-base-200);
    }

    .checkpoint-card.current {
      background: rgba(var(--color-primary-rgb), 0.1);
    }
  }
</style>
