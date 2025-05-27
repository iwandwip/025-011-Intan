import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '~/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, placeholderClassName, label, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="mb-2">
        {label && (
          <Text className="text-sm font-medium text-foreground mb-1.5">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
            props.editable === false && 'opacity-50 web:cursor-not-allowed',
            isFocused && 'border-2 border-gray-400', // Add blue border when focused
            className
          )}
          placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };