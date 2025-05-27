import { Column, ColumnDef } from '@tanstack/react-table';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Dimensions, TouchableOpacity, View, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button } from '~/components/ui/button';
import { DataTable } from '~/components/ui/data-table';
import { Skeleton } from '~/components/ui/skeleton';
import { TableCell, TableRow } from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import { ArrowDown, ArrowLeft, ArrowUp, Edit, Info, Trash, X } from 'lucide-react-native';
import { getHealthRecords } from '../api/health';
import { Health } from '~/types/health';
import dayjs from 'dayjs';
import { Input } from '~/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select';
import { ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { updateHealthRecord, deleteHealthRecord } from '~/app/api/health';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

export const columns: ColumnDef<Health>[] = [
  {
    accessorKey: 'createdAt',
    size: 100,
    header: ({ column }) => <Header title='Tanggal' column={column} />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      const formattedDate = dayjs(date).format('DD/MM/YYYY'); // Use 24-hour format
      return (
        <Text className='text-foreground font-medium'>
        {formattedDate}
      </Text>
      );
    },
  },
  {
    accessorKey: 'height',
    size: 100,
    header: ({ column }) => <Header title='Tinggi' column={column} />,
    cell: ({ row }) => {
      return <Text className='text-foreground'>{row.getValue('height')}</Text>;
    },
  },
  {
    accessorKey: 'weight',
    size: 100,
    header: ({ column }) => <Header title='Berat' column={column} />,
    cell: ({ row }) => {
      return <Text className='text-foreground'>{row.getValue('weight')}</Text>;
    },
  },
  {
    accessorKey: 'statusGizi',
    size: 100,
    header: ({ column }) => <Header title='Status Gizi' column={column} />,
    cell: ({ row }) => {
      const status = row.getValue('statusGizi')?.toString().toLowerCase() || '';
      
      // Define the style based on the status
      const getStatusStyle = () => {
        if (status.includes('baik')) {
          return 'bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium';
        } else if (status.includes('buruk')) {
          return 'bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium';
        }
        return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium'; // default style
      };
      

      return (
        <View className="flex items-center justify-center">
          <Text className={getStatusStyle()}>
            {row.getValue('statusGizi')}
          </Text>
        </View>
      );
    },
  },
];

