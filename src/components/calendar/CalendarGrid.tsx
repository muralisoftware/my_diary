import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MoodType } from '../../types/diary';
import { MOODS } from '../../constants/moods';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CalendarGridProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  datesWithEntries: Record<string, { count: number; moods: MoodType[] }>;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onSelectDate,
  datesWithEntries,
}) => {
  const { theme } = useTheme();

  // Initialize to selected date or current date
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return parseInt(selectedDate.substring(0, 4), 10) || new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return parseInt(selectedDate.substring(5, 7), 10) - 1 || new Date().getMonth();
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Blank slots before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ dateStr: '', dayNum: 0, isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({
      dateStr: `${currentYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {monthNames[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronRight size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekRow}>
        {weekDays.map((wd, i) => (
          <Text key={i} style={[styles.weekDayText, { color: theme.textMuted }]}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {days.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return <View key={idx} style={styles.emptyDayCell} />;
          }

          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const entryInfo = datesWithEntries[item.dateStr];
          const hasEntries = !!entryInfo && entryInfo.count > 0;
          const dominantMood = hasEntries && entryInfo.moods.length > 0 ? entryInfo.moods[0] : null;
          const moodColor = dominantMood && MOODS[dominantMood] ? MOODS[dominantMood].color : theme.accent;

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => onSelectDate(item.dateStr)}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: theme.accent, borderRadius: 20 },
                !isSelected && isToday && { borderWidth: 1, borderColor: theme.accent, borderRadius: 20 },
              ]}
            >
              <Text
                style={[
                  styles.dayNumText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : isToday
                      ? theme.accent
                      : theme.text,
                    fontWeight: isSelected || isToday ? '700' : '400',
                  },
                ]}
              >
                {item.dayNum}
              </Text>

              {/* Indicator Dot for entry */}
              {hasEntries && (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : moodColor,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navBtn: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emptyDayCell: {
    width: 38,
    height: 38,
    marginVertical: 2,
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  dayNumText: {
    fontSize: 13,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 4,
  },
});
