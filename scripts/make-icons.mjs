import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const html = (size) => `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; }
  .icon {
    width: ${size}px; height: ${size}px;
    background: #2B5CE6;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: ${Math.round(size * 0.52)}px;
    color: white;
    letter-spacing: -0.02em;
  }
</style></head><body><div class="icon">P</div></body></html>`

const browser = await chromium.launch()
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } })
    await page.setContent(html(size))
    await page.waitForTimeout(600) // font load
    await page.screenshot({ path: `public/icons/icon-${size}.png` })
    await page.close()
  }
} finally {
  await browser.close()
}
console.log('Icons generated')
