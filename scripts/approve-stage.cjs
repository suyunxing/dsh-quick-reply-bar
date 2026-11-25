// Approve a staged npm publish through the web 2FA flow (passkey friendly).
// The npm CLI refuses the web flow when stdin is not a TTY, so drive the
// same endpoints directly: POST /-/stage/<id>/approve -> EOTP with authUrl +
// doneUrl, poll doneUrl until it returns a token, retry with npm-otp.
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { exec } = require('node:child_process')

const NPM_ROOT = 'C:/Program Files/nodejs/node_modules/npm/node_modules'
const fetch = require(`${NPM_ROOT}/npm-registry-fetch`)

const STAGE_ID = process.argv[2]
const REGISTRY = 'https://registry.npmjs.org/'
const LOG = path.join(os.tmpdir(), 'qrb-approve-progress.log')
const MAX_WAIT_MS = 10 * 60 * 1000

fs.writeFileSync(LOG, '')
const say = (...parts) => {
  const line = `[${new Date().toISOString()}] ${parts.join(' ')}`
  fs.appendFileSync(LOG, line + '\n')
  console.log(line)
}

const readToken = () => {
  const rc = path.join(os.homedir(), '.npmrc')
  const text = fs.readFileSync(rc, 'utf8')
  const m = text.match(/\/\/registry\.npmjs\.org\/:_authToken\s*=\s*(\S+)/)
  if (!m) throw new Error('no npmjs token in ~/.npmrc')
  return m[1]
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const main = async () => {
  const token = readToken()
  const opts = {
    registry: REGISTRY,
    token,
    proxy: process.env.HTTPS_PROXY,
    timeout: 60000,
    retry: { retries: 0 },
  }
  const approve = (extra = {}) =>
    fetch(`/-/stage/${STAGE_ID}/approve`, { ...opts, ...extra, method: 'POST' })

  say('POST approve stage', STAGE_ID)
  let res
  try {
    res = await approve()
    say('approved without challenge:', res.status)
    say('DONE')
    return
  } catch (err) {
    const body = err.body || {}
    say('challenge:', err.code, err.statusCode || err.statusCode === 0 ? '' : '')
    if (!body.authUrl || !body.doneUrl) {
      say('no authUrl in body; body keys =', Object.keys(body).join(','))
      say('message:', err.message)
      say('FAILED')
      return
    }
    say('AUTH_URL ' + body.authUrl)
    say('opening browser…')
    exec(`start "" "${body.authUrl}"`, { shell: 'cmd.exe' })

    const deadline = Date.now() + MAX_WAIT_MS
    let otp = null
    while (Date.now() < deadline) {
      const r = await fetch(body.doneUrl, { registry: REGISTRY, token, timeout: 60000 })
      if (r.status === 200) {
        const content = await r.json()
        otp = content.token
        say('challenge solved, got otp')
        break
      }
      if (r.status !== 202) {
        say('unexpected done status', r.status)
        break
      }
      await sleep(2000)
    }
    if (!otp) {
      say('TIMEOUT waiting for approval')
      say('FAILED')
      return
    }
    const ok = await approve({ headers: { 'npm-otp': otp } })
    const out = await ok.json().catch(() => null)
    say('approve retried:', ok.status, JSON.stringify(out))
    say('DONE')
  }
}

main().catch((e) => {
  say('ERROR', e && e.message)
  say('FAILED')
})
