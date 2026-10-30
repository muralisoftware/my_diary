import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SecurityProvider, useSecurity } from './src/context/SecurityContext';
import { DiaryProvider, useDiary } from './src/context/DiaryContext';

// Screens
import { LockScreen } from './src/screens/LockScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { MemoriesScreen } from './src/screens/MemoriesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Modals
import { EditorModal } from './src/screens/EditorModal';
import { DiaryDetailModal } from './src/screens/DiaryDetailModal';
import { SearchModal } from './src/screens/SearchModal';
import { PinSetupModal } from './src/screens/PinSetupModal';

// Icons
import {
  Home,
  Calendar,
  PenTool,
  BookHeart,
  Settings,
} from 'lucide-react-native';

type TabType = 'home' | 'calendar' | 'memories' | 'settings';

const MainAppContent: React.FC = () => {
  const { theme } = useTheme();
  const { isLocked, isLoading } = useSecurity();
  const { openEditor } = useDiary();

  const [activeTab, setActiveTab] = useState<TabType>('home');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Opening your private diary...
        </Text>
      </View>
    );
  }

  // If app is protected by PIN and currently locked
  if (isLocked) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <LockScreen />
      </SafeAreaView>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToCalendar={() => setActiveTab('calendar')} />;
      case 'calendar':
        return <CalendarScreen />;
      case 'memories':
        return <MemoriesScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigateToCalendar={() => setActiveTab('calendar')} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* Active Screen View */}
      <View style={styles.screenWrapper}>
        {renderActiveScreen()}
      </View>

      {/* 5-Tab Mindful Bottom Navigation */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.tabBarBg,
            borderTopColor: theme.tabBarBorder,
            shadowColor: theme.isDark ? '#000' : '#8C5A3C',
          },
        ]}
      >
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('home')}
          style={styles.tabItem}
        >
          <Home
            size={22}
            color={activeTab === 'home' ? theme.tabActive : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'home' ? theme.tabActive : theme.tabInactive,
                fontWeight: activeTab === 'home' ? '700' : '500',
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Calendar */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('calendar')}
          style={styles.tabItem}
        >
          <Calendar
            size={22}
            color={activeTab === 'calendar' ? theme.tabActive : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'calendar' ? theme.tabActive : theme.tabInactive,
                fontWeight: activeTab === 'calendar' ? '700' : '500',
              },
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Prominent Center Write Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => openEditor()}
          style={styles.centerWriteContainer}
        >
          <View
            style={[
              styles.centerWriteBtn,
              {
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
              },
            ]}
          >
            <PenTool size={22} color="#FFFFFF" />
          </View>
          <Text style={[styles.tabLabel, { color: theme.accent, fontWeight: '700', marginTop: 3 }]}>
            Write
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Memories & Insights */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('memories')}
          style={styles.tabItem}
        >
          <BookHeart
            size={22}
            color={activeTab === 'memories' ? theme.tabActive : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'memories' ? theme.tabActive : theme.tabInactive,
                fontWeight: activeTab === 'memories' ? '700' : '500',
              },
            ]}
          >
            Memories
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Settings */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('settings')}
          style={styles.tabItem}
        >
          <Settings
            size={22}
            color={activeTab === 'settings' ? theme.tabActive : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'settings' ? theme.tabActive : theme.tabInactive,
                fontWeight: activeTab === 'settings' ? '700' : '500',
              },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Universal Floating Modals */}
      <EditorModal />
      <DiaryDetailModal />
      <SearchModal />
      <PinSetupModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SecurityProvider>
        <DiaryProvider>
          <MainAppContent />
        </DiaryProvider>
      </SecurityProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 76 : 64,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerWriteContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerWriteBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
