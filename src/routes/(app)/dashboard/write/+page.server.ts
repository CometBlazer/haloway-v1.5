// src/routes/(admin)/account/(menu)/write/+page.server.ts
import { error, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { supabase } from "$lib/supabase"

export const actions = {
  default: async ({ locals }) => {
    const session = locals.session
    if (!session) {
      throw error(401, "Unauthorized")
    }

    // Create a new document
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        title: "[List your school here and name your essay]",
        user_id: session.user.id,
      })
      .select()
      .single()

    if (documentError) {
      throw error(500, "Failed to create document")
    }

    // Create initial version
    const { data: version, error: versionError } = await supabase
      .from("document_versions")
      .insert({
        document_id: document.id,
        version_name: "Version 1",
        content: "",
        created_by: session.user.id,
      })
      .select()
      .single()

    if (versionError) {
      throw error(500, "Failed to create initial version")
    }

    // Redirect to the new document
    throw redirect(303, `/account/write/${document.id}/${version.id}`)
  },
} satisfies Actions
