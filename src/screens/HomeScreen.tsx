import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import TopBar from '../components/home/TopBar';
import SearchBar from '../components/home/SearchBar';
import BannerCarousel from '../components/home/BannerCarousel';
import PoojaTypesSection from '../components/home/PoojaTypesSection';
import OnlinePoojaBanner from '../components/home/OnlinePoojaBanner';
import NearbyPanditsSection from '../components/home/NearbyPanditsSection';
// import BottomNav from '../components/home/BottomNav';

// API
import { homeApi, Banner, PoojaType, Pandit } from '../api/homeApi';

// Types
type TabType = 'home' | 'booking' | 'account';

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [poojaTypes, setPoojaTypes] = useState<PoojaType[]>([]);
  const [nearbyPandits, setNearbyPandits] = useState<Pandit[]>([]);
  
  // Loading states
  const [bannersLoading, setBannersLoading] = useState(true);
  const [poojaTypesLoading, setPoojaTypesLoading] = useState(true);
  const [panditsLoading, setPanditsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all data in parallel with better error handling
      const bannersPromise = homeApi.getBanners().catch(error => {
        console.error('Error loading banners:', error);
        return [] as Banner[];
      });
      
      const poojaTypesPromise = homeApi.getPoojaTypes(6).catch(error => {
        console.error('Error loading pooja types:', error);
        return [] as PoojaType[];
      });
      
      const panditsPromise = homeApi.getNearbyPandits({ lat: 19.0760, lng: 72.8777, limit: 5 }).catch(error => {
        console.error('Error loading nearby pandits:', error);
        return [] as Pandit[];
      });

      const [bannersData, poojaTypesData, panditsData] = await Promise.all([
        bannersPromise,
        poojaTypesPromise,
        panditsPromise,
      ]);

      setBanners(bannersData);
      setPoojaTypes(poojaTypesData);
      setNearbyPandits(panditsData);
    } catch (error) {
      console.error('Error loading home data:', error);
      // Set empty arrays on error to prevent UI crashes
      setBanners([]);
      setPoojaTypes([]);
      setNearbyPandits([]);
    } finally {
      setBannersLoading(false);
      setPoojaTypesLoading(false);
      setPanditsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setBannersLoading(true);
    setPoojaTypesLoading(true);
    setPanditsLoading(true);
    
    await loadData();
    setRefreshing(false);
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    // TODO: Handle tab navigation
    console.log('Tab pressed:', tab);
  };

  const renderContent = () => {
    if (bannersLoading && poojaTypesLoading && panditsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar />

        {/* Banner Carousel */}
        <BannerCarousel banners={banners} loading={bannersLoading} />

        {/* Pooja Types Section */}
        <PoojaTypesSection poojaTypes={poojaTypes} loading={poojaTypesLoading} />

        {/* Online Pooja Banner */}
        <OnlinePoojaBanner />

        {/* Nearby Pandits Section */}
        <NearbyPanditsSection pandits={nearbyPandits} loading={panditsLoading} />

        {/* Bottom padding for bottom nav */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      {/* <BottomNav activeTab={activeTab} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    // flex: 1,
  },
  scrollView: {
    // flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  loadingContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 20, // Just enough padding for bottom nav
  },
});

export default HomeScreen;
