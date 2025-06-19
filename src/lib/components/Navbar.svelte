<!-- src/lib/components/Navbar.svelte -->
<script lang="ts">
  import { page } from "$app/stores"
  import { WebsiteName } from "../../config"
  import { Mail, Menu, X } from "lucide-svelte"
  import ThemeSwitch from "$lib/components/ThemeSwitch.svelte"

  // Define navItems if not provided by siteConfig
  const navItems = [
    // { href: "/", label: "Home" },
    // { href: "/blog", label: "Blog" },
    { href: "/contact_us", label: "Contact Us" },
    // { href: "/search", label: "Search" },
    {
      href: "/account",
      label: "Start writing →",
      className: "border border-primary rounded-full ml-4",
    },
  ]

  let mobileMenuOpen = $state(false)

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen
  }

  function closeMobileMenu() {
    mobileMenuOpen = false
  }
</script>

<!-- Add back in top-0 when banner is not there -->
<div
  class="fixed left-0 right-0 z-50 w-full backdrop-blur bg-base-100/70 border-b border-base-300/20"
>
  <nav
    class="navbar container max-w-7xl mx-auto flex justify-between px-4 py-4"
  >
    <a class="font-bold flex items-center gap-2 text-2xl md:text-3xl" href="/">
      <img src="/favicon.png" alt="Logo" class="mr-2 w-8 h-8" />
      {WebsiteName}
    </a>

    <!-- Desktop Menu -->
    <ul class="hidden md:flex items-center space-x-4">
      {#each navItems as item}
        <li>
          <a
            href={item.href}
            class="btn btn-ghost btn-lg rounded-xl transition-all duration-200 hover:bg-base-200 font-semibold text-lg {item.className ||
              ''}"
            class:active={$page?.url?.pathname === item.href}
          >
            {item.label}
          </a>
        </li>
      {/each}
      <!-- Theme Switch -->
      <div class="hidden md:flex ml-2">
        <ThemeSwitch />
      </div>
    </ul>

    <!-- Mobile Menu Button -->
    <div class="md:hidden flex items-center gap-2 order-first">
      <button
        onclick={toggleMobileMenu}
        class="btn btn-ghost btn-circle hover:bg-base-200 transition-colors duration-200"
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}
          <X class="w-5 h-5" />
        {:else}
          <Menu class="w-5 h-5" />
        {/if}
      </button>
    </div>

    <!-- Mobile Theme Switch -->
    <div class="md:hidden">
      <ThemeSwitch />
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  {#if mobileMenuOpen}
    <div
      class="md:hidden fixed inset-0 top-[73px] bg-black/20 backdrop-blur-sm z-40"
      onclick={closeMobileMenu}
      onkeydown={(e) => e.key === "Escape" && closeMobileMenu()}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <!-- Modern Mobile Menu -->
  <div
    class="md:hidden fixed top-[73px] left-0 w-full max-w-sm bg-base-100/95 backdrop-blur-xl border-r border-base-300/30 shadow-2xl z-50 transform transition-transform duration-300 ease-out {mobileMenuOpen
      ? 'translate-x-0'
      : '-translate-x-full'}"
  >
    <div class="flex flex-col p-6 space-y-1">
      <!-- Navigation Items -->
      {#each navItems as item, index}
        <a
          href={item.href}
          onclick={closeMobileMenu}
          class="group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-base-200/70 {$page
            ?.url?.pathname === item.href
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-base-content'}"
          style="animation-delay: {index * 50}ms"
          class:mobile-nav-item-enter={mobileMenuOpen}
        >
          <span class="font-medium text-base"
            >{item.label.replace(" →", "")}</span
          >

          <!-- Active indicator -->
          {#if $page?.url?.pathname === item.href}
            <div class="w-2 h-2 bg-primary rounded-full"></div>
          {:else}
            <svg
              class="w-4 h-4 text-base-content/40 group-hover:text-base-content/70 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          {/if}
        </a>
      {/each}

      <!-- Divider -->
      <div class="border-t border-base-300/30"></div>

      <!-- Additional Actions -->
      <a
        href="/contact_us"
        onclick={closeMobileMenu}
        class="group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-base-200/70 {$page
          ?.url?.pathname === '/contact_us'
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-base-content'}"
        style="animation-delay: {navItems.length * 50}ms"
        class:mobile-nav-item-enter={mobileMenuOpen}
      >
        <div class="flex items-center gap-2">
          <Mail
            class="w-5 h-5 text-base-content/40 group-hover:text-base-content/70 transition-colors"
          />
          <span class="font-medium text-base">Get Support</span>
        </div>

        <!-- Active indicator -->
        {#if $page?.url?.pathname === "/contact_us"}
          <div class="w-2 h-2 bg-primary rounded-full"></div>
        {:else}
          <svg
            class="w-4 h-4 text-base-content/40 group-hover:text-base-content/70 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        {/if}
      </a>

      <!-- Footer -->
      <div class="pt-4 border-t border-base-300/30">
        <p class="text-xs text-base-content/50 text-center">
          © {new Date().getFullYear()}
          {WebsiteName}
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .mobile-nav-item-enter {
    animation: slideInFromLeft 0.3s ease-out forwards;
    opacity: 0;
    transform: translateX(-20px);
  }

  @keyframes slideInFromLeft {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Smooth backdrop blur enhancement */
  .fixed[class*="backdrop-blur"] {
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
</style>
