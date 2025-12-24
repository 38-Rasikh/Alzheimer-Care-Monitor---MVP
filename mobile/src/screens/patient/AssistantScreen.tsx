import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, TextInput, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
  requiresEscalation?: boolean;
}

const quickQuestions = [
  { id: '1', text: 'What day is it?', icon: 'calendar' },
  { id: '2', text: 'Who is Jane?', icon: 'account' },
  { id: '3', text: 'What should I do next?', icon: 'format-list-checkbox' },
  { id: '4', text: 'Where am I?', icon: 'map-marker' },
  { id: '5', text: "What's the weather?", icon: 'weather-sunny' },
  { id: '6', text: 'I need help', icon: 'alert-circle' },
];

export default function AssistantScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Hello! I\'m here to help you. You can ask me about today, your family, or what to do next.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const assistantMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiClient.post(
        `/api/patient/${user?.id}/assistant/query`,
        { query }
      );
      return response.data;
    },
  });

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Get assistant response
    try {
      const response = await assistantMutation.mutateAsync(trimmedText);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        intent: response.intent,
        requiresEscalation: response.requiresEscalation,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // Show escalation notice if needed
      if (response.requiresEscalation) {
        setTimeout(() => {
          const escalationMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: '✓ Your caregiver has been notified and will check on you soon.',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, escalationMessage]);
        }, 1500);
      }
    } catch (error) {
      console.error('Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I\'m having trouble right now. Please try again or contact your caregiver.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleQuickQuestion = (text: string) => {
    handleSend(text);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.quickQuestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickQuestionsContent}
        >
          {quickQuestions.map((q) => (
            <Chip
              key={q.id}
              icon={q.icon}
              onPress={() => handleQuickQuestion(q.text)}
              style={styles.quickChip}
              textStyle={styles.quickChipText}
              disabled={assistantMutation.isPending}
            >
              {q.text}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {!message.isUser && (
              <MaterialCommunityIcons
                name="robot"
                size={28}
                color={colors.primary}
                style={styles.messageIcon}
              />
            )}
            <View style={styles.messageContent}>
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.assistantText,
                ]}
              >
                {message.text}
              </Text>
              {message.requiresEscalation && !message.isUser && (
                <View style={styles.escalationBadge}>
                  <MaterialCommunityIcons name="alert" size={16} color={colors.warning} />
                  <Text style={styles.escalationText}>Alert sent to caregiver</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        
        {assistantMutation.isPending && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <MaterialCommunityIcons
              name="robot"
              size={28}
              color={colors.primary}
              style={styles.messageIcon}
            />
            <View style={styles.messageContent}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
          mode="outlined"
          style={styles.input}
          multiline
          maxLength={200}
          onSubmitEditing={() => handleSend(inputText)}
          disabled={assistantMutation.isPending}
          right={
            <TextInput.Icon
              icon="send"
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim() || assistantMutation.isPending}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickQuestionsContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  quickQuestionsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  quickChip: {
    backgroundColor: colors.primaryLight,
    height: 48,
  },
  quickChipText: {
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    gap: spacing.sm,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageIcon: {
    marginTop: spacing.xs,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 20,
    padding: spacing.md,
    borderRadius: 12,
    lineHeight: 28,
  },
  userText: {
    backgroundColor: colors.primary,
    color: '#fff',
  },
  assistantText: {
    backgroundColor: colors.surface,
    color: colors.text,
  },
  escalationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  escalationText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  typingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    backgroundColor: colors.background,
    fontSize: 18,
    maxHeight: 120,
  },
});
