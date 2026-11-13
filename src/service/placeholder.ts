import { getServerContext } from 'dsh-h3/utils'
import { server } from '../server'
import { defineService } from '../utils/service'

export const placeholder = defineService({
  get: () => {
    const _ctx = getServerContext(server)
  },
})
