import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
const useScope=()=>useSelector((s:RootState)=>`${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`);
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getException, getExceptions } from './api';
import type { ExceptionFilters } from './types';
export const useExceptions = (filters:ExceptionFilters={}) => {const scope=useScope();return useInfiniteQuery({queryKey:['exceptions',scope,filters],queryFn:({pageParam})=>getExceptions(filters,pageParam),initialPageParam:undefined as string|undefined,getNextPageParam:page=>page.nextCursor??undefined,refetchInterval:30000,refetchIntervalInBackground:false});};
export const useException = (id:number) => {const scope=useScope();return useQuery({queryKey:['exception',scope,id],queryFn:()=>getException(id),enabled:id>0,refetchInterval:30000});};
export const useExceptionCount = (enabled=true) => {const scope=useScope();return useQuery({queryKey:['exception-count',scope],queryFn:()=>getExceptions(),enabled,refetchInterval:30000,refetchIntervalInBackground:false});};
