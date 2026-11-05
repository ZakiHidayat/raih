'use client';

// ============================================================
// RAIH — Prize Structure Display Component (Strictly NO Gradients)
// ============================================================
import React from 'react';
import { Trophy, Award, Gift, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { parsePrizeInfo, getPrizeSummary, PrizeTier } from '@/lib/utils/prize';

interface PrizeStructureViewProps {
  prizeInfo: string | null | undefined;
  className?: string;
  compact?: boolean;
}

export default function PrizeStructureView({
  prizeInfo,
  className = '',
  compact = false,
}: PrizeStructureViewProps) {
  const tiers: PrizeTier[] = parsePrizeInfo(prizeInfo);
  const summary = getPrizeSummary(prizeInfo);

  if (tiers.length === 0 && !prizeInfo) {
    return (
      <div className={`p-4 rounded-xl border border-[#E6E6E6] bg-white text-center ${className}`}>
        <Award size={24} className="mx-auto text-[#A39E98] mb-1.5" />
        <p className="text-xs font-semibold text-[#000000]">Sertifikat & Penghargaan</p>
        <p className="text-[11px] text-[#615D59]">
          Seluruh peserta terdaftar akan memperoleh sertifikat partisipasi resmi.
        </p>
      </div>
    );
  }

  // Fallback if unstructured string without clear tiers
  if (tiers.length === 0 && prizeInfo) {
    return (
      <div className={`p-4 rounded-xl border border-[#E6E6E6] bg-white space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#DD5B00]" />
          <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wide">
            Hadiah & Penghargaan
          </h3>
        </div>
        <p className="text-xs text-[#31302E] leading-relaxed font-medium">
          {prizeInfo}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E6E6E6] bg-[#F6F5F4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF5D35] text-white flex items-center justify-center flex-shrink-0">
            <Trophy size={16} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#615D59] block">
              Total Hadiah Kompetisi
            </span>
            <span className="text-sm font-bold text-[#000000]">
              {summary.totalEstimatedAmount ? summary.totalEstimatedAmount : summary.primaryAmount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#E6E6E6] text-[#31302E]">
            <Sparkles size={12} className="text-[#DD5B00]" />
            {tiers.length} Kategori Penghargaan
          </span>
        </div>
      </div>

      {/* Grid of Prize Tiers */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {tiers.map((tier, idx) => {
          const isGold = tier.rank === 1 || tier.title.toLowerCase().includes('1');
          const isSilver = tier.rank === 2 || tier.title.toLowerCase().includes('2');
          const isBronze = tier.rank === 3 || tier.title.toLowerCase().includes('3');

          // Styling tokens without any gradients
          let badgeBg = 'bg-[#F6F5F4]';
          let badgeText = 'text-[#31302E]';
          let cardBorder = 'border-[#E6E6E6]';
          let icon = <Award size={15} className="text-[#615D59]" />;

          if (isGold) {
            badgeBg = 'bg-[#FFF4E5]';
            badgeText = 'text-[#B24800]';
            cardBorder = 'border-[#FFD299]';
            icon = <Trophy size={15} className="text-[#DD5B00]" />;
          } else if (isSilver) {
            badgeBg = 'bg-[#F0F1F3]';
            badgeText = 'text-[#3E4551]';
            cardBorder = 'border-[#D1D5DB]';
            icon = <Award size={15} className="text-[#4B5563]" />;
          } else if (isBronze) {
            badgeBg = 'bg-[#FAF0E6]';
            badgeText = 'text-[#8A4B1A]';
            cardBorder = 'border-[#E3C7A8]';
            icon = <Award size={15} className="text-[#A55E2B]" />;
          }

          const perksList = tier.perks
            ? tier.perks.split(/[+,]/).map(p => p.trim()).filter(Boolean)
            : [];

          return (
            <div
              key={tier.id || idx}
              className={`p-4 rounded-xl border ${cardBorder} bg-white flex flex-col justify-between transition-all hover:shadow-xs`}
            >
              <div>
                {/* Header Rank Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeBg} ${badgeText}`}>
                    {icon}
                    <span>{tier.title}</span>
                  </span>

                  {isGold && (
                    <span className="text-[10px] uppercase font-bold text-[#DD5B00] bg-[#FFF4E5] px-2 py-0.5 rounded-full">
                      Utama
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="my-2">
                  <span className="text-[10px] text-[#A39E98] uppercase tracking-wide block font-medium">
                    Nominal Hadiah
                  </span>
                  <span className="text-base font-extrabold text-[#000000] tracking-tight block">
                    {tier.amount}
                  </span>
                </div>

                {/* Perks Checklist */}
                {perksList.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] space-y-1">
                    <span className="text-[10px] text-[#A39E98] uppercase tracking-wide block font-medium mb-1">
                      Benefit & Fasilitas:
                    </span>
                    {perksList.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-1.5 text-xs text-[#31302E]">
                        <CheckCircle2 size={12} className="text-[#1AAE39] flex-shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
