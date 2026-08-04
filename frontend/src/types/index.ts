export type BlockType = 'theory_markdown' | 'interactive_fill_blank' | 'interactive_scenario';

export interface BaseBlock {
  type: BlockType;
  imagePrompt?: string; // AI generated prompt for dynamic illustration
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

export type Block = TheoryBlock | FillBlankBlock | ScenarioBlock;
