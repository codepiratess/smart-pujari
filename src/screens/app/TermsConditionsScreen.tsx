import React from 'react';
import StaticContentScreen from './StaticContentScreen';

const TermsConditionsScreen: React.FC = () => {
  const sections = [
    {
      heading: "1. Acceptance of Terms",
      paragraphs: [
        "By accessing and using Smart Pujari mobile application, you accept and agree to be bound by terms and provisions of this agreement. If you do not agree to these terms, please do not use our services."
      ]
    },
    {
      heading: "2. Service Description",
      paragraphs: [
        "Smart Pujari is a platform that connects users with verified pandits for performing Hindu religious ceremonies and poojas. We act as an intermediary between users and pandits."
      ],
      bulletPoints: [
        "Booking and scheduling religious ceremonies",
        "Connecting users with verified pandits",
        "Facilitating online and offline poojas",
        "Processing payments and managing bookings"
      ]
    },
    {
      heading: "3. User Responsibilities",
      paragraphs: [
        "As a user of Smart Pujari, you agree to:"
      ],
      numberedList: [
        "Provide accurate and complete information during registration and booking",
        "Maintain confidentiality of your account credentials",
        "Use service for lawful purposes only",
        "Respect pandits and treat them with courtesy",
        "Make timely payments for booked services",
        "Provide accurate location and contact information"
      ]
    },
    {
      heading: "4. Booking and Cancellation",
      paragraphs: [
        "All bookings are subject to availability and confirmation. Users can cancel bookings according to our cancellation policy. Cancellation charges may apply based on timing of cancellation."
      ],
      bulletPoints: [
        "Cancellations 24+ hours in advance: Full refund",
        "Cancellations within 24 hours: 30% cancellation charge applies",
        "No-shows or last-minute cancellations: No refund",
        "Emergency cancellations will be reviewed on a case-by-case basis"
      ]
    },
    {
      heading: "5. Payment Terms",
      paragraphs: [
        "All fees are displayed in Indian Rupees (INR). Payment must be made in full at time of booking. We accept various payment methods including UPI, cards, net banking, and digital wallets."
      ]
    },
    {
      heading: "6. Pandit Services",
      paragraphs: [
        "While we verify our pandits, Smart Pujari is not responsible for quality of services provided by individual pandits. Users are encouraged to review ratings and feedback before booking."
      ]
    },
    {
      heading: "7. Limitation of Liability",
      paragraphs: [
        "Smart Pujari shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of our services. Our total liability shall not exceed amount paid for specific booking in question."
      ]
    },
    {
      heading: "8. Privacy and Data Protection",
      paragraphs: [
        "We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, use, and safeguard your personal information."
      ]
    },
    {
      heading: "9. Intellectual Property",
      paragraphs: [
        "All content, trademarks, and intellectual property on Smart Pujari platform are owned by us or our licensors. Users may not reproduce, distribute, or create derivative works without our express written permission."
      ]
    },
    {
      heading: "10. Modifications to Terms",
      paragraphs: [
        "We reserve right to modify these terms at any time. Users will be notified of significant changes. Continued use of service after modifications constitutes acceptance of updated terms."
      ]
    },
    {
      heading: "11. Dispute Resolution",
      paragraphs: [
        "Any disputes arising from use of Smart Pujari shall be resolved through arbitration in accordance with Indian law. The jurisdiction for all disputes shall be Mumbai, Maharashtra."
      ]
    },
    {
      heading: "12. Contact Information",
      paragraphs: [
        "For questions or concerns regarding these terms, please contact our support team through app or email us at support@smartpujari.com"
      ]
    }
  ];

  return (
    <StaticContentScreen
      title="Terms & Conditions"
      lastUpdated="12 Feb 2026"
      sections={sections}
    />
  );
};

export default TermsConditionsScreen;
