<!-- src/routes/(admin)/account/(menu)/write/[documentId]/[versionId]/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import { beforeNavigate } from "$app/navigation"
  import { browser } from "$app/environment"
  import { onMount, onDestroy } from "svelte"
  import { fade, slide } from "svelte/transition"
  import DocumentHeader from "./DocumentHeader.svelte"
  import VersionSidebar from "./VersionSidebar.svelte"
  import TiptapEditor from "$lib/components/TiptapEditor.svelte"
  import { toastStore } from "$lib/stores/toast"
  import type { PageData } from "./$types"
  import type { ActionResult } from "@sveltejs/kit"
  import type { Editor } from "@tiptap/core"
  import type { ComponentVersion } from "../../../../../../../DatabaseDefinitions"
  import { WebsiteName } from "../../../../../../../config"
  import { Download, FileText, Text, Save } from "lucide-svelte"
  import type { Status } from "$lib/components/StatusDropdown.svelte"

  // Import modular systems
  import { AutoSaveManager, getStatusDisplay } from "$lib/autosave"
  import type { SaveState } from "$lib/autosave"
  import { DocumentExporter } from "$lib/export"
  import type { DocumentMetadata } from "$lib/export"

  export let data: PageData

  // Editor and content state
  let editor: Editor
  let content = ""
  let editorReady = false

  // Document state
  let documentTitle = data.document.title || ""
  let documentPrompt = data.document.prompt || ""
  let wordCountLimit = data.document.word_count_limit || 250
  let wordCount = 0
  let isSidebarOpen = false
  let editorZenMode = false
  let currentWordCount = 0

  // Checkpoint creation state
  let isCreatingCheckpoint = false
  let showCheckpointModal = false
  let checkpointModalName = ""

  // Modular managers
  let autoSaveManager: AutoSaveManager
  let documentExporter: DocumentExporter
  let saveState: SaveState = {
    status: "saved",
    lastSavedTime: new Date(),
    hasUnsavedChanges: false,
    consecutiveFailures: 0,
    isOnline: true,
    isSaveInProgress: false,
  }

  // Create autosave manager with callbacks
  function createAutoSaveManager() {
    autoSaveManager = new AutoSaveManager(
      {
        debounceMs: 2000,
        maxRetryAttempts: 3,
        retryDelays: [2000, 5000, 10000],
        timeoutMs: 30000,
        backupIntervalMs: 30000,
      },
      {
        onSave: async (content: string) => {
          const formData = new FormData()
          formData.append("content", content)
          formData.append("lastKnownVersion", data.currentVersion.updated_at)

          return await fetch("?/updateVersion", {
            method: "POST",
            body: formData,
          })
        },
        onToast: (message: string, type: "success" | "error" | "info") => {
          toastStore.show(message, type)
        },
        onConflict: () => {
          toastStore.show(
            "Document was modified elsewhere. Please refresh to see latest version.",
            "error",
          )
          // Optionally add a refresh button to the toast
          setTimeout(() => {
            if (
              confirm(
                "Document conflict detected. Refresh page to see latest version?",
              )
            ) {
              window.location.reload()
            }
          }, 1000)
        },
        onAuthError: () => {
          goto("/login")
        },
      },
    )

    // Subscribe to save state changes
    autoSaveManager.getState().subscribe((state) => {
      saveState = state
    })
  }

  // Create document exporter when editor is ready
  function createDocumentExporter() {
    if (!editor) return

    const metadata: DocumentMetadata = {
      title: documentTitle,
      prompt: documentPrompt,
      wordCount: currentWordCount,
      wordCountLimit: wordCountLimit,
      versionName: currentVersionName,
      lastSaved: saveState.lastSavedTime,
      appName: `${WebsiteName}`,
    }

    documentExporter = new DocumentExporter(editor, metadata, {
      onSuccess: (message) => toastStore.show(message, "success"),
      onError: (message) => toastStore.show(message, "error"),
    })
  }

  // Initialize managers
  $: if (browser && !autoSaveManager) {
    createAutoSaveManager()
  }

  $: if (editor && editorReady && !documentExporter) {
    createDocumentExporter()
  }

  // Update exporter metadata when document changes
  $: if (documentExporter) {
    documentExporter.updateMetadata({
      title: documentTitle,
      prompt: documentPrompt,
      wordCount: currentWordCount,
      lastSaved: saveState.lastSavedTime,
    })
  }

  // Get status display for UI
  $: statusDisplay = getStatusDisplay(
    saveState.status,
    saveState.hasUnsavedChanges,
    saveState.lastSavedTime,
    saveState.isOnline,
  )

  // Initialize editor with existing content
  function handleEditorReady() {
    if (editor && !editorReady) {
      loadVersionContent()
      editorReady = true

      // Initialize autosave manager with editor
      if (autoSaveManager) {
        const initialContent = data.currentVersion.content || {
          type: "doc",
          content: [],
        }
        autoSaveManager.initialize(
          editor,
          initialContent,
          $page.params.documentId,
        )
      }
    }
  }

  // Load version content into editor
  function loadVersionContent() {
    if (!editor) return
    try {
      const versionContent = data.currentVersion.content
      let parsedContent

      if (
        !versionContent ||
        versionContent === "" ||
        (typeof versionContent === "object" &&
          Object.keys(versionContent).length === 0)
      ) {
        parsedContent = { type: "doc", content: [] }
      } else if (typeof versionContent === "string") {
        try {
          const jsonContent = JSON.parse(versionContent)
          if (
            jsonContent &&
            typeof jsonContent === "object" &&
            jsonContent.type === "doc"
          ) {
            parsedContent = jsonContent
          } else {
            parsedContent = {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: versionContent }],
                },
              ],
            }
          }
        } catch {
          parsedContent = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: versionContent }],
              },
            ],
          }
        }
      } else {
        parsedContent = versionContent
      }

      editor.commands.setContent(parsedContent)
      console.log("Content loaded and initialized")
    } catch (error) {
      console.error("Failed to load checkpoint content:", error)
      toastStore.show("Warning: Could not load checkpoint content", "error")
      const emptyContent = { type: "doc", content: [] }
      editor.commands.setContent(emptyContent)
    }
  }

  // Content and save handlers
  function handleContentUpdate() {
    if (autoSaveManager) {
      autoSaveManager.onContentChange()
    }
  }

  async function saveContent(fromKeyboard = false) {
    if (autoSaveManager) {
      await autoSaveManager.manualSave(fromKeyboard)
    }
  }

  // Export functions - now much simpler!
  function downloadAsTxt() {
    documentExporter?.exportAsText()
  }

  function downloadAsDoc() {
    documentExporter?.exportAsDoc()
  }

  // function downloadAsHtml() {
  //   documentExporter?.exportAsHtml()
  // }

  // Document management functions
  async function handleTitleUpdate(event: CustomEvent<string>) {
    const newTitle = event.detail.trim()
    if (newTitle === documentTitle) return
    documentTitle = newTitle
    try {
      const formData = new FormData()
      formData.append("title", newTitle)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        toastStore.show("Title updated successfully", "success")
      } else {
        throw new Error("Failed to update title")
      }
    } catch (error) {
      console.error("Failed to update title:", error)
      toastStore.show("Failed to update title", "error")
      documentTitle = data.document.title || ""
    }
  }

  async function handlePromptUpdate(event: CustomEvent<string>) {
    const newPrompt = event.detail.trim()
    if (newPrompt === documentPrompt) return
    documentPrompt = newPrompt
    try {
      const formData = new FormData()
      formData.append("prompt", newPrompt)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        toastStore.show("Prompt updated successfully", "success")
      } else {
        throw new Error("Failed to update prompt")
      }
    } catch (error) {
      console.error("Failed to update prompt:", error)
      toastStore.show("Failed to update prompt", "error")
      documentPrompt = data.document.prompt || ""
    }
  }

  async function handleWordCountLimitUpdate(event: CustomEvent<number>) {
    const newLimit = event.detail
    if (newLimit === wordCountLimit) return
    wordCountLimit = newLimit
    try {
      const formData = new FormData()
      formData.append("wordCountLimit", newLimit.toString())
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        toastStore.show("Word count limit updated successfully", "success")
        if (editor && editorReady) {
          editor = editor
        }
      } else {
        throw new Error("Failed to update word count limit")
      }
    } catch (error) {
      console.error("Failed to update word count limit:", error)
      toastStore.show("Failed to update word count limit", "error")
      wordCountLimit = data.document.word_count_limit || 250
    }
  }

  function handleWordCountUpdate(event: CustomEvent<number>) {
    wordCount = event.detail
    currentWordCount = event.detail
  }

  async function handleStatusUpdate(event: CustomEvent<Status>) {
    const newStatus = event.detail
    try {
      const formData = new FormData()
      formData.append("status", newStatus)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        toastStore.show("Status updated successfully", "success")
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      toastStore.show("Failed to update status", "error")
    }
  }

  async function handleDueDateUpdate(event: CustomEvent<Date | null>) {
    const newDate = event.detail
    try {
      const formData = new FormData()
      formData.append("dueDate", newDate ? newDate.toISOString() : "")
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        toastStore.show("Deadline updated successfully", "success")
      } else {
        throw new Error("Failed to update deadline")
      }
    } catch (error) {
      console.error("Failed to update deadline:", error)
      toastStore.show("Failed to update deadline", "error")
    }
  }

  // Sidebar functions
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen
  }

  function closeSidebar() {
    isSidebarOpen = false
  }

  // Checkpoint functions
  // async function handleQuickSaveCheckpoint() {
  //   if (!editor || !editorReady) {
  //     toastStore.show("Editor not ready", "error")
  //     return
  //   }

  //   // First save current content
  //   await saveContent()

  //   // Generate default checkpoint name
  //   const now = new Date()
  //   const defaultName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

  //   isCreatingCheckpoint = true

  //   try {
  //     const formData = new FormData()
  //     formData.append("name", defaultName)

  //     const response = await fetch("?/createVersion", {
  //       method: "POST",
  //       body: formData,
  //     })

  //     const result = await response.json()

  //     if (response.ok && result.type === "success" && result.data?.version) {
  //       const version = result.data.version
  //       toastStore.show("Checkpoint saved successfully", "success")
  //       await goto(`/account/write/${$page.params.documentId}/${version.id}`)
  //     } else {
  //       throw new Error("Failed to create checkpoint")
  //     }
  //   } catch (error) {
  //     console.error("Quick save failed:", error)
  //     toastStore.show("Failed to save checkpoint", "error")
  //   } finally {
  //     isCreatingCheckpoint = false
  //   }
  // }

  // function handleOpenCheckpointModal() {
  //   showCheckpointModal = true
  //   const now = new Date()
  //   checkpointModalName = `Checkpoint ${now.toLocaleDateString()}`
  // }

  async function handleSaveNamedCheckpoint() {
    if (!checkpointModalName.trim() || !editor || !editorReady) {
      toastStore.show("Please enter a checkpoint name", "error")
      return
    }

    await saveContent()

    isCreatingCheckpoint = true
    showCheckpointModal = false

    try {
      const formData = new FormData()
      formData.append("name", checkpointModalName.trim())

      const response = await fetch("?/createVersion", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.type === "success" && result.data?.version) {
        const version = result.data.version
        toastStore.show("Checkpoint saved successfully", "success")
        await goto(`/account/write/${$page.params.documentId}/${version.id}`)
      } else {
        throw new Error("Failed to create checkpoint")
      }
    } catch (error) {
      console.error("Named save failed:", error)
      toastStore.show("Failed to save checkpoint", "error")
    } finally {
      isCreatingCheckpoint = false
      checkpointModalName = ""
    }
  }

  function closeCheckpointModal() {
    showCheckpointModal = false
    checkpointModalName = ""
  }

  // Version management functions with optimistic UI updates
  function handleVersionCreate(event: CustomEvent<{ name: string }>) {
    const tempId = `temp-${Date.now()}`
    const newVersion: ComponentVersion = {
      id: tempId,
      version_name: event.detail.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.session.user.id,
      document_id: $page.params.documentId,
      content: editor ? editor.getJSON() : { type: "doc", content: [] },
    }

    data.versions = [newVersion, ...data.versions]

    const form = document.createElement("form")
    form.method = "POST"
    form.action = "?/createVersion"
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "name"
    input.value = event.detail.name
    form.appendChild(input)
    document.body.appendChild(form)

    enhance(form, () => {
      return async ({ result }: { result: ActionResult }) => {
        if (result.type === "success" && result.data?.version) {
          const version = result.data.version
          toastStore.show("Checkpoint created successfully", "success")
          goto(`/account/write/${$page.params.documentId}/${version.id}`)
        } else {
          data.versions = data.versions.filter((v) => v.id !== tempId)
          toastStore.show("Failed to create checkpoint", "error")
        }
        document.body.removeChild(form)
      }
    })
    form.submit()
  }

  function handleVersionRename(
    event: CustomEvent<{ id: string; name: string }>,
  ) {
    const originalVersion = data.versions.find((v) => v.id === event.detail.id)
    if (originalVersion) {
      const updatedVersions = data.versions.map((v) =>
        v.id === event.detail.id
          ? {
              ...v,
              version_name: event.detail.name,
              updated_at: new Date().toISOString(),
            }
          : v,
      )
      data.versions = updatedVersions
    }

    const form = document.createElement("form")
    form.method = "POST"
    form.action = "?/renameVersion"

    const versionInput = document.createElement("input")
    versionInput.type = "hidden"
    versionInput.name = "renameVersionId"
    versionInput.value = event.detail.id
    form.appendChild(versionInput)

    const nameInput = document.createElement("input")
    nameInput.type = "hidden"
    nameInput.name = "name"
    nameInput.value = event.detail.name
    form.appendChild(nameInput)
    document.body.appendChild(form)

    enhance(form, () => {
      return async ({ result }: { result: ActionResult }) => {
        if (result.type === "success") {
          toastStore.show("Checkpoint renamed successfully", "success")
        } else {
          if (originalVersion) {
            data.versions = data.versions.map((v) =>
              v.id === event.detail.id ? originalVersion : v,
            )
          }
          toastStore.show("Failed to rename checkpoint", "error")
        }
        document.body.removeChild(form)
      }
    })
    form.submit()
  }

  function handleVersionDuplicate(event: CustomEvent<string>) {
    const sourceVersion = data.versions.find((v) => v.id === event.detail)
    if (!sourceVersion) return

    const tempId = `temp-dup-${Date.now()}`
    const duplicatedVersion: ComponentVersion = {
      ...sourceVersion,
      id: tempId,
      version_name: `${sourceVersion.version_name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    data.versions = [duplicatedVersion, ...data.versions]

    const form = document.createElement("form")
    form.method = "POST"
    form.action = "?/duplicateVersion"
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "sourceVersionId"
    input.value = event.detail
    form.appendChild(input)
    document.body.appendChild(form)

    enhance(form, () => {
      return async ({ result }: { result: ActionResult }) => {
        if (result.type === "success" && result.data?.version) {
          const version = result.data.version
          toastStore.show("Checkpoint duplicated successfully", "success")
          goto(`/account/write/${$page.params.documentId}/${version.id}`)
        } else {
          data.versions = data.versions.filter((v) => v.id !== tempId)
          toastStore.show("Failed to duplicate checkpoint", "error")
        }
        document.body.removeChild(form)
      }
    })
    form.submit()
  }

  function handleVersionDelete(event: CustomEvent<string>) {
    const versionToDelete = data.versions.find((v) => v.id === event.detail)
    if (!versionToDelete) return

    const updatedVersions = data.versions.filter((v) => v.id !== event.detail)
    data.versions = updatedVersions

    const form = document.createElement("form")
    form.method = "POST"
    form.action = "?/deleteVersion"
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "versionId"
    input.value = event.detail
    form.appendChild(input)
    document.body.appendChild(form)

    enhance(form, () => {
      return async ({ result }: { result: ActionResult }) => {
        if (result.type === "success") {
          toastStore.show("Checkpoint deleted successfully", "success")

          if (event.detail === $page.params.versionId) {
            if (updatedVersions.length > 0) {
              const sortedRemaining = [...updatedVersions].sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime(),
              )
              goto(
                `/account/write/${$page.params.documentId}/${sortedRemaining[0].id}`,
              )
            } else {
              goto("/account/documents")
            }
          }
        } else {
          data.versions = [...data.versions, versionToDelete].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          )
          toastStore.show("Failed to delete checkpoint", "error")
        }
        document.body.removeChild(form)
      }
    })
    form.submit()
  }

  // Event handlers
  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault()
      event.stopPropagation()
      saveContent(true)
    }
  }

  // Navigation guards
  beforeNavigate(({ cancel }) => {
    if (browser && saveState.hasUnsavedChanges) {
      if (
        !confirm(
          "You have unsaved changes. Are you sure you want to leave? You'll lose your work.",
        )
      ) {
        cancel()
      }
    }
  })

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (saveState.hasUnsavedChanges) {
      if (autoSaveManager) {
        autoSaveManager.createBackup(
          $page.params.documentId,
          $page.params.versionId,
          documentTitle,
        )
      }
      event.preventDefault()
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?"
      return event.returnValue
    }
  }

  // Lifecycle management
  onMount(() => {
    if (browser) {
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("keydown", handleKeydown)

      // Network status listeners
      window.addEventListener("online", () => {
        if (autoSaveManager) {
          autoSaveManager.setOnlineStatus(true)
        }
      })

      window.addEventListener("offline", () => {
        if (autoSaveManager) {
          autoSaveManager.setOnlineStatus(false)
        }
      })

      // Periodic connectivity check
      const connectivityInterval = setInterval(() => {
        if (autoSaveManager) {
          autoSaveManager.setOnlineStatus(navigator.onLine)
        }
      }, 5000)

      // Periodic backup
      const backupInterval = setInterval(() => {
        if (autoSaveManager && saveState.hasUnsavedChanges) {
          autoSaveManager.createBackup(
            $page.params.documentId,
            $page.params.versionId,
            documentTitle,
          )
        }
      }, 30000)

      return () => {
        clearInterval(connectivityInterval)
        clearInterval(backupInterval)
      }
    }
  })

  onDestroy(() => {
    if (autoSaveManager) {
      autoSaveManager.cleanup()
    }

    if (browser) {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("keydown", handleKeydown)
    }
  })

  // Watch for editor initialization
  $: if (editor && !editorReady) {
    handleEditorReady()
  }

  // Watch for version changes and reload content
  $: if (editorReady && data.currentVersion) {
    loadVersionContent()
  }

  // Get current checkpoint name for display
  $: currentVersion = data.versions.find(
    (v: ComponentVersion) => v.id === $page.params.versionId,
  )
  $: currentVersionName = currentVersion?.version_name || "Unknown Checkpoint"
</script>

<svelte:head>
  <title>{documentTitle || "Rich Text Editor"} | {WebsiteName}</title>
</svelte:head>

<div class="container">
  <!-- Header with document controls -->
  <header class:zen-mode={editorZenMode} class="mb-8 lg:mb-12">
    <div class="w-full">
      <!-- Enhanced toolbar integrated into header -->
      <div
        class="flex justify-end items-center gap-3 mb-4 pb-4 border-b border-base-200 flex-row lg:items-center"
      >
        <!-- Save status and manual save -->
        <div class="flex items-center gap-3">
          <!-- Contextual save button - only show when needed -->
          {#if saveState.status === "error" || saveState.status === "offline" || (saveState.hasUnsavedChanges && !saveState.isOnline)}
            <button
              on:click={() => saveContent(false)}
              class="btn btn-ghost btn-sm"
              class:btn-error={saveState.status === "error"}
              class:btn-warning={saveState.status === "offline"}
              disabled={saveState.status === "saving" ||
                saveState.status === "retrying"}
              title={saveState.status === "error"
                ? "Auto-save failed - click to retry"
                : saveState.status === "offline"
                  ? "Currently offline"
                  : "Save changes manually"}
            >
              <Save size={14} />
              {#if saveState.status === "error"}
                Retry Save
              {:else if saveState.status === "offline"}
                Save When Online
              {:else}
                Save
              {/if}
            </button>
          {/if}

          <!-- Status indicator -->
          <div
            class="flex items-center"
            class:animate-pulse={saveState.status === "error"}
          >
            <div
              class="flex items-center gap-2 text-sm font-medium whitespace-nowrap px-4 py-2 md:py-3 rounded-full transition-all duration-300 {statusDisplay.class ===
              'saved'
                ? 'text-success bg-success/10'
                : statusDisplay.class === 'saving' ||
                    statusDisplay.class === 'retrying'
                  ? 'text-info bg-info/10'
                  : statusDisplay.class === 'unsaved' ||
                      statusDisplay.class === 'pending'
                    ? 'text-warning bg-warning/10'
                    : statusDisplay.class === 'error'
                      ? 'text-error bg-error/10'
                      : 'text-base-content bg-base-200'}"
            >
              <!-- Dynamic status icon -->
              {#if statusDisplay.icon === "saved"}
                <svg
                  class="w-4 h-4 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  >
                    <path
                      d="M2 14.5A4.5 4.5 0 0 0 6.5 19h12a3.5 3.5 0 0 0 .5-6.965a7 7 0 0 0-13.76-1.857A4.5 4.5 0 0 0 2 14.5Z"
                    />
                    <path stroke-linecap="round" d="m15 11l-4 4l-2-2" />
                  </g>
                </svg>
              {:else if statusDisplay.icon === "saving"}
                <span class="loading loading-spinner loading-xs"></span>
              {:else if statusDisplay.icon === "unsaved" || statusDisplay.icon === "pending"}
                <svg
                  class="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
              {:else if statusDisplay.icon === "error"}
                <svg
                  class="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              {:else if statusDisplay.icon === "offline"}
                <svg
                  class="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1h-5L9 16v-3H4a1 1 0 01-1-1V4zm6 3a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd"
                  />
                </svg>
              {/if}
              <span class="min-w-0">{statusDisplay.text}</span>
            </div>
          </div>
        </div>

        <!-- Download dropdown -->
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            type="button"
            class="btn btn-outline btn-sm md:btn-md gap-2"
            title="Download document"
          >
            <Download size={16} />
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <ul
            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-44 p-2 shadow-lg border border-base-300 mt-2"
          >
            <li>
              <button
                type="button"
                on:click={downloadAsTxt}
                class="flex items-center gap-2"
              >
                <Text size={16} />
                Download as TXT
              </button>
            </li>
            <li>
              <button
                type="button"
                on:click={downloadAsDoc}
                class="flex items-center gap-2"
              >
                <FileText size={16} />
                Download as DOC
              </button>
            </li>
          </ul>
        </div>
      </div>

      <DocumentHeader
        documentTitle={documentTitle || ""}
        {documentPrompt}
        {wordCount}
        {wordCountLimit}
        {currentVersionName}
        zenMode={editorZenMode}
        initialStatus={(data.document.status as Status) || "not-started"}
        initialDueDate={data.document.due_date
          ? new Date(data.document.due_date)
          : null}
        on:updateTitle={handleTitleUpdate}
        on:updatePrompt={handlePromptUpdate}
        on:updateWordCountLimit={handleWordCountLimitUpdate}
        on:toggleSidebar={toggleSidebar}
        on:updateStatus={handleStatusUpdate}
        on:updateDueDate={handleDueDateUpdate}
      />
    </div>
  </header>

  <!-- Editor container -->
  <div class="rounded-xl min-h-[600px]">
    <TiptapEditor
      bind:editor
      bind:body={content}
      bind:zenMode={editorZenMode}
      bind:wordCountLimit
      bind:wordCount={currentWordCount}
      on:update={handleContentUpdate}
      on:wordCount={handleWordCountUpdate}
    />
  </div>

  <div class="flex justify-between w-full mt-8 mb-4">
    <h2 class="text-2xl font-semibold">AI Feedback: coming soon!</h2>
    <button
      class="btn btn-primary btn-sm md:btn-md"
      on:click={() => alert("This doesn't do anything yet")}
    >
      Get New Feedback
    </button>
  </div>

  <!-- Checkpoint sidebar -->
  {#if isSidebarOpen}
    <div
      class="fixed inset-0 bg-black/50 z-40"
      transition:fade={{ duration: 200 }}
      on:click={() => (isSidebarOpen = false)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === "Escape" && (isSidebarOpen = false)}
    ></div>
    <div
      class="fixed top-0 right-0 h-screen z-50"
      transition:slide={{ duration: 300, axis: "x" }}
    >
      <VersionSidebar
        documentId={$page.params.documentId}
        currentVersionId={$page.params.versionId}
        versions={data.versions}
        on:createVersion={handleVersionCreate}
        on:renameVersion={handleVersionRename}
        on:duplicateVersion={handleVersionDuplicate}
        on:deleteVersion={handleVersionDelete}
        on:closeSidebar={closeSidebar}
      />
    </div>
  {/if}

  <!-- Checkpoint Modal -->
  {#if showCheckpointModal}
    <dialog
      class="modal modal-open"
      transition:fade={{ duration: 200 }}
      open
      aria-label="Save checkpoint modal"
    >
      <!-- Use a button as a backdrop for proper accessibility -->
      <button
        class="modal-backdrop absolute inset-0 w-full h-full bg-transparent cursor-default"
        on:click={closeCheckpointModal}
        on:keydown={(e) => e.key === "Escape" && closeCheckpointModal()}
        aria-label="Close modal"
      ></button>
      <div class="modal-box" role="document">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Save Checkpoint</h3>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            on:click={closeCheckpointModal}
            aria-label="Close modal"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <p class="text-sm text-base-content/70">
            Give this checkpoint a meaningful name to help you remember what
            progress you've made.
          </p>

          <div class="form-control">
            <label for="checkpoint-name-modal" class="label">
              <span class="label-text">Checkpoint Name</span>
            </label>
            <input
              id="checkpoint-name-modal"
              type="text"
              bind:value={checkpointModalName}
              on:keydown={(e) => {
                if (e.key === "Enter") handleSaveNamedCheckpoint()
                if (e.key === "Escape") closeCheckpointModal()
              }}
              class="input input-bordered"
              placeholder="e.g., First draft complete, Added conclusion, Final revision"
              disabled={isCreatingCheckpoint}
            />
          </div>
        </div>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            on:click={closeCheckpointModal}
            disabled={isCreatingCheckpoint}
          >
            Cancel
          </button>

          <button
            type="button"
            class="btn btn-primary"
            on:click={handleSaveNamedCheckpoint}
            disabled={!checkpointModalName.trim() || isCreatingCheckpoint}
          >
            {#if isCreatingCheckpoint}
              <span class="loading loading-spinner loading-sm"></span>
              Saving...
            {:else}
              Save Checkpoint
            {/if}
          </button>
        </div>
      </div>
    </dialog>
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    min-height: 100vh;
    /* background: var(--color-base-300); */
  }

  header {
    margin-bottom: 2rem;
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
  }

  /* .document-header-wrapper {
    width: 100%;
  }

  .integrated-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-base-200);
  }

  .save-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  } */
  /* TipTap editor responsive styling */
  :global(.tiptap) {
    min-height: 800px;
    padding: 4rem 7rem;
    font-size: 18px;
    line-height: 1.6;
  }

  @media (max-width: 1400px) {
    :global(.tiptap) {
      padding: 4rem 5rem;
    }
  }

  @media (max-width: 1024px) {
    :global(.tiptap) {
      min-height: 700px;
      padding: 3rem 4rem;
      font-size: 18px;
      line-height: 1.5;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
      max-width: none;
    }

    header {
      margin-bottom: 1.5rem;
    }

    :global(.tiptap) {
      min-height: 400px;
      padding: 1.5rem 1.5rem;
      font-size: 17px;
      line-height: 1.4;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0.25rem;
    }

    :global(.tiptap) {
      min-height: 450px;
      padding: 1.5rem 2rem;
      font-size: 16px;
      line-height: 1.4;
    }
  }

  /* Print styles */
  @media print {
    .dropdown,
    .btn {
      display: none !important;
    }
  }
</style>
