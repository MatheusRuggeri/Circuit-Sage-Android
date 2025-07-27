import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';

// 1. Define a NEW props interface specifically for React Native
interface ButtonProps {
  children: React.ReactNode;
  // Use 'onPress' instead of 'onClick' and 'disabled' as a boolean
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  // Keep your variants and sizes
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  // Allow for custom style overrides
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style, // Use the style prop instead of className
}) => {
  // 2. Combine styles into arrays. This is the React Native way.
  const containerStyle: ViewStyle[] = [
    styles.baseContainer,
    styles[variant], // e.g., styles.primary
    styles[size],    // e.g., styles.md
    disabled ? styles.disabledContainer : {}, // Apply disabled style if needed
    style,           // Apply custom styles last
  ];

  const textStyle: TextStyle[] = [
    styles.baseText,
    styles[`${variant}Text`], // e.g., styles.primaryText
    styles[`${size}Text`],    // e.g., styles.mdText
  ];

  return (
    // 3. Render a TouchableOpacity with the combined styles
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7} // Standard visual feedback for press
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

// 4. Create a StyleSheet object to hold all style translations
const styles = StyleSheet.create({
  // Base styles for the container and text
  baseContainer: {
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600', // font-semibold (React Native uses strings for weight)
  },
  // Disabled state style
  disabledContainer: {
    opacity: 0.5, // disabled:opacity-50
  },

  // --- Variant Styles ---
  primary: { backgroundColor: '#0284c7' /* bg-sky-600 */ },
  primaryText: { color: '#ffffff' /* text-white */ },
  
  secondary: { backgroundColor: '#334155' /* bg-slate-700 */ },
  secondaryText: { color: '#f1f5f9' /* text-slate-100 */ },
  
  danger: { backgroundColor: '#dc2626' /* bg-red-600 */ },
  dangerText: { color: '#ffffff' /* text-white */ },
  
  ghost: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: '#475569' /* border-slate-600 */
  },
  ghostText: { color: '#f1f5f9' /* text-slate-100 */ },

  // --- Size Styles ---
  sm: { paddingHorizontal: 12, paddingVertical: 6 /* px-3 py-1.5 */ },
  smText: { fontSize: 14 /* text-sm */ },
  
  md: { paddingHorizontal: 16, paddingVertical: 8 /* px-4 py-2 */ },
  mdText: { fontSize: 16 /* text-base */ },
  
  lg: { paddingHorizontal: 24, paddingVertical: 12 /* px-6 py-3 */ },
  lgText: { fontSize: 18 /* text-lg */ },
});

export default Button;