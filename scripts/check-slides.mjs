import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-chromium'

const source = await readFile(new URL('../slides.md', import.meta.url), 'utf8')
const markerCount = source
  .split(/\r?\n/)
  .filter((line) => line.trim() === '---').length
const slideCount = Math.floor(markerCount / 2)
const baseUrl = process.env.SLIDEV_URL ?? 'http://127.0.0.1:3030'
const outputDir = new URL('../artifacts/screenshots/', import.meta.url)

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const problems = []

for (let slide = 1; slide <= slideCount; slide += 1) {
  await page.goto(`${baseUrl}/${slide}?t=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1_000)
  const file = new URL(`slide-${String(slide).padStart(2, '0')}.png`, outputDir)
  await page.screenshot({ path: file.pathname })

  const issues = await page.evaluate(() => {
    const root = document.querySelector('.slidev-layout')
    if (!(root instanceof HTMLElement)) return ['slide root not found']
    const bounds = root.getBoundingClientRect()
    const found = []

    for (const element of root.querySelectorAll('*')) {
      if (!(element instanceof HTMLElement || element instanceof SVGElement)) continue
      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      if (element.closest('.slidev-code-copy')) continue
      const rect = element.getBoundingClientRect()
      if (rect.width < 4 || rect.height < 4) continue
      const outside =
        rect.left < bounds.left - 4 ||
        rect.right > bounds.right + 4 ||
        rect.top < bounds.top - 4 ||
        rect.bottom > bounds.bottom + 4
      if (!outside) continue
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
      if (text) found.push(`outside canvas: ${text}`)
      if (found.length >= 4) break
    }
    return found
  })

  if (issues.length > 0) problems.push({ slide, issues })
  console.log(issues.length === 0 ? `ok ${slide}` : `check ${slide}: ${issues.join(' | ')}`)
}

await writeFile(
  new URL('../artifacts/slide-check.json', import.meta.url),
  JSON.stringify({ slideCount, problems }, null, 2),
)
await browser.close()

if (problems.length > 0) process.exitCode = 1
