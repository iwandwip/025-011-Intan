import { useState } from 'react';
import { View } from 'react-native';
import { Calendar, DateType } from '~/components/ui/calendar';
import dayjs from 'dayjs';

interface SingleDatePickerProps {
  date: DateType;
  onChange: (date: DateType) => void;
  format?: string;
  placeholder?: string;
}

export default function SingleDatePicker({ 
  date, 
  onChange, 
  format = 'DD-MM-YYYY',
  placeholder = "Pick a date"
}: SingleDatePickerProps) {
  
  return (
    <View className="flex-1 gap-4">
      <Calendar
        mode="single"
        date={date}
        onChange={({ date }) => onChange(date)}
        // minDate={new Date()}
        // maxDate={new Date(new Date().getFullYear(), 11, 31)} // end of the year
      />
    </View>
  );
}