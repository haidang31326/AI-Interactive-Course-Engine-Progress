const fs = require('fs');
let content = fs.readFileSync('/home/dane/ai-interactive-course-engine/frontend/src/components/Dashboard.tsx', 'utf8');
console.log(content.substring(400, 800));
