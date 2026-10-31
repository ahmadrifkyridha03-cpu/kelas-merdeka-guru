const fs = require('fs');
const files = ['PRD.md', 'SYSTEM_ARCHITECTURE.md', 'MULTI_AGENT_SPEC.md', 'SKILL_SPECIFICATIONS.md'];

let totalBlocks = 0;
let failedBlocks = 0;

for (const file of files) {
  const content = fs.readFileSync('d:/New folder/' + file, 'utf8');
  const regex = /```json\s*([\s\S]*?)\s*```/g;
  let match;
  let fileCount = 0;
  while ((match = regex.exec(content)) !== null) {
    fileCount++;
    totalBlocks++;
    try {
      JSON.parse(match[1]);
    } catch (e) {
      failedBlocks++;
      console.error(`File ${file} block #${fileCount} failed: ${e.message}`);
      console.error('Snippet: ' + match[1].slice(0, 100) + '...');
    }
  }
  console.log(`${file}: ${fileCount} JSON blocks verified`);
}

console.log(`TOTAL JSON blocks parsed: ${totalBlocks}, Failures: ${failedBlocks}`);
if (failedBlocks > 0) {
  process.exit(1);
} else {
  console.log('SUCCESS: All JSON blocks across all specification files are 100% syntactically valid JSON.');
}
