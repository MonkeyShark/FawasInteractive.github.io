const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Load layout template
const template = fs.readFileSync('template-blog.html', 'utf8');

// Recursively walk through all .md files
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const filePath = path.join(dir, f);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, callback);
    } else if (path.extname(filePath) === '.md') {
      callback(filePath);
    }
  });
}

// Ensure output directory exists
if (!fs.existsSync('./news')) fs.mkdirSync('./news', { recursive: true });

// Process all markdown files
walk('./news-markdown', function(filePath) {
  console.log(`Processing: ${filePath}`);

  // Read file content
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const lines = rawContent.trim().split('\n');

  // Parse front matter
  if (lines[0].trim() !== '===') {
    console.warn(`⚠️ No front matter found in ${filePath}`);
    return;
  }

  let delimiterIndex = 1;
  while (delimiterIndex < lines.length && lines[delimiterIndex].trim() !== '===') {
    delimiterIndex++;
  }

  if (delimiterIndex >= lines.length) {
    console.warn(`⚠️ Invalid front matter in ${filePath}`);
    return;
  }

  const frontMatterLines = lines.slice(1, delimiterIndex).filter(line => line.trim());
  const frontMatter = {};

  frontMatterLines.forEach(line => {
    const [key, ...rest] = line.split(':').map(s => s.trim());
    if (key) frontMatter[key] = rest.join(': ').trim();
  });

  // Extract body content
  const markdownBody = lines.slice(delimiterIndex + 1).join('\n').trim();
  const htmlContent = marked.parse(markdownBody);

  // Build output path
  const relativePath = filePath.replace(/^news-markdown[\\/]/, '');
  const outPath = path.join('./news', relativePath.replace(/\.md$/, '.html'));

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Inject into template
  let finalHtml = template
    .replace(/{{title}}/g, frontMatter['title'] || 'Untitled')
    .replace(/{{tags}}/g, frontMatter['tags'] || 'News')
    .replace(/{{date}}/g, frontMatter['date'] || 'Unknown Date')
    .replace(/{{time}}/g, frontMatter['time'] || 'Unknown Time')
    .replace(/{{thumbnail}}/g, frontMatter['thumbnail'] || '/images/Blogs/TestBlogPost/clown-clear-logo.png')
    .replace(/{{content}}/g, htmlContent);

  fs.writeFileSync(outPath, finalHtml);
  console.log(`✅ Created: ${outPath}`);
});