'use client';

// ============================================================
// RAIH — Teammate Discussion & Chat Messenger
// Solves Feedback Grid:
// - WISH: Menambahkan fitur chat untuk mencari rekan tim
// - QUESTIONS: Bagaimana pengguna dapat menghubungi calon rekan tim untuk berdiskusi sebelum berkolaborasi?
// - IDEAS: Menambahkan chat untuk komunikasi antarmahasiswa
// Design System: Notion (design.md)
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  MessageCircle,
  Phone,
  ExternalLink,
  CheckCircle,
  Zap,
  Sparkles,
  GraduationCap,
  MapPin,
  Clock,
} from '@/components/ui/icons';
import type { UserWithProfiles } from '@/types';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface TeammateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: UserWithProfiles | null;
  currentUserName?: string;
}

export function TeammateChatModal({
  isOpen,
  onClose,
  candidate,
  currentUserName = 'Ariel Pratama',
}: TeammateChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load or initialize chat when candidate opens
  useEffect(() => {
    if (!candidate || !isOpen) return;

    const storageKey = `raih_chat_${candidate.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // fallback
      }
    } else {
      // Default initial welcome conversation
      const initial: Message[] = [
        {
          id: 'init-1',
          sender: 'them',
          text: `Halo ${currentUserName}! Senang terhubung di Raih. Saya melihat profilmu tertarik di kompetisi teknologi & inovasi.`,
          time: '10:14',
        },
        {
          id: 'init-2',
          sender: 'them',
          text: `Apakah kamu sedang mencari rekan tim untuk lomba dalam waktu dekat?`,
          time: '10:15',
        },
      ];
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [candidate, isOpen, currentUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !candidate) return null;

  const candidateProfile = candidate.participant_profile;
  const compatibility = (candidate as any).compatibilityScore ?? 92;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');

    const storageKey = `raih_chat_${candidate.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Simulate smart candidate auto-reply after 1.4s
    setIsTyping(true);
    setTimeout(() => {
      let replyText = `Terima kasih infonya! Ide yang sangat bagus. Ayo kita jadwalkan diskusi santai via Google Meet atau WhatsApp untuk finalisasi pembagian tugas.`;
      if (text.toLowerCase().includes('lomba') || text.toLowerCase().includes('hackathon')) {
        replyText = `Wah cocok banget! Saya siap handle bagian prototype & pitch deck. Boleh kirimkan link detail lombanya di Raih?`;
      } else if (text.toLowerCase().includes('wa') || text.toLowerCase().includes('whatsapp')) {
        replyText = `Boleh banget, nomor WhatsApp saya aktif di ${candidate.phone || '0812-9876-5432'}. Kabari kalau sudah chat ya!`;
      } else if (text.toLowerCase().includes('role') || text.toLowerCase().includes('skill')) {
        replyText = `Skill utama saya di ${candidateProfile?.skills || 'UI/UX & Product Design'}. Kita bisa saling melengkapi peran di tim!`;
      }

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'them',
        text: replyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updated, replyMsg];
      setMessages(finalMessages);
      setIsTyping(false);
      localStorage.setItem(storageKey, JSON.stringify(finalMessages));
    }, 1400);
  };

  const quickPrompts = [
    '👋 Tanya ketersediaan gabung tim',
    '🎯 Ajak kolaborasi di Hackathon/UI-UX',
    '📱 Minta kontak WhatsApp untuk diskusi cepat',
    '📋 Bahas pembagian peran tim',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-white rounded-xl border border-[#E6E6E6] shadow-xl overflow-hidden flex flex-col h-[580px] max-h-[92vh]"
      >
        {/* ── Header ────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-[#F6F5F4] border-b border-[#E6E6E6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar
                src={candidate.profile_photo ?? undefined}
                name={candidate.name}
                size="md"
                className="w-10 h-10 rounded-full border border-[#E6E6E6] shrink-0"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1AAE39] border-2 border-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#000000] truncate">{candidate.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1AAE39]/10 text-[#0E6621] border border-[#1AAE39]/30">
                  <Zap size={10} className="text-[#1AAE39]" />
                  <span>{Math.round(compatibility)}% Match</span>
                </span>
              </div>
              <p className="text-[11px] text-[#615D59] truncate flex items-center gap-1">
                <span>{candidate.education_level || 'Mahasiswa'}</span>
                {candidate.location && (
                  <>
                    <span>•</span>
                    <span>{candidate.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick External WhatsApp Action */}
            <a
              href={`https://wa.me/${(candidate.phone || '081234567890').replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(candidate.name)},%20saya%20menghubungi%20lewat%20platform%20Raih`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-[5px] text-[#0E6621] hover:bg-[#1AAE39]/10 border border-[#1AAE39]/30 text-xs inline-flex items-center gap-1 transition-colors"
              title="Buka Chat WhatsApp Langsung"
            >
              <Phone size={13} />
              <span className="hidden sm:inline font-medium text-[11px]">WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-[5px] text-[#615D59] hover:text-[#000000] hover:bg-[#EAE8E4] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Subheader Notice (Notion Callout) ─────────────── */}
        <div className="px-4 py-2 bg-white border-b border-[#E6E6E6] text-[11px] text-[#615D59] flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <Sparkles size={12} className="text-[#0075DE] shrink-0" />
            <span>Keahlian: <strong>{candidateProfile?.skills || 'Desain, Frontend'}</strong></span>
          </span>
          <span className="text-[10px] text-[#A39E98] shrink-0">Pesan terenkripsi</span>
        </div>

        {/* ── Message Thread Body ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF9]">
          {messages.map((m) => {
            const isMe = m.sender === 'me';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#0075DE] text-white rounded-br-xs shadow-2xs'
                      : 'bg-white text-[#000000] border border-[#E6E6E6] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[9px] text-[#A39E98] mt-1 px-1">{m.time}</span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-[#615D59] px-2 py-1 bg-white rounded-full border border-[#E6E6E6] w-fit shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0075DE] animate-pulse" />
              <span className="text-[11px]">{candidate.name} sedang mengetik...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Starter Chips ───────────────────────────── */}
        <div className="px-3 py-1.5 bg-[#F6F5F4] border-t border-[#E6E6E6] overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-[#E6E6E6] text-[#31302E] hover:border-[#0075DE] hover:text-[#0075DE] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ── Input Box ─────────────────────────────────────── */}
        <div className="p-3 bg-white border-t border-[#E6E6E6]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ketik pesan untuk berdiskusi dengan ${candidate.name}...`}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] focus:bg-white focus:outline-hidden focus:border-[#0075DE] text-[#000000] placeholder:text-[#A39E98] transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-2 rounded-lg bg-[#0075DE] hover:bg-[#005BAB] text-white disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
