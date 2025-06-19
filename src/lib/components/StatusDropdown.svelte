<!-- src/lib/components/StatusDropdown.svelte -->
<script context="module" lang="ts">
  /** The six possible statuses */
  export type Status =
    | "not-started"
    | "in-progress"
    | "finished"
    | "polished"
    | "submitted"
    | "scrapped"
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import { ChevronDown } from "lucide-svelte"

  const dispatch = createEventDispatcher()

  // Props
  export let currentStatus: Status = "not-started"
  export let disabled = false
  export let size: "xs" | "sm" | "md" | "lg" = "md"

  // State for controlling dropdown visibility
  let isOpen = false
  let dropdownElement: HTMLElement

  // Configuration for each status
  const statusConfig: Record<
    Status,
    { label: string; colorClass: string; badgeClass: string }
  > = {
    "not-started": {
      label: "Not Started",
      colorClass: "btn-ghost text-base-content",
      badgeClass: "badge-ghost",
    },
    "in-progress": {
      label: "In Progress",
      colorClass: "btn-warning",
      badgeClass: "badge-warning",
    },
    finished: {
      label: "Finished",
      colorClass: "btn-success",
      badgeClass: "badge-success",
    },
    polished: {
      label: "Polished",
      colorClass: "btn-info",
      badgeClass: "badge-info",
    },
    submitted: {
      label: "Submitted",
      colorClass: "btn-primary",
      badgeClass: "badge-primary",
    },
    scrapped: {
      label: "Scrapped",
      colorClass: "btn-error",
      badgeClass: "badge-error",
    },
  }

  // All possible status keys
  const statusOptions = Object.keys(statusConfig) as Status[]

  // Map size prop to DaisyUI size classes
  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  }

  function toggleDropdown(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    isOpen = !isOpen
  }

  function handleStatusChange(newStatus: Status, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    if (newStatus !== currentStatus) {
      currentStatus = newStatus
      dispatch("statusChange", {
        status: newStatus,
        label: statusConfig[newStatus].label,
      })
    }
    isOpen = false // Close dropdown after selection
  }

  function handleClickOutside(event: Event) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false
    }
  }

  // Setup click outside listener
  onMount(() => {
    const handleClick = (event: Event) => handleClickOutside(event)
    const handleKey = (event: KeyboardEvent) => handleKeydown(event)

    document.addEventListener("click", handleClick, true)
    document.addEventListener("touchstart", handleClick, true)
    document.addEventListener("keydown", handleKey)

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("touchstart", handleClick, true)
      document.removeEventListener("keydown", handleKey)
    }
  })

  // Reactive values
  $: currentConfig = statusConfig[currentStatus]
  $: buttonClasses = `${currentConfig.colorClass} ${sizeClasses[size]}`
</script>

<div class="relative" bind:this={dropdownElement}>
  <!-- Trigger button -->
  <button
    type="button"
    class="btn btn-soft btn-sm md:btn-md w-20 md:w-45 {buttonClasses} gap-2 rounded-full"
    {disabled}
    on:click={toggleDropdown}
    on:touchstart={toggleDropdown}
    tabindex="0"
    aria-haspopup="true"
    aria-expanded={isOpen}
    title={currentConfig.label}
  >
    <div class="badge {currentConfig.badgeClass} badge-sm">
      <div class="w-2 h-2 rounded-full bg-current opacity-80"></div>
    </div>
    <span class="font-medium hidden md:inline">{currentConfig.label}</span>
    <div class="transition-transform duration-200" class:rotate-180={isOpen}>
      <ChevronDown size={16} class="opacity-60" />
    </div>
  </button>

  <!-- Dropdown menu -->
  {#if isOpen}
    <div
      class="absolute top-full left-0 mt-2 w-44 md:w-52 bg-base-100 rounded-box shadow-lg border border-base-300 p-1 md:p-2 z-50"
      in:slide={{ duration: 200 }}
      out:slide={{ duration: 200 }}
      role="menu"
    >
      {#each statusOptions as status}
        {@const cfg = statusConfig[status]}
        <button
          type="button"
          class="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-colors hover:bg-base-200 text-sm md:text-base {status ===
          currentStatus
            ? 'bg-base-200 font-semibold'
            : ''}"
          on:click={(e) => handleStatusChange(status, e)}
          on:touchstart={(e) => handleStatusChange(status, e)}
          {disabled}
          role="menuitem"
        >
          <div class="badge {cfg.badgeClass} badge-xs md:badge-sm">
            <div
              class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-current opacity-80"
            ></div>
          </div>
          <span class="flex-1 text-left">{cfg.label}</span>
          {#if status === currentStatus}
            <svg
              class="w-3 h-3 md:w-4 md:h-4 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
                   011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Ensure proper touch handling on mobile */
  button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Lift on hover for non-touch devices */
  @media (hover: hover) {
    button:hover {
      transform: translateY(-1px);
    }
  }

  /* Ensure the dropdown appears above other elements */
  .z-50 {
    z-index: 50;
  }
</style>
