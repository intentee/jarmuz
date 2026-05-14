import { formatSubtreeList } from "./format-subtree-list.mjs";

export function printSubtreeList({ title, items }) {
  for (const line of formatSubtreeList({ title, items })) {
    console.log(line);
  }
}
