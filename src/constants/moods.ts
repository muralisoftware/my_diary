import { MoodType } from '../types/diary';

export interface MoodMeta {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

export const MOODS: Record<MoodType, MoodMeta> = {
  happy: {
    type: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    description: 'Joyful, grateful, content',
  },
  calm: {
    type: 'calm',
    label: 'Calm',
    emoji: '🌿',
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'Peaceful, relaxed, centered',
  },
  excited: {
    type: 'excited',
    label: 'Excited',
    emoji: '✨',
    color: '#F97316',
    bgColor: '#FFEDD5',
    description: 'Energized, inspired, eager',
  },
  neutral: {
    type: 'neutral',
    label: 'Neutral',
    emoji: '🌤️',
    color: '#64748B',
    bgColor: '#F1F5F9',
    description: 'Ordinary, steady, reflective',
  },
  sad: {
    type: 'sad',
    label: 'Sad',
    emoji: '🌧️',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: 'Down, heavy, in need of warmth',
  },
  stressed: {
    type: 'stressed',
    label: 'Stressed',
    emoji: '⚡',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: 'Overwhelmed, tired, anxious',
  },
};

export const MOOD_LIST = Object.values(MOODS);
