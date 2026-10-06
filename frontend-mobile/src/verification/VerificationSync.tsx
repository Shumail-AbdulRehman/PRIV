import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { startEvidenceSync } from './sync';
export function VerificationSync() { const {user}=useAuth();useEffect(()=>{if(user&&Platform.OS!=='web')return startEvidenceSync();},[user?.companyId,user?.id]);return null; }
