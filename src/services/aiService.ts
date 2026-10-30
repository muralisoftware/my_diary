import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiReflection, AiSettings, DiaryEntry, MindfulDigest, MoodType } from '../types/diary';

const AI_SETTINGS_STORAGE_KEY = '@personal_diary_ai_settings_v1';

const DEFAULT_AI_SETTINGS: AiSettings = {
  isEnabled: true,
  provider: 'offline', // default 100% on-device private
  apiKey: '',
  autoDetectMood: true,
  modelName: 'gemini-1.5-flash',
};

// Emotion vocabulary for offline on-device sentiment & tag analysis
const MOOD_LEXICON: Record<MoodType, string[]> = {
  happy: [
    'happy', 'joy', 'smile', 'laugh', 'grateful', 'blessed', 'delight', 'wonderful',
    'sunshine', 'content', 'fun', 'celebrate', 'love', 'pleasant', 'proud', 'good',
    'fantastic', 'cheerful', 'thankful', 'peace', 'warmth', 'friend', 'family',
  ],
  calm: [
    'calm', 'peace', 'quiet', 'relax', 'serene', 'breathe', 'gentle', 'still',
    'nature', 'walk', 'tea', 'rest', 'soothing', 'tranquil', 'centered', 'mindful',
    'slow', 'meditate', 'morning', 'lake', 'trees', 'balance', 'steady',
  ],
  excited: [
    'excited', 'thrilled', 'amazing', 'breakthrough', 'energized', 'idea', 'success',
    'achieved', 'win', 'start', 'adventure', 'passionate', 'eager', 'inspired',
    'can\'t wait', 'proud', 'milestone', 'opportunity', 'creative',
  ],
  neutral: [
    'okay', 'fine', 'ordinary', 'routine', 'normal', 'usual', 'day', 'work',
    'meeting', 'regular', 'average', 'task', 'chores', 'errands', 'steady',
  ],
  sad: [
    'sad', 'lonely', 'miss', 'cry', 'tears', 'heavy', 'hurt', 'pain', 'disappointed',
    'lost', 'grief', 'empty', 'down', 'gloomy', 'sorry', 'heartbroken', 'regret',
  ],
  stressed: [
    'stressed', 'anxious', 'overwhelmed', 'tired', 'exhausted', 'deadline', 'pressure',
    'hectic', 'rush', 'busy', 'headache', 'worry', 'panic', 'tension', 'frustrated',
    'hard', 'struggle', 'mess', 'chaos', 'burnout',
  ],
};

const TOPIC_TAG_RULES: { tag: string; keywords: string[] }[] = [
  { tag: 'gratitude', keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'gift', 'kindness'] },
  { tag: 'mindfulness', keywords: ['breathe', 'present', 'mindful', 'calm', 'meditate', 'peace', 'listen', 'quiet'] },
  { tag: 'career', keywords: ['work', 'project', 'job', 'office', 'code', 'client', 'meeting', 'deadline', 'colleague'] },
  { tag: 'nature', keywords: ['walk', 'trees', 'park', 'sun', 'sky', 'rain', 'lake', 'water', 'mountain', 'air', 'flowers'] },
  { tag: 'relationships', keywords: ['friend', 'family', 'partner', 'talk', 'dinner', 'together', 'mom', 'dad', 'sister', 'brother'] },
  { tag: 'health', keywords: ['sleep', 'workout', 'gym', 'food', 'body', 'walk', 'tired', 'energy', 'healthy', 'meal'] },
  { tag: 'creativity', keywords: ['wrote', 'music', 'art', 'idea', 'design', 'build', 'read', 'book', 'craft', 'poetry'] },
  { tag: 'growth', keywords: ['learned', 'realized', 'improve', 'better', 'habit', 'practice', 'lesson', 'patience'] },
];

