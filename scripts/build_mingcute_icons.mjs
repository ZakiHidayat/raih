import fs from 'fs';
import path from 'path';

const raw = JSON.parse(fs.readFileSync('scripts/mingcute_downloaded.json', 'utf8'));

const iconDefinitions = [
  { name: 'Home', file: 'Home-1-Line--Streamline-Mingcute.svg', aliases: ['MingCuteHome'] },
  { name: 'Search', file: 'Search-Line--Streamline-Mingcute.svg', aliases: ['MingCuteSearch'] },
  { name: 'Heart', file: 'Heart-Line--Streamline-Mingcute.svg', aliases: ['MingCuteHeart'] },
  { name: 'HeartFill', file: 'Heart-Fill--Streamline-Mingcute-Fill.svg', aliases: ['MingCuteHeartFill'] },
  { name: 'Trophy', file: 'Trophy-Line--Streamline-Mingcute.svg', aliases: ['MingCuteTrophy'] },
  { name: 'Award', file: 'Award-Line--Streamline-Mingcute.svg', aliases: ['MingCuteAward'] },
  { name: 'Ticket', file: 'Ticket-Line--Streamline-Mingcute.svg', aliases: ['MingCuteTicket', 'Bookmark'] },
  { name: 'User', file: 'User-1-Line--Streamline-Mingcute.svg', aliases: ['MingCuteUser'] },
  { name: 'Calendar', file: 'Calendar-Line--Streamline-Mingcute.svg', aliases: ['MingCuteCalendar'] },
  { name: 'Clock', file: 'Time-Line--Streamline-Mingcute.svg', aliases: ['Time', 'MingCuteClock', 'MingCuteTime'] },
  { name: 'MapPin', file: 'Location-Line--Streamline-Mingcute.svg', aliases: ['Location', 'MingCuteMapPin'] },
  { name: 'ArrowLeft', file: 'Arrow-Left-Line--Streamline-Mingcute.svg', aliases: ['MingCuteArrowLeft'] },
  { name: 'ArrowRight', file: 'Arrow-Right-Line--Streamline-Mingcute.svg', aliases: ['MingCuteArrowRight'] },
  { name: 'ArrowUp', file: 'Arrow-Up-Line--Streamline-Mingcute.svg', aliases: ['MoveUp', 'MingCuteArrowUp'] },
  { name: 'ArrowDown', file: 'Arrow-Down-Line--Streamline-Mingcute.svg', aliases: ['MoveDown', 'MingCuteArrowDown'] },
  { name: 'ChevronRight', file: 'Right-Line--Streamline-Mingcute.svg', aliases: ['Right', 'MingCuteChevronRight'] },
  { name: 'ChevronLeft', file: 'Left-Line--Streamline-Mingcute.svg', aliases: ['Left', 'MingCuteChevronLeft'] },
  { name: 'ChevronDown', file: 'Down-Line--Streamline-Mingcute.svg', aliases: ['Down', 'MingCuteChevronDown'] },
  { name: 'ChevronUp', file: 'Up-Line--Streamline-Mingcute.svg', aliases: ['Up', 'MingCuteChevronUp'] },
  { name: 'Check', file: 'Check-Line--Streamline-Mingcute.svg', aliases: ['MingCuteCheck'] },
  { name: 'CheckCircle', file: 'Check-Circle-Line--Streamline-Mingcute.svg', aliases: ['CheckCircle2', 'MingCuteCheckCircle'] },
  { name: 'X', file: 'Close-Line--Streamline-Mingcute.svg', aliases: ['Close', 'MingCuteClose', 'MingCuteX'] },
  { name: 'XCircle', file: 'Close-Circle-Line--Streamline-Mingcute.svg', aliases: ['CloseCircle', 'MingCuteCloseCircle', 'MingCuteXCircle'] },
  { name: 'Eye', file: 'Eye-Line--Streamline-Mingcute.svg', aliases: ['MingCuteEye'] },
  { name: 'EyeOff', file: 'Eye-Close-Line--Streamline-Mingcute.svg', aliases: ['EyeClose', 'MingCuteEyeOff'] },
  { name: 'Lock', file: 'Lock-Line--Streamline-Mingcute.svg', aliases: ['MingCuteLock'] },
  { name: 'Mail', file: 'Mail-Line--Streamline-Mingcute.svg', aliases: ['MingCuteMail', 'MessageSquare'] },
  { name: 'Phone', file: 'Phone-Line--Streamline-Mingcute.svg', aliases: ['MingCutePhone'] },
  { name: 'Users', file: 'Group-Line--Streamline-Mingcute.svg', aliases: ['Group', 'MingCuteUsers'] },
  { name: 'Plus', file: 'Add-Line--Streamline-Mingcute.svg', aliases: ['Add', 'MingCutePlus'] },
  { name: 'Trash', file: 'Delete-2-Line--Streamline-Mingcute.svg', aliases: ['Trash2', 'Delete', 'MingCuteTrash'] },
  { name: 'Edit', file: 'Edit-2-Line--Streamline-Mingcute.svg', aliases: ['Edit2', 'Edit3', 'MingCuteEdit'] },
  { name: 'Star', file: 'Star-Line--Streamline-Mingcute.svg', aliases: ['MingCuteStar'] },
  { name: 'Share2', file: 'Share-2-Line--Streamline-Mingcute.svg', aliases: ['Share', 'MingCuteShare'] },
  { name: 'Bell', file: 'Notification-Line--Streamline-Mingcute.svg', aliases: ['Notification', 'MingCuteBell'] },
  { name: 'Filter', file: 'Filter-Line--Streamline-Mingcute.svg', aliases: ['MingCuteFilter'] },
  { name: 'SlidersHorizontal', file: 'Filter-2-Line--Streamline-Mingcute.svg', aliases: ['Filter2', 'MingCuteSlidersHorizontal'] },
  { name: 'AlertCircle', file: 'Alert-Line--Streamline-Mingcute.svg', aliases: ['Alert', 'MingCuteAlertCircle', 'HelpCircle'] },
  { name: 'Warning', file: 'Warning-Line--Streamline-Mingcute.svg', aliases: ['MingCuteWarning'] },
  { name: 'ShieldAlert', file: 'Safe-Alert-Line--Streamline-Mingcute.svg', aliases: ['SafeAlert', 'MingCuteShieldAlert'] },
  { name: 'FileText', file: 'Document-Line--Streamline-Mingcute.svg', aliases: ['Document', 'MingCuteFileText'] },
  { name: 'Save', file: 'Save-Fill--Streamline-Mingcute-Fill.svg', aliases: ['MingCuteSave'] },
  { name: 'Download', file: 'Download-Line--Streamline-Mingcute.svg', aliases: ['MingCuteDownload'] },
  { name: 'Flame', file: 'Flame-Line--Streamline-Mingcute.svg', aliases: ['Fire', 'MingCuteFlame'] },
  { name: 'Zap', file: 'Flash-Line--Streamline-Mingcute.svg', aliases: ['Flash', 'MingCuteZap'] },
  { name: 'Sparkles', file: 'Sparkles-Line--Streamline-Mingcute.svg', aliases: ['MingCuteSparkles'] },
  { name: 'Target', file: 'Target-Line--Streamline-Mingcute.svg', aliases: ['MingCuteTarget'] },
  { name: 'Settings', file: 'Settings-1-Line--Streamline-Mingcute.svg', aliases: ['MingCuteSettings'] },
  { name: 'GraduationCap', file: 'Mortarboard-Line--Streamline-Mingcute.svg', aliases: ['Mortarboard', 'MingCuteGraduationCap'] },
  { name: 'Globe', file: 'Earth-Line--Streamline-Mingcute.svg', aliases: ['Globe2', 'Earth', 'MingCuteGlobe'] },
  { name: 'Shield', file: 'Shield-Line--Streamline-Mingcute.svg', aliases: ['MingCuteShield', 'ShieldCheck'] },
  { name: 'Video', file: 'Video-Line--Streamline-Mingcute.svg', aliases: ['MingCuteVideo'] },
  { name: 'LogOut', file: 'Exit-Line--Streamline-Mingcute.svg', aliases: ['Exit', 'MingCuteLogOut'] },
  { name: 'LayoutDashboard', file: 'Dashboard-Line--Streamline-Mingcute.svg', aliases: ['Dashboard', 'MingCuteLayoutDashboard'] },
  { name: 'BarChart2', file: 'Chart-Bar-Line--Streamline-Mingcute.svg', aliases: ['BarChart', 'MingCuteBarChart'] },
  { name: 'TrendingUp', file: 'Stock-Line--Streamline-Mingcute.svg', aliases: ['Stock', 'MingCuteTrendingUp'] },
  { name: 'Compass', file: 'Compass-Line--Streamline-Mingcute.svg', aliases: ['MingCuteCompass'] },
  { name: 'DollarSign', file: 'Currency-Dollar-Line--Streamline-Mingcute.svg', aliases: ['CurrencyDollar', 'MingCuteDollarSign'] },
  { name: 'Upload', file: 'Upload-2-Line--Streamline-Mingcute.svg', aliases: ['Upload2', 'MingCuteUpload'] },
  { name: 'Layers', file: 'Layer-Line--Streamline-Mingcute.svg', aliases: ['MingCuteLayers', 'Layer'] },
  { name: 'ExternalLink', file: 'External-Link-Line--Streamline-Mingcute.svg', aliases: ['MingCuteExternalLink'] },
  { name: 'Moon', file: 'Moon-Line--Streamline-Mingcute.svg', aliases: ['MingCuteMoon'] },
  { name: 'Briefcase', file: 'Briefcase-Line--Streamline-Mingcute.svg', aliases: ['MingCuteBriefcase'] },
];

let code = `/* 
  AUTO-GENERATED MINGCUTE ICON LIBRARY
  Streamline MCP MingCute Icons for Raih
  Design System: Notion
*/
import React from 'react';

export interface MingCuteIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

function createIcon(displayName: string, pathD: string) {
  const Icon = React.forwardRef<SVGSVGElement, MingCuteIconProps>(
    ({ size = 20, className = '', style, ...props }, ref) => {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={'mingcute-icon ' + className}
          data-streamline="mingcute"
          data-icon-name={displayName}
          style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
          aria-hidden="true"
          {...props}
        >
          <path fillRule="evenodd" clipRule="evenodd" d={pathD} />
        </svg>
      );
    }
  );
  Icon.displayName = displayName;
  return Icon;
}

`;

for (const def of iconDefinitions) {
  const item = raw[def.file];
  if (!item) {
    console.error('Missing item for', def);
    continue;
  }
  const match = item.svg.match(/<path[^>]+fill="#000000"[^>]+d="([^"]+)"/) || item.svg.match(/<path[^>]+d="([^"]+)"[^>]+fill="#000000"/);
  if (!match) {
    console.error('Could not extract path for', def.file);
    continue;
  }
  const d = match[1];
  code += `export const ${def.name} = createIcon('${def.name}', ${JSON.stringify(d)});\n`;
  for (const alias of def.aliases) {
    code += `export const ${alias} = ${def.name};\n`;
  }
  code += '\n';
}

fs.writeFileSync('components/ui/mingcute-icons.tsx', code);
console.log('Successfully generated components/ui/mingcute-icons.tsx');
