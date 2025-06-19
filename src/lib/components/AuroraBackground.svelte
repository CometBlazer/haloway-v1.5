<script lang="ts">
  import { onMount } from "svelte"

  export let showRadialGradient: boolean = true
  export let className: string = ""

  let mounted = false

  onMount(() => {
    mounted = true
  })
</script>

<main>
  <div
    class="relative flex flex-col h-screen items-center justify-center bg-base-100 text-base-content transition-colors {className}"
  >
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="aurora-gradient {showRadialGradient ? 'radial-mask' : ''}"
        class:animate-aurora={mounted}
      ></div>
    </div>
    <slot />
  </div>
</main>

<style>
  .aurora-gradient {
    --white-gradient: repeating-linear-gradient(
      100deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.95) 7%,
      transparent 10%,
      transparent 12%,
      rgba(255, 255, 255, 0.9) 16%
    );
    --dark-gradient: repeating-linear-gradient(
      100deg,
      #000000 0%,
      #000000 7%,
      transparent 10%,
      transparent 12%,
      #000000 16%
    );
    --aurora: repeating-linear-gradient(
      100deg,
      #ff6b9d 5%,
      #a88bfe 15%,
      #4ecdc4 25%,
      #feca57 35%,
      #ff9ff3 45%,
      #54a0ff 55%,
      #a88bfe 65%
    );

    background-image: var(--white-gradient), var(--aurora);
    background-size: 350%, 250%;
    background-position:
      50% 50%,
      50% 50%;
    filter: blur(12px) saturate(1.4);
    pointer-events: none;
    position: absolute;
    inset: -10px;
    opacity: 0.5;
    will-change: transform;
  }

  :global(html.dark) .aurora-gradient {
    background-image: var(--dark-gradient), var(--aurora);
    opacity: 0.6;
    filter: blur(12px) saturate(1.2);
  }

  .aurora-gradient::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--white-gradient), var(--aurora);
    background-size: 200%, 150%;
    background-attachment: fixed;
    mix-blend-mode: color-dodge;
    animation: aurora-glow 20s ease-in-out infinite alternate;
    opacity: 0.6;
  }

  :global(html.dark) .aurora-gradient::after {
    background-image: var(--dark-gradient), var(--aurora);
    mix-blend-mode: difference;
  }

  .radial-mask {
    mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
  }

  .animate-aurora {
    animation: aurora 150s linear infinite;
  }

  @keyframes aurora {
    from {
      background-position:
        50% 50%,
        50% 50%;
    }
    to {
      background-position:
        400% 50%,
        350% 50%;
    }
  }

  @keyframes aurora-glow {
    0% {
      opacity: 0.4;
      filter: hue-rotate(0deg);
    }
    50% {
      opacity: 0.7;
      filter: hue-rotate(15deg);
    }
    100% {
      opacity: 0.4;
      filter: hue-rotate(0deg);
    }
  }

  /* Light mode specific enhancements */
  @media (prefers-color-scheme: light) {
    .aurora-gradient {
      filter: blur(12px) saturate(4) brightness(1.2) contrast(1.4);
      opacity: 0.85;
    }

    .aurora-gradient::after {
      opacity: 0.9;
      filter: hue-rotate(0deg) saturate(3);
    }
  }
</style>