export const aiService = {
  async getSettings(): Promise<AiSettings> {
    try {
      const raw = await AsyncStorage.getItem(AI_SETTINGS_STORAGE_KEY);
      if (!raw) return DEFAULT_AI_SETTINGS;
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  },

  async saveSettings(settings: AiSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AI settings:', e);
      throw e;
    }
  },

  // 1. On-device smart mood and tags detector
  detectMoodAndTags(content: string, title: string = ''): { mood: MoodType; tags: string[]; confidence: number } {
    const text = `${title} ${content}`.toLowerCase();
    const scores: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      excited: 0,
      neutral: 1, // baseline
      sad: 0,
      stressed: 0,
    };

    // Calculate score per mood
    for (const [moodKey, keywords] of Object.entries(MOOD_LEXICON) as [MoodType, string[]][]) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          scores[moodKey] += 1;
        }
      }
    }

    // Determine highest scoring mood
    let bestMood: MoodType = 'calm';
    let highestScore = -1;
    for (const [m, score] of Object.entries(scores) as [MoodType, number][]) {
      if (score > highestScore) {
        highestScore = score;
        bestMood = m;
      }
    }

    // Extract tags
    const detectedTags: string[] = [];
    for (const rule of TOPIC_TAG_RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw) && !detectedTags.includes(rule.tag)) {
          detectedTags.push(rule.tag);
          break;
        }
      }
    }

    const confidence = Math.min(100, Math.round((highestScore / 5) * 100));

    return {
      mood: bestMood,
      tags: detectedTags.slice(0, 4),
      confidence,
    };
  },

  // 2. Empathetic companion reflection
  async getReflection(entry: DiaryEntry): Promise<AiReflection> {
    const settings = await this.getSettings();

    // If cloud provider configured, attempt LLM call
    if (settings.provider === 'gemini' && settings.apiKey.trim()) {
      try {
        const cloudResult = await callGeminiReflection(entry, settings.apiKey);
        if (cloudResult) return cloudResult;
      } catch (err) {
        console.warn('Gemini cloud API failed, falling back to on-device engine:', err);
      }
    }

    // Default: On-device mindful therapeutic engine (100% private & immediate)
    return generateOfflineReflection(entry);
  },

  // 3. Writing helpers inside editor
  async getWritingHelp(
    content: string,
    title: string,
    type: 'continue' | 'reframe' | 'lesson'
  ): Promise<string[]> {
    const detected = this.detectMoodAndTags(content, title);

    if (type === 'continue') {
      if (detected.mood === 'stressed') {
        return [
          'What is one small boundary or pause you can give yourself right now?',
          'If you looked at this situation with absolute self-compassion, what would you tell yourself?',
          'What part of this burden is truly within your control to solve today?',
        ];
      }
      if (detected.mood === 'happy' || detected.mood === 'excited') {
        return [
          'What made this moment feel so uniquely bright or special to you?',
          'How can you anchor this positive feeling in your memory for tough days?',
          'Who is someone you would love to share this joy or gratitude with?',
        ];
      }
      return [
        'What was the most quiet or unexpected highlight of your day so far?',
        'How does your physical body feel right now as you write these words?',
        'What is one thing you hope to give yourself tomorrow morning?',
      ];
    }

    if (type === 'reframe') {
      return [
        'Even in difficult moments, acknowledging how you feel is an act of bravery and honest self-care.',
        'This challenge is only a chapter in your growth, not the conclusion of your story.',
        'You do not have to carry everything all at once; small gentle progress is still progress.',
      ];
    }

    // type === 'lesson'
    if (detected.mood === 'stressed') {
      return ['"Resting is not quitting; pause and breathe before taking the next step."'];
    }
    if (detected.mood === 'happy') {
      return ['"True wealth is found in simple moments of peace, laughter, and appreciation."'];
    }
    return ['"Every day holds something worth remembering when you take time to reflect."'];
  },

  // 4. Mindful Digest (Weekly/Monthly Summary)
  async generateMindfulDigest(entries: DiaryEntry[]): Promise<MindfulDigest> {
    const total = entries.length;
    if (total === 0) {
      return {
        periodTitle: 'Mindful Overview',
        chapterTitle: 'A Fresh Blank Page',
        overview: 'You have not written any journal entries yet. Start by writing what is on your mind today!',
        highsAndWins: ['Begin your first journal reflection.'],
        growthObservations: ['Your journaling journey begins with a single word.'],
        mindfulMotto: 'A journey of self-discovery begins within.',
        dominantMood: 'calm',
        entriesAnalyzed: 0,
      };
    }

    // Mood counts
    const moodCounts: Record<MoodType, number> = {
      happy: 0, calm: 0, excited: 0, neutral: 0, sad: 0, stressed: 0,
    };
    entries.forEach((e) => {
      if (moodCounts[e.mood] !== undefined) moodCounts[e.mood] += 1;
    });

    let dominantMood: MoodType = 'calm';
    let max = -1;
    for (const [m, count] of Object.entries(moodCounts) as [MoodType, number][]) {
      if (count > max) {
        max = count;
        dominantMood = m;
      }
    }

    const chapterTitles: Record<MoodType, string> = {
      calm: 'The Season of Quiet Centering',
      happy: 'The Days of Radiant Gratitude',
      excited: 'The Chapter of Bold Strides',
      neutral: 'The Rhythm of Everyday Grounding',
      sad: 'The Healing Journey of Soft Acceptance',
      stressed: 'Navigating Currents and Reclaiming Peace',
    };

    const highs: string[] = [];
    const favorites = entries.filter((e) => e.isFavorite);
    if (favorites.length > 0) {
      highs.push(`Cherished milestone: "${favorites[0].title}"`);
    }
    const happyEntries = entries.filter((e) => e.mood === 'happy' || e.mood === 'excited');
    if (happyEntries.length > 0) {
      highs.push(`Celebrated joy in: "${happyEntries[0].title}"`);
    }
    highs.push(`Consistently maintained your inner space across ${total} reflections.`);

    const growth: string[] = [
      `You practiced deep emotional awareness by tracking ${total} mindful check-ins.`,
      dominantMood === 'stressed' || dominantMood === 'sad'
        ? 'You faced emotional friction with honest vulnerability instead of bottling it up.'
        : 'You prioritized calm and mindful living throughout your daily routine.',
      'Your writing reflects genuine personal evolution and honest self-honoring.',
    ];

    const mottos: Record<MoodType, string> = {
      calm: '"Peace is not the absence of trouble, but the presence of serenity within."',
      happy: '"Joy multiplied through gratitude illuminates even the quietest days."',
      excited: '"Energy flows where mindful intention leads."',
      neutral: '"Simplicity in the present moment is the truest sanctuary."',
      sad: '"Tears water the soil of wisdom; honor what was, and welcome what is."',
      stressed: '"When everything feels noisy, your breath is your anchor back home."',
    };

    return {
      periodTitle: 'Recent Reflections Review',
      chapterTitle: chapterTitles[dominantMood] || 'The Mindful Chapter',
      overview: `Over your last ${total} reflections, your thoughts carried an emotional anchor of ${dominantMood.toUpperCase()}. You explored life with self-honesty and deliberate care.`,
      highsAndWins: highs,
      growthObservations: growth,
      mindfulMotto: mottos[dominantMood],
      dominantMood,
      entriesAnalyzed: total,
    };
  },
};

