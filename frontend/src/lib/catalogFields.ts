// ─────────────────────────────────────────────────────────────────────────────
// CATALOG FIELDS CONFIGURATION
// Category-specific native product attributes, mirroring Meesho-style catalogs.
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = [
  'Aqua Blue','Assorted','Beige','Black','Blue','Bolt Blue Marl','Brick Red','Bright Yellow',
  'Brown','Butter Yellow','Caramel Brown','Charcoal Marl','Classic Black','Clean Slate',
  'Coffee Brown','Coral','Cream','Crepe Pink','Deep Green','Deep Sea Blue','Forest Green',
  'Gold','Green','Grey','Grey Melange','Heather Grey','Ice Grey','Indigo Blue','Khaki',
  'Lavendar','Lemon Yellow','Maroon','Metallic','Midnight Navy','Mint Green','Multicolor',
  'Mustard','Mustard Yellow','Navy Blue','Neon Green','Nude','Olive','Olive Green','Orange',
  'Pastel Grey','Peach','Pine Green','Pink','Purple','Red','Rust','Silver','Sporty Maroon',
  'Teal','White','Yellow',
];

export const FABRICS = [
  'Acrylic','Art Silk','Bamboo','Chambray','Chanderi Cotton','Chanderi Silk','Chiffon',
  'Cotton','Cotton Blend','Cotton Cambric','Cotton Linen','Cotton Silk','Crepe','Denim',
  'Dupion Silk','Elastane','Georgette','Jacquard','Jute Cotton','Jute Silk','Khadi Cotton',
  'Kora Muslin','Lace','Linen','Lycra','Microfibre','Modal','Mulmul','Net','Nylon','Organza',
  'Paper Silk','Pashmina','Poly Blend','Poly Chiffon','Poly Crepe','Poly Georgette','Poly Silk',
  'Polycotton','Polyester','Polypropylene','Popcorn','Rayon','Rayon Slub','Satin','Shantoon',
  'Silk','Silk Blend','Soft Silk','Super Net','Supima Cotton','Synthetic','Taffeta Silk',
  'Tissue','Tussar Silk','Velvet','Vichitra Silk','Viscose Rayon','Voile','Wool',
];

export const FIT_SHAPES = ['Boxy','Compression','Loose','Oversize','Regular','Relaxed','Slim','Tailored'];

export const GENERIC_NAMES = [
  'Accessories','Bottom Wear','Garment','Others','Sportswear','Topwear','Tshirts','Undergarment',
];

export const NET_QUANTITIES = ['1','2','3','4','5','6','7','8','9','10'];

export const NECKS = [
  'Contrast Collar','Cowl','Dual Collar','Henley','High Neck','Hood','Mandarin','Polo',
  'Racerback','Round','Scoop','Shawl','Square','V-neck',
];

export const OCCASIONS = ['Beach','Casual','Festive','Formal','Party'];

export const PATTERNS = [
  'Checked','Colorblocked','Dyed/ Washed','Embellished','Embroidered','Printed',
  'Self-Design','Solid','Striped','Woven Design','Zari Woven',
];

export const SLEEVE_LENGTHS = ['Long Sleeves','Short Sleeves','Sleeveless','Three-Quarter Sleeves'];

export const STYLES = ['Casual','Classic','Ethnic','Formal','Modern','Relaxed','Sporty','Street','Trendy'];

export const HEMLINES = ['Asymmetric','Curved','High-Low','Knee Length','Midi','Mini','Straight'];

export const LENGTHS = ['Full Length','Knee Length','Maxi','Midi','Mini'];

export const POCKETS = ['0','1','2','3','4+'];

export const SLEEVE_STYLINGS = ['Cuffed','Flared','Puffed','Raglan','Regular','Roll-Up'];

export const COUNTRIES_OF_ORIGIN = ['India','China','Bangladesh','Vietnam','Cambodia','Sri Lanka','Other'];

export const SHOE_TYPES_CLOSURE = ['Lace-Up','Slip-On','Velcro','Buckle','Zipper'];
export const SHOE_SOLE_MATERIALS = ['Rubber','EVA','PU','TPR','Leather'];
export const SHOE_UPPER_MATERIALS = ['Leather','Synthetic','Canvas','Mesh','Suede','Knit'];
export const SHOE_HEEL_TYPES = ['Flat','Block','Stiletto','Wedge','Kitten'];
export const OCCASIONS_FOOTWEAR = ['Casual','Formal','Sports','Ethnic','Party'];

