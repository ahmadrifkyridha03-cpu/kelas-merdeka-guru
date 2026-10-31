const fs = require('fs');

const content = fs.readFileSync('d:/New folder/SKILL_SPECIFICATIONS.md', 'utf8');
const regex = /```ya?ml\s*([\s\S]*?)\s*```/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  count++;
  const block = match[1];
  const nameMatch = block.match(/name:\s*([^\r\n]+)/);
  const descMatch = block.match(/description:\s*([^\r\n]+)/);
  console.log(`Skill #${count}: ${nameMatch ? nameMatch[1].trim() : 'Unknown'}`);
  console.log(`  Description: ${descMatch ? descMatch[1].trim() : 'N/A'}`);
}