// Offline compassionate reflection generator
function generateOfflineReflection(entry: DiaryEntry): AiReflection {
  const mood = entry.mood;
  const wordCount = entry.wordCount;

  const empathyTemplates: Record<MoodType, { empathy: string; question: string }> = {
    happy: {
      empathy: `Your reflection radiates genuine contentment and gratitude. Taking the time to capture this light preserves it as a sanctuary for your future self.`,
      question: `What is one sensory detail from this happy moment that you want to remember forever?`,
    },
    calm: {
      empathy: `There is a beautiful, grounding stillness in your words. Pausing to appreciate quiet simplicity is one of the highest forms of self-care.`,
      question: `How can you carry a little piece of this calm energy into whatever you do tomorrow?`,
    },
    excited: {
      empathy: `Your passion and forward momentum shine through vividly! Breakthroughs and creative energy like this are moments to be celebrated.`,
      question: `What is the very next small, inspiring step you feel called to take?`,
    },
    neutral: {
      empathy: `Ordinary, steady days are the silent foundation of our lives. Acknowledging routine without judgment brings a subtle, dependable clarity.`,
      question: `What was one quiet moment from today that felt gentle or comforting?`,
    },
    sad: {
      empathy: `I hear the weight and vulnerability in your writing. It is completely okay to feel tender right now; your feelings deserve space and kindness.`,
      question: `What is one kind, non-demanding thing your mind or body needs tonight?`,
    },
    stressed: {
      empathy: `You have been carrying a substantial amount of pressure. Acknowledging overwhelm is the first step toward releasing what is not yours to fix right now.`,
      question: `If you could let go of just one expectation before sleeping, what would bring you relief?`,
    },
  };

  const template = empathyTemplates[mood] || empathyTemplates.calm;

  return {
    sentiment: `${mood.toUpperCase()} • ${wordCount} words analyzed`,
    empathyResponse: template.empathy,
    followUpQuestion: template.question,
    suggestedMood: mood,
    suggestedTags: entry.tags.length > 0 ? entry.tags : ['mindfulness', 'reflection'],
    keyLesson: `Honoring your ${mood} state with compassionate awareness.`,
  };
}

// Optional Gemini LLM Integration
async function callGeminiReflection(entry: DiaryEntry, apiKey: string): Promise<AiReflection | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are a warm, compassionate, non-judgmental mindful journaling companion.
Analyze this personal diary entry:
Title: "${entry.title}"
Date: ${entry.entryDate}
Mood: ${entry.mood}
Content: "${entry.content}"

Respond in valid JSON only with this schema:
{
  "sentiment": "Short sentiment description",
  "empathyResponse": "2-3 sentences of compassionate reflection and emotional validation",
  "followUpQuestion": "One gentle, thoughtful question to help the writer reflect deeper",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedMood": "${entry.mood}",
  "keyLesson": "One concise philosophical motto"
}
`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return JSON.parse(text) as AiReflection;
}
