'use client';

import { getCatalogFields, CatalogField, COLORS, FABRICS } from '@/lib/catalogFields';

interface NativeCatalogSectionProps {
  subCategory: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  manufacturerSameAsPacker: boolean;
  onToggleSameAsPacker: (v: boolean) => void;
}

function FieldInput({ field, value, onChange }: {
  field: CatalogField;
  value: string;
  onChange: (val: string) => void;
}) {
  const baseClass = 'w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm';

  if (field.type === 'select' && field.options) {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={baseClass}
        required={field.required}
      >
        <option value=''>Select {field.label}</option>
        {field.options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type='number'
        min='0'
        placeholder={field.placeholder || field.label}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={baseClass}
        required={field.required}
      />
    );
  }

  return (
    <textarea
      placeholder={field.placeholder || field.label}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      rows={field.key === 'description' ? 4 : 2}
      maxLength={field.key === 'description' ? 1400 : undefined}
      className={`${baseClass} resize-none`}
      required={field.required}
    />
  );
}

export default function NativeCatalogSection({
  subCategory,
  values,
  onChange,
  manufacturerSameAsPacker,
  onToggleSameAsPacker,
}: NativeCatalogSectionProps) {
  const allFields = getCatalogFields(subCategory || '');

  // Split off compliance fields (manufacturer/packer/importer/country) from product-specific fields
  const complianceKeys = new Set([
    'manufacturerName','manufacturerAddress','manufacturerPincode',
    'packerName','packerAddress','packerPincode',
    'importerName','importerAddress','importerPincode','countryOfOrigin'
  ]);

  const productFields = allFields.filter(f => !complianceKeys.has(f.key));
  const complianceFields = allFields.filter(f => complianceKeys.has(f.key));

  // When "same as manufacturer" is ticked, auto-copy manufacturer values to packer
  const handleChange = (key: string, val: string) => {
    onChange(key, val);
    if (manufacturerSameAsPacker && key.startsWith('manufacturer')) {
      const packerKey = key.replace('manufacturer', 'packer');
      onChange(packerKey, val);
    }
  };

  const handleSameAsPacker = (checked: boolean) => {
    onToggleSameAsPacker(checked);
    if (checked) {
      onChange('packerName', values['manufacturerName'] || '');
      onChange('packerAddress', values['manufacturerAddress'] || '');
      onChange('packerPincode', values['manufacturerPincode'] || '');
    }
  };

  const cols2 = (key: string) =>
    ['manufacturerAddress','packerAddress','importerAddress','description'].includes(key)
      ? 'col-span-2'
      : '';

  return (
    <div className='space-y-6 mt-4'>
      {/* ── Product-Specific Attributes ─────────────────────────────── */}
      <section className='bg-background rounded-2xl p-6 border border-border shadow-sm'>
        <h3 className='font-semibold text-foreground text-sm mb-4 pb-3 border-b border-border'>
          Product, Size &amp; Attributes
          <span className='ml-2 text-xs font-normal text-muted-foreground'>
            (based on selected sub-category: {subCategory || 'N/A'})
          </span>
        </h3>
        <div className='grid grid-cols-2 gap-5'>
          {productFields.map(field => (
            <div key={field.key} className={`space-y-1.5 ${cols2(field.key)}`}>
              <label className='text-xs font-semibold text-foreground tracking-wide'>
                {field.label}
                {field.required && <span className='text-red-500 ml-0.5'>*</span>}
              </label>
              <FieldInput field={field} value={values[field.key] || ''} onChange={v => handleChange(field.key, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Manufacturing & Legal (Compliance) ─────────────────────── */}
      <section className='bg-background rounded-2xl p-6 border border-border shadow-sm'>
        <h3 className='font-semibold text-foreground text-sm mb-1 pb-3 border-b border-border'>
          Manufacturing &amp; Legal Details
          <span className='ml-2 text-xs font-normal text-muted-foreground'>(Required by Indian law)</span>
        </h3>

        {/* Manufacturer */}
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-3'>Manufacturer</p>
        <div className='grid grid-cols-2 gap-4'>
          {complianceFields.filter(f => f.key.startsWith('manufacturer')).map(field => (
            <div key={field.key} className={`space-y-1.5 ${cols2(field.key)}`}>
              <label className='text-xs font-semibold text-foreground tracking-wide'>
                {field.label}
                {field.required && <span className='text-red-500 ml-0.5'>*</span>}
              </label>
              <FieldInput field={field} value={values[field.key] || ''} onChange={v => handleChange(field.key, v)} />
            </div>
          ))}
        </div>

        {/* Packer */}
        <div className='flex items-center gap-3 mt-5 mb-3'>
          <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>Packer</p>
          <label className='flex items-center gap-2 cursor-pointer ml-auto'>
            <input
              type='checkbox'
              checked={manufacturerSameAsPacker}
              onChange={e => handleSameAsPacker(e.target.checked)}
              className='w-4 h-4 rounded text-primary focus:ring-primary border-border'
            />
            <span className='text-xs text-muted-foreground font-medium'>Same as Manufacturer</span>
          </label>
        </div>
        <div className={`grid grid-cols-2 gap-4 ${manufacturerSameAsPacker ? 'opacity-40 pointer-events-none' : ''}`}>
          {complianceFields.filter(f => f.key.startsWith('packer')).map(field => (
            <div key={field.key} className={`space-y-1.5 ${cols2(field.key)}`}>
              <label className='text-xs font-semibold text-foreground tracking-wide'>
                {field.label}
                {field.required && <span className='text-red-500 ml-0.5'>*</span>}
              </label>
              <FieldInput
                field={field}
                value={manufacturerSameAsPacker
                  ? (values[field.key.replace('packer','manufacturer')] || '')
                  : (values[field.key] || '')}
                onChange={v => onChange(field.key, v)}
              />
            </div>
          ))}
        </div>

        {/* Importer (Optional) */}
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mt-5 mb-3'>
          Importer <span className='text-[10px] font-normal normal-case'>(Optional – only if product is imported)</span>
        </p>
        <div className='grid grid-cols-2 gap-4'>
          {complianceFields.filter(f => f.key.startsWith('importer')).map(field => (
            <div key={field.key} className={`space-y-1.5 ${cols2(field.key)}`}>
              <label className='text-xs font-semibold text-foreground tracking-wide'>{field.label}</label>
              <FieldInput field={field} value={values[field.key] || ''} onChange={v => onChange(field.key, v)} />
            </div>
          ))}
        </div>

        {/* Country of Origin */}
        <div className='mt-4 max-w-xs space-y-1.5'>
          {complianceFields.filter(f => f.key === 'countryOfOrigin').map(field => (
            <div key={field.key}>
              <label className='text-xs font-semibold text-foreground tracking-wide'>
                {field.label}<span className='text-red-500 ml-0.5'>*</span>
              </label>
              <div className='mt-1.5'>
                <FieldInput field={field} value={values[field.key] || ''} onChange={v => onChange(field.key, v)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
