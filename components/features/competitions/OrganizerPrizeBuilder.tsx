'use client';

// ============================================================
// RAIH — Organizer Prize Item-by-Item Builder (Strictly NO Gradients)
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Input, Button, Chip } from '@heroui/react';
import {
  PrizeTier,
  parsePrizeInfo,
  serializePrizeTiers,
  formatRupiah,
  extractNumericAmount,
} from '@/lib/utils/prize';

interface OrganizerPrizeBuilderProps {
  value: string;
  onChange: (serialized: string) => void;
}

const CATEGORY_PRESETS = [
  { label: 'Juara 1 🥇', title: 'Juara 1', rank: 1 },
  { label: 'Juara 2 🥈', title: 'Juara 2', rank: 2 },
  { label: 'Juara 3 🥉', title: 'Juara 3', rank: 3 },
  { label: 'Juara Harapan 🎖️', title: 'Juara Harapan 1', rank: 4 },
  { label: 'Best Innovation 💡', title: 'Best Innovation', rank: undefined },
  { label: 'Best Speaker 🎙️', title: 'Best Speaker', rank: undefined },
  { label: 'Finalis 🌟', title: 'Top 10 Finalis', rank: undefined },
];

export default function OrganizerPrizeBuilder({
  value,
  onChange,
}: OrganizerPrizeBuilderProps) {
  const [tiers, setTiers] = useState<PrizeTier[]>(() => parsePrizeInfo(value));
  
  // Single Item Input State (Input 1 per 1)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('Juara 1');
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentPerks, setCurrentPerks] = useState('');
  const [isNonCash, setIsNonCash] = useState(false);
  const [inputError, setInputError] = useState('');

  // Synchronize internal state when value prop changes externally
  useEffect(() => {
    const parsed = parsePrizeInfo(value);
    if (parsed.length > 0 && tiers.length === 0) {
      setTiers(parsed);
    }
  }, [value]);

  const updateParent = (newTiers: PrizeTier[]) => {
    setTiers(newTiers);
    const serialized = serializePrizeTiers(newTiers);
    onChange(serialized);
  };

  const handleApplyPreset = (preset: { title: string; rank?: number }) => {
    setCurrentTitle(preset.title);
    setInputError('');
  };

  const handleQuickStandard3 = () => {
    const standard3: PrizeTier[] = [
      {
        id: `tier-${Date.now()}-1`,
        rank: 1,
        title: 'Juara 1',
        amount: 'Rp 10.000.000',
        amountNumber: 10000000,
        perks: 'Trophy + Sertifikat Resmi + Inkubasi',
      },
      {
        id: `tier-${Date.now()}-2`,
        rank: 2,
        title: 'Juara 2',
        amount: 'Rp 5.000.000',
        amountNumber: 5000000,
        perks: 'Trophy + Sertifikat Resmi',
      },
      {
        id: `tier-${Date.now()}-3`,
        rank: 3,
        title: 'Juara 3',
        amount: 'Rp 2.500.000',
        amountNumber: 2500000,
        perks: 'Trophy + Sertifikat Resmi',
      },
    ];
    updateParent(standard3);
  };

  const handleSaveItem = () => {
    if (!currentTitle.trim()) {
      setInputError('Kategori atau peringkat hadiah wajib diisi.');
      return;
    }

    let finalAmount = currentAmount.trim();
    let numAmount: number | undefined;

    if (isNonCash) {
      finalAmount = finalAmount || 'Beasiswa & Penghargaan';
    } else {
      numAmount = extractNumericAmount(finalAmount);
      if (numAmount) {
        finalAmount = formatRupiah(numAmount);
      } else if (!finalAmount) {
        finalAmount = 'Sertifikat & Hadiah';
      }
    }

    let rank: number | undefined;
    const lower = currentTitle.toLowerCase();
    if (lower.includes('1') || lower.includes('pertama')) rank = 1;
    else if (lower.includes('2') || lower.includes('kedua')) rank = 2;
    else if (lower.includes('3') || lower.includes('ketiga')) rank = 3;

    if (editingId) {
      // Edit existing
      const updated = tiers.map(t =>
        t.id === editingId
          ? {
              ...t,
              title: currentTitle.trim(),
              amount: finalAmount,
              amountNumber: numAmount,
              perks: currentPerks.trim() || undefined,
              rank,
            }
          : t
      );
      updateParent(updated);
      setEditingId(null);
    } else {
      // Add new item
      const newItem: PrizeTier = {
        id: `tier-${Date.now()}`,
        title: currentTitle.trim(),
        amount: finalAmount,
        amountNumber: numAmount,
        perks: currentPerks.trim() || undefined,
        rank,
      };
      updateParent([...tiers, newItem]);
    }

    // Reset input fields for next entry
    // Auto-advance title if possible
    if (currentTitle === 'Juara 1') setCurrentTitle('Juara 2');
    else if (currentTitle === 'Juara 2') setCurrentTitle('Juara 3');
    else if (currentTitle === 'Juara 3') setCurrentTitle('Juara Harapan 1');
    else setCurrentTitle('');

    setCurrentAmount('');
    setCurrentPerks('');
    setIsNonCash(false);
    setInputError('');
  };

  const handleEditClick = (tier: PrizeTier) => {
    setEditingId(tier.id);
    setCurrentTitle(tier.title);
    setCurrentAmount(tier.amountNumber ? tier.amountNumber.toString() : tier.amount);
    setCurrentPerks(tier.perks || '');
    setIsNonCash(tier.amountNumber === undefined && tier.amount !== '-');
    setInputError('');
  };

  const handleDeleteClick = (id: string) => {
    const filtered = tiers.filter(t => t.id !== id);
    updateParent(filtered);
    if (editingId === id) {
      setEditingId(null);
      setCurrentTitle('Juara 1');
      setCurrentAmount('');
      setCurrentPerks('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentTitle('Juara 1');
    setCurrentAmount('');
    setCurrentPerks('');
    setIsNonCash(false);
    setInputError('');
  };

  // Calculate total pool
  const totalPool = tiers.reduce((acc, t) => acc + (t.amountNumber || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-3.5 rounded-lg border border-[#E6E6E6] bg-[#F6F5F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#DD5B00]" />
          <div>
            <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wide">
              Struktur & Rincian Hadiah (Input 1 per 1)
            </h4>
            <p className="text-[11px] text-[#615D59]">
              Masukkan hadiah per tingkat/kategori satu per satu agar tersusun rapi untuk peserta.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="bordered"
          className="rounded-[4px] border-[#E6E6E6] bg-white text-xs font-semibold text-[#0075DE] h-8"
          onPress={handleQuickStandard3}
          startContent={<Sparkles size={13} className="text-[#DD5B00]" />}
        >
          Preset Standar (Juara 1, 2, 3)
        </Button>
      </div>

      {/* Input Form Satu per Satu */}
      <div className="p-4 rounded-lg border border-[#0075DE]/40 bg-white shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0075DE] text-white flex items-center justify-center text-[10px] font-bold">
              {editingId ? '✎' : '+'}
            </span>
            <span>{editingId ? 'Edit Hadiah Ini' : 'Tambah Hadiah Baru (Satu per Satu)'}</span>
          </span>

          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-[#615D59] hover:text-[#000000] underline"
            >
              Batal Edit
            </button>
          )}
        </div>

        {/* Preset Chips */}
        <div>
          <span className="text-[11px] text-[#615D59] block mb-1.5 font-medium">
            Pilih Kategori Cepat:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  currentTitle === preset.title
                    ? 'border-[#0075DE] bg-[#EBF4FC] text-[#0075DE] font-bold'
                    : 'border-[#E6E6E6] bg-white text-[#31302E] hover:bg-[#F6F5F4]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Kategori / Peringkat"
            placeholder="e.g. Juara 1, Juara Favorit, Best Pitch"
            value={currentTitle}
            onValueChange={(v) => {
              setCurrentTitle(v);
              setInputError('');
            }}
            isInvalid={!!inputError}
            errorMessage={inputError}
            classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
          />

          <div>
            <Input
              label="Nominal Hadiah Tunai (Rp)"
              placeholder={isNonCash ? 'Hadiah Non-Tunai' : 'e.g. 15000000'}
              value={currentAmount}
              onValueChange={setCurrentAmount}
              disabled={isNonCash}
              startContent={!isNonCash ? <span className="text-[#A39E98] text-xs">Rp</span> : undefined}
              classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
            />
            <div className="flex items-center gap-2 mt-1 px-1">
              <label className="flex items-center gap-1.5 text-[11px] text-[#615D59] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNonCash}
                  onChange={(e) => setIsNonCash(e.target.checked)}
                  className="rounded border-[#E6E6E6] text-[#0075DE]"
                />
                <span>Non-tunai (Beasiswa, Medali, Piagam, dll.)</span>
              </label>
            </div>
          </div>
        </div>

        <Input
          label="Benefit & Fasilitas Tambahan (opsional)"
          placeholder="e.g. Trophy + Sertifikat Resmi + Program Inkubasi + Merchandise"
          value={currentPerks}
          onValueChange={setCurrentPerks}
          classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
          description="Gunakan tanda tambah (+) atau koma untuk memisahkan benefit."
        />

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            className="rounded-[4px] bg-[#FF5D35] hover:bg-[#E04D27] text-white font-semibold text-xs px-5 h-9 shadow-xs"
            onPress={handleSaveItem}
            startContent={editingId ? <Check size={14} /> : <Plus size={14} />}
          >
            {editingId ? 'Simpan Perubahan Hadiah' : 'Tambahkan ke Daftar Hadiah'}
          </Button>
        </div>
      </div>

      {/* List of Added Prizes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#000000]">
          <span>Daftar Hadiah Terdaftar ({tiers.length})</span>
          {totalPool > 0 && (
            <span className="text-[#DD5B00] bg-[#FFF4E5] border border-[#FFD299] px-2.5 py-0.5 rounded-full text-[11px]">
              Total Pool: {formatRupiah(totalPool)}
            </span>
          )}
        </div>

        {tiers.length === 0 ? (
          <div className="p-6 rounded-lg border border-dashed border-[#E6E6E6] text-center bg-white">
            <Award size={24} className="mx-auto text-[#A39E98] mb-1.5" />
            <p className="text-xs font-semibold text-[#000000]">Belum ada rincian hadiah</p>
            <p className="text-[11px] text-[#615D59] mt-0.5">
              Gunakan form di atas untuk memasukkan hadiah satu per satu, atau klik tombol <strong>Preset Standar</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {tiers.map((tier, index) => {
              const isGold = tier.rank === 1;
              const isSilver = tier.rank === 2;
              const isBronze = tier.rank === 3;

              let badgeBg = 'bg-[#F6F5F4] text-[#31302E]';
              let borderClass = 'border-[#E6E6E6]';
              if (isGold) {
                badgeBg = 'bg-[#FFF4E5] text-[#B24800] font-bold';
                borderClass = 'border-[#FFD299]';
              } else if (isSilver) {
                badgeBg = 'bg-[#F0F1F3] text-[#3E4551] font-bold';
                borderClass = 'border-[#D1D5DB]';
              } else if (isBronze) {
                badgeBg = 'bg-[#FAF0E6] text-[#8A4B1A] font-bold';
                borderClass = 'border-[#E3C7A8]';
              }

              return (
                <div
                  key={tier.id || index}
                  className={`p-3 rounded-lg border ${borderClass} bg-white flex items-center justify-between gap-3 shadow-2xs hover:bg-[#FAFAFA] transition-colors`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#F6F5F4] text-[#615D59] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${badgeBg}`}>
                          {tier.title}
                        </span>
                        <span className="font-bold text-xs text-[#000000]">
                          {tier.amount}
                        </span>
                      </div>

                      {tier.perks && (
                        <p className="text-[11px] text-[#615D59] truncate mt-0.5">
                          + {tier.perks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(tier)}
                      className="p-1.5 rounded text-[#615D59] hover:text-[#0075DE] hover:bg-[#EBF4FC] transition-colors"
                      title="Edit Hadiah"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(tier.id)}
                      className="p-1.5 rounded text-[#615D59] hover:text-[#E5484D] hover:bg-[#FDF2F2] transition-colors"
                      title="Hapus Hadiah"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
