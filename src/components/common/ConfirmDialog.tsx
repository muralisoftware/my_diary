import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Trash2, AlertTriangle } from 'lucide-react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = 'Delete Reflection?',
  message = 'Are you sure you want to delete this diary entry? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmType = 'danger',
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.isDark ? '#000000' : '#8C5A3C',
                },
              ]}
            >
              {/* Icon Header */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      confirmType === 'danger'
                        ? theme.isDark
                          ? '#3D1C1C'
                          : '#FEE2E2'
                        : theme.accentLight,
                  },
                ]}
              >
                {confirmType === 'danger' ? (
                  <Trash2
                    size={26}
                    color={theme.danger}
                  />
                ) : (
                  <AlertTriangle
                    size={26}
                    color={theme.accent}
                  />
                )}
              </View>

              {/* Title & Message */}
              <Text style={[styles.title, { color: theme.text }]}>
                {title}
              </Text>

              <Text style={[styles.message, { color: theme.textSecondary }]}>
                {message}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onCancel}
                  style={[
                    styles.button,
                    styles.cancelBtn,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.isDark ? '#232933' : '#F6F0E6',
                    },
                  ]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onConfirm}
                  style={[
                    styles.button,
                    styles.confirmBtn,
                    {
                      backgroundColor:
                        confirmType === 'danger' ? theme.danger : theme.accent,
                    },
                  ]}
                >
                  <Text style={styles.confirmBtnText}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
