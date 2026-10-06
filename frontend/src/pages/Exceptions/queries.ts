import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getException, getExceptions } from './api';
import type { ExceptionFilters } from './types';
export const useExceptions = (filters:ExceptionFilters={}) => useInfiniteQuery({queryKey:['exceptions',filters],queryFn:({pageParam})=>getExceptions(filters,pageParam),initialPageParam:undefined as string|undefined,getNextPageParam:page=>page.nextCursor??undefined,refetchInterval:30000,refetchIntervalInBackground:false});
export const useException = (id:number) => useQuery({queryKey:['exception',id],queryFn:()=>getException(id),enabled:id>0,refetchInterval:30000});
export const useExceptionCount = (enabled=true) => useQuery({queryKey:['exception-count'],queryFn:()=>getExceptions(),enabled,refetchInterval:30000,refetchIntervalInBackground:false});
