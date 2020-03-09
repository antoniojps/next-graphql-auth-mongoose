// jest.setup.js
import { setConfig } from 'next/config'
import { serverRuntimeConfig } from './next.config'

// Make sure you can use "serverRuntimeConfig" within tests.
setConfig({ serverRuntimeConfig })
