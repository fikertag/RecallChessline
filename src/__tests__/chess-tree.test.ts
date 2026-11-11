import { describe, it, expect } from "vitest";
import {
  addMoveToTree,
  deleteNodeAndSubtree,
  getLineToNode,
  getFenAtNode,
  exportStudyToPgn,
  getTreeStatistics,
  updateNodeMetadata,
  STARTING_FEN,
} from "@/lib/chess-tree";
import { Study } from "@/types/chess";
import {
  initTrainingState,
  testUserMove,
  getOpponentMove,
} from "@/lib/training-engine";

function createEmptyTestStudy(): Study {
  return {
    _id: "test_study_1",
    userId: "test_user_1",
    name: "Test Italian Game",
    openingName: "Italian Game",
    color: "white",
    startingFen: STARTING_FEN,
    rootNodeIds: [],
    nodes: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Chess Move Tree Architecture", () => {
  it("creates root move and correctly sets node properties", () => {
    let study = createEmptyTestStudy();

    // 1. e4
    const res = addMoveToTree(study, null, { from: "e2", to: "e4" });
    study = res.updatedStudy;

    expect(study.rootNodeIds.length).toBe(1);
    const rootNode = study.nodes[study.rootNodeIds[0]];
    expect(rootNode.san).toBe("e4");
    expect(rootNode.uci).toBe("e2e4");
    expect(rootNode.turn).toBe("w");
    expect(rootNode.moveNumber).toBe(1);
    expect(rootNode.parentId).toBeNull();
  });

  it("adds sequential moves along a single line", () => {
    let study = createEmptyTestStudy();

    // 1. e4
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    study = m1.updatedStudy;

    // 1... e5
    const m2 = addMoveToTree(study, m1.nodeId, { from: "e7", to: "e5" });
    study = m2.updatedStudy;

    // 2. Nf3
    const m3 = addMoveToTree(study, m2.nodeId, { from: "g1", to: "f3" });
    study = m3.updatedStudy;

    expect(study.rootNodeIds.length).toBe(1);
    const line = getLineToNode(study, m3.nodeId);
    expect(line.length).toBe(3);
    expect(line.map((m) => m.san)).toEqual(["e4", "e5", "Nf3"]);
  });

  it("supports branching: creates multiple opponent variations from the same position", () => {
    let study = createEmptyTestStudy();

    // 1. e4 e5 2. Nf3
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    const m2 = addMoveToTree(m1.updatedStudy, m1.nodeId, { from: "e7", to: "e5" });
    const m3 = addMoveToTree(m2.updatedStudy, m2.nodeId, { from: "g1", to: "f3" });
    study = m3.updatedStudy;

    // Branch 1: 2... Nc6
    const b1 = addMoveToTree(study, m3.nodeId, { from: "b8", to: "c6" });
    study = b1.updatedStudy;

    // Branch 2: 2... Nf6 (Petrov Defense)
    const b2 = addMoveToTree(study, m3.nodeId, { from: "g8", to: "f6" });
    study = b2.updatedStudy;

    // Branch 3: 2... d6 (Philidor Defense)
    const b3 = addMoveToTree(study, m3.nodeId, { from: "d7", to: "d6" });
    study = b3.updatedStudy;

    const parentNode = study.nodes[m3.nodeId];
    expect(parentNode.children.length).toBe(3);
    expect(parentNode.children).toContain(b1.nodeId);
    expect(parentNode.children).toContain(b2.nodeId);
    expect(parentNode.children).toContain(b3.nodeId);

    // Verify existing move does not create duplicate
    const duplicateAttempt = addMoveToTree(study, m3.nodeId, { from: "b8", to: "c6" });
    expect(duplicateAttempt.isNewBranch).toBe(false);
    expect(duplicateAttempt.nodeId).toBe(b1.nodeId);
    expect(study.nodes[m3.nodeId].children.length).toBe(3);
  });

  it("safely deletes a variation and its entire subtree without corrupting other branches", () => {
    let study = createEmptyTestStudy();

    // 1. e4 e5 2. Nf3
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    const m2 = addMoveToTree(m1.updatedStudy, m1.nodeId, { from: "e7", to: "e5" });
    const m3 = addMoveToTree(m2.updatedStudy, m2.nodeId, { from: "g1", to: "f3" });
    study = m3.updatedStudy;

    // Branch 1: 2... Nc6 3. Bc4
    const b1 = addMoveToTree(study, m3.nodeId, { from: "b8", to: "c6" });
    const b1Cont = addMoveToTree(b1.updatedStudy, b1.nodeId, { from: "f1", to: "c4" });
    study = b1Cont.updatedStudy;

    // Branch 2: 2... Nf6 3. Nxe5
    const b2 = addMoveToTree(study, m3.nodeId, { from: "g8", to: "f6" });
    const b2Cont = addMoveToTree(b2.updatedStudy, b2.nodeId, { from: "f3", to: "e5" });
    study = b2Cont.updatedStudy;

    expect(Object.keys(study.nodes).length).toBe(7);

    // Delete Branch 2 (2... Nf6 and its child 3. Nxe5)
    const delResult = deleteNodeAndSubtree(study, b2.nodeId);
    study = delResult.updatedStudy;

    expect(delResult.fallbackNodeId).toBe(m3.nodeId);
    expect(study.nodes[b2.nodeId]).toBeUndefined();
    expect(study.nodes[b2Cont.nodeId]).toBeUndefined();

    // Verify Branch 1 is fully intact
    expect(study.nodes[b1.nodeId]).toBeDefined();
    expect(study.nodes[b1Cont.nodeId]).toBeDefined();
    expect(study.nodes[m3.nodeId].children).toEqual([b1.nodeId]);
  });

  it("updates and persists annotations and comments", () => {
    let study = createEmptyTestStudy();
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    study = m1.updatedStudy;

    study = updateNodeMetadata(study, m1.nodeId, {
      annotation: "!",
      comment: "Controls center and opens lines.",
      videoTimestamp: 125,
    });

    const updatedNode = study.nodes[m1.nodeId];
    expect(updatedNode.annotation).toBe("!");
    expect(updatedNode.comment).toBe("Controls center and opens lines.");
    expect(updatedNode.videoTimestamp).toBe(125);
  });

  it("computes accurate tree statistics (variations count and max depth)", () => {
    let study = createEmptyTestStudy();
    // 1. e4 e5 2. Nf3 (Nc6 | Nf6)
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    const m2 = addMoveToTree(m1.updatedStudy, m1.nodeId, { from: "e7", to: "e5" });
    const m3 = addMoveToTree(m2.updatedStudy, m2.nodeId, { from: "g1", to: "f3" });
    const b1 = addMoveToTree(m3.updatedStudy, m3.nodeId, { from: "b8", to: "c6" });
    const b2 = addMoveToTree(b1.updatedStudy, m3.nodeId, { from: "g8", to: "f6" });
    study = b2.updatedStudy;

    const stats = getTreeStatistics(study);
    expect(stats.totalNodes).toBe(5);
    expect(stats.totalVariations).toBe(2);
    expect(stats.maxDepth).toBe(4);
  });

  it("exports tree to valid branching PGN string", () => {
    let study = createEmptyTestStudy();
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    const m2 = addMoveToTree(m1.updatedStudy, m1.nodeId, { from: "e7", to: "e5" });
    const m3 = addMoveToTree(m2.updatedStudy, m2.nodeId, { from: "g1", to: "f3" });
    const b1 = addMoveToTree(m3.updatedStudy, m3.nodeId, { from: "b8", to: "c6" });
    const b2 = addMoveToTree(b1.updatedStudy, m3.nodeId, { from: "g8", to: "f6" });
    study = b2.updatedStudy;

    const pgn = exportStudyToPgn(study);
    expect(pgn).toContain('[Event "Test Italian Game"]');
    expect(pgn).toContain("1. e4 e5 2. Nf3");
    expect(pgn).toContain("Nc6");
    expect(pgn).toContain("(2... Nf6)");
  });
});

