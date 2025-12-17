import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTelemedicineAppointments, getTelemedicineRecords, uploadMedicalRecord } from '@/lib/api';
import { getUserId } from '@/lib/user-id';

interface Appointment {
  id: string;
  startTime: string;
  endTime?: string | null;
  status: string;
  reason?: string | null;
  provider: {
    id: string;
    fullName: string;
    type: string;
  };
}

interface MedicalRecord {
  id: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  provider?: {
    id: string;
    fullName: string;
  } | null;
  sharedWithProviderIds: string[];
}

export default function TelemedicineScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'records'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, activeTab]);

  const loadUserId = async () => {
    const id = await getUserId();
    setUserId(id);
  };

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const data = await getTelemedicineAppointments(userId);
        if (data?.appointments) {
          setAppointments(data.appointments);
        }
      } else {
        const data = await getTelemedicineRecords(userId);
        if (data?.records) {
          setRecords(data.records);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!userId || !title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    setUploading(true);
    try {
      const result = await uploadMedicalRecord(userId, title.trim(), description.trim() || undefined, fileUrl.trim() || undefined);
      if (result?.record) {
        setRecords([result.record, ...records]);
        setTitle('');
        setDescription('');
        setFileUrl('');
        setShowUploadForm(false);
        Alert.alert('Success', 'Medical record saved');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save record');
    } finally {
      setUploading(false);
    }
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
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'appointments' && styles.tabActive]}
          onPress={() => setActiveTab('appointments')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === 'appointments' ? '#0F4C81' : '#8B8580'}
          />
          <Text
            style={[styles.tabText, activeTab === 'appointments' && styles.tabTextActive]}
          >
            Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'records' && styles.tabActive]}
          onPress={() => setActiveTab('records')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'records' ? '#0F4C81' : '#8B8580'}
          />
          <Text style={[styles.tabText, activeTab === 'records' && styles.tabTextActive]}>
            Records
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F4C81" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : activeTab === 'appointments' ? (
          <>
            {appointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#8B8580" />
                <Text style={styles.emptyText}>No appointments yet</Text>
                <Text style={styles.emptySubtext}>
                  Book your first consultation from the web app
                </Text>
              </View>
            ) : (
              appointments.map((appt) => {
                const start = new Date(appt.startTime);
                const end = appt.endTime ? new Date(appt.endTime) : null;
                const statusColors: Record<string, { bg: string; text: string }> = {
                  confirmed: { bg: '#D1FAE5', text: '#065F46' },
                  completed: { bg: '#F3F4F6', text: '#374151' },
                  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
                  pending: { bg: '#FEF3C7', text: '#92400E' },
                };
                const statusStyle = statusColors[appt.status] || statusColors.pending;
                return (
                  <View key={appt.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons name="medical-outline" size={20} color="#0F4C81" />
                        <Text style={styles.cardTitle}>{appt.provider.fullName}</Text>
                      </View>
                      <View
                        style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                      >
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {appt.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B6560" />
                        <Text style={styles.cardText}>
                          {start.toLocaleDateString()} at{' '}
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {end &&
                            ` - ${end.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`}
                        </Text>
                      </View>
                      {appt.reason && (
                        <View style={styles.cardRow}>
                          <Ionicons name="chatbubble-outline" size={16} color="#6B6560" />
                          <Text style={styles.cardText}>{appt.reason}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {!showUploadForm ? (
              <>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowUploadForm(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Record</Text>
                </TouchableOpacity>
                {records.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={64} color="#8B8580" />
                    <Text style={styles.emptyText}>No records yet</Text>
                    <Text style={styles.emptySubtext}>
                      Add your first medical record or lab result
                    </Text>
                  </View>
                ) : (
                  records.map((record) => (
                    <View key={record.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <Ionicons name="document-text-outline" size={20} color="#0F4C81" />
                          <Text style={styles.cardTitle}>{record.title}</Text>
                        </View>
                      </View>
                      {record.description && (
                        <View style={styles.cardBody}>
                          <Text style={styles.cardText}>{record.description}</Text>
                        </View>
                      )}
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardFooterText}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </Text>
                        {record.fileUrl && (
                          <TouchableOpacity
                            onPress={() => {
                              // In a real app, open the URL
                              Alert.alert('File', record.fileUrl || '');
                            }}
                          >
                            <Text style={styles.linkText}>View File</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              <View style={styles.uploadForm}>
                <Text style={styles.formTitle}>Add Medical Record</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title (required)"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#8B8580"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#8B8580"
                />
                <TextInput
                  style={styles.input}
                  placeholder="File URL (optional)"
                  value={fileUrl}
                  onChangeText={setFileUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor="#8B8580"
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => {
                      setShowUploadForm(false);
                      setTitle('');
                      setDescription('');
                      setFileUrl('');
                    }}
                  >
                    <Text style={styles.buttonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleUpload}
                    disabled={uploading || !title.trim()}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonPrimaryText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3DC',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0F4C81',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8580',
  },
  tabTextActive: {
    color: '#0F4C81',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6B6560',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E3DC',
  },
  cardFooterText: {
    fontSize: 12,
    color: '#8B8580',
  },
  linkText: {
    fontSize: 12,
    color: '#0F4C81',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F4C81',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E3DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
});

