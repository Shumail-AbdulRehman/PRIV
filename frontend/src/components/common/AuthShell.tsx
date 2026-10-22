import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/context';
import BrandLogo from './BrandLogo';
import LanguageChoice from './LanguageChoice';
import '@/workspace.css';
import '@/workspace-refresh.css';
import './auth.css';

// The approved gallery's public journeys share this centered real form surface.
export default function AuthShell({title,subtitle,children,footer}:{
 title:string;subtitle:string;children:ReactNode;footer:ReactNode;
}) {
 const {t}=useLanguage();
 useEffect(()=>{document.title=`${title} | Hygene Ops`;},[title]);
 return <div className="workspace v5-auth-page">
  <a className="v5-auth-skip" href="#auth-content">{t('Skip to content')}</a>
  <main className="v5-auth" id="auth-content" tabIndex={-1}>
   <Link to="/login" className="v5-auth-brand" aria-label={t('Hygene Ops sign in')}><BrandLogo/></Link>
   <h1>{title}</h1>
   <section className="v5-auth-panel" aria-label={title}>
    <p className="v5-auth-description">{subtitle}</p>
    {children}
    <div className="v5-auth-footer">{footer}</div>
   </section>
   <div className="v5-auth-language"><LanguageChoice/></div>
  </main>
 </div>;
}
