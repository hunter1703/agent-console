/**
 * Catalog API Module
 * Handles catalog/list, catalog/search, and catalog/{type}/{id} operations
 */

import { API_CONFIG } from '../config';

const API_BASE = API_CONFIG.BASE_URL;

// ============================================================================
// Types
// ============================================================================

export interface CatalogQuery {
    assetType: string;
    query?: {
        page?: {
            offset: number;
            limit: number;
        };
        filter?: {
            field: string;
            op: 'EQ' | 'NE' | 'GT' | 'LT' | 'GTE' | 'LTE' | 'IN' | 'LIKE';
            values: any[];
        };
        sort?: {
            field: string;
            direction: 'ASC' | 'DESC';
        };
    };
    options?: {
        query?: string;
        [key: string]: any;
    };
}

export interface CatalogResult {
    items: any[];
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
}

export interface CatalogSearchOptions extends CatalogQuery {
    options?: {
        query?: string;
        [key: string]: any;
    };
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List items from the catalog
 */
export async function catalogList(query: CatalogQuery): Promise<CatalogResult> {
    const response = await fetch(`${API_BASE}/v1/catalog/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
    });

    if (!response.ok) {
        throw new Error(`Failed to list catalog items: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Search items in the catalog
 */
export async function catalogSearch(query: CatalogSearchOptions): Promise<CatalogResult> {
    const response = await fetch(`${API_BASE}/v1/catalog/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
    });

    if (!response.ok) {
        throw new Error(`Failed to search catalog: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a specific resource by ID
 */
export async function catalogGetById(
    assetType: string,
    id: string,
    options?: { includeEvents?: boolean }
): Promise<any> {
    const params = new URLSearchParams();
    if (options?.includeEvents) {
        params.set('includeEvents', 'true');
    }

    const queryString = params.toString();
    const url = `${API_BASE}/v1/catalog/${assetType}/${id}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Failed to get ${assetType}: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create a new resource
 */
export async function catalogCreate(assetType: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE}/v1/catalog/${assetType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create ${assetType}: ${response.status} ${response.statusText} - ${error}`);
    }

    return response.json();
}

/**
 * Update an existing resource
 */
export async function catalogUpdate(assetType: string, id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE}/v1/catalog/${assetType}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update ${assetType}: ${response.status} ${response.statusText} - ${error}`);
    }

    return response.json();
}

/**
 * Delete a resource
 */
export async function catalogDelete(assetType: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/v1/catalog/${assetType}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete ${assetType}: ${response.status} ${response.statusText}`);
    }
}
