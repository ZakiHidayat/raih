// ============================================================
// RAIH — Prize Info Parser & Utilities
// ============================================================

export interface PrizeTier {
  id: string;
  rank?: number; // 1 = Gold, 2 = Silver, 3 = Bronze, etc.
  title: string; // e.g. "Juara 1", "Best Innovation"
  amount: string; // e.g. "Rp 15.000.000" or "-"
  amountNumber?: number; // numeric value for calculations
  perks?: string; // e.g. "Trophy + Sertifikat + Program Inkubasi"
}

export interface PrizeSummary {
  primaryAmount: string; // e.g. "Rp 15.000.000"
  primaryTitle: string; // e.g. "Juara 1"
  totalEstimatedAmount?: string; // e.g. "Rp 31.000.000"
  totalNumber?: number;
  totalCategories: number;
  shortLabel: string; // e.g. "Juara 1: Rp 15 Jt" or "Rp 15.000.000"
}

/**
 * Extracts numbers from Indonesian currency strings like "Rp 15.000.000" -> 15000000
 */
export function extractNumericAmount(str: string): number | undefined {
  if (!str) return undefined;
  // Match patterns like "Rp 15.000.000" or "Rp15000000" or "15.000.000"
  const cleaned = str.replace(/rp\.?/gi, '').trim();
  const numMatch = cleaned.match(/[\d.]+/);
  if (!numMatch) return undefined;
  
  // Strip dots used as thousand separators
  const digitsOnly = numMatch[0].replace(/\./g, '');
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Formats a number to Rupiah string: 15000000 -> "Rp 15.000.000"
 */
export function formatRupiah(num: number): string {
  if (num === 0) return 'Gratis / Non-tunai';
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Formats compact Rupiah: 15000000 -> "Rp 15 Jt"
 */
export function formatCompactRupiah(num: number): string {
  if (!num) return '-';
  if (num >= 1_000_000_000) {
    const val = (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1);
    return `Rp ${val} M`;
  }
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1);
    return `Rp ${val} Jt`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1);
    return `Rp ${val} Rb`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Parses any raw prize_info string (JSON array, pipe-delimited, newline-delimited)
 * into a structured PrizeTier array.
 */
export function parsePrizeInfo(raw: string | null | undefined): PrizeTier[] {
  if (!raw || typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // 1. Try parsing JSON format
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => {
          const num = typeof item.amount === 'number' 
            ? item.amount 
            : extractNumericAmount(item.amount || '');
          const amountStr = typeof item.amount === 'number'
            ? formatRupiah(item.amount)
            : item.amount || '-';

          let rank: number | undefined;
          const lowerTitle = (item.title || '').toLowerCase();
          if (lowerTitle.includes('1') || lowerTitle.includes('pertama')) rank = 1;
          else if (lowerTitle.includes('2') || lowerTitle.includes('kedua')) rank = 2;
          else if (lowerTitle.includes('3') || lowerTitle.includes('ketiga')) rank = 3;

          return {
            id: item.id || `prize-${idx}`,
            rank: item.rank || rank,
            title: item.title || `Penghargaan ${idx + 1}`,
            amount: amountStr,
            amountNumber: num,
            perks: item.perks || '',
          };
        });
      }
    } catch {
      // Not JSON, continue to string parser
    }
  }

  // 2. Parse string with delimiter (pipe '|' or newlines)
  const segments = trimmed
    .split(/[|\n]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return [];

  const results: PrizeTier[] = [];

  segments.forEach((seg, idx) => {
    // Check if segment is a general total mention like "Total hadiah Rp 150.000.000"
    if (seg.toLowerCase().startsWith('total hadiah') && segments.length > 1) {
      // Don't treat "Total Hadiah" as a single competitor rank, but we can capture it
      return;
    }

    // Typical format: "Juara 1: Rp 15.000.000 + Trophy + Sertifikat"
    // Or "Juara 1 Rp 15.000.000"
    let title = '';
    let rest = seg;

    if (seg.includes(':')) {
      const parts = seg.split(':');
      title = parts[0].trim();
      rest = parts.slice(1).join(':').trim();
    } else if (/juara\s+\d+/i.test(seg)) {
      const match = seg.match(/(juara\s+\d+)(.*)/i);
      if (match) {
        title = match[1].trim();
        rest = match[2].trim();
      }
    } else {
      title = `Penghargaan ${idx + 1}`;
    }

    // Now extract perks if "+" is present
    let amount = rest;
    let perks = '';

    if (rest.includes('+')) {
      const plusParts = rest.split('+');
      amount = plusParts[0].trim();
      perks = plusParts.slice(1).map(p => p.trim()).join(' + ');
    }

    // If amount has other benefits without "+", check commas
    if (!perks && amount.includes(',') && !/\d,\d/.test(amount)) {
      const commaParts = amount.split(',');
      amount = commaParts[0].trim();
      perks = commaParts.slice(1).map(p => p.trim()).join(', ');
    }

    const num = extractNumericAmount(amount);

    let rank: number | undefined;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('1') || lowerTitle.includes('pertama') || lowerTitle.includes('emas')) rank = 1;
    else if (lowerTitle.includes('2') || lowerTitle.includes('kedua') || lowerTitle.includes('perak')) rank = 2;
    else if (lowerTitle.includes('3') || lowerTitle.includes('ketiga') || lowerTitle.includes('perunggu')) rank = 3;

    results.push({
      id: `tier-${idx}`,
      rank,
      title: title || `Kategori ${idx + 1}`,
      amount: amount || '-',
      amountNumber: num,
      perks: perks || undefined,
    });
  });

  return results;
}

