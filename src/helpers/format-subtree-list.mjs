export function formatSubtreeList({ title, items }) {
  const sortedItems = [...items].sort();
  const lines = [`└── ${title}:`];

  for (const [index, item] of sortedItems.entries()) {
    const isLast = index === sortedItems.length - 1;
    const prefix = isLast ? "└──" : "├──";

    lines.push(`    ${prefix} ${item}`);
  }

  return lines;
}
