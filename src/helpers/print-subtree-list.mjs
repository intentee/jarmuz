import { formatSubtreeList } from "./format-subtree-list.mjs";

/**
 * @param {import("./format-subtree-list.mjs").SubtreeList} subtreeList
 */
export function printSubtreeList({ title, items }) {
  for (const line of formatSubtreeList({ title, items })) {
    console.log(line);
  }
}