/**
 * Returns a high-level concise summary for cards and tables.
 */
export function getPrizeSummary(raw: string | null | undefined): PrizeSummary {
  if (!raw || !raw.trim()) {
    return {
      primaryAmount: 'Sertifikat & Hadiah',
      primaryTitle: 'Semua Peserta',
      totalCategories: 0,
      shortLabel: 'Sertifikat & Hadiah',
    };
  }

  // Check if raw explicitly specifies "Total hadiah Rp ..."
  const totalMatch = raw.match(/total\s+hadiah\s*(?:rp\.?)?\s*([\d.]+)/i);
  let explicitTotal: number | undefined;
  if (totalMatch) {
    explicitTotal = extractNumericAmount(totalMatch[1]);
  }

  const tiers = parsePrizeInfo(raw);

  if (tiers.length === 0) {
    const rawNumber = extractNumericAmount(raw);
    if (rawNumber) {
      return {
        primaryAmount: formatRupiah(rawNumber),
        primaryTitle: 'Total Hadiah',
        totalNumber: rawNumber,
        totalEstimatedAmount: formatRupiah(rawNumber),
        totalCategories: 1,
        shortLabel: formatRupiah(rawNumber),
      };
    }
    return {
      primaryAmount: raw,
      primaryTitle: 'Hadiah',
      totalCategories: 1,
      shortLabel: raw.length > 25 ? `${raw.slice(0, 22)}...` : raw,
    };
  }

  // Calculate sum of numeric prizes
  let calculatedSum = 0;
  let hasValidAmount = false;
  tiers.forEach(t => {
    if (t.amountNumber) {
      calculatedSum += t.amountNumber;
      hasValidAmount = true;
    }
  });

  const totalNumber = explicitTotal || (hasValidAmount ? calculatedSum : undefined);
  const totalEstimatedAmount = totalNumber ? formatRupiah(totalNumber) : undefined;

  // Pick top tier (Juara 1 or first item)
  const topTier = tiers.find(t => t.rank === 1) || tiers[0];
  const primaryAmount = topTier?.amount || (totalEstimatedAmount ?? 'Sertifikat');
  const primaryTitle = topTier?.title || 'Juara 1';

  let shortLabel = primaryAmount;
  if (topTier.amountNumber) {
    shortLabel = `${primaryTitle}: ${formatCompactRupiah(topTier.amountNumber)}`;
    if (tiers.length > 1) {
      shortLabel += ` (+${tiers.length - 1})`;
    }
  } else if (totalNumber) {
    shortLabel = `Total ${formatCompactRupiah(totalNumber)}`;
  } else if (primaryAmount.length > 30) {
    shortLabel = `${primaryAmount.slice(0, 27)}...`;
  }

  return {
    primaryAmount,
    primaryTitle,
    totalEstimatedAmount,
    totalNumber,
    totalCategories: tiers.length,
    shortLabel,
  };
}

/**
 * Serializes an array of PrizeTier into a clean human-readable and parseable string format
 * (e.g. "Juara 1: Rp 15.000.000 + Trophy + Sertifikat | Juara 2: Rp 8.000.000 ...")
 */
export function serializePrizeTiers(tiers: PrizeTier[]): string {
  if (!tiers || tiers.length === 0) return '';
  return tiers
    .map(t => {
      let str = `${t.title}: ${t.amount}`;
      if (t.perks && t.perks.trim()) {
        str += ` + ${t.perks.trim()}`;
      }
      return str;
    })
    .join(' | ');
}
