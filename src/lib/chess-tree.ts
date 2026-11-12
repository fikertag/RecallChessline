import { Chess } from "chess.js";
import { MoveNode, Study, MoveAnnotation } from "@/types/chess";

export const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function generateNodeId(): string {
  return "node_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
}

/**
 * Returns the path of MoveNodes from root to the given target node.
 */
export function getLineToNode(study: Study, targetNodeId: string | null): MoveNode[] {
  if (!targetNodeId || !study.nodes[targetNodeId]) {
    return [];
  }

  const line: MoveNode[] = [];
  let curr: MoveNode | undefined = study.nodes[targetNodeId];

  while (curr) {
    line.unshift(curr);
    if (!curr.parentId) break;
    curr = study.nodes[curr.parentId];
  }

  return line;
}

/**
 * Gets the FEN after the given node, or startingFen if node is null.
 */
export function getFenAtNode(study: Study, nodeId: string | null): string {
  if (!nodeId || !study.nodes[nodeId]) {
    return study.startingFen || STARTING_FEN;
  }
  return study.nodes[nodeId].fen;
}

/**
 * Adds a move to the study's move tree.
 * If the exact move already exists as a child of the parent, returns the existing node ID.
 * Otherwise creates a new branch and links it.
 */
export function addMoveToTree(
  study: Study,
  parentId: string | null,
  moveInput: { from: string; to: string; promotion?: string }
): { updatedStudy: Study; nodeId: string; isNewBranch: boolean } {
  const currentFen = getFenAtNode(study, parentId);
  const chess = new Chess(currentFen);

  // Validate legal move
  const moveRes = chess.move({
    from: moveInput.from,
    to: moveInput.to,
    promotion: moveInput.promotion || "q",
  });

  if (!moveRes) {
    throw new Error(`Illegal move: ${moveInput.from} to ${moveInput.to}`);
  }

  const resultingFen = chess.fen();
  const uci = `${moveRes.from}${moveRes.to}${moveRes.promotion || ""}`;

  // Check if this move already exists under parent
  const existingChildIds = parentId ? study.nodes[parentId]?.children || [] : study.rootNodeIds;
  for (const childId of existingChildIds) {
    const existingNode = study.nodes[childId];
    if (existingNode && (existingNode.uci === uci || existingNode.san === moveRes.san)) {
      return { updatedStudy: study, nodeId: childId, isNewBranch: false };
    }
  }

  // Create new node
  const newNodeId = generateNodeId();
  const turn = moveRes.color;
  // Compute move number: in chess FEN, the 6th token is fullmove number
  const fullmoveNumber = parseInt(currentFen.split(" ")[5] || "1", 10);

  const newNode: MoveNode = {
    id: newNodeId,
    parentId,
    children: [],
    san: moveRes.san,
    uci,
    from: moveRes.from,
    to: moveRes.to,
    promotion: moveRes.promotion,
    fen: resultingFen,
    turn,
    moveNumber: fullmoveNumber,
    comment: "",
    annotation: "",
  };

  const newNodes = { ...study.nodes, [newNodeId]: newNode };
  let newRootNodeIds = [...study.rootNodeIds];

  if (!parentId) {
    newRootNodeIds.push(newNodeId);
  } else {
    const parentNode = study.nodes[parentId];
    if (parentNode) {
      newNodes[parentId] = {
        ...parentNode,
        children: [...parentNode.children, newNodeId],
      };
    }
  }

  const updatedStudy: Study = {
    ...study,
    rootNodeIds: newRootNodeIds,
    nodes: newNodes,
    updatedAt: new Date().toISOString(),
  };

  return { updatedStudy, nodeId: newNodeId, isNewBranch: true };
}

/**
 * Recursively deletes a node and all of its descendants from the tree.
 */
export function deleteNodeAndSubtree(
  study: Study,
  nodeIdToDelete: string
): { updatedStudy: Study; fallbackNodeId: string | null } {
  if (!study.nodes[nodeIdToDelete]) {
    return { updatedStudy: study, fallbackNodeId: null };
  }

  const nodeToDelete = study.nodes[nodeIdToDelete];
  const fallbackNodeId = nodeToDelete.parentId;

  // Collect all descendants to delete
  const idsToDelete = new Set<string>();
  function collectDescendants(id: string) {
    idsToDelete.add(id);
    const node = study.nodes[id];
    if (node) {
      node.children.forEach(collectDescendants);
    }
  }
  collectDescendants(nodeIdToDelete);

  // Filter out nodes
  const newNodes: Record<string, MoveNode> = {};
  for (const [id, node] of Object.entries(study.nodes)) {
    if (!idsToDelete.has(id)) {
      newNodes[id] = node;
    }
  }

  // Remove from parent's children list
  if (fallbackNodeId && newNodes[fallbackNodeId]) {
    newNodes[fallbackNodeId] = {
      ...newNodes[fallbackNodeId],
      children: newNodes[fallbackNodeId].children.filter((cid) => cid !== nodeIdToDelete),
    };
  }

  // Remove from rootNodeIds if needed
  const newRootNodeIds = study.rootNodeIds.filter((rid) => !idsToDelete.has(rid));

  const updatedStudy: Study = {
    ...study,
    rootNodeIds: newRootNodeIds,
    nodes: newNodes,
    updatedAt: new Date().toISOString(),
  };

  return { updatedStudy, fallbackNodeId };
}

