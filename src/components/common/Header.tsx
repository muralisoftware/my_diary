import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useSecurity } from '../../context/SecurityContext';
import { Search, Flame, Lock } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showSearch = true }) => {
  const { theme } = useTheme();
  const { streak, setIsSearchOpen } = useDiary();
  const { settings, lockApp } = useSecurity();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.titleArea}>
        <View style={styles.titleWithLogo}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <Text style={[styles.title, { color: theme.text }]}>
            {title || 'My Diary'}
          </Text>
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightArea}>
        {/* Streak Badge */}
        <View style={[styles.streakBadge, { backgroundColor: theme.accentLight }]}>
          <Flame size={15} color={theme.accent} />
          <Text style={[styles.streakText, { color: theme.accent }]}>
            {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
          </Text>
        </View>

        {/* Instant Search Button */}
        {showSearch && (
          <TouchableOpacity
            onPress={() => setIsSearchOpen(true)}
            style={[styles.iconButton, { backgroundColor: theme.isDark ? '#262D38' : '#F4EEE5' }]}
            accessibilityLabel="Search entries"
          >
            <Search size={18} color={theme.text} />
          </TouchableOpacity>
        )}

        {/* Lock button if PIN is configured */}
        {settings.isPinEnabled && (
          <TouchableOpacity
            onPress={lockApp}
            style={[styles.iconButton, { backgroundColor: theme.isDark ? '#262D38' : '#F4EEE5', marginLeft: 6 }]}
            accessibilityLabel="Lock diary"
          >
            <Lock size={16} color={theme.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#7B52BE',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
