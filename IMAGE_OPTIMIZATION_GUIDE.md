# Image Optimization Guide

## Overview
This guide helps you optimize images for the blog to achieve the **377 KB savings** identified by PageSpeed Insights.

---

## 🎯 Goal
Convert all images to modern formats (WebP/AVIF) and properly size them to reduce bandwidth and improve load times.

---

## 📊 Image Format Comparison

| Format | File Size | Browser Support | Quality |
|--------|-----------|-----------------|---------|
| **JPEG/PNG** | 100% (baseline) | ✅ Universal | Good |
| **WebP** | ~30% smaller | ✅ 95%+ | Excellent |
| **AVIF** | ~50% smaller | ⚠️ 88%+ | Excellent |

---

## 🛠️ Optimization Methods

### Method 1: Online Tools (Easiest)

**Squoosh (Recommended)**
1. Visit: https://squoosh.app/
2. Drag & drop your image
3. Choose format:
   - **WebP** (best compatibility)
   - **AVIF** (best compression)
4. Adjust quality (75-85 recommended)
5. Download optimized image

**TinyPNG**
1. Visit: https://tinypng.com/
2. Upload up to 20 images at once
3. Download compressed files
4. ~50-70% size reduction

---

### Method 2: Command Line (Batch Processing)

#### Install Tools
```bash
# macOS
brew install webp imagemagick

# Ubuntu/Debian
sudo apt-get install webp imagemagick

# Windows (via Chocolatey)
choco install webp imagemagick
```

#### Convert to WebP
```bash
# Single image
cwebp -q 80 input.jpg -o output.webp

# Batch convert all JPGs in a folder
for file in *.jpg; do
  cwebp -q 80 "$file" -o "${file%.jpg}.webp"
done

# Batch convert all PNGs
for file in *.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

#### Resize Large Images
```bash
# Resize to max width 1200px (maintaining aspect ratio)
convert input.jpg -resize 1200x output.jpg

# Batch resize
for file in *.jpg; do
  convert "$file" -resize 1200x "resized_$file"
done
```

---

### Method 3: Node.js Script (Automated)

Create `scripts/optimize-images.js`:

```javascript
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const inputDir = 'public/images';
const outputDir = 'public/images/optimized';

async function optimizeImages() {
  const files = await readdir(inputDir);
  
  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    
    const inputPath = join(inputDir, file);
    const outputName = file.replace(/\.(jpe?g|png)$/i, '');
    
    // Generate WebP
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(outputDir, `${outputName}.webp`));
    
    // Generate AVIF (optional, for best compression)
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .avif({ quality: 70 })
      .toFile(join(outputDir, `${outputName}.avif`));
    
    console.log(`✓ Optimized: ${file}`);
  }
}

optimizeImages();
```

Install dependencies and run:
```bash
npm install -D sharp
node scripts/optimize-images.js
```

---

## 🖼️ Implementing Optimized Images in Blog

### Using the `<picture>` Element (Best Practice)

```tsx
<picture>
  {/* Modern formats (loaded first if supported) */}
  <source srcSet="/images/hero.avif" type="image/avif" />
  <source srcSet="/images/hero.webp" type="image/webp" />
  
  {/* Fallback for older browsers */}
  <img 
    src="/images/hero.jpg" 
    alt="Hero image"
    width="1200"
    height="630"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### Responsive Images (Multiple Sizes)

```tsx
<picture>
  {/* Mobile */}
  <source 
    media="(max-width: 640px)" 
    srcSet="/images/hero-mobile.webp" 
    type="image/webp" 
  />
  
  {/* Tablet */}
  <source 
    media="(max-width: 1024px)" 
    srcSet="/images/hero-tablet.webp" 
    type="image/webp" 
  />
  
  {/* Desktop */}
  <source 
    srcSet="/images/hero-desktop.webp" 
    type="image/webp" 
  />
  
  <img 
    src="/images/hero.jpg" 
    alt="Hero image"
    width="1200"
    height="630"
    loading="lazy"
  />
</picture>
```

