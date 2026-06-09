import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const url = process.argv[2]
const outDir = process.argv[3]
if (!url || !outDir) {
  console.error('Usage: node scripts/screenshot.mjs <url> <outDir>')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

const sizes = [
  { name: 'desktop', w: 1280, h: 800 },
  { name: 'tablet', w: 800, h: 900 },
  { name: 'mobile', w: 375, h: 812 },
]

const browser = await chromium.launch()
try {
  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } })
    await page.goto(url)
    // Optional login (for the React app; the original HTML has no login)
    if (process.env.TEST_EMAIL) {
      if (!process.env.TEST_PASSWORD) {
        console.error('TEST_EMAIL is set but TEST_PASSWORD is missing')
        process.exit(1)
      }
      await page.fill('input[type=email]', process.env.TEST_EMAIL)
      await page.fill('input[type=password]', process.env.TEST_PASSWORD)
      await page.click('button.btn-primary')
      await page.waitForSelector('.stats-grid', { timeout: 10000 })
    }
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${outDir}/list-${s.name}.png`, fullPage: true })
    const card = await page.$('.project-card')
    if (!card) throw new Error(`No .project-card found at ${url} [${s.name}] — seed data first`)
    await card.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${outDir}/detail-${s.name}.png`, fullPage: true })
    await page.close()
  }
} finally {
  await browser.close()
}
console.log('Screenshots saved to', outDir)
