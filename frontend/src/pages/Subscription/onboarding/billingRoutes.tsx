import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequireRole } from '@/App';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { SubscriptionPage } from '@/routes/workspacePages';
import FlowEntry from '@/pages/Onboarding/FlowEntry';
const owner=(page:React.ReactNode)=><RequireRole roles={['ADMIN']}><Suspense fallback={<LoadingSpinner fullScreen/>}>{page}</Suspense></RequireRole>;
/** Mounted beneath App restoration, outside marketing and operational layouts. */
export const billingRoutes:RouteObject[]=[
 {path:'continue',element:<Suspense fallback={<LoadingSpinner fullScreen/>}><FlowEntry/></Suspense>},
 {path:'choose-plan',element:owner(<SubscriptionPage/>)},
 {path:'welcome',element:owner(<SubscriptionPage activationReturn/>)},
 {path:'subscription',element:owner(<SubscriptionPage/>)},
 {path:'subscription/payment',element:owner(<SubscriptionPage/>)},
 {path:'subscription/activation',element:owner(<SubscriptionPage/>)},
 {path:'subscription/recovery',element:owner(<SubscriptionPage/>)},
];
