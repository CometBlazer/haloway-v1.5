<script lang="ts">
  import { WebsiteName } from "../../config"
  import { Mail } from "lucide-svelte"
</script>

<div class="border-t w-full border-neutral">
  <footer class="px-6 py-8 md:py-12 max-w-6xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
      <!-- Brand Section - full width on small mobile, half on larger mobile -->
      <div class="col-span-2 md:col-span-1 my-5 md:my-0">
        <a href="/" class="flex flex-col space-y-4">
          <img
            src="/favicon.png"
            alt="Logo"
            class="w-12 h-12 md:w-20 md:h-20"
          />
          <span class="text-2xl font-bold">{WebsiteName}</span>
          <p class="text-lg text-neutral-content">Where great essays begin.</p>
        </a>
      </div>

      <!-- Navigation Sections - each takes half the width on mobile -->
      <div class="space-y-3">
        <h3 class="font-semibold">Product</h3>
        <ul class="space-y-2">
          <li>
            <a href="/pricing" class="text-sm hover:underline">Pricing</a>
          </li>
          <li>
            <a href="/account" class="text-sm hover:underline">Account</a>
          </li>
          <!-- <li><a href="/" class="text-sm hover:underline">Search</a></li> -->
        </ul>
      </div>

      <div class="space-y-3">
        <h3 class="font-semibold">Company</h3>
        <ul class="space-y-2">
          <li>
            <a href="/blog" class="text-sm hover:underline">Blog</a>
          </li>
          <li>
            <a href="/contact_us" class="text-sm hover:underline">Contact</a>
          </li>
          <li>
            <!-- <a href="/" class="text-sm hover:underline">Careers</a> -->
          </li>
        </ul>
      </div>

      <div class="space-y-3">
        <h3 class="font-semibold">Legal</h3>
        <ul class="space-y-2">
          <li>
            <a href="/legal/privacy" class="text-sm hover:underline"
              >Privacy Policy</a
            >
          </li>
          <li>
            <a href="/legal/terms" class="text-sm hover:underline"
              >Terms of Service</a
            >
          </li>
          <li>
            <!-- <a href="/" class="text-sm hover:underline">Cookie Policy</a> -->
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom Section with Socials and Copyright -->
    <div
      class="flex flex-col md:flex-row justify-between items-center mt-8 md:mt-12 pt-6 border-t border-neutral"
    >
      <p class="text-sm text-neutral-content mb-4 md:mb-0">
        © {new Date().getFullYear()}
        {WebsiteName}. All rights reserved. Illustrations from
        <a
          href="https://popsy.co/illustrations"
          target="_blank"
          class="underline">Popsy</a
        >.
        <br />
      </p>

      <div class="flex items-center space-x-4">
        <a
          href="https://instagram.com/unibooth_ai"
          target="_blank"
          class="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          aria-label="Instagram"
        >
          <!-- Instagram SVG -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <a
          href="https://linkedin.com/company/your-company"
          target="_blank"
          class="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          aria-label="LinkedIn"
        >
          <!-- LinkedIn SVG -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
            ></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
        <a
          href="mailto:unibooth.business@gmail.com"
          target="_blank"
          class="p-2 rounded-full hover:bg-muted transition-colors duration-200"
          aria-label="Email"
        >
          <Mail class="w-5 h-5" />
        </a>
      </div>
    </div>
  </footer>
</div>
