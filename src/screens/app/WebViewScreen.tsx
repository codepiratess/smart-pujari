import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { reviewApi, StaticContent } from '../../api/reviewApi';

const WebViewScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { page } = route.params;
  
  const [content, setContent] = useState<StaticContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [page]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const contentData = await reviewApi.getStaticContent(page);
      setContent(contentData);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Unable to load content');
    } finally {
      setLoading(false);
    }
  };

  const getScreenTitle = () => {
    switch (page) {
      case 'terms':
        return 'Terms & Conditions';
      case 'privacy':
        return 'Privacy Policy';
      case 'about':
        return 'About Us';
      case 'faqs':
        return 'FAQs';
      case 'refund-policy':
        return 'Refund Policy';
      default:
        return 'Information';
    }
  };

  const generateHTML = (content: StaticContent) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
          }
          h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #FF6B35;
          }
          h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 24px 0 16px 0;
          }
          h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 20px 0 12px 0;
          }
          p {
            margin-bottom: 16px;
            color: #666;
          }
          ul, ol {
            margin-bottom: 16px;
            padding-left: 24px;
          }
          li {
            margin-bottom: 8px;
            color: #666;
          }
          strong {
            color: #1a1a1a;
            font-weight: 600;
          }
          a {
            color: #FF6B35;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          code {
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
          blockquote {
            border-left: 4px solid #FF6B35;
            padding-left: 16px;
            margin: 16px 0;
            color: #666;
            font-style: italic;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }
          th, td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .last-updated {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${content.content}
        <div class="last-updated">
          Last updated: ${new Date(content.lastUpdated).toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  };

  const handleWebViewLoad = () => {
    setWebViewLoading(false);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setWebViewLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>Unable to load content</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{ html: generateHTML(content) }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewScreen;
