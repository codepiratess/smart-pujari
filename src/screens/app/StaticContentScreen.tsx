import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';

interface Section {
  heading?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  numberedList?: string[];
}

interface StaticContentScreenProps {
  title: string;
  lastUpdated?: string;
  sections: Section[];
}

const StaticContentScreen: React.FC<StaticContentScreenProps> = ({
  title,
  lastUpdated,
  sections,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const renderSection = (section: Section, index: number) => {
    return (
      <View key={index} style={styles.section}>
        {section.heading && (
          <Text style={styles.sectionHeading}>{section.heading}</Text>
        )}
        
        {section.paragraphs && section.paragraphs.map((paragraph: string, pIndex: number) => (
          <Text key={pIndex} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
        
        {section.bulletPoints && section.bulletPoints.map((point: string, bIndex: number) => (
          <View key={bIndex} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
        
        {section.numberedList && section.numberedList.map((point: string, nIndex: number) => (
          <View key={nIndex} style={styles.numberedPoint}>
            <Text style={styles.number}>{nIndex + 1}.</Text>
            <Text style={styles.numberedText}>{point}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {sections.map((section, index) => renderSection(section, index))}
        
        {lastUpdated && (
          <Text style={styles.footerText}>
            Last updated: {lastUpdated}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  numberedPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  numberedText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});

export default StaticContentScreen;
