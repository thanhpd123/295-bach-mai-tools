const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Nguồn chân lý (single source of truth) cho icon app nằm trong assets/.
// public/ chỉ chứa output được sinh ra từ file nguồn này.
const SOURCE = "assets/chu-tro-app-icon.svg";
const OUT_DIR = "public";

(async () => {
    // 1. Copy SVG nguồn vào public để serve ở đường dẫn /app-icon.svg
    fs.copyFileSync(SOURCE, path.join(OUT_DIR, "app-icon.svg"));

    // 2. Sinh các kích thước PNG từ SVG nguồn
    const svg = fs.readFileSync(SOURCE);
    await sharp(svg, { density: 300 })
        .resize(192, 192)
        .png()
        .toFile(path.join(OUT_DIR, "app-icon-192.png"));
    await sharp(svg, { density: 300 })
        .resize(512, 512)
        .png()
        .toFile(path.join(OUT_DIR, "app-icon-512.png"));
    await sharp(svg, { density: 300 })
        .resize(180, 180)
        .png()
        .toFile(path.join(OUT_DIR, "apple-touch-icon.png"));
    console.log("Icons generated OK");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