---

## ✅ Best Practices Checklist

### Always Include:
- ✅ **Width & Height**: Prevents layout shift
- ✅ **Alt text**: Accessibility & SEO
- ✅ **loading="lazy"**: Defer off-screen images
- ✅ **decoding="async"**: Non-blocking decode

### Image Dimensions:
```tsx
// ✅ Good - Prevents CLS
<img src="photo.jpg" width="800" height="600" alt="..." />

// ❌ Bad - Causes layout shift
<img src="photo.jpg" alt="..." />
```

### Lazy Loading:
```tsx
// ✅ Lazy load below-fold images
<img src="photo.jpg" loading="lazy" alt="..." />

// ✅ Eager load above-fold images (LCP element)
<img src="hero.jpg" loading="eager" fetchPriority="high" alt="..." />
```

---

## 📐 Recommended Image Sizes

| Use Case | Max Width | Quality | Format |
|----------|-----------|---------|--------|
| **Hero/Banner** | 1920px | 80% | WebP |
| **Blog Content** | 1200px | 75-80% | WebP |
| **Thumbnails** | 600px | 75% | WebP |
| **Icons/Logos** | SVG preferred | N/A | SVG |
| **Profile Photos** | 400px | 80% | WebP |

---

## 🚀 Quick Wins

### 1. Optimize Existing Images
```bash
cd public/images
for img in *.{jpg,png}; do
  cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

### 2. Update Image References
Replace:
```tsx
<img src="/images/photo.jpg" alt="..." />
```

With:
```tsx
<picture>
  <source srcSet="/images/photo.webp" type="image/webp" />
  <img src="/images/photo.jpg" alt="..." width="800" height="600" loading="lazy" />
</picture>
```

### 3. Verify Savings
- Before: Check file size in Finder/Explorer
- After: Compare with optimized version
- Target: **50-70% reduction** for most images

---

## 🔍 Testing

### Check Optimization:
```bash
# Compare file sizes
ls -lh public/images/*.{jpg,webp}

# Expected: WebP should be 30-50% smaller
```

### Verify in Browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Check "Type" column (should show "webp" or "avif")
5. Check "Size" column (should be significantly smaller)

---

## 📊 Expected Results

### Before Optimization:
```
hero.jpg     377 KB
photo1.jpg   245 KB
photo2.png   189 KB
-----------------------
Total:       811 KB
```

### After Optimization:
```
hero.webp    113 KB (70% smaller)
photo1.webp   74 KB (70% smaller)
photo2.webp   57 KB (70% smaller)
-----------------------
Total:       244 KB (70% reduction = 567 KB saved!)
```

---

## 🆘 Troubleshooting

**Images not showing:**
- Check file paths are correct
- Ensure WebP files are in `/public/images/`
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

**Quality too low:**
- Increase quality setting (`-q 85` for cwebp)
- Try AVIF instead of WebP (better quality at same size)

**Browser compatibility:**
- Always provide fallback formats
- Use `<picture>` element with multiple sources
- Test in older browsers (Safari 13-, IE11)

---

## 📚 Resources

- [Squoosh - Image Optimizer](https://squoosh.app/)
- [TinyPNG - PNG/JPG Compressor](https://tinypng.com/)
- [WebP Official Docs](https://developers.google.com/speed/webp)
- [Sharp - Node.js Image Processing](https://sharp.pixelplumbing.com/)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

## ✅ Action Items

1. [ ] Audit all images in `/public/images/`
2. [ ] Convert to WebP using preferred method
3. [ ] Update image references to use `<picture>` element
4. [ ] Add width/height to all images
5. [ ] Add `loading="lazy"` to below-fold images
6. [ ] Test on slow connection (DevTools Network throttling)
7. [ ] Re-run PageSpeed Insights
8. [ ] Verify 377 KB savings achieved

---

Generated: December 16, 2025