/**
 * Updates metadata for a specific node (comment, annotation, timestamp).
 */
export function updateNodeMetadata(
  study: Study,
  nodeId: string,
  updates: { comment?: string; annotation?: MoveAnnotation; videoTimestamp?: number }
): Study {
  const existingNode = study.nodes[nodeId];
  if (!existingNode) return study;

  return {
    ...study,
    nodes: {
      ...study.nodes,
      [nodeId]: {
        ...existingNode,
        ...updates,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export interface VariationLine {
  id: string;
  name: string;
  shortName: string;
  moves: MoveNode[];
  nodeIds: string[];
  length: number;
  lastMoveSan: string;
}

export function formatMovesToSanLine(moves: MoveNode[]): string {
  if (moves.length === 0) return "Starting Position";
  return moves
    .map((m) => (m.turn === "w" ? `${m.moveNumber}. ${m.san}` : `${m.san}`))
    .join(" ");
}

/**
 * Extracts all complete paths from root to leaf nodes in the study tree.
 */
export function getAllVariationLines(study: Study): VariationLine[] {
  const lines: VariationLine[] = [];

  function traverse(nodeId: string, currentPath: MoveNode[]) {
    const node = study.nodes[nodeId];
    if (!node) return;

    const newPath = [...currentPath, node];

    if (node.children.length === 0) {
      const name = formatMovesToSanLine(newPath);
      const lastFew = newPath.slice(-2);
      const shortName = formatMovesToSanLine(lastFew);
      lines.push({
        id: node.id,
        name,
        shortName,
        moves: newPath,
        nodeIds: newPath.map((m) => m.id),
        length: newPath.length,
        lastMoveSan: node.san,
      });
    } else {
      for (const childId of node.children) {
        traverse(childId, newPath);
      }
    }
  }

  for (const rootId of study.rootNodeIds) {
    traverse(rootId, []);
  }

  return lines;
}

/**
 * Gets the longest variation line (deepest branch) in the study.
 */
export function getLongestVariationLine(study: Study): VariationLine | null {
  const lines = getAllVariationLines(study);
  if (lines.length === 0) return null;
  return lines.reduce((prev, curr) => (curr.length > prev.length ? curr : prev), lines[0]);
}

/**
 * Gets a random variation line from the study.
 */
export function getRandomVariationLine(study: Study): VariationLine | null {
  const lines = getAllVariationLines(study);
  if (lines.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
}

/**
 * Finds a specific variation line by its leaf node ID.
 */
export function getVariationLineById(study: Study, leafId: string): VariationLine | null {
  const lines = getAllVariationLines(study);
  return lines.find((l) => l.id === leafId) || null;
}

/**
 * Computes opening tree statistics: variation count (leaf nodes), total moves, and max depth.
 */
export function getTreeStatistics(study: Study): {
  totalNodes: number;
  totalVariations: number;
  maxDepth: number;
} {
  const totalNodes = Object.keys(study.nodes).length;
  let totalVariations = 0;
  let maxDepth = 0;

  function traverse(nodeId: string, depth: number) {
    if (depth > maxDepth) maxDepth = depth;
    const node = study.nodes[nodeId];
    if (!node) return;

    if (node.children.length === 0) {
      totalVariations++;
    } else {
      for (const childId of node.children) {
        traverse(childId, depth + 1);
      }
    }
  }

  for (const rootId of study.rootNodeIds) {
    traverse(rootId, 1);
  }

  return {
    totalNodes,
    totalVariations: totalVariations === 0 && totalNodes > 0 ? 1 : totalVariations,
    maxDepth,
  };
}

/**
 * Exports a study's move tree into standard PGN format with recursive variations and comments.
 */
export function exportStudyToPgn(study: Study): string {
  const tags = [
    `[Event "${study.name}"]`,
    `[Site "LearnChess Platform"]`,
    `[Date "${new Date(study.createdAt || Date.now()).toISOString().split("T")[0]}"]`,
    `[White "${study.color === "white" ? "User Repertoire" : study.openingName}"]`,
    `[Black "${study.color === "black" ? "User Repertoire" : study.openingName}"]`,
    `[Result "*"]`,
    `[Opening "${study.openingName}"]`,
  ];

  if (study.startingFen && study.startingFen !== STARTING_FEN) {
    tags.push(`[SetUp "1"]`);
    tags.push(`[FEN "${study.startingFen}"]`);
  }

  function serializeNode(nodeId: string, isVariation = false): string {
    const node = study.nodes[nodeId];
    if (!node) return "";

    let text = "";
    if (node.turn === "w") {
      text += `${node.moveNumber}. ${node.san}`;
    } else {
      text += isVariation ? `${node.moveNumber}... ${node.san}` : `${node.san}`;
    }

    if (node.annotation) {
      text += node.annotation;
    }

    if (node.comment) {
      text += ` { ${node.comment} }`;
    }

    if (node.children.length === 0) {
      return text;
    }

    // Main continuation
    const mainChildId = node.children[0];
    const sideVariations = node.children.slice(1);

    const mainText = serializeNode(mainChildId, false);
    const sideTexts = sideVariations
      .map((sid) => `(${serializeNode(sid, true)})`)
      .join(" ");

    return [text, sideTexts, mainText].filter(Boolean).join(" ");
  }

  const movesText = study.rootNodeIds.map((rid) => serializeNode(rid, false)).join("\n\n");

  return `${tags.join("\n")}\n\n${movesText} *`;
}

