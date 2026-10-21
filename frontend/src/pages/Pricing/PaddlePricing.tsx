import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import type { PlanCode } from '../Subscription/types';
import { TIERS } from './tiers';
import EnterprisePlan from './EnterprisePlan';

export function PaddlePricing({currentPlan,subscribeDisabled=false,disabledMessage}: {
 appearance?:'default'|'marketing';currentPlan?:PlanCode;subscribeDisabled?:boolean;disabledMessage?:string;
}) {
 const {user}=useAuth();const {t}=useLanguage();
 return <div className="saas-pricing">
  <p className="pricing-message" role="status">{t('Prices and any trial are available only from the configured provider catalog in owner billing. No payment starts on this page.')}</p>
  <div className="plan-grid">{TIERS.map(tier=><article key={tier.name} className="saas-plan">
   <div className="plan-title"><h2>{tier.name}</h2>{currentPlan===tier.name.toUpperCase()?<span>{t('Current capacity plan')}</span>:null}</div>
   <p>{tier.description}</p><ul className="plan-features">{[...tier.capacity,...tier.features].map(feature=><li key={feature}><Check aria-hidden="true"/>{feature}</li>)}</ul>
   {subscribeDisabled||user&&user.role!=='ADMIN'?<p>{t(disabledMessage??'Only the company owner can view or change billing.')}</p>:<Link className="marketing-button secondary-button" to={user?'/subscription':'/signup'}>{t(user?'Open Plan & billing':'Create an account to view billing')}</Link>}
  </article>)}<EnterprisePlan/></div>
 </div>;
}
