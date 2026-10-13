import { View } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';
import { LanguageChoice } from './LanguageChoice';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function StaffBrand() {
  const { isRTL } = useLanguage();
  return <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="Sparkles" size={28} color="#093F45" />
      <Text className="text-2xl font-bold text-primary">Hygene Ops</Text>
    </View>
    <LanguageChoice />
  </View>;
}
