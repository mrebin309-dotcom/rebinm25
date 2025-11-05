import { useState } from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';
import { ColorVariant } from '../types';

interface ColorVariantManagerProps {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  { name: 'Gold', code: '#FFD700' },
  { name: 'Space Grey', code: '#6B7280' },
  { name: 'Silver', code: '#C0C0C0' },
  { name: 'Midnight Green', code: '#004953' },
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Rose Gold', code: '#B76E79' },
  { name: 'Pacific Blue', code: '#4A90A4' },
  { name: 'Graphite', code: '#41424C' },
  { name: 'Sierra Blue', code: '#9BB5CE' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Purple', code: '#A855F7' },
  { name: 'Red', code: '#DC2626' },
  { name: 'Green', code: '#16A34A' },
  { name: 'Blue', code: '#2563EB' },
];

export function ColorVariantManager({ variants, onChange, disabled }: ColorVariantManagerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newVariant, setNewVariant] = useState<ColorVariant>({
    color: '',
    colorCode: '#000000',
    stock: 0,
  });

  const handleAddVariant = () => {
    if (newVariant.color.trim() && newVariant.stock >= 0) {
      onChange([...variants, newVariant]);
      setNewVariant({ color: '', colorCode: '#000000', stock: 0 });
      setShowColorPicker(false);
    }
  };

  const handleRemoveVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleUpdateVariantStock = (index: number, stock: number) => {
    const updated = variants.map((v, i) =>
      i === index ? { ...v, stock: Math.max(0, stock) } : v
    );
    onChange(updated);
  };

  const selectPresetColor = (preset: { name: string; code: string }) => {
    setNewVariant(prev => ({
      ...prev,
      color: preset.name,
      colorCode: preset.code,
    }));
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Palette className="inline h-4 w-4 mr-1" />
          Color Variants
        </label>
        {variants.length > 0 && (
          <span className="text-sm text-gray-500">Total Stock: {totalStock}</span>
        )}
      </div>

      {/* Existing Variants */}
      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: variant.colorCode }}
              title={variant.color}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{variant.color}</p>
              <p className="text-xs text-gray-500">{variant.colorCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => handleUpdateVariantStock(index, parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                min="0"
                disabled={disabled}
              />
              <span className="text-xs text-gray-500">units</span>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Variant */}
      {!showColorPicker ? (
        <button
          type="button"
          onClick={() => setShowColorPicker(true)}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add Color Variant
        </button>
      ) : (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Add New Color</h4>
          </div>

          {/* Preset Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose from presets:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPresetColor(preset)}
                  className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                    newVariant.color === preset.name
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto shadow-sm"
                    style={{ backgroundColor: preset.code }}
                  />
                  <p className="text-xs mt-1 text-center truncate">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Name
              </label>
              <input
                type="text"
                value={newVariant.color}
                onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Code
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newVariant.colorCode}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, colorCode: e.target.value }))}
                  className="h-10 w-14 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newVariant.colorCode}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, colorCode: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Stock
            </label>
            <input
              type="number"
              value={newVariant.stock}
              onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddVariant}
              disabled={!newVariant.color.trim()}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Variant
            </button>
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(false);
                setNewVariant({ color: '', colorCode: '#000000', stock: 0 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <p className="text-xs text-gray-500">
          Note: Total product stock will be calculated as the sum of all color variant stocks.
        </p>
      )}
    </div>
  );
}
