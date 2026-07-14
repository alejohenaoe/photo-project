import sharp from 'sharp'
import { readdir, unlink } from 'fs/promises'
import { join, extname } from 'path'

const INPUT_DIR = join(process.cwd(), 'public', 'imagenes')
const MAX_WIDTH = 1920
const QUALITY = 80

async function optimizeImages() {
  const files = await readdir(INPUT_DIR)

  const jpgFiles = files.filter(f =>
    extname(f).toLowerCase() === '.jpg' && f !== 'neftali-portrait.jpg'
  )

  if (jpgFiles.length === 0) {
    console.log('No JPG files to optimize')
    return
  }

  for (const file of jpgFiles) {
    const inputPath = join(INPUT_DIR, file)
    const outputFile = file.replace(/\.jpg$/i, '.webp')
    const outputPath = join(INPUT_DIR, outputFile)

    console.log(`Optimizing: ${file}`)

    const metadata = await sharp(inputPath).metadata()
    const resizeOptions = metadata.width > MAX_WIDTH
      ? { width: MAX_WIDTH, withoutEnlargement: true }
      : {}

    await sharp(inputPath)
      .resize(resizeOptions)
      .webp({ quality: QUALITY })
      .toFile(outputPath)

    const stats = await sharp(outputPath).metadata()
    const inputSize = (await sharp(inputPath).metadata()).density
    console.log(`  → ${outputFile} (${stats.width}x${stats.height})`)

    await unlink(inputPath)
    console.log(`  → Deleted original: ${file}`)
  }

  console.log('\nDone! All images optimized to WebP.')
}

optimizeImages().catch(console.error)
