const fs = require('fs');

const content = fs.readFileSync('d:/New folder/MULTI_AGENT_SPEC.md', 'utf8');
const agentMatches = content.match(/### Agent \d+:[^\r\n]+/g) || content.match(/## 2\.\d+ [^\r\n]+/g);

console.log('Agent Sections Found:');
if (agentMatches) {
  agentMatches.forEach(m => console.log('  ' + m));
} else {
  console.log('Searching for agent headings...');
  const lines = content.split('\n');
  lines.filter(l => l.startsWith('## ') || l.startsWith('### ')).slice(0, 30).forEach(l => console.log('  ' + l));
}
