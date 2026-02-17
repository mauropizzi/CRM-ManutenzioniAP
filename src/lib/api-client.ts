/**
 * Centralized API Client with Caching and Deduplication
 * 
 * This client prevents:
 * - Double fetches from React Strict Mode
 * - Multiple simultaneous identical requests
 * - Unnecessary re-connections to Supabase
 * - Stale data issues across route changes
 */

import { supabase } from '@/integrations/supabase/client';

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 2 * 60 * 1000, // 2 minutes
  LONG_TTL: 10 * 60 * 1000, // 10 minutes
};

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  fetchPromise?: Promise<T>;
}

// Global cache store
const cache = new Map<string, CacheEntry<any>>();

// Active request deduplication
const activeRequests = new Map<string, Promise<any>>();

// Cleanup interval
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Start cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Generate cache key from parameters
 */
function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  const paramString = JSON.stringify(params, Object.keys(params).sort());
  return `${endpoint}:${paramString}`;
}

/**
 * Get data from cache
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  const age = now - entry.timestamp;

  // Return cached data if still fresh
  if (age < entry.ttl) {
    return entry.data as T;
  }

  // Cache expired, remove it
  cache.delete(key);
  return null;
}

/**
 * Set data in cache
 */
function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Execute a fetch with deduplication and caching
 */
async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_CONFIG.DEFAULT_TTL
): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Check if request is already in flight (deduplication)
  if (activeRequests.has(key)) {
    return activeRequests.get(key) as Promise<T>;
  }

  // Create new fetch promise
  const fetchPromise = fetcher()
    .then((data) => {
      // Cache successful response
      setCache(key, data, ttl);
      activeRequests.delete(key);
      return data;
    })
    .catch((error) => {
      activeRequests.delete(key);
      throw error;
    });

  // Store active request for deduplication
  activeRequests.set(key, fetchPromise);

  return fetchPromise;
}

/**
 * Clear cache for specific endpoint or all
 */
export function clearCache(endpoint?: string): void {
  if (endpoint) {
    // Clear all cache entries that start with the endpoint
    for (const key of cache.keys()) {
      if (key.startsWith(endpoint)) {
        cache.delete(key);
      }
    }
  } else {
    // Clear entire cache
    cache.clear();
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * Fetch materials with caching
   */
  async fetchMaterials() {
    const key = 'materials';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('description', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch suppliers with caching
   */
  async fetchSuppliers() {
    const key = 'suppliers';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('ragione_sociale', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch technicians with caching
   */
  async fetchTechnicians() {
    const key = 'technicians';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('technicians')
          .select('*')
          .order('last_name', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch customers with caching
   */
  async fetchCustomers() {
    const key = 'customers';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('company_name', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch service points with caching
   */
  async fetchServicePoints(customerId?: string) {
    const key = generateCacheKey('service-points', { customerId });
    return fetchWithCache(
      key,
      async () => {
        let query = supabase
          .from('service_points')
          .select('*')
          .order('name', { ascending: true });
        
        if (customerId) {
          query = query.eq('customer_id', customerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch interventions with caching (shorter TTL)
   */
  async fetchInterventions() {
    const key = 'interventions';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('intervention_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.SHORT_TTL
    );
  },

  /**
   * Fetch brands with caching
   */
  async fetchBrands() {
    const key = 'brands';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Fetch system types with caching
   */
  async fetchSystemTypes() {
    const key = 'system-types';
    return fetchWithCache(
      key,
      async () => {
        const { data, error } = await supabase
          .from('system_types')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      CACHE_CONFIG.LONG_TTL
    );
  },

  /**
   * Invalidate cache after mutation
   */
  invalidate(endpoint: string): void {
    clearCache(endpoint);
  },
};