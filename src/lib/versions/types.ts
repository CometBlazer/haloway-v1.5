// 📁 src/lib/versions/types.ts
import type { ComponentVersion } from "../../DatabaseDefinitions"

export interface VersionCallbacks {
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onNavigate: (path: string) => void
}

export interface CreateVersionResponse {
  type: string
  data?: { version: ComponentVersion }
}
