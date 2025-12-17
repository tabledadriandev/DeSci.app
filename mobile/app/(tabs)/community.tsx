import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCommunityPosts, createCommunityPost, likePost } from '@/lib/api';
import { getUserId } from '@/lib/user-id';

interface Post {
  id: string;
  content: string;
  type: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  user?: {
    walletAddress: string;
    username?: string;
  };
}

export default function CommunityScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadPosts();
    }
  }, [userId]);

  const loadUserId = async () => {
    const id = await getUserId();
    setUserId(id);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getCommunityPosts();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!userId || !newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityPost(userId, newPostContent.trim(), 'text');
      setNewPostContent('');
      setShowCreateForm(false);
      await loadPosts();
      Alert.alert('Success', 'Post shared! You earned 2 $TA tokens.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) {
      Alert.alert('Error', 'Please set your user ID in Profile');
      return;
    }
    try {
      await likePost(postId, userId);
      await loadPosts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to like post');
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return 'Anonymous';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!userId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-circle-outline" size={64} color="#8B8580" />
          <Text style={styles.emptyText}>Please set your user ID in Profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Ionicons
            name={showCreateForm ? 'close' : 'add-circle'}
            size={24}
            color="#0F4C81"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {showCreateForm && (
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Create Post</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What's on your mind?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
              placeholderTextColor="#8B8580"
              textAlignVertical="top"
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setShowCreateForm(false);
                  setNewPostContent('');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleCreatePost}
                disabled={submitting || !newPostContent.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F4C81" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#8B8580" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked = userId && post.likedBy?.includes(userId);
            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {post.user?.walletAddress?.slice(0, 2).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postAuthor}>
                      {post.user?.username || formatAddress(post.user?.walletAddress)}
                    </Text>
                    <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postFooter}>
                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => handleLike(post.id)}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isLiked ? '#EF4444' : '#6B6560'}
                    />
                    <Text
                      style={[styles.postActionText, isLiked && styles.postActionTextLiked]}
                    >
                      {post.likes || 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={20} color="#6B6560" />
                    <Text style={styles.postActionText}>Comment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3DC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F4C81',
  },
  createButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B6560',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B6560',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  createForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E8E3DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0F4C81',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonSecondary: {
    backgroundColor: '#F5F3F0',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  postTime: {
    fontSize: 12,
    color: '#8B8580',
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E3DC',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: '#6B6560',
  },
  postActionTextLiked: {
    color: '#EF4444',
    fontWeight: '600',
  },
});

