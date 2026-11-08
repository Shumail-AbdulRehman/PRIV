import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequireRole } from '@/App';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { SubscriptionPage, WelcomePage, ChoosePlanPage } from '@/routes/workspacePages';
const owner=(page:React.ReactNode)=><RequireRole roles={['ADMIN']}><Suspense fallback={<LoadingSpinner fullScreen/>}>{page}</Suspense></RequireRole>;
/** Mounted beneath App restoration, outside marketing and operational layouts. */
export const billingRoutes:RouteObject[]=[
 {path:'choose-plan',element:owner(<ChoosePlanPage/>)},
 {path:'welcome',element:owner(<WelcomePage/>)},
 {path:'subscription',element:owner(<SubscriptionPage/>)},
 {path:'subscription/payment',element:owner(<SubscriptionPage/>)},
 {path:'subscription/activation',element:owner(<SubscriptionPage activationReturn/>)},
 {path:'subscription/recovery',element:owner(<SubscriptionPage/>)},
];
