const sharp = require("sharp");
const fs = require("fs");

(async () => {
    const svg = fs.readFileSync("public/app-icon.svg");
    await sharp(svg, { density: 300 })
        .resize(192, 192)
        .png()
        .toFile("public/app-icon-192.png");
    await sharp(svg, { density: 300 })
        .resize(512, 512)
        .png()
        .toFile("public/app-icon-512.png");
    await sharp(svg, { density: 300 })
        .resize(180, 180)
        .png()
        .toFile("public/apple-touch-icon.png");
    console.log("Icons generated OK");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
