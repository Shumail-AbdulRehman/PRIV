import { useLanguage } from '@/i18n/context';

const ur: Record<string,string> = {
 'Your locations':'آپ کے مقامات',
 'See your sites, teams, and today’s cleaning work.':'اپنے مقامات، ٹیموں اور آج کے صفائی کے کام دیکھیں۔',
 'Location register':'مقامات کا رجسٹر',
 'Saved sites in your workspace':'آپ کے ورک اسپیس میں محفوظ مقامات',
 'Today at this location':'آج اس مقام پر',
 'Start with the exceptions, then check the schedule.':'پہلے توجہ طلب امور دیکھیں، پھر شیڈول کی جانچ کریں۔',
 'The facts used by attendance and scheduling.':'حاضری اور شیڈول کے لیے استعمال ہونے والی معلومات۔',
 'Site-local day':'مقام کا مقامی دن',
 'Submission is not verification':'جمع کرنا تصدیق نہیں ہے',
 'Reusable cleaning requirements':'صفائی کی دوبارہ استعمال ہونے والی شرائط',
 'Immutable task snapshots':'کام کی محفوظ نقل تبدیل نہیں ہوتی',
 'Waiting for a decision':'فیصلے کے منتظر',
 '{present} checked in · {missing} not checked in':'{present} کی حاضری درج · {missing} کی حاضری درج نہیں',
 '{progress} in progress · {overdue} overdue':'{progress} جاری · {overdue} کا وقت گزر گیا',
 'View reviews':'جائزے دیکھیں',
 'View area templates':'علاقے کے سانچے دیکھیں',
 'Area templates are unavailable.':'علاقے کے سانچے دستیاب نہیں۔',
 'Attendance uses the saved geofence and reported device location.':'حاضری محفوظ مقام کی حد اور آلے کی بتائی گئی جگہ استعمال کرتی ہے۔',
 'Staff shifts':'عملے کی شفٹیں',
 'Review each worker’s saved shift in Staff and shifts.':'عملے اور شفٹوں میں ہر کارکن کی محفوظ شفٹ دیکھیں۔',
 'No shift configured':'کوئی شفٹ مقرر نہیں',
 'Shift times vary by worker':'شفٹ کا وقت کارکن کے مطابق مختلف ہے',
 'Today’s attendance and task totals are unavailable.':'آج کی حاضری اور کام کے مجموعے دستیاب نہیں۔',
 'Showing {count} locations':'{count} مقامات دکھائے جا رہے ہیں',
 'Clear filters':'فلٹر صاف کریں',
 'Location not found':'مقام نہیں ملا',
 'Return to locations':'مقامات پر واپس جائیں',
 'No saved location is available at this address.':'اس پتے پر کوئی محفوظ مقام دستیاب نہیں۔',
 'Checking today’s work…':'آج کا کام دیکھا جا رہا ہے…',
};
export function useLocationLanguage() {
 const context=useLanguage();
 return {...context,t:(text:string,values?:Record<string,string|number>)=>{
  if(context.language!=='ur'||!ur[text])return context.t(text,values);
  return ur[text].replace(/\{(\w+)\}/g,(match,key)=>String(values?.[key]??match));
 }};
}
