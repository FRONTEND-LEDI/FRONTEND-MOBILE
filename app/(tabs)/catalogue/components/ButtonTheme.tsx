import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type text = {
    text: string;
}
type TextProps = {
    data: text;
   
}
export default function ButtonTheme({ data }: TextProps) {
  return (
    <TouchableOpacity className='bg-secondary p-2 rounded-full justifify-center items-center'>
        <Text className='text-white font-semibold text-center'>{data.text}</Text>
    </TouchableOpacity>
  )
}