export interface Product {
    id: number;
    sku: string; 
    name: string;
    parent: string;
    description: string;
    type: string;
    shortDescription: string; 
    categories: string; 
    tags: string; 
    isInDevelopment: string;
    isEol: string;
    isActive: string;
    family_grouping: string;
    shoutout: string;
    is_active: number;
    is_in_development: number;
    is_eol: number;
    product_id: number;
    brand_type_id: NumberConstructor;
}
