const fs = require('fs');

// Simple 10x10 red PNG image
const pngData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mP8z8DwnwEJMDKgAiYGVAAAJdgD/c3LMPMAAAAASUVORK5CYII=',
  'base64'
);

fs.writeFileSync('test-front.png', pngData);
console.log('Test image created: test-front.png');
