export type ChessColor = 'white' | 'black';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type MoveAnnotation = '!' | '!!' | '!?' | '?' | '??' | '?!' | '' | undefined;

export interface MoveNode {
  id: string;
  parentId: string | null;
  children: string[];
  san: string;
  uci: string;
  from: string;
  to: string;
  promotion?: string;
  fen: string;
  turn: 'w' | 'b';
  moveNumber: number;
  comment?: string;
  annotation?: MoveAnnotation;
  videoTimestamp?: number;
  // Position review metrics
  correctCount?: number;
  incorrectCount?: number;
  lastTrained?: string;
}

export interface Study {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  color: ChessColor;
  openingName: string;
  startingFen: string;
  rootNodeIds: string[];
  nodes: Record<string, MoveNode>;
  videoUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastStudiedAt?: string;
}

export interface TrainingMistake {
  fen: string;
  expectedSan: string;
  playedSan: string;
  nodeId: string;
  comment?: string;
}

export interface TrainingSession {
  _id: string;
  userId: string;
  studyId: string;
  studyName?: string;
  mode: 'guided' | 'recall';
  color: ChessColor;
  movesTested: number;
  correctMoves: number;
  incorrectMoves: number;
  accuracy: number;
  completed: boolean;
  mistakes: TrainingMistake[];
  durationSeconds: number;
  createdAt: string;
}

export interface TrainingStats {
  totalStudies: number;
  totalVariations: number;
  totalSessions: number;
  overallAccuracy: number;
  totalMovesPracticed: number;
  recentSessions: TrainingSession[];
  studiesNeedingRevision: Array<{
    study: Study;
    accuracy: number;
    lastTrained?: string;
  }>;
}

export interface BoardPreferences {
  boardTheme: 'classic' | 'wood' | 'green' | 'blue' | 'glass';
  pieceSet: 'standard' | 'cburnett' | 'merida';
  soundEnabled: boolean;
  showCoordinates: boolean;
  autoFlip: boolean;
}
