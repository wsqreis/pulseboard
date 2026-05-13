import createClient from 'openapi-fetch'

import type { paths } from '@pulseboard/contracts/src/schema'

import { API_BASE_URL } from '../env'

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
})