describe("Training Engine Logic", () => {
  it("initializes training state and tests user move correctly", () => {
    let study = createEmptyTestStudy();
    // White repertoire: 1. e4 e5 2. Nf3
    const m1 = addMoveToTree(study, null, { from: "e2", to: "e4" });
    const m2 = addMoveToTree(m1.updatedStudy, m1.nodeId, { from: "e7", to: "e5" });
    const m3 = addMoveToTree(m2.updatedStudy, m2.nodeId, { from: "g1", to: "f3" });
    study = m3.updatedStudy;

    const state = initTrainingState(study, "guided");
    expect(state.isUserTurn).toBe(true);
    expect(state.movesTested).toBe(0);

    // Play correct move: 1. e4
    const res1 = testUserMove(state, { from: "e2", to: "e4" });
    expect(res1.isCorrect).toBe(true);
    expect(res1.newState.correctMoves).toBe(1);
    expect(res1.newState.isUserTurn).toBe(false);

    // Opponent makes response
    const oppRes = getOpponentMove(res1.newState);
    expect(oppRes.node?.san).toBe("e5");
    expect(oppRes.newState.isUserTurn).toBe(true);

    // Test incorrect user move (e.g. 2. f4 instead of 2. Nf3)
    const resMistake = testUserMove(oppRes.newState, { from: "f2", to: "f4" });
    expect(resMistake.isCorrect).toBe(false);
    expect(resMistake.newState.incorrectMoves).toBe(1);
    expect(resMistake.newState.mistakes.length).toBe(1);
    expect(resMistake.newState.mistakes[0].playedSan).toBe("f4");
    expect(resMistake.newState.mistakes[0].expectedSan).toContain("Nf3");
  });
});
