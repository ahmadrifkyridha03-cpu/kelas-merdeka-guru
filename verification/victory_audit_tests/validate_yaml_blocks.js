const fs = require('fs');

const content = fs.readFileSync('d:/New folder/SKILL_SPECIFICATIONS.md', 'utf8');
const regex = /```ya?ml\s*([\s\S]*?)\s*```/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  count++;
  console.log(`YAML block ${count}: length = ${match[1].length} chars`);
}
console.log(`Total YAML blocks in SKILL_SPECIFICATIONS.md: ${count}`);