export const WATCH_DIAL_SHAPES = ['Round','Square','Oval','Rectangular'];
export const WATCH_STRAP_TYPES = ['Leather','Metal','Rubber','Fabric','Mesh'];
export const WATCH_DISPLAY_TYPES = ['Analogue','Digital','Analogue-Digital'];
export const WATCH_CASE_MATERIALS = ['Stainless Steel','Plastic','Alloy','Titanium'];

export const JEWELLERY_BASE_METALS = ['Brass','Copper','Alloy','Silver','Gold Plated','Stainless Steel'];
export const JEWELLERY_PLATING = ['Gold','Rose Gold','Rhodium','Silver','Antique'];
export const JEWELLERY_STONE_TYPES = ['None','Pearl','Cubic Zirconia','Crystal','Semi-Precious'];

export const BELT_MATERIALS = ['Leather','Synthetic','Fabric','Reversible'];
export const BELT_CLOSURE_TYPES = ['Buckle','Pin','Automatic'];

export const BAG_MATERIALS = ['Leather','Canvas','Synthetic','Fabric','Jute'];
export const BAG_TYPES = ['Backpack','Tote','Clutch','Handbag','Shoulder Bag','Wallet','Crossbody'];

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITIONS BY PRODUCT TYPE
// Each entry is a list of { key, label, type, options?, required }
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = 'select' | 'text' | 'number';

export interface CatalogField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

// Manufacturer/Packer/Importer block is common to ALL native products
export const COMPLIANCE_FIELDS: CatalogField[] = [
  { key: 'manufacturerName', label: 'Manufacturer Name', type: 'text', required: true, placeholder: 'Enter Manufacturer Name' },
  { key: 'manufacturerAddress', label: 'Manufacturer Address', type: 'text', required: true, placeholder: 'Enter Manufacturer Address' },
  { key: 'manufacturerPincode', label: 'Manufacturer Pincode', type: 'text', required: true, placeholder: '6-digit pincode' },
  { key: 'packerName', label: 'Packer Name', type: 'text', required: true, placeholder: 'Enter Packer Name' },
  { key: 'packerAddress', label: 'Packer Address', type: 'text', required: true, placeholder: 'Enter Packer Address' },
  { key: 'packerPincode', label: 'Packer Pincode', type: 'text', required: true, placeholder: '6-digit pincode' },
  { key: 'importerName', label: 'Importer Name', type: 'text', required: false, placeholder: 'If imported, enter name' },
  { key: 'importerAddress', label: 'Importer Address', type: 'text', required: false, placeholder: 'If imported, enter address' },
  { key: 'importerPincode', label: 'Importer Pincode', type: 'text', required: false, placeholder: 'If imported, enter pincode' },
  { key: 'countryOfOrigin', label: 'Country of Origin', type: 'select', options: COUNTRIES_OF_ORIGIN, required: true },
];

// ─── TOP WEAR (T-Shirts, Shirts, Etc) ───────────────────────────────────────
const TOPWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 250' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'fitShape', label: 'Fit / Shape', type: 'select', options: FIT_SHAPES, required: true },
  { key: 'neck', label: 'Neck', type: 'select', options: NECKS, required: true },
  { key: 'sleeveLength', label: 'Sleeve Length', type: 'select', options: SLEEVE_LENGTHS, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: true },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'style', label: 'Style', type: 'select', options: STYLES, required: false },
  { key: 'genericName', label: 'Generic Name', type: 'select', options: GENERIC_NAMES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product (max 1400 chars)' },
];

