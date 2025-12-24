import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../state/AuthContext';
import { apiClient } from '../../services/api/client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Account for padding

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string | null;
  comfortingSentence: string;
  visitFrequency: string;
  lastVisit?: string;
}

interface MemoryAids {
  patientId: string;
  familyRoster: FamilyMember[];
  comfortingMessages: string[];
}

export default function MemoryAidsScreen() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: memoryAidsData, isLoading, error } = useQuery({
    queryKey: ['memoryAids', user?.id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/patient/${user?.id}/memory-aids`);
      return response.data;
    },
    enabled: !!user?.id && user?.role === 'patient',
  });

  const memoryAids = memoryAidsData as MemoryAids | undefined;
  const familyMembers = memoryAids?.familyRoster || [];
  const comfortingMessages = memoryAids?.comfortingMessages || [];

  // Auto-play carousel
  useEffect(() => {
    if (autoPlayEnabled && familyMembers.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % familyMembers.length);
      }, 8000); // Slow rotation: 8 seconds per card

      return () => {
        if (autoPlayTimer.current) {
          clearInterval(autoPlayTimer.current);
        }
      };
    }
  }, [autoPlayEnabled, familyMembers.length]);

  const handleNext = () => {
    setAutoPlayEnabled(false);
    setCurrentIndex((prev) => (prev + 1) % familyMembers.length);
  };

  const handlePrevious = () => {
    setAutoPlayEnabled(false);
    setCurrentIndex((prev) => (prev - 1 + familyMembers.length) % familyMembers.length);
  };

  const formatLastVisit = (lastVisit?: string) => {
    if (!lastVisit) return '';
    
    const visit = new Date(lastVisit);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Visited today';
    if (daysAgo === 1) return 'Visited yesterday';
    if (daysAgo <= 7) return `Visited ${daysAgo} days ago`;
    return `Last visit: ${visit.toLocaleDateString()}`;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your family...</Text>
      </View>
    );
  }

  if (error || !memoryAids) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>Unable to load family information</Text>
      </View>
    );
  }

  if (familyMembers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="account-multiple" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No family members added yet</Text>
      </View>
    );
  }

  const currentMember = familyMembers[currentIndex];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Your Family Loves You</Text>
        <Text style={styles.subheader}>
          These are the people who care about you
        </Text>

        {/* Main Carousel Card */}
        <View style={styles.carouselContainer}>
          <Card style={styles.mainCard} elevation={4}>
            <Card.Content style={styles.mainCardContent}>
              {/* Photo or Icon */}
              <View style={styles.photoContainer}>
                {currentMember.photoUrl ? (
                  <Image 
                    source={{ uri: currentMember.photoUrl }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.iconPlaceholder}>
                    <MaterialCommunityIcons
                      name="account-heart"
                      size={120}
                      color={colors.primary}
                    />
                  </View>
                )}
              </View>

              {/* Member Info */}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{currentMember.name}</Text>
                <Text style={styles.memberRelationship}>{currentMember.relationship}</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.comfortingMessage}>
                  "{currentMember.comfortingSentence}"
                </Text>

                {currentMember.lastVisit && (
                  <View style={styles.visitInfo}>
                    <MaterialCommunityIcons 
                      name="calendar-heart" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.visitText}>
                      {formatLastVisit(currentMember.lastVisit)}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Navigation Controls */}
          {familyMembers.length > 1 && (
            <View style={styles.navigationContainer}>
              <IconButton
                icon="chevron-left"
                size={40}
                iconColor={colors.primary}
                onPress={handlePrevious}
                style={styles.navButton}
              />
              
              <View style={styles.dotsContainer}>
                {familyMembers.map((_: FamilyMember, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>

              <IconButton
                icon="chevron-right"
                size={40}
                iconColor={colors.primary}
                onPress={handleNext}
                style={styles.navButton}
              />
            </View>
          )}

          {/* Auto-play indicator */}
          {familyMembers.length > 1 && (
            <TouchableOpacity 
              onPress={() => setAutoPlayEnabled(!autoPlayEnabled)}
              style={styles.autoPlayButton}
            >
              <MaterialCommunityIcons
                name={autoPlayEnabled ? "pause-circle" : "play-circle"}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.autoPlayText}>
                {autoPlayEnabled ? 'Auto-play on' : 'Auto-play off'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comforting Messages */}
        {comfortingMessages.length > 0 && (
          <Card style={styles.comfortCard}>
            <Card.Content>
              <MaterialCommunityIcons name="heart" size={40} color={colors.error} />
              <Text style={styles.comfortTitle}>Remember</Text>
              {comfortingMessages.map((message: string, index: number) => (
                <Text key={index} style={styles.comfortMessage}>
                  • {message}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subheader: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  carouselContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  mainCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
  },
  mainCardContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  photoContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    gap: spacing.md,
  },
  memberName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  memberRelationship: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  comfortingMessage: {
    fontSize: 20,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  visitText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: CARD_WIDTH,
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    margin: 0,
    backgroundColor: colors.primaryLight,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 32,
  },
  autoPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  autoPlayText: {
    fontSize: 14,
    color: colors.primary,
  },
  comfortCard: {
    backgroundColor: colors.primaryLight,
    elevation: 2,
    marginTop: spacing.md,
  },
  comfortTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  comfortMessage: {
    fontSize: 18,
    color: colors.text,
    marginVertical: spacing.xs,
    lineHeight: 26,
  },
});