export default function ListData() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [fetchedData, setFetchedData] = React.useState<Health[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Health | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    weight: '',
    height: '',
    statusGizi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHealthData = React.useCallback(async () => {
    try {
      const data = await getHealthRecords(userId);
      setFetchedData(data);
    } catch (error) {
      console.error('Error fetching health data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch health data',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await fetchHealthData();
    setIsRefreshing(false);
  }, [fetchHealthData]);

  React.useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  const handleEditPress = () => {
    if (selectedRecord) {
      setEditForm({
        weight: selectedRecord.weight,
        height: selectedRecord.height,
        statusGizi: selectedRecord.statusGizi
      });
      setIsDetailsModalVisible(false);
      setIsEditModalVisible(true);
    }
  };

  const handleDeletePress = () => {
    setIsDetailsModalVisible(false);
    setIsDeleteModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedRecord) return;
    
    try {
      setIsSubmitting(true);
      await updateHealthRecord(
        userId,
        selectedRecord.id,
        editForm
      );
      
      // Refresh data
      await fetchHealthData();
      
      // Close modal
      setIsEditModalVisible(false);
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Health record updated successfully',
      });
    } catch (error) {
      console.error('Error updating health record:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update health record',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    
    try {
      setIsSubmitting(true);
      await deleteHealthRecord(
        userId,
        selectedRecord.id
      );
      
      // Refresh data
      await fetchHealthData();
      
      // Close modal
      setIsDeleteModalVisible(false);
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Health record deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting health record:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete health record',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShadowVisible: false }} />
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#000000" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-black-700">Rekap Data</Text>
              <View style={{ width: 24 }} />
            </View>
      {/* <Text className="text-xl font-bold text-center my-4">Rekap Data</Text> */}
      
      <DataTable
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        data={fetchedData}
        columns={columns}
        onRowPress={(row) => {
          const record = row.original as Health;
          setSelectedRecord(record);
          setIsDetailsModalVisible(true);
        }}
        ListEmptyComponent={() => {
          return (
            <TableRow className='border-b-0 dark:opacity-50'>
              <TableCell style={{ height, width }} className='flex-1'>
                <Text className="text-center text-muted-foreground">
                  {isLoading ? 'Loading...' : 'No health data found'}
                </Text>
              </TableCell>
            </TableRow>
          );
        }}
      />

      {/* Details Modal */}
      <Modal
        visible={isDetailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDetailsModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Health Details</Text>
              <TouchableOpacity onPress={() => setIsDetailsModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {selectedRecord && (
              <View className="space-y-4">
                <View className="bg-gray-50 p-4 rounded-xl">
                  <Text className="text-gray-500 text-sm mb-1">Date</Text>
                  <Text className="text-lg font-medium">
                    {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Text>
                </View>
                
                <View className="flex-row space-x-4">
                  <View className="flex-1 bg-gray-50 p-4 rounded-xl">
                    <Text className="text-gray-500 text-sm mb-1">Weight</Text>
                    <Text className="text-lg font-medium">{selectedRecord.weight}</Text>
                  </View>
                  
                  <View className="flex-1 bg-gray-50 p-4 rounded-xl">
                    <Text className="text-gray-500 text-sm mb-1">Height</Text>
                    <Text className="text-lg font-medium">{selectedRecord.height}</Text>
                  </View>
                </View>
                
                <View className="bg-gray-50 p-4 rounded-xl">
                  <Text className="text-gray-500 text-sm mb-1">Status Gizi</Text>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mt-1">
                      <View className={`w-3 h-3 rounded-full mr-2 ${
                        selectedRecord.statusGizi.toLowerCase().includes('baik') 
                          ? 'bg-green-500' 
                          : selectedRecord.statusGizi.toLowerCase().includes('buruk')
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                      }`} />
                      <Text className="text-lg font-medium">{selectedRecord.statusGizi}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row space-x-4 mt-4">
                  <Button 
                    className="flex-1 bg-blue-500" 
                    onPress={handleEditPress}
                  >
                    <View className="flex-row items-center">
                      <Edit size={18} color="#fff" className="mr-2" />
                      <Text className="text-white font-medium">Edit</Text>
                    </View>
                  </Button>
                  
                  <Button 
                    className="flex-1 bg-red-500" 
                    onPress={handleDeletePress}
                  >
                    <View className="flex-row items-center">
                      <Trash size={18} color="#fff" className="mr-2" />
                      <Text className="text-white font-medium">Delete</Text>
                    </View>
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Edit Health Record</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-gray-500 text-sm mb-1">Weight</Text>
                <Input
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm({...editForm, weight: text})}
                  placeholder="e.g., 70 kg"
                />
              </View>
              
              <View>
                <Text className="text-gray-500 text-sm mb-1">Height</Text>
                <Input
                  value={editForm.height}
                  onChangeText={(text) => setEditForm({...editForm, height: text})}
                  placeholder="e.g., 175 cm"
                />
              </View>
              
              <View>
                <Text className="text-gray-500 text-sm mb-1">Status Gizi</Text>
                <Input
                  value={editForm.statusGizi}
                  onChangeText={(text) => setEditForm({...editForm, statusGizi: text})}
                  placeholder="Gizi Baik"
                />
                {/* <Select
                  defaultValue={{value: editForm.statusGizi, label: editForm.statusGizi}}
                  onValueChange={(value) => setEditForm({...editForm, statusGizi: value?.label})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem label="Gizi Baik" value='Gizi Baik'>Gizi Baik</SelectItem>
                    <SelectItem label="Gizi Buruk" value='Gizi Buruk'>Gizi Buruk</SelectItem>
                    <SelectItem label="Gizi Lebih" value="Gizi Lebih">Gizi Lebih</SelectItem>
                    <SelectItem label="Gizi Kurang" value="Gizi Kurang">Gizi Kurang</SelectItem>
                  </SelectContent>
                </Select> */}
              </View>
              
              <Button 
                className="bg-blue-500 mt-4" 
                onPress={handleEditSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-medium">Save Changes</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-5/6 max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <Trash size={28} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-center">Delete Record</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete this health record? This action cannot be undone.
              </Text>
            </View>
            
            <View className="flex-row space-x-3 mt-4">
              <Button 
                className="flex-1 bg-gray-200" 
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </Button>
              
              <Button 
                className="flex-1 bg-red-500" 
                onPress={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-medium">Delete</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Header({ title, column }: { title: string; column: Column<Health> }) {
  return (
    <Button
      onPress={() => {
        if (column.getIsSorted() === 'desc') {
          column.clearSorting();
          return;
        }
        column.toggleSorting(column.getIsSorted() === 'asc');
      }}
      size='sm'
      variant='ghost'
      className='flex flex-row px-0 justify-start gap-1.5 web:hover:bg-background/0 web:hover:opacity-80 active:bg-background/0'
    >
      <Text className={'font-medium text-muted-foreground'}>{title}</Text>
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp size={15} className='ml-2 text-muted-foreground' />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown size={15} className='ml-2 text-muted-foreground' />
      ) : null}
    </Button>
  );
}