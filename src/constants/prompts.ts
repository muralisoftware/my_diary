export interface WritingPrompt {
  id: string;
  category: 'gratitude' | 'reflection' | 'mindfulness' | 'creativity' | 'growth';
  prompt: string;
  starter: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'p1',
    category: 'gratitude',
    prompt: 'What is a small, quiet moment that brought you joy today?',
    starter: 'Today, I found myself smiling when...',
  },
  {
    id: 'p2',
    category: 'reflection',
    prompt: 'What was the most challenging part of today, and what did it teach you?',
    starter: 'Looking back on today, the hardest moment was...',
  },
  {
    id: 'p3',
    category: 'mindfulness',
    prompt: 'How does your body and mind feel right now in this exact moment?',
    starter: 'Right now, as I sit to write, I feel...',
  },
  {
    id: 'p4',
    category: 'growth',
    prompt: 'What is something you handled better today than you would have a year ago?',
    starter: 'I noticed some personal growth today because...',
  },
  {
    id: 'p5',
    category: 'gratitude',
    prompt: 'Who is someone you are thankful for today, and why?',
    starter: 'I am especially grateful for...',
  },
  {
    id: 'p6',
    category: 'creativity',
    prompt: 'If today was a chapter in a book, what title would you give it?',
    starter: 'Chapter title: ',
  },
  {
    id: 'p7',
    category: 'reflection',
    prompt: 'What is one thing you want to let go of before you go to sleep tonight?',
    starter: 'Tonight, I am consciously releasing...',
  },
  {
    id: 'p8',
    category: 'growth',
    prompt: 'What is one promise you want to make to yourself for tomorrow?',
    starter: 'Tomorrow, my gentle intention is to...',
  },
];

export const getRandomPrompt = (): WritingPrompt => {
  const index = Math.floor(Math.random() * WRITING_PROMPTS.length);
  return WRITING_PROMPTS[index];
};
