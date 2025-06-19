<!-- src/lib/components/Banner.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { browser } from "$app/environment"

  /**
   * text: the main banner copy
   * showBullets: whether to render the pulsing dots
   */
  export let text: string
  export let showBullets: boolean = true

  let bannerEl: HTMLElement
  let ro: ResizeObserver | undefined

  onMount(() => {
    // Only run in browser environment and if ResizeObserver is available
    if (browser && typeof ResizeObserver !== "undefined" && bannerEl) {
      try {
        // whenever the banner resizes, update --banner-height on <html>
        ro = new ResizeObserver((entries) => {
          if (entries && entries[0] && entries[0].contentRect) {
            const h = entries[0].contentRect.height
            document.documentElement.style.setProperty(
              "--banner-height",
              `${h}px`,
            )
          }
        })
        ro.observe(bannerEl)
      } catch (error) {
        console.warn("ResizeObserver failed to initialize:", error)
      }
    }
  })

  onDestroy(() => {
    // Only disconnect if ro exists and we're in browser
    if (browser && ro && typeof ro.disconnect === "function") {
      try {
        ro.disconnect()
      } catch (error) {
        console.warn("ResizeObserver failed to disconnect:", error)
      }
    }
  })
</script>

<div
  bind:this={bannerEl}
  class="fixed banner-container top-0 left-0 right-0 z-50"
>
  <div
    class="glass-banner relative overflow-hidden backdrop-blur-3xl
           bg-base-100/70 text-base-content text-center py-1.5 md:py-3
           px-4 text-xs md:text-sm font-medium"
  >
    <!-- subtle blurred gradient glows behind -->
    <div
      class="absolute top-1/2 left-[calc(50%-20rem)] w-[36rem] h-[18rem]
             -translate-y-1/2 transform rotate-[30deg]
             bg-gradient-to-r from-pink-500/20 to-purple-500/20
             blur-[60px] pointer-events-none"
      aria-hidden="true"
    ></div>

    <div
      class="absolute top-1/2 right-[calc(50%-20rem)] w-[36rem] h-[18rem]
             -translate-y-1/2 transform rotate-[60deg]
             bg-gradient-to-r from-pink-500/20 to-purple-500/20
             blur-[60px] pointer-events-none"
      aria-hidden="true"
    ></div>

    <div class="flex items-center justify-center space-x-2 relative">
      {#if showBullets}
        <div
          class="w-2 h-2 bg-base-content/70 rounded-full animate-pulse"
        ></div>
      {/if}

      <span class="font-semibold tracking-wide">{text}</span>

      {#if showBullets}
        <div
          class="w-2 h-2 bg-base-content/70 rounded-full animate-pulse"
          style="animation-delay: 0.5s"
        ></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .glass-banner::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    animation: shimmer 3s infinite;
  }

  .glass-banner::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
</style>
