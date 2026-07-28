import 'react-native-url-polyfill/auto'

import {
  createClient,
  SupabaseAuthAdapter,
} from '@neondatabase/neon-js'

const authUrl =
  process.env.EXPO_PUBLIC_NEON_AUTH_URL

const dataApiUrl =
  process.env.EXPO_PUBLIC_NEON_DATA_API_URL

if (!authUrl || !dataApiUrl) {
  throw new Error(
    'Hiányzik az EXPO_PUBLIC_NEON_AUTH_URL vagy az EXPO_PUBLIC_NEON_DATA_API_URL.'
  )
}

// The export name stays "supabase" temporarily so the existing screens can
// migrate without a risky, all-at-once rewrite. The implementation is Neon.
export const supabase = createClient({
  auth: {
    adapter: SupabaseAuthAdapter(),
    url: authUrl,
    allowAnonymous: true,
  },
  dataApi: {
    url: dataApiUrl,
    options: {
      db: {
        schema: 'public',
      },
    },
  },
})
