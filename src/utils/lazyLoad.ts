// Lazy loading utilities for code splitting
import { lazy, ComponentType } from 'react';
export const lazyLoadWithRetry = <T extends ComponentType<any>,>(importFunc: () => Promise<{
  default: T;
}>, retries = 3): ReturnType<typeof lazy> => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        importFunc().then(resolve).catch(error => {
          if (retriesLeft === 0) {
            reject(error);
            return;
          }
          setTimeout(() => {
            attemptImport(retriesLeft - 1);
          }, 1000);
        });
      };
      attemptImport(retries);
    });
  });
};

// Preload critical routes
export const preloadRoute = (importFunc: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    requestIdleCallback(() => {
      importFunc();
    });
  }
};