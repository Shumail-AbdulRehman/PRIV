import { ActivityIndicator, Pressable, View } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function PhotoCaptureControls({ disabled, busy, label, onCapture }: {
  disabled: boolean; busy: boolean; label: string; onCapture: () => void;
}) {
  const { t } = useLanguage();
  return <View className="items-center gap-2">
    <Pressable accessibilityRole="button" accessibilityLabel={t(label)} accessibilityState={{disabled:disabled || busy, busy}}
      disabled={disabled || busy} onPress={onCapture}
      style={({pressed})=>({width:88,height:88,borderRadius:44,borderWidth:2,borderColor:'#093F45',padding:5,opacity: disabled ? 0.45 : pressed ? 0.75 : 1})}>
      <View style={{flex:1,borderRadius:40,backgroundColor:'#093F45',alignItems:'center',justifyContent:'center'}}>
        {busy ? <ActivityIndicator color="white" size="large"/> : <Icon name="Camera" color="white" size={34}/>}
      </View>
    </Pressable>
    <Text className="text-base font-semibold text-primary" accessibilityLiveRegion="polite">{t(label)}</Text>
  </View>;
}

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
      {Array.from({length:Math.min(total,12)},(_,i)=><View key={i} style={{flex:1,height:6,borderRadius:4,backgroundColor:i<Math.ceil(current/total*Math.min(total,12))?'#093F45':'#E3E7E2'}}/>)}
    </View>
    <Text className="text-sm text-muted-foreground">{t('Photo {current} of {total}',{current,total})}</Text>
  </View>;
}
