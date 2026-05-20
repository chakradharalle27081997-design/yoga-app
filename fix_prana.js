const fs = require('fs');
let code = fs.readFileSync('lib/pdfExport.js', 'utf8');

const newPrana = `<!-- Pranayama compact -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
      <div style="background:#E1F5EE;border:1px solid #1D9E75;border-radius:8px;padding:8px 12px;">
        <div style="font-size:11px;font-weight:700;color:#0F6E56;margin-bottom:5px;">🌬️ Recommended Pranayamas</div>
        <ol style="padding-left:16px;margin:0;">\${pranayamaList || '<li style="font-size:11px;color:#0F6E56;">As advised</li>'}</ol>
      </div>
      <div style="background:#FEE2E2;border:1px solid #FCA5A5;border-radius:8px;padding:8px 12px;">
        <div style="font-size:11px;font-weight:700;color:#DC2626;margin-bottom:5px;">⚠️ Not Recommended</div>
        <ul style="padding-left:16px;margin:0;">\${safetyList || '<li style="font-size:11px;color:#DC2626;">None</li>'}</ul>
      </div>
    </div>
    <!-- Footer -->`;

const pattern = /<!-- Pranayama section -->[\s\S]*?<!-- Footer -->/;
if (pattern.test(code)) {
  code = code.replace(pattern, newPrana);
  console.log('Pranayama replaced successfully');
} else {
  console.log('Pattern not found - check comments in pdfExport.js');
}

fs.writeFileSync('lib/pdfExport.js', code);
console.log('Done');
