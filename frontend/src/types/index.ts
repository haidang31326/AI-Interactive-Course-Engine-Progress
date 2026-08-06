export type BlockType = 'theory_markdown' | 'interactive_fill_blank' | 'interactive_scenario' | 'interactive_code_editor' | 'interactive_drag_drop';

export interface BaseBlock {
  type: BlockType;
  referenceLink?: string; // AI generated related reference link
}

export interface TheoryBlock extends BaseBlock {
  type: 'theory_markdown';
  content: string;
}

export interface FillBlankBlock extends BaseBlock {
  type: 'interactive_fill_blank';
  questionText: string;
  correctAnswers: Record<string, string>;
  hints?: string[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ScenarioBlock extends BaseBlock {
  type: 'interactive_scenario';
  scenarioDescription: string;
  options: Option[];
  explanation: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'interactive_code_editor';
  problemStatement: string;
  startingCode: string;
  expectedCode: string;
  language: string;
  hints?: string[];
}

export interface DragDropBlock extends BaseBlock {
  type: 'interactive_drag_drop';
  instruction: string;
  categories: string[];
  items: { id: string; text: string; correctCategory: string }[];
}

export type Block = TheoryBlock | FillBlankBlock | ScenarioBlock | CodeBlock | DragDropBlock;

export interface User {
  id: number;
  username: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  currentStepIndex: number;
  userId?: number;
  isPublic?: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  blocks: Block[];
}

export interface Highlight {
  id?: number;
  userId: number;
  courseId: number;
  text: string;
  color?: string;
  note?: string;
}
