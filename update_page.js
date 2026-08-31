const fs = require('fs');
const file = 'app/chat/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startTarget = `{timeline.map((item, idx) => {`;
const endTarget = `                    })}`;

const startIndex = content.indexOf(startTarget);
const endIndex = content.indexOf(endTarget, startIndex) + endTarget.length;

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find timeline.map block");
  process.exit(1);
}

const mapBody = content.substring(startIndex + startTarget.length, endIndex - endTarget.length);

const renderFunc = `  const renderTimelineItem = (idx: number) => {
    const item = timeline[idx];
    ${mapBody}
  };`;

// Insert the render function right before the return statement of ChatPageContent
// We'll search for `return (` after `const renderTimelineItem = ...`
const returnIndex = content.lastIndexOf('  return (', startIndex);

content = content.slice(0, returnIndex) + renderFunc + '\n\n' + content.slice(returnIndex, startIndex) + 
`<VirtualTimelineList 
                      itemCount={timeline.length} 
                      renderItem={renderTimelineItem} 
                      scrollContainerRef={scrollContainerRef} 
                    />` + content.slice(endIndex);

fs.writeFileSync(file, content);
console.log("Updated page.tsx");
