import { ReadonlyURLSearchParams } from 'next/navigation';

export const getParam = (sp: ReadonlyURLSearchParams | null | undefined, key: string) =>
  sp?.get(key) ?? undefined;

export const mustParam = (sp: ReadonlyURLSearchParams | null | undefined, key: string) => {
  const v = sp?.get(key);
  if (!v) throw new Error(`Missing required searchParam: ${key}`);
  return v;
};

export const getParamAsNumber = (sp: ReadonlyURLSearchParams | null | undefined, key: string, defaultValue: number = 0) => {
  const value = sp?.get(key);
  if (!value) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export const getParamAsBoolean = (sp: ReadonlyURLSearchParams | null | undefined, key: string, defaultValue: boolean = false) => {
  const value = sp?.get(key);
  if (!value) return defaultValue;
  return value === 'true';
};

export const safeRouteParam = (params: any, key: string) => {
  return params?.[key] as string | undefined;
};

export const mustRouteParam = (params: any, key: string) => {
  const value = params?.[key];
  if (!value) throw new Error(`Missing required route param: ${key}`);
  return value as string;
};