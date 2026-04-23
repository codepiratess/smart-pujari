import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { cartApi, Cart, CartItem } from '../../api/cartApi';

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', emoji: '📱' },
  { id: 'card', label: 'Credit / Debit Card', emoji: '💳' },
  { id: 'netbanking', label: 'Net Banking', emoji: '🏦' },
  { id: 'cash', label: 'Cash on Service', emoji: '💵' },
];

// Format time HH:MM → H:MM AM/PM
const fmt = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const CartScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [proceeding, setProceeding] = useState(false);

  // Add-ons edit modal
  const [addonsModalVisible, setAddonsModalVisible] = useState(false);
  const [modalAddons, setModalAddons] = useState<any[]>([]);
  const [savingAddons, setSavingAddons] = useState(false);

  // Calendar/date edit — reuse BookPooja
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, []),
  );

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error('Cart fetch error:', err);
      Alert.alert('Error', 'Could not load cart.');
    } finally {
      setLoading(false);
    }
  };

  const openAddonsModal = (item: CartItem) => {
    // Merge all addons from item (keep quantities)
    const existing = item.addons ?? [];
    setModalAddons(existing.map(a => ({ ...a, editQty: a.quantity })));
    setAddonsModalVisible(true);
  };

  const changeModalAddonQty = (addonId: number, delta: number) => {
    setModalAddons(prev =>
      prev.map(a =>
        a.addon_id === addonId
          ? { ...a, editQty: Math.max(0, (a.editQty ?? a.quantity) + delta) }
          : a,
      ),
    );
  };

  const saveAddons = async () => {
    if (!cart?.items[0]) return;
    setSavingAddons(true);
    try {
      await cartApi.updateCartAddons(
        cart.items[0].item_id,
        modalAddons.map(a => ({
          pandit_addon_id: a.pandit_addon_id,
          quantity: a.editQty ?? a.quantity,
        })),
      );
      setAddonsModalVisible(false);
      fetchCart();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to update add-ons.',
      );
    } finally {
      setSavingAddons(false);
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await cartApi.clearCart();
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to clear cart.');
          }
        },
      },
    ]);
  };

  const handleProceed = async () => {
    setProceeding(true);
    try {
      const res = await cartApi.checkout(paymentMethod);
      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your pooja has been booked successfully.',
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('Bookings'),
          },
          { text: 'Go Home', onPress: () => navigation.navigate('Home') },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Payment failed. Please try again.',
      );
    } finally {
      setProceeding(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconBtn}
          >
            <Icon name="home" size={22} color="#f97316" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.loadingBox}>
          <Icon name="shopping-cart" size={52} color="#d1d5db" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      </SafeAreaView>
    );
  }

  const item = cart.items[0];
  const pooja = item.pandit_pooja?.pooja_type;
  const selectedAddons = item.addons ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.headerIconBtn}
        >
          <Icon name="home" size={22} color="#f97316" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Booking summary */}
        <View style={styles.card}>
          <View style={styles.bookingTopRow}>
            {pooja?.image ? (
              <Image source={{ uri: pooja.image }} style={styles.bookingImg} />
            ) : (
              <View
                style={[
                  styles.bookingImg,
                  {
                    backgroundColor: '#ffedd5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Icon name="spa" size={28} color="#f97316" />
              </View>
            )}
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingName}>
                {pooja?.name || item.meta?.pooja_name}
              </Text>
              <View style={styles.bookingMetaRow}>
                <Icon name="schedule" size={13} color="#6b7280" />
                <Text style={styles.bookingMetaText}>
                  {item.pandit_pooja?.duration} hours
                </Text>
              </View>
            </View>
          </View>

          {/* Date + time row */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeLeft}>
              <Icon name="calendar-today" size={14} color="#f97316" />
              <Text style={styles.dateTimeText}>{item.meta?.date}</Text>
              <Text style={styles.dateTimeDot}>•</Text>
              <Icon name="schedule" size={14} color="#f97316" />
              <Text style={styles.dateTimeText}>
                {fmt(item.meta?.slot_start)} - {fmt(item.meta?.slot_end)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="edit" size={18} color="#f97316" />
            </TouchableOpacity>
          </View>

          {/* Base price */}
          <View style={styles.basePriceRow}>
            <Text style={styles.basePriceLabel}>Base Price</Text>
            <Text style={styles.basePriceValue}>{cart.base_price}</Text>
          </View>
        </View>

        {/* Add-ons */}
        <View style={styles.card}>
          <View style={styles.addonHeaderRow}>
            <Text style={styles.cardTitle}>Selected Add-ons</Text>
            <TouchableOpacity
              style={styles.editAddonsBtn}
              onPress={() => openAddonsModal(item)}
            >
              <Icon name="edit" size={14} color="#374151" />
              <Text style={styles.editAddonsBtnText}>Edit Addons</Text>
            </TouchableOpacity>
          </View>

          {selectedAddons.length === 0 ? (
            <Text style={styles.emptyNote}>No add-ons selected</Text>
          ) : (
            selectedAddons.map((addon, i) => (
              <View key={i} style={styles.addonRow}>
                <Text style={styles.addonName}>{addon.addon_name}</Text>
                <Text style={styles.addonPrice}>
                  ₹{addon.total || addon.price * addon.quantity}
                </Text>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => openAddonsModal(item)}
          >
            <Text style={styles.addMoreBtnText}>+ Add More Add-ons</Text>
          </TouchableOpacity>
        </View>

        {/* Price Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price</Text>
            <Text style={styles.priceValue}>{cart.base_price}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Add-ons Total</Text>
            <Text style={styles.priceValue}>{cart.addons_total}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceValue}>₹{cart.platform_fee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes (GST 18%)</Text>
            <Text style={styles.priceValue}>₹{cart.tax_amount}</Text>
          </View>
          {cart.discount_amount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#16a34a' }]}>
                Discount
              </Text>
              <Text style={[styles.priceValue, { color: '#16a34a' }]}>
                -₹{cart.discount_amount}
              </Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{cart.total_payable}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[
                styles.paymentOption,
                paymentMethod === pm.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <Text style={styles.paymentEmoji}>{pm.emoji}</Text>
              <Text style={styles.paymentLabel}>{pm.label}</Text>
              <View
                style={[
                  styles.paymentRadio,
                  paymentMethod === pm.id && styles.paymentRadioSelected,
                ]}
              >
                {paymentMethod === pm.id && (
                  <View style={styles.paymentRadioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon + Redeem */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.couponRow}>
            <View style={styles.couponIcon}>
              <Icon name="local-offer" size={18} color="#f97316" />
            </View>
            <Text style={styles.couponLabel}>Apply Coupon</Text>
            <Icon name="chevron-right" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.priceDivider} />

          <View style={styles.redeemRow}>
            <View style={styles.couponIcon}>
              <Icon name="card-giftcard" size={18} color="#f97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.couponLabel}>Redeem Points</Text>
              <Text style={styles.redeemSub}>points available</Text>
            </View>
            <Switch
              value={redeemPoints}
              onValueChange={setRedeemPoints}
              trackColor={{ false: '#e5e7eb', true: '#f97316' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Clear Cart */}
        <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear Cart</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Payable</Text>
          <Text style={styles.footerPrice}>
            ₹{cart.total_payable.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.proceedBtn, proceeding && { opacity: 0.7 }]}
          onPress={handleProceed}
          disabled={proceeding}
        >
          {proceeding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.proceedBtnText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit Add-ons Modal */}
      <Modal
        visible={addonsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddonsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Add-ons</Text>
              <TouchableOpacity onPress={() => setAddonsModalVisible(false)}>
                <Icon name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {modalAddons.map((addon, i) => (
                <View key={i} style={styles.modalAddonCard}>
                  <View style={styles.modalAddonTop}>
                    <Text style={styles.modalAddonName}>
                      {addon.addon_name}
                    </Text>
                    <Text style={styles.modalAddonPrice}>₹{addon.price}</Text>
                  </View>
                  {(addon.editQty ?? addon.quantity) > 0 ? (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => changeModalAddonQty(addon.addon_id, -1)}
                      >
                        <Icon name="remove" size={18} color="#f97316" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>
                        {addon.editQty ?? addon.quantity}
                      </Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => changeModalAddonQty(addon.addon_id, 1)}
                      >
                        <Icon name="add" size={18} color="#f97316" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => changeModalAddonQty(addon.addon_id, 1)}
                    >
                      <Icon name="add" size={16} color="#f97316" />
                      <Text style={styles.addBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <View style={{ height: 16 }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmAddonsBtn,
                savingAddons && { opacity: 0.7 },
              ]}
              onPress={saveAddons}
              disabled={savingAddons}
            >
              {savingAddons ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmAddonsBtnText}>Confirm Add-ons</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerIconBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  scrollContent: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  // Booking
  bookingTopRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  bookingImg: { width: 80, height: 80, borderRadius: 12 },
  bookingInfo: { flex: 1, justifyContent: 'center' },
  bookingName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  bookingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bookingMetaText: { fontSize: 12, color: '#6b7280' },

  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    flexWrap: 'wrap',
  },
  dateTimeDot: { color: '#6b7280' },
  dateTimeText: { fontSize: 13, color: '#111827', fontWeight: '500' },

  basePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basePriceLabel: { fontSize: 13, color: '#6b7280' },
  basePriceValue: { fontSize: 16, fontWeight: '700', color: '#f97316' },

  // Add-ons
  addonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  editAddonsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  editAddonsBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 6,
    paddingLeft: 12,
  },
  addonName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  addonPrice: { fontSize: 14, fontWeight: '700', color: '#f97316' },
  emptyNote: { fontSize: 13, color: '#9ca3af', marginBottom: 12 },
  addMoreBtn: {
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addMoreBtnText: { fontSize: 14, fontWeight: '600', color: '#f97316' },

  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#111827' },
  priceDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#f97316' },

  // Payment
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  paymentEmoji: { fontSize: 20 },
  paymentLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRadioSelected: { borderColor: '#f97316' },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f97316',
  },

  // Coupon / Redeem
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  couponIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  redeemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  redeemSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  // Clear
  clearBtn: { alignItems: 'center', paddingVertical: 16 },
  clearBtnText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    elevation: 8,
  },
  footerLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  footerPrice: { fontSize: 20, fontWeight: '700', color: '#f97316' },
  proceedBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  proceedBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Addons modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalAddonCard: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  modalAddonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalAddonName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  modalAddonPrice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    paddingVertical: 4,
  },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderRadius: 10,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  confirmAddonsBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmAddonsBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default CartScreen;
