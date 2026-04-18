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
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { colors } from '../../theme/theme';
import { paymentApi, CartItem, CartSummary, PaymentOrder } from '../../api/paymentApi';

type PaymentMethod = 'upi' | 'card' | 'cod' | 'saved';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { cartItems, cartSummary, couponCode, pointsUsed } = route.params;
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setProcessing(true);
      const order = await paymentApi.createPaymentOrder(cartSummary.totalPayable);
      setPaymentOrder(order);
    } catch (error) {
      console.error('Error initializing payment:', error);
      Alert.alert('Error', 'Unable to initialize payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentOrder) {
      Alert.alert('Error', 'Payment not initialized');
      return;
    }

    // Validate payment method
    if (selectedMethod === 'upi' && !upiId.trim()) {
      Alert.alert('Error', 'Please enter UPI ID');
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
        Alert.alert('Error', 'Please fill all card details');
        return;
      }
    }

    try {
      setProcessing(true);

      const options = {
        description: 'SmartPujari Booking',
        image: 'https://picsum.photos/seed/smartpujari/100/100',
        currency: paymentOrder.currency,
        key: 'rzp_test_1234567890', // Test key - replace with actual key
        amount: paymentOrder.amount,
        order_id: paymentOrder.razorpayOrderId,
        name: 'SmartPujari',
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name',
        },
        theme: {
          color: colors.primary,
        },
        method: selectedMethod === 'cod' ? 'netbanking' : undefined,
      };

      const razorpayResult = await RazorpayCheckout.open(options);

      // Payment successful, verify with backend
      const verificationResult = await paymentApi.verifyPayment({
        paymentId: razorpayResult.razorpay_payment_id,
        orderId: razorpayResult.razorpay_order_id,
        signature: razorpayResult.razorpay_signature,
      });

      if (verificationResult.success && verificationResult.bookingId) {
        // Navigate to booking confirmation
        navigation.replace('BookingConfirmation', {
          bookingId: verificationResult.bookingId,
        });
      } else {
        Alert.alert('Error', 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.code === 0) {
        // User cancelled payment
        Alert.alert('Cancelled', 'Payment was cancelled');
      } else {
        // Payment failed
        Alert.alert('Payment Failed', 'Unable to complete payment. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.orderSummary}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
        <Text style={styles.summaryValue}>${cartSummary.basePrice + cartSummary.addonTotal}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Platform Fee</Text>
        <Text style={styles.summaryValue}>${cartSummary.platformFee}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxes</Text>
        <Text style={styles.summaryValue}>${cartSummary.taxes}</Text>
      </View>
      {cartSummary.discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.summaryValue} style={{ color: '#4CAF50' }}>
            -${cartSummary.discount}
          </Text>
        </View>
      )}
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${cartSummary.totalPayable}</Text>
      </View>
    </View>
  );

  const renderPaymentMethod = (method: PaymentMethod, title: string, icon: string) => (
    <TouchableOpacity
      key={method}
      style={[
        styles.paymentMethod,
        selectedMethod === method && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedMethod(method)}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={24} color={selectedMethod === method ? colors.primary : colors.textSecondary} />
      <Text style={[
        styles.paymentMethodText,
        selectedMethod === method && styles.selectedPaymentMethodText,
      ]}>
        {title}
      </Text>
      <View style={[styles.radioButton, selectedMethod === method && styles.radioButtonSelected]}>
        {selectedMethod === method && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );

  const renderUPIForm = () => (
    <View style={styles.paymentForm}>
      <Text style={styles.formTitle}>Enter UPI ID</Text>
      <TextInput
        style={styles.input}
        placeholder="username@upi"
        placeholderTextColor={colors.textSecondary}
        value={upiId}
        onChangeText={setUpiId}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.formNote}>
        You will receive a payment request on your UPI app
      </Text>
    </View>
  );

  const renderCardForm = () => (
    <View style={styles.paymentForm}>
      <Text style={styles.formTitle}>Card Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        placeholderTextColor={colors.textSecondary}
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        maxLength={16}
      />
      <View style={styles.cardRow}>
        <TextInput
          style={[styles.input, styles.cardInput]}
          placeholder="MM/YY"
          placeholderTextColor={colors.textSecondary}
          value={cardExpiry}
          onChangeText={setCardExpiry}
          keyboardType="numeric"
          maxLength={5}
        />
        <TextInput
          style={[styles.input, styles.cardInput]}
          placeholder="CVV"
          placeholderTextColor={colors.textSecondary}
          value={cardCvv}
          onChangeText={setCardCvv}
          keyboardType="numeric"
          maxLength={3}
          secureTextEntry
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Name on Card"
        placeholderTextColor={colors.textSecondary}
        value={cardName}
        onChangeText={setCardName}
        autoCapitalize="words"
      />
    </View>
  );

  const renderCODForm = () => (
    <View style={styles.paymentForm}>
      <Text style={styles.formTitle}>Cash on Delivery</Text>
      <Text style={styles.formNote}>
        Pay the full amount when the pandit arrives at your location
      </Text>
      <View style={styles.codNote}>
        <Icon name="info" size={16} color={colors.primary} />
        <Text style={styles.codNoteText}>
          Additional convenience fee may apply for COD
        </Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          {renderOrderSummary()}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {renderPaymentMethod('upi', 'UPI', 'account-balance-wallet')}
            {renderPaymentMethod('card', 'Credit/Debit Card', 'credit-card')}
            {renderPaymentMethod('cod', 'Cash on Delivery', 'local-shipping')}
          </View>
        </View>

        {/* Payment Forms */}
        <View style={styles.section}>
          {selectedMethod === 'upi' && renderUPIForm()}
          {selectedMethod === 'card' && renderCardForm()}
          {selectedMethod === 'cod' && renderCODForm()}
        </View>

        {/* Saved Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          <TouchableOpacity style={styles.savedPaymentMethod} activeOpacity={0.7}>
            <Icon name="credit-card" size={20} color={colors.textSecondary} />
            <Text style={styles.savedPaymentText}>**** **** **** 1234</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.payButton,
            processing && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={processing || !paymentOrder}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${cartSummary.totalPayable}
            </Text>
          )}
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
  orderSummary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
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
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPaymentMethod: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  selectedPaymentMethodText: {
    color: colors.primary,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentForm: {
    gap: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardInput: {
    flex: 1,
  },
  formNote: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  codNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  codNoteText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    lineHeight: 20,
  },
  savedPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedPaymentText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
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
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: colors.border,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
