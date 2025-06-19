export function printSubtreeList({ title, items }) {
  console.log(`└── ${title}:`);

  items.sort();

  for (const [index, item] of items.entries()) {
    const isLast = index === items.length - 1;
    const prefix = isLast ? "└──" : "├──";

    console.log(`    ${prefix} ${item}`);
  }
}
