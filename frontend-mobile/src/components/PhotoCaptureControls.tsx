import { v5Colors } from '../theme';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function PhotoCaptureControls({ disabled, busy, label, onCapture }: {
  disabled: boolean; busy: boolean; label: string; onCapture: () => void;
}) {
  const { t } = useLanguage();
  const [pressed, setPressed] = useState(false);
  return <View style={captureStyles.controls}>
    <Pressable accessibilityRole="button" accessibilityLabel={t(label)} accessibilityState={{disabled:disabled || busy, busy}}
      disabled={disabled || busy} onPress={onCapture}
      onPressIn={()=>setPressed(true)} onPressOut={()=>setPressed(false)}
      style={[captureStyles.shutter, {opacity: disabled ? 0.45 : pressed && !busy ? 0.75 : 1}]}>
      <View pointerEvents="none" style={captureStyles.shutterFace}>
        {busy ? <ActivityIndicator color="white" size="large"/> : <Icon name="Camera" color="white" size={34}/>}
      </View>
    </Pressable>
    <Text className="text-base font-semibold text-primary" accessibilityLiveRegion="polite">{t(label)}</Text>
  </View>;
}

// NativeWind processes inline styles before Pressable evaluates style callbacks.
// Keep shutter geometry in plain styles so it cannot lose its bounds or flex
// into the screen. Only opacity changes while pressing.
const captureStyles = StyleSheet.create({
  controls: {width:'100%',alignItems:'center',gap:8,flexGrow:0,flexShrink:0},
  shutter: {width:88,height:88,flexGrow:0,flexShrink:0,alignSelf:'center',
    borderRadius:44,borderWidth:2,borderColor:v5Colors.primary,padding:5,
    alignItems:'center',justifyContent:'center'},
  shutterFace: {width:74,height:74,borderRadius:37,backgroundColor:v5Colors.primary,
    alignItems:'center',justifyContent:'center'},
});

export function CaptureFrame() {
  return <View pointerEvents="none" style={{position:'absolute',top:24,left:24,right:24,bottom:24}}>
    {['tl','tr','bl','br'].map(corner=><View key={corner} style={{position:'absolute',width:32,height:32,borderColor:'#FFFFFF',
      ...(corner.includes('t')?{top:0,borderTopWidth:3}:{bottom:0,borderBottomWidth:3}),
      ...(corner.includes('l')?{left:0,borderLeftWidth:3}:{right:0,borderRightWidth:3}),borderRadius:8}}/>)}
  </View>;
}

export function PhotoStepProgress({current,total}:{current:number;total:number}) {
  const { t, isRTL } = useLanguage();
  return <View className="gap-2">
    <View style={{flexDirection:isRTL?'row-reverse':'row',gap:5}} accessible={false}>
      {Array.from({length:Math.min(total,12)},(_,i)=><View key={i} style={{flex:1,height:6,borderRadius:4,backgroundColor:i<Math.ceil(current/total*Math.min(total,12))?v5Colors.primary:v5Colors.border}}/>)}
    </View>
    <Text className="text-sm text-muted-foreground">{t('Photo {current} of {total}',{current,total})}</Text>
  </View>;
}
