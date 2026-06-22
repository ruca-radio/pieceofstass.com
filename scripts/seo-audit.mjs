import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const reportFile = path.join(__dirname, '../docs/seo/audit-report.md');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function auditHtml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(content);
  
  const issues = [];
  
  // Title
  const title = $('title').text();
  if (!title) {
    issues.push('Missing <title>');
  } else if (title.length > 60) {
    issues.push(`Title too long (${title.length} chars > 60)`);
  }
  
  // Description
  const description = $('meta[name="description"]').attr('content');
  if (!description) {
    issues.push('Missing meta description');
  } else if (description.length > 160) {
    issues.push(`Description too long (${description.length} chars > 160)`);
  }
  
  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    issues.push('Missing canonical link');
  }
  
  // H1
  const h1s = $('h1');
  if (h1s.length === 0) {
    issues.push('Missing <h1>');
  } else if (h1s.length > 1) {
    issues.push(`Multiple <h1> tags (${h1s.length} found)`);
  }
  
  // OG Image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (!ogImage) {
    issues.push('Missing og:image');
  }
  
  // Schema.org
  const scripts = $('script[type="application/ld+json"]');
  if (scripts.length === 0) {
    issues.push('Missing JSON-LD schema');
  } else {
    try {
      let hasProduct = false;
      scripts.each((i, el) => {
        const json = JSON.parse($(el).html());
        const schemas = Array.isArray(json) ? json : [json];
        for (const schema of schemas) {
          if (schema['@type'] === 'Product') hasProduct = true;
        }
      });
      
      // PDP specific check
      if (filePath.includes('/shop/') && !filePath.endsWith('shop/index.html') && filePath.split('/').length > filePath.indexOf('shop') + 2) {
         if (!hasProduct) issues.push('PDP missing Product schema');
      }
    } catch (e) {
      issues.push(`Invalid JSON-LD schema: ${e.message}`);
    }
  }

  return {
    path: filePath.replace(distDir, ''),
    title,
    issues
  };
}

function runAudit() {
  console.log('Running SEO audit on dist/ directory...');
  const results = {
    homepage: [],
    plp: [],
    pdp: [],
    other: []
  };
  
  walkDir(distDir, (filePath) => {
    if (!filePath.endsWith('.html')) return;
    
    const relPath = filePath.replace(distDir, '');
    const audit = auditHtml(filePath);
    
    if (relPath === '/index.html') {
      results.homepage.push(audit);
    } else if (relPath === '/shop/index.html' || (relPath.startsWith('/shop/') && relPath.split('/').length === 4)) {
      results.plp.push(audit);
    } else if (relPath.startsWith('/shop/') && relPath.split('/').length > 4) {
      results.pdp.push(audit);
    } else {
      results.other.push(audit);
    }
  });
  
  // Generate markdown report
  let md = '# Piece of Stass SEO Audit Report\n\n';
  md += `*Generated: ${new Date().toISOString()}*\n\n`;
  
  for (const [category, audits] of Object.entries(results)) {
    md += `## ${category.toUpperCase()} (${audits.length} pages)\n`;
    let categoryIssues = 0;
    
    audits.forEach(a => {
      if (a.issues.length > 0) {
        md += `- **[FAIL]** \`${a.path}\`\n`;
        a.issues.forEach(issue => {
          md += `  - ${issue}\n`;
        });
        categoryIssues++;
      }
    });
    
    if (categoryIssues === 0 && audits.length > 0) {
      md += `✅ All pages passed!\n\n`;
    } else {
      md += `\n`;
    }
  }
  
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, md);
  
  console.log(`Audit complete! Report saved to ${reportFile}`);
}

runAudit();
