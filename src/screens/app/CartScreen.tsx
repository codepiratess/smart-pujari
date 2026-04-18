import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { paymentApi, CartItem, CartSummary } from '../../api/paymentApi';

const CartScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [usingPoints, setUsingPoints] = useState(false);

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    calculateCartSummary();
  }, [cartItems, couponCode, pointsToUse]);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const [items, points] = await Promise.all([
        paymentApi.getCartItems(),
        paymentApi.getUserPoints(),
      ]);
      setCartItems(items);
      setUserPoints(points);
    } catch (error) {
      console.error('Error loading cart data:', error);
      Alert.alert('Error', 'Unable to load cart data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCartSummary = async () => {
    if (cartItems.length === 0) return;
    
    try {
      const summary = await paymentApi.getCartSummary(
        cartItems, 
        couponCode || undefined, 
        usingPoints ? pointsToUse : undefined
      );
      setCartSummary(summary);
    } catch (error) {
      console.error('Error calculating cart summary:', error);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      setUpdating(itemId);
      const updatedItems = await paymentApi.updateCartItem(itemId, newQuantity);
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Unable to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const updatedItems = await paymentApi.removeCartItem(itemId);
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Unable to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      setApplyingCoupon(true);
      await calculateCartSummary();
      Alert.alert('Success', 'Coupon applied successfully!');
    } catch (error) {
      console.error('Error applying coupon:', error);
      Alert.alert('Error', 'Invalid coupon code');
      setCouponCode('');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePointsToggle = () => {
    if (!usingPoints) {
      setPointsToUse(Math.min(userPoints, Math.floor((cartSummary?.totalPayable || 0) * 0.1)));
    } else {
      setPointsToUse(0);
    }
    setUsingPoints(!usingPoints);
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    
    navigation.navigate('Payment', {
      cartItems,
      cartSummary,
      couponCode: couponCode || undefined,
      pointsUsed: usingPoints ? pointsToUse : 0,
    });
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <View style={styles.itemImageContainer}>
          <Icon name={item.type === 'pooja' ? 'spa' : 'local-offer'} size={24} color={colors.primary} />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={updating === item.id || item.quantity <= 1}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={16} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={updating === item.id}
            activeOpacity={0.7}
          >
            <Icon name="add" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeItem(item.id)}
          disabled={updating === item.id}
          activeOpacity={0.7}
        >
          <Icon name="delete" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
          {cartItems.map(renderCartItem)}
        </View>

        {/* Price Breakdown */}
        {cartSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Price</Text>
                <Text style={styles.priceValue}>${cartSummary.basePrice}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Add-on Total</Text>
                <Text style={styles.priceValue}>${cartSummary.addonTotal}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform Fee</Text>
                <Text style={styles.priceValue}>${cartSummary.platformFee}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Taxes (18% GST)</Text>
                <Text style={styles.priceValue}>${cartSummary.taxes}</Text>
              </View>
              {cartSummary.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.discountLabel}>Discount</Text>
                  <Text style={styles.discountValue}>-${cartSummary.discount}</Text>
                </View>
              )}
              {cartSummary.pointsUsed > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.pointsLabel}>Points Used</Text>
                  <Text style={styles.pointsValue}>-${cartSummary.pointsUsed}</Text>
                </View>
              )}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>${cartSummary.totalPayable}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Points Redemption */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reward Points</Text>
          <View style={styles.pointsContainer}>
            <View style={styles.pointsInfo}>
              <Text style={styles.availablePoints}>Available Points: {userPoints}</Text>
              <Text style={styles.pointsNote}>Use points for up to 10% discount</Text>
            </View>
            <TouchableOpacity
              style={[styles.pointsToggle, usingPoints && styles.pointsToggleActive]}
              onPress={handlePointsToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.pointsToggleText, usingPoints && styles.pointsToggleTextActive]}>
                {usingPoints ? `Using ${pointsToUse} points` : 'Use Points'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor={colors.textSecondary}
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity
              style={[styles.applyButton, !couponCode.trim() && styles.applyButtonDisabled]}
              onPress={applyCoupon}
              disabled={!couponCode.trim() || applyingCoupon}
              activeOpacity={0.8}
            >
              {applyingCoupon ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToPayment}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>
            Proceed to Payment ${cartSummary?.totalPayable || 0}
          </Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  priceBreakdown: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 16,
    color: '#4CAF50',
  },
  discountValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#FF9800',
  },
  pointsValue: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
  },
  availablePoints: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  pointsNote: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pointsToggle: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsToggleActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  pointsToggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pointsToggleTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.border,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  proceedButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;
