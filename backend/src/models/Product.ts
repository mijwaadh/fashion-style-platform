import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    salePrice?: number; // Price after discount
    discountPercentage?: number; // Discount amount
    currency: string;
    mainCategory?: string; // e.g., MEN FASHION, WOMEN FASHION
    category: string; // e.g., Men Clothing, Ethnic Wear
    subCategory?: string; // e.g., Men Top Wear, Men Bottom Wear
    productType?: string; // e.g., T-Shirts, Shirts
    
    // Core expansion: Native checkout vs Affiliate redirects
    listingType: 'native' | 'affiliate';
    stockQuantity: number;
    productUrl?: string; // External link if affiliate
    
    imageUrl: string;
    imageOriginal?: string; // Original uploaded image
    imageTransparent?: string; // Background removed image
    images?: string[]; // Multiple photos
    inStock: boolean;
    brand?: string;
    attributes?: {
        color?: string;
        colors?: string[]; // Multiple colors support
        size?: string[];
        material?: string;
    };

    // Full catalog details for native products (category-specific)
    nativeCatalogDetails?: Record<string, any>;

    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    savesCount: number;
    viewsCount: number;
    sharesCount: number;
    averageRating: number;
    reviewCount: number;
    status: 'draft' | 'published';
    specifications?: {
        weight_gms?: number;
        supplier_id?: string;
        fabric?: string;
        fit?: string;
        neck?: string;
        occasion?: string;
        pattern?: string;
        sleeve_length?: string;
        country_of_origin?: string;
        manufacturer_name?: string;
        manufacturer_address?: string;
        manufacturer_pincode?: number;
        packer_name?: string;
        packer_address?: string;
        packer_pincode?: number;
        importer_name?: string;
        importer_address?: string;
        importer_pincode?: number;
        seller_comment?: string;
    };
}

const productSchema = new Schema<IProduct>(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        salePrice: { type: Number },
        discountPercentage: { type: Number },
        currency: { type: String, default: 'INR' },
        mainCategory: { type: String }, // Made optional for legacy data
        category: { type: String, required: true },
        subCategory: { type: String }, // Made optional for legacy data
        productType: { type: String }, // Made optional for legacy data
        
        listingType: { type: String, enum: ['native', 'affiliate'], default: 'affiliate' },
        stockQuantity: { type: Number, default: 0 },
        productUrl: { type: String },
        
        imageUrl: { type: String, required: true },
        imageOriginal: { type: String },
        imageTransparent: { type: String },
        images: [{ type: String }],
        inStock: { type: Boolean, default: true },
        brand: { type: String },
        attributes: {
            color: { type: String },
            colors: [{ type: String }],
            size: [{ type: String }],
            material: { type: String },
        },

        // Flexible store for all category-specific native catalog data
        nativeCatalogDetails: { type: Schema.Types.Mixed, default: {} },

        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        likesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        viewsCount: { type: Number, default: 0 },
        sharesCount: { type: Number, default: 0 },
        averageRating: { type: Number, default: 4.5 },
        reviewCount: { type: Number, default: 12 },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
        specifications: {
            weight_gms: { type: Number },
            supplier_id: { type: String },
            fabric: { type: String },
            fit: { type: String },
            neck: { type: String },
            occasion: { type: String },
            pattern: { type: String },
            sleeve_length: { type: String },
            country_of_origin: { type: String },
            manufacturer_name: { type: String },
            manufacturer_address: { type: String },
            manufacturer_pincode: { type: Number },
            packer_name: { type: String },
            packer_address: { type: String },
            packer_pincode: { type: Number },
            importer_name: { type: String },
            importer_address: { type: String },
            importer_pincode: { type: Number },
            seller_comment: { type: String },
        }
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