// ─── BOTTOM WEAR (Jeans, Trousers, Shorts) ──────────────────────────────────
const BOTTOMWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 300' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'fitShape', label: 'Fit / Shape', type: 'select', options: FIT_SHAPES, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: true },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'numberOfPockets', label: 'Number of Pockets', type: 'select', options: POCKETS, required: false },
  { key: 'length', label: 'Length', type: 'select', options: LENGTHS, required: false },
  { key: 'genericName', label: 'Generic Name', type: 'select', options: GENERIC_NAMES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── ETHNIC WEAR (Kurtis, Sarees, Lehengas, Sherwanis) ─────────────────────
const ETHNICWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 400' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: true },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: true },
  { key: 'neckStyle', label: 'Neck Style', type: 'select', options: NECKS, required: false },
  { key: 'sleeveLength', label: 'Sleeve Length', type: 'select', options: SLEEVE_LENGTHS, required: false },
  { key: 'hemline', label: 'Hemline', type: 'select', options: HEMLINES, required: false },
  { key: 'length', label: 'Length', type: 'select', options: LENGTHS, required: false },
  { key: 'genericName', label: 'Generic Name', type: 'select', options: GENERIC_NAMES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── OUTERWEAR (Jackets, Blazers, Sweaters) ──────────────────────────────────
const OUTERWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 600' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'fitShape', label: 'Fit / Shape', type: 'select', options: FIT_SHAPES, required: true },
  { key: 'closureType', label: 'Closure Type', type: 'select', options: ['Zipper','Button','Open Front','Snap','Velcro'], required: false },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: true },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'numberOfPockets', label: 'Number of Pockets', type: 'select', options: POCKETS, required: false },
  { key: 'genericName', label: 'Generic Name', type: 'select', options: GENERIC_NAMES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── INNERWEAR / SLEEPWEAR ───────────────────────────────────────────────────
const INNERWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 150' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: false },
  { key: 'genericName', label: 'Generic Name', type: 'select', options: GENERIC_NAMES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── FOOTWEAR ────────────────────────────────────────────────────────────────
const FOOTWEAR_FIELDS: CatalogField[] = [
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 400' },
  { key: 'upperMaterial', label: 'Upper Material', type: 'select', options: SHOE_UPPER_MATERIALS, required: true },
  { key: 'soleMaterial', label: 'Sole Material', type: 'select', options: SHOE_SOLE_MATERIALS, required: true },
  { key: 'closureType', label: 'Closure Type', type: 'select', options: SHOE_TYPES_CLOSURE, required: true },
  { key: 'heelType', label: 'Heel Type', type: 'select', options: SHOE_HEEL_TYPES, required: false },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS_FOOTWEAR, required: true },
  { key: 'pattern', label: 'Pattern/Style', type: 'select', options: PATTERNS, required: false },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── WATCHES ─────────────────────────────────────────────────────────────────
const WATCH_FIELDS: CatalogField[] = [
  { key: 'dialShape', label: 'Dial Shape', type: 'select', options: WATCH_DIAL_SHAPES, required: true },
  { key: 'strapType', label: 'Strap Type', type: 'select', options: WATCH_STRAP_TYPES, required: true },
  { key: 'displayType', label: 'Display Type', type: 'select', options: WATCH_DISPLAY_TYPES, required: true },
  { key: 'caseMaterial', label: 'Case Material', type: 'select', options: WATCH_CASE_MATERIALS, required: false },
  { key: 'waterResistant', label: 'Water Resistant', type: 'select', options: ['Yes','No'], required: false },
  { key: 'warrantyMonths', label: 'Warranty (months)', type: 'number', required: false, placeholder: 'e.g. 12' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── JEWELLERY ───────────────────────────────────────────────────────────────
const JEWELLERY_FIELDS: CatalogField[] = [
  { key: 'baseMetal', label: 'Base Metal', type: 'select', options: JEWELLERY_BASE_METALS, required: true },
  { key: 'platingType', label: 'Plating', type: 'select', options: JEWELLERY_PLATING, required: false },
  { key: 'stoneType', label: 'Stone Type', type: 'select', options: JEWELLERY_STONE_TYPES, required: false },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: true, placeholder: 'e.g. 50' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── BELTS ───────────────────────────────────────────────────────────────────
const BELT_FIELDS: CatalogField[] = [
  { key: 'material', label: 'Material', type: 'select', options: BELT_MATERIALS, required: true },
  { key: 'closureType', label: 'Closure Type', type: 'select', options: BELT_CLOSURE_TYPES, required: true },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: false, placeholder: 'e.g. 100' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── GLASSES / SUNGLASSES ─────────────────────────────────────────────────────
const GLASSES_FIELDS: CatalogField[] = [
  { key: 'lensType', label: 'Lens Type', type: 'select', options: ['UV Protection','Polarized','Anti-Glare','Clear','Mirrored'], required: true },
  { key: 'frameType', label: 'Frame Type', type: 'select', options: ['Full Rim','Half Rim','Rimless'], required: true },
  { key: 'frameMaterial', label: 'Frame Material', type: 'select', options: ['Plastic','Metal','TR90','Acetate','Titanium'], required: false },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: false, placeholder: 'e.g. 30' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── BAGS / ACCESSORIES ──────────────────────────────────────────────────────
const BAG_FIELDS: CatalogField[] = [
  { key: 'bagType', label: 'Bag Type', type: 'select', options: BAG_TYPES, required: true },
  { key: 'material', label: 'Material', type: 'select', options: BAG_MATERIALS, required: true },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'numberOfPockets', label: 'Number of Pockets', type: 'select', options: POCKETS, required: false },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: false, placeholder: 'e.g. 350' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── CAPS & HATS ─────────────────────────────────────────────────────────────
const CAPS_FIELDS: CatalogField[] = [
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: false },
  { key: 'occasion', label: 'Occasion', type: 'select', options: OCCASIONS, required: false },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: false, placeholder: 'e.g. 100' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─── MUFFLERS / SCARVES ───────────────────────────────────────────────────────
const SCARF_FIELDS: CatalogField[] = [
  { key: 'fabric', label: 'Fabric', type: 'select', options: FABRICS, required: true },
  { key: 'pattern', label: 'Pattern', type: 'select', options: PATTERNS, required: false },
  { key: 'length', label: 'Length', type: 'select', options: LENGTHS, required: false },
  { key: 'netWeightGms', label: 'Net Weight (gms)', type: 'number', required: false, placeholder: 'e.g. 80' },
  { key: 'netQuantity', label: 'Net Quantity', type: 'select', options: NET_QUANTITIES, required: true },
  { key: 'description', label: 'Product Description', type: 'text', required: false, placeholder: 'Describe the product' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY RESOLUTION MAP: productType (lowercased keyword) → CatalogField[]
// ─────────────────────────────────────────────────────────────────────────────
const SUBCAT_TO_FIELDS: Record<string, CatalogField[]> = {
  // Topwear
  'men top wear': TOPWEAR_FIELDS,
  'kurtis & sets': ETHNICWEAR_FIELDS,
  'sarees & blouses': ETHNICWEAR_FIELDS,
  'suits': ETHNICWEAR_FIELDS,
  'lehenga choli': ETHNICWEAR_FIELDS,
  'gowns & kaftans': ETHNICWEAR_FIELDS,
  'islamic wear': ETHNICWEAR_FIELDS,
  'traditional': ETHNICWEAR_FIELDS,
  'men ethnic wear': ETHNICWEAR_FIELDS,
  // Bottomwear
  'men bottom wear': BOTTOMWEAR_FIELDS,
  'bottomwear': BOTTOMWEAR_FIELDS,
  'dupattas & shawls': SCARF_FIELDS,
  // Outerwear / Winter
  'outerwear': OUTERWEAR_FIELDS,
  // Activewear
  'activewear': TOPWEAR_FIELDS,
  'sportswear': TOPWEAR_FIELDS,
  'innerwear': INNERWEAR_FIELDS,
  // Innerwear
  'essentials': INNERWEAR_FIELDS,
  'nightsuits': INNERWEAR_FIELDS,
  'bras & lingerie': INNERWEAR_FIELDS,
  // Footwear
  'shoes': FOOTWEAR_FIELDS,
  'flip flops & sandals': FOOTWEAR_FIELDS,
  'ethnic footwear': FOOTWEAR_FIELDS,
  'flats': FOOTWEAR_FIELDS,
  'boots': FOOTWEAR_FIELDS,
  'heels': FOOTWEAR_FIELDS,
  'flipflops & slippers': FOOTWEAR_FIELDS,
  'sandals': FOOTWEAR_FIELDS,
  'bellies & juttis': FOOTWEAR_FIELDS,
  'wedges': FOOTWEAR_FIELDS,
  // Accessories
  'belts': BELT_FIELDS,
  'caps & hats': CAPS_FIELDS,
  'mufflers & gloves': SCARF_FIELDS,
  'jewellery': JEWELLERY_FIELDS,
  'watches': WATCH_FIELDS,
  'glasses': GLASSES_FIELDS,
  'bags': BAG_FIELDS,
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns category-specific fields for the native catalog form.
 * Compliance fields (manufacturer/packer/importer) are ALWAYS appended.
 */
export function getCatalogFields(subCategory: string): CatalogField[] {
  const key = subCategory.toLowerCase().trim();
  const specific = SUBCAT_TO_FIELDS[key] ?? TOPWEAR_FIELDS; // fallback to generic topwear
  return [...specific, ...COMPLIANCE_FIELDS];
}
