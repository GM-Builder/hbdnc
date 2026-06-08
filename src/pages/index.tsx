import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface ModalProps {
  onClose: () => void;
}

const InteractiveBirthdayRoom = () => {
  const [clickedObjects, setClickedObjects] = useState<string[]>([]);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [lampOn, setLampOn] = useState<boolean>(true); 
  const [ceilingTaps, setCeilingTaps] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showSecretHotspot, setShowSecretHotspot] = useState<boolean>(false);

  // Gift open once states
  const [gift1Opened, setGift1Opened] = useState<boolean>(false);
  const [gift2Opened, setGift2Opened] = useState<boolean>(false);
  const [secretGiftOpened, setSecretGiftOpened] = useState<boolean>(false);

  // Audio elements & helper functions
  const playSound = (frequency = 800, duration = 150, type: OscillatorType = 'sine') => {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const playBlowSound = () => {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioContext.sampleRate * 0.3;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        noise.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const vibrate = (pattern: number | number[]): void => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audioElement = new Audio('/song.mp3');
      audioElement.loop = true;
      audioElement.volume = 0.25;
      setAudio(audioElement);
      
      return () => {
        audioElement.pause();
      };
    }
  }, []);

  const triggerModalConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    const colors = ['#A3C9A8', '#84B082', '#E2ECE9', '#B8D0C8', '#FFF9E6', '#FFF0F5'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // 🎂 CakeModal with Microphone blow support
  const CakeModal: React.FC<ModalProps> = ({ onClose }) => {
    const [candleBlown, setCandleBlown] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [isListening, setIsListening] = useState<boolean>(false);
    const streamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleBlow = () => {
      if (!candleBlown) {
        setCandleBlown(true);
        playBlowSound();
        triggerModalConfetti();
        vibrate([100, 50, 100]);
        stopMicListening();
      }
    };

    const stopMicListening = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsListening(false);
    };

    const startMicListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        setMicPermission('granted');
        setIsListening(true);

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        const checkBlow = () => {
          if (candleBlown) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;

          // If sound level is high (blowing into the mic)
          if (average > 65) {
            handleBlow();
          } else {
            requestAnimationFrame(checkBlow);
          }
        };

        requestAnimationFrame(checkBlow);
      } catch (err) {
        console.error("Microphone access error:", err);
        setMicPermission('denied');
        setIsListening(false);
      }
    };

    useEffect(() => {
      return () => {
        stopMicListening();
      };
    }, [candleBlown]);

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
            aria-label="Tutup"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-[#E2ECE9] rounded-full text-xs font-semibold text-emerald-800 tracking-wider mb-3">
              🎀 HARI SPESIALNYA AYANG 🎀
            </div>
            <h2 className="text-3xl font-playfair font-black text-emerald-950 leading-tight">
              Yeni Anggriani Putri
            </h2>
            <p className="text-sm font-semibold text-emerald-700 font-quicksand mt-1">
              Ulang Tahun yang Ke-28 • 8 Juni 2026
            </p>
          </div>

          <div className="bg-[#EAF2F0] rounded-2xl p-5 mb-5 flex flex-col items-center justify-center border border-[#D3E5E0]">
            <p className="text-xs text-emerald-800 font-bold mb-4 text-center">
              {candleBlown 
                ? "✨ Lilin Berhasil Ditiup! Make a wish... ✨" 
                : "🕯️ Ketuk lilin untuk tiup atau gunakan Mic!"}
            </p>
            
            <div 
              onClick={handleBlow}
              className={`cursor-pointer transition-transform duration-300 relative flex flex-col items-center mb-4 ${candleBlown ? '' : 'hover:scale-105'}`}
            >
              {!candleBlown ? (
                <div className="w-6 h-8 bg-amber-400 rounded-full flame-animation relative flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                  <div className="w-3 h-5 bg-yellow-200 rounded-full"></div>
                </div>
              ) : (
                <div className="h-8 flex items-center justify-center text-xs text-gray-500 italic">
                  💨 *puff*
                </div>
              )}
              <div className="w-0.5 h-2 bg-gray-700"></div>
              <div className="w-4 h-16 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-t shadow-inner relative overflow-hidden flex flex-col justify-between py-1">
                <div className="w-full h-1 bg-white/40"></div>
                <div className="w-full h-1 bg-white/40"></div>
                <div className="w-full h-1 bg-white/40"></div>
              </div>
              <div className="w-16 h-2 bg-amber-200 rounded-full shadow-md mt-0.5"></div>
            </div>

            {!candleBlown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isListening) {
                    stopMicListening();
                  } else {
                    startMicListening();
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  isListening 
                    ? 'bg-red-400 text-white hover:bg-red-500' 
                    : 'bg-[#84B082] text-white hover:bg-[#729c70]'
                }`}
              >
                <span>🎤</span> {isListening ? 'Matikan Mikrofon' : 'Tiup Pakai Mic'}
              </button>
            )}

            {candleBlown && (
              <p className="text-[11px] text-emerald-700 mt-2 text-center italic">
                "Semoga semua harapan, mimpi, dan doa terbaikmu di umur 28 ini dikabulkan oleh Allah SWT. Amin."
              </p>
            )}
          </div>

          <div className="space-y-3 font-quicksand text-xs text-emerald-950 leading-relaxed text-left bg-white p-4 rounded-xl border border-emerald-100/50">
            <p className="font-semibold text-sm text-emerald-800 border-b border-emerald-100 pb-2 flex items-center gap-1.5">
              <span>🧸</span> Pesan Manis untuk Cuti:
            </p>
            <p>
              Selamat ulang tahun yang ke-28 untuk istri tercintaku, belahan jiwaku. 💖
            </p>
            <p>
              Meskipun hari lahirmu sudah lewat sedikit, rasa sayang, syukur, dan cinta yang kumiliki untukmu tidak pernah berkurang sedetik pun. Aku sangat beruntung memiliki Ayang yang sehebat, secantik, dan sehangat dirimu di sisiku.
            </p>
            <p>
              Terima kasih telah menemani perjalananku sejak kita bersama di November 2019, hingga akhirnya kita melangkah ke pelaminan yang indah di Desember 2025. Selamat membuka lembaran baru yang manis di usiamu yang ke-28 ini, Cuti sayang.
            </p>
            <p className="font-semibold text-center text-emerald-800 pt-2 border-t border-[#EAF2F0] mt-3">
              I Love You More Than Words Can Say! 🎀
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-5 bg-[#84B082] text-white py-3 rounded-xl font-bold font-quicksand shadow-md hover:bg-[#729c70] active:scale-95 transition-all text-sm"
          >
            Lanjut Jelajahi Kamar 🧸
          </button>
        </div>
      </div>
    );
  };

  // 📖 BookModal
  const BookModal: React.FC<ModalProps> = ({ onClose }) => {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">📖</span>
            <h2 className="text-2xl font-playfair font-black text-emerald-950">Memory Book</h2>
            <p className="text-xs text-emerald-700 italic mt-0.5">Kisah perjalanan cinta kita 🤍</p>
          </div>

          <div className="space-y-4 font-quicksand">
            <div className="bg-white p-4 rounded-2xl border-l-4 border-[#84B082] shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 block mb-1">
                November 2019
              </span>
              <h3 className="font-bold text-sm text-emerald-950 mb-1">Awal Kisah Kita 💖</h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Pertama kali langkah kita dipertemukan. Saat itulah kita mulai berjalan berdampingan, saling mengenal, berbagi tawa, dan menyusun mimpi-mimpi sederhana bersama Cuti.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-l-4 border-amber-300 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 block mb-1">
                2020 - 2024
              </span>
              <h3 className="font-bold text-sm text-emerald-950 mb-1">Tumbuh Bersama 🌱</h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Tahun-tahun penuh petualangan, suka, dan duka. Kita belajar mengerti satu sama lain, menguatkan ketika lelah, dan yakin bahwa kita diciptakan untuk saling melengkapi.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-l-4 border-emerald-400 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block mb-1">
                Desember 2025
              </span>
              <h3 className="font-bold text-sm text-emerald-950 mb-1">Janji Suci Pernikahan 💍</h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Hari paling bersejarah saat kita berjanji di hadapan-Nya untuk hidup semati. Dari teman perjalanan kini resmi menjadi teman hidup selamanya untuk saling menyayangi.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-l-4 border-red-300 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 block mb-1">
                Juni 2026
              </span>
              <h3 className="font-bold text-sm text-emerald-950 mb-1">Ulang Tahun Ke-28 Cuti ✨</h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Sekarang di usiamu yang ke-28, kita merayakannya bersama di bawah atap yang sama. Semoga cinta kita terus bertumbuh subur dan rumah tangga kita penuh berkah.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
          >
            Tutup Buku Cerita 📚
          </button>
        </div>
      </div>
    );
  };

  // 🎁 GiftModal for Kado 1 — 3 selectable main gifts
  const Gift1Modal: React.FC<ModalProps> = ({ onClose }) => {
    const [selectedGift, setSelectedGift] = useState<number | null>(null);

    const gifts = [
      { id: 1, label: 'Box A', emoji: '🚗', title: 'Jalan-jalan ke Bandung', desc: 'Petualangan seru menikmati sejuknya kota kembang berdua.' },
      { id: 2, label: 'Box B', emoji: '🏨', title: 'Staycation Hotel Jakarta', desc: 'Waktu santai, berenang, dan dimanja di hotel mewah Jakarta.' },
      { id: 3, label: 'Box C', emoji: '🛍️', title: 'Jajan Sepuasnya', desc: 'Pesta kuliner atau belanja impianmu, budget 500rb – 1 Juta!' },
    ];

    const handleSelect = (id: number) => {
      setSelectedGift(id);
      playSound(1000, 250);
      triggerModalConfetti();
      vibrate([50, 50, 100]);
      setGift1Opened(true);
    };

    const handleClaim = (title: string) => {
      const waNumber = '6282213955753';
      const message = encodeURIComponent(`Halo suamiku sayang! ❤️ Aku sudah buka Kado 1 (Mystery Box) dan isinya: "${title}". Makasih banyak ya sayang! 🥰`);
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    };

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✕
          </button>

          <div className="text-center mb-5">
            <span className="text-4xl block mb-2">🎁✨</span>
            <h2 className="text-2xl font-playfair font-black text-emerald-950">Mystery Box Utama</h2>
            <p className="text-xs text-emerald-700 mt-1">Pilih salah satu kotak misteri di bawah untuk membukanya! 🌸</p>
          </div>

          {selectedGift === null ? (
            <div className="grid grid-cols-3 gap-3 py-4">
              {gifts.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  className="cursor-pointer group flex flex-col items-center justify-center p-4 bg-white border-2 border-[#D3E5E0] rounded-2xl shadow-sm hover:border-[#84B082] hover:shadow-md active:scale-95 transition-all text-center"
                >
                  <span className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">🎁</span>
                  <span className="text-xs font-bold text-emerald-950">{g.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#EAF2F0] rounded-2xl p-5 border border-[#D3E5E0] text-center">
              <span className="text-4xl block mb-2 animate-bounce">{gifts.find(g => g.id === selectedGift)?.emoji}</span>
              <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Pilihan Kamu:</p>
              <h3 className="text-base font-bold text-emerald-950 mb-3">{gifts.find(g => g.id === selectedGift)?.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClaim(gifts.find(g => g.id === selectedGift)?.title || '')}
                  className="flex-1 bg-[#84B082] text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#729c70] active:scale-95 transition-all"
                >
                  Klaim ke Suami 💌
                </button>
                <button
                  onClick={() => setSelectedGift(null)}
                  className="px-4 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-xs hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Ganti
                </button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-center text-gray-400 italic mt-4">(Hanya bisa dibuka 1x — pilih dengan bijak! 😄)</p>
        </div>
      </div>
    );
  };

  // 🎁 GiftModal for Kado 2 — 3 smaller supplementary gifts
  const Gift2Modal: React.FC<ModalProps> = ({ onClose }) => {
    const [selectedGift, setSelectedGift] = useState<number | null>(null);

    const gifts = [
      { id: 1, label: 'Box X', emoji: '🍽️', title: 'Makan Malam Romantis', desc: 'Dinner berdua di restoran pilihan Cuti, malam yang hangat dan berkesan.' },
      { id: 2, label: 'Box Y', emoji: '🎬', title: 'Nonton Bioskop + Makan', desc: 'Pilih film favorit, nikmati popcorn, dan makan enak bareng Ayang.' },
      { id: 3, label: 'Box Z', emoji: '💆', title: 'Skincare / Perawatan Favorit', desc: 'Bebas pilih skincare atau perawatan kecantikan yang Cuti inginkan.' },
    ];

    const handleSelect = (id: number) => {
      setSelectedGift(id);
      playSound(900, 220);
      vibrate([50, 50, 80]);
      setGift2Opened(true);
    };

    const handleClaim = (title: string) => {
      const waNumber = '6282213955753';
      const message = encodeURIComponent(`Halo suamiku sayang! ❤️ Aku sudah buka Kado 2 (Mystery Box tambahan) dan isinya: "${title}". Makasih banyak ya sayang! 🥰`);
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    };

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✕
          </button>

          <div className="text-center mb-5">
            <span className="text-4xl block mb-2">🎀✨</span>
            <h2 className="text-2xl font-playfair font-black text-emerald-950">Mystery Box Tambahan</h2>
            <p className="text-xs text-emerald-700 mt-1">Pilih salah satu kotak pita di bawah! 💕</p>
          </div>

          {selectedGift === null ? (
            <div className="grid grid-cols-3 gap-3 py-4">
              {gifts.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  className="cursor-pointer group flex flex-col items-center justify-center p-4 bg-white border-2 border-[#D3E5E0] rounded-2xl shadow-sm hover:border-[#84B082] hover:shadow-md active:scale-95 transition-all text-center"
                >
                  <span className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">🎁</span>
                  <span className="text-xs font-bold text-emerald-950">{g.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#EAF2F0] rounded-2xl p-5 border border-[#D3E5E0] text-center">
              <span className="text-4xl block mb-2">{gifts.find(g => g.id === selectedGift)?.emoji}</span>
              <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Pilihan Kamu:</p>
              <h3 className="text-base font-bold text-emerald-950 mb-3">{gifts.find(g => g.id === selectedGift)?.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClaim(gifts.find(g => g.id === selectedGift)?.title || '')}
                  className="flex-1 bg-[#84B082] text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#729c70] active:scale-95 transition-all"
                >
                  Klaim ke Suami 💌
                </button>
                <button
                  onClick={() => setSelectedGift(null)}
                  className="px-4 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-xs hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Ganti
                </button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-center text-gray-400 italic mt-4">(Hanya bisa dibuka 1x — pilih yang paling kamu mau! 💖)</p>
        </div>
      </div>
    );
  };

  // Already Opened Gift Card Modal
  const AlreadyOpenedModal: React.FC<{ title: string; desc: string; onClose: () => void }> = ({ title, desc, onClose }) => {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✕
          </button>
          <span className="text-5xl block mb-3 opacity-60">🔒</span>
          <h2 className="text-xl font-playfair font-black text-emerald-950 mb-2">Kado Ini Sudah Dibuka</h2>
          <div className="bg-[#EAF2F0] rounded-xl p-4 border border-emerald-100 mb-4 text-left">
            <p className="font-bold text-xs text-emerald-900 mb-1">{title}</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">{desc}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-[#84B082] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-[#729c70] active:scale-95 transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  };

  // 📸 GalleryModal
  const GalleryModal: React.FC<ModalProps> = ({ onClose }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const images = [
      "/foto/foto1.jpg",
      "/foto/foto2.jpg",
      "/foto/foto3.jpg",
      "/foto/foto4.jpg",
      "/foto/foto5.jpg",
      "/foto/foto6.jpg",
    ];

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-800 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✕
          </button>

          <div className="text-center mb-5">
            <span className="text-4xl block mb-2">📸</span>
            <h2 className="text-2xl font-playfair font-black text-emerald-950">Galeri Foto Kenangan</h2>
            <p className="text-xs text-emerald-700 mt-1">Senyum manismu selalu terekam di hati 🤍</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {images.map((src, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(src)}
                className="cursor-pointer bg-white p-2 border border-gray-200 rounded-lg shadow-sm hover:-translate-y-1 transition-transform"
              >
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded mb-1">
                  <img
                    src={src}
                    alt={`Kenangan ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop`;
                    }}
                  />
                </div>
                <div className="text-[10px] text-center text-gray-500 font-medium">Memory {i + 1}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
          >
            Tutup Galeri 📷
          </button>
        </div>

        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
          >
            <div className="relative max-w-full max-h-[80vh] flex flex-col items-center">
              <img
                src={selectedImage}
                alt="Zoomed memory"
                className="max-w-[95vw] max-h-[75vh] object-contain rounded-xl border-4 border-white shadow-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="mt-4 bg-white/20 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/30 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 🎈 BalloonModal
  const BalloonModal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl text-center"
      >
        <div className="flex justify-center gap-3 mb-4 animate-bounce">
          <span className="text-4xl">🎈</span>
          <span className="text-3xl">🎀</span>
          <span className="text-4xl">🎈</span>
        </div>
        
        <h2 className="text-2xl font-playfair font-black text-emerald-950 mb-2">Harapan Terbang Tinggi</h2>
        <p className="text-xs text-gray-700 leading-relaxed font-quicksand mb-6">
          Seperti balon-balon ceria ini yang membubung tinggi ke awan, semoga setiap doa yang dipanjatkan terbang tinggi melintasi langit dan dikabulkan seluruhnya.
        </p>

        <div className="bg-[#EAF2F0] rounded-xl p-4 text-left border border-[#D3E5E0] space-y-2 text-xs text-emerald-900 mb-6">
          <p>🌟 Semoga Ayang selalu dipenuhi limpahan kesehatan & kebahagiaan</p>
          <p>🤍 Semoga ikatan pernikahan kita semakin hari semakin kuat & berkah</p>
          <p>🌸 Semoga Ayang dimudahkan mencapai segala impian di usiamu yang ke-28</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Amin, Ya Rabbal Alamin 🤍
        </button>
      </div>
    </div>
  );

  // 🪑 ChairModal
  const ChairModal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">🪑</span>
          <h2 className="text-2xl font-playfair font-black text-emerald-950">Sudut Istirahat Cuti</h2>
          <p className="text-xs text-emerald-700 italic mt-0.5">Tempat ternyaman untuk melepas lelah</p>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed font-quicksand mb-5 text-center">
          Dunia luar mungkin sibuk dan melelahkan, tapi ingatlah ada rumah yang selalu hangat untukmu. Duduklah santai di sini, tarik nafas panjang, dan rasakan kasih sayang yang selalu menunggumu pulang.
        </p>

        <div className="bg-[#EAF2F0] rounded-xl p-4 border border-[#D3E5E0] mb-6">
          <p className="text-xs text-emerald-800 italic text-center">
            "Kamu tidak harus selalu berlari. Terkadang, beristirahat sejenak sambil ditemani segelas teh hangat adalah bentuk cinta terbaik untuk dirimu sendiri." 🍵
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Kembali Santai 🤍
        </button>
      </div>
    </div>
  );

  // 😺 Cat1Modal (Si Oren Lucu)
  const Cat1Modal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">🐈</span>
          <h2 className="text-2xl font-playfair font-black text-emerald-950">Si Oren Lucu</h2>
          <p className="text-xs text-emerald-700 italic">Meow~ pesan manis pertama untukmu... 🐾</p>
        </div>

        <div className="bg-[#EAF2F0] p-4 rounded-xl border border-[#D3E5E0] text-emerald-950 text-xs font-quicksand leading-relaxed my-4">
          "Meow~ Jangan lupa tersenyum ya hari ini, Cuti! Senyuman manis Cuti adalah hal terindah yang selalu bikin suami bersemangat setiap hari."
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Meow~ Terima Kasih! 🐾
        </button>
      </div>
    </div>
  );

  // 😺 Cat2Modal (Si Putih Cantik)
  const Cat2Modal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">😺</span>
          <h2 className="text-2xl font-playfair font-black text-emerald-950">Si Putih Cantik</h2>
          <p className="text-xs text-emerald-700 italic">Meow~ ada doa baik di sini... 🐾</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 text-emerald-950 text-xs font-quicksand leading-relaxed my-4">
          "Meow~ Semoga Cuti selalu diberikan kesehatan, kelancaran rezeki, dan selalu diliputi kebahagiaan di usia ke-28 ini."
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Meow~ Amin! 🐾
        </button>
      </div>
    </div>
  );

  // 😺 Cat3Modal (Si Abu-Abu Manis)
  const Cat3Modal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">🐈‍⬛</span>
          <h2 className="text-2xl font-playfair font-black text-emerald-950">Si Abu-Abu Manis</h2>
          <p className="text-xs text-emerald-700 italic">Meow~ sebuah harapan hangat... 🐾</p>
        </div>

        <div className="bg-[#EAF2F0] p-4 rounded-xl border border-gray-100 text-emerald-900 text-xs font-quicksand leading-relaxed my-4">
          "Meow~ Tetaplah menjadi Cuti yang penyayang dan sabar ya. Kami mendoakan kebahagiaan rumah tanggamu selamanya."
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Meow~ Amin YRA! 🐾
        </button>
      </div>
    </div>
  );

  // 🌿 PlantModal
  const PlantModal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl text-center"
      >
        <span className="text-4xl block mb-2">🌿</span>
        <h2 className="text-2xl font-playfair font-black text-emerald-950 mb-2">Terus Tumbuh Bersama</h2>
        <p className="text-xs text-gray-700 leading-relaxed font-quicksand mb-5">
          Seperti tanaman hias cantik di kamar ini, semoga cinta dan kebersamaan kita terus bertumbuh subur, melahirkan dedaunan kasih baru, dan selalu segar penuh keberkahan di masa depan.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Tumbuh Bersama 🌱
        </button>
      </div>
    </div>
  );

  // ☕ TableModal
  const TableModal: React.FC<ModalProps> = ({ onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF9F6] border-2 border-[#B8D0C8] rounded-3xl p-6 shadow-xl text-center"
      >
        <span className="text-4xl block mb-2">☕</span>
        <h2 className="text-2xl font-playfair font-black text-emerald-950 mb-2">Meja Hangat Cerita</h2>
        <p className="text-xs text-gray-700 leading-relaxed font-quicksand mb-5">
          Meja kecil tempat kita biasa meletakkan secangkir kopi atau cemilan manis di malam hari. Semoga obrolan-obrolan hangat kita selalu hidup menemani malam-malam kita.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
        >
          Mari Ngobrol Lagi 🤍
        </button>
      </div>
    </div>
  );

  // Easter Egg Modal
  const EasterEggModal: React.FC<ModalProps> = ({ onClose }) => {
    const handleShowClue = () => {
      setShowSecretHotspot(true);
      onClose();
    };

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-[#FAF9F6] border-2 border-yellow-300 rounded-3xl p-6 shadow-xl text-center"
        >
          <span className="text-5xl block mb-3 animate-bounce">✨🧸✨</span>
          <h2 className="text-2xl font-playfair font-black text-[#6B8E23] mb-1">Wah, Ketemu!</h2>
          <p className="text-xs text-emerald-800 font-bold mb-4">Kamu Menemukan Clue Rahasia! 🎉</p>
          
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 text-xs text-gray-700 leading-relaxed mb-5 text-left">
            <p className="font-bold text-amber-800 mb-1">🎁 Petunjuk Hadiah Rahasia:</p>
            <p>Ada area tersembunyi yang sekarang sudah aktif! Coba cari di bagian laci paling bawah dari rak laci lemari ya. Ada sesuatu yang menunggumu di sana! 👀</p>
          </div>

          <button
            onClick={handleShowClue}
            className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
          >
            Ayo Cari! 🔍
          </button>
        </div>
      </div>
    );
  };

  // Secret Gift Modal — restored to original sweet vouchers
  const SecretGiftModal: React.FC<ModalProps> = ({ onClose }) => {
    useEffect(() => {
      setSecretGiftOpened(true);
    }, []);

    const waNumber = '6281383521750';
    const handleWhatsApp = () => {
      const message = encodeURIComponent("Halo Ayang sayang! Aku berhasil menemukan Laci Rahasia di websitemu. 🎁 Aku klaim pelukan terhangat dan ciuman kening yaa hari ini! Love you! ❤️");
      window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
    };

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-[#FAF9F6] border-2 border-emerald-300 rounded-3xl p-6 shadow-xl text-center"
        >
          <span className="text-5xl block mb-3 animate-pulse">💖🧸💖</span>
          <h2 className="text-2xl font-playfair font-black text-emerald-950 mb-2">Laci Rahasia Terbuka!</h2>
          <p className="text-xs text-gray-700 leading-relaxed font-quicksand mb-5">
            Hebat banget bisa nemu laci rahasia ini! Ini adalah bentuk pelukan hangat dariku untuk menyambut pertambahan usiamu yang ke-28 ini.
          </p>

          <div className="bg-[#EAF2F0] rounded-xl p-4 border border-[#D3E5E0] text-xs text-emerald-900 text-left mb-6 space-y-1">
            <p><strong>Hadiah Tambahan:</strong></p>
            <p>✨ Voucher Peluk Manja Sepuasnya 🤗</p>
            <p>✨ Voucher Cium Kening Sayang 😘</p>
            <p>✨ Voucher Bebas Cemberut 1 Harian Penuh 🌸</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#84B082] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#729c70] active:scale-95 transition-transform text-sm"
          >
            Kirim 💌
          </button>
        </div>
      </div>
    );
  };

  // Hotspots definitions
  const hotspots = [
    { id: 'cake', name: '🎂 Kue Ulang Tahun', position: { left: '42%', top: '72%', width: '16%', height: '5%' }, action: 'cake' },
    { id: 'bookshelf', name: '📚 Buku Kenangan', position: { left: '8%', top: '28%', width: '25%', height: '20%' }, action: 'book' },
    { id: 'gift1', name: '🎁 Kado 1', position: { left: '0%', top: '70%', width: '12%', height: '10%' }, action: 'gift1' },
    { id: 'gift2', name: '🎁 Kado 2', position: { left: '22%', top: '85%', width: '18%', height: '12%' }, action: 'gift2' },
    { id: 'balloons', name: '🎈 Balon', position: { left: '40%', top: '30%', width: '12%', height: '20%' }, action: 'balloon' },
    { id: 'armchair', name: '🪑 Kursi Cozy', position: { left: '62%', top: '50%', width: '25%', height: '20%' }, action: 'chair' },
    { id: 'cat1', name: '😺 Boneka Kucing Oren', position: { left: '16%', top: '68%', width: '10%', height: '12%' }, action: 'cat1' },
    { id: 'cat2', name: '😺 Boneka Kucing Putih', position: { left: '2%', top: '80%', width: '10%', height: '12%' }, action: 'cat2' },
    { id: 'cat3', name: '😺 Boneka Kucing Abu', position: { left: '85%', top: '80%', width: '14%', height: '6%' }, action: 'cat3' },
    { id: 'plants', name: '🌿 Tanaman', position: { left: '42%', top: '55%', width: '16%', height: '15%' }, action: 'plant' },
    { id: 'lamp', name: '💡 Lampu Utama', position: { left: '44%', top: '5%', width: '12%', height: '25%' }, action: 'lamp' },
    { id: 'sidetable', name: '☕ Meja Samping', position: { left: '85%', top: '58%', width: '14%', height: '15%' }, action: 'table' },
    { id: 'Photo', name: 'Foto Kenangan', position: { left: '14%', top: '50%', width: '12%', height: '10%' }, action: 'gallery' },
    { id: 'window', name: '🪟 Pintu Keluar', position: { left: '60%', top: '20%', width: '40%', height: '35%' }, action: 'exit' },
    ...(showSecretHotspot ? [{
      id: 'secret_drawer',
      name: '🎁 Laci Rahasia',
      position: { left: '0%', top: '60%', width: '12%', height: '10%' },
      action: 'secret_gift'
    }] : [])
  ];

  const handleHotspotClick = (action: string, objectId: string): void => {
    playSound(action === 'cake' ? 1000 : action === 'cat' ? 700 : 800, 150);
    vibrate(action === 'cake' ? [50, 50, 50] : [50]);

    if (!clickedObjects.includes(objectId)) {
      setClickedObjects((prev: string[]) => [...prev, objectId]);
    }

    if (action === 'exit') {
      setCurrentPage('landing');
      playSound(500, 200);
      return;
    }

    if (action === 'lamp') {
      setLampOn(!lampOn);
      playSound(lampOn ? 350 : 700, 100);
      return;
    }

    setActiveModal(action);
    
    if (action === 'cake' || action === 'gift1' || action === 'gift2' || action === 'secret_gift') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleCeilingTap = (): void => {
    const newTaps = ceilingTaps + 1;
    setCeilingTaps(newTaps);
    
    if (newTaps >= 3) {
      setActiveModal('easteregg');
      playSound(1200, 300, 'triangle');
      vibrate([50, 100, 50]);
      setCeilingTaps(0);
    }
    
    setTimeout(() => setCeilingTaps(0), 2500);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 100) {
      setCurrentPage('landing');
    }
  };

  const totalObjects = hotspots.length - 2; // Subtract lamp and window from count
  const progress = Math.round((clickedObjects.filter(id => id !== 'lamp' && id !== 'window').length / totalObjects) * 100);

  // 🏡 LandingPage
  const LandingPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] relative overflow-hidden px-6 text-center">
      <div className="absolute top-10 left-10 text-3xl opacity-20 float-animation select-none">🎈</div>
      <div className="absolute top-20 right-12 text-3xl opacity-20 float-animation select-none" style={{ animationDelay: '1.5s' }}>🎀</div>
      <div className="absolute bottom-20 left-12 text-3xl opacity-20 float-animation select-none" style={{ animationDelay: '2s' }}>🧸</div>
      <div className="absolute bottom-12 right-16 text-3xl opacity-20 float-animation select-none" style={{ animationDelay: '0.5s' }}>🎈</div>

      <div className="z-10 max-w-sm w-full space-y-6">
        <div className="inline-block p-1.5 bg-[#E2ECE9] rounded-full mb-2 border border-[#B8D0C8]">
          <span className="px-3 py-1 bg-white rounded-full text-[11px] font-bold text-emerald-800 tracking-wider block">
            HAPPY BIRTHDAY AYANG 🎀
          </span>
        </div>

        <h1 className="text-3xl font-playfair font-black text-emerald-950 leading-snug">
          Hai, Sayangku Yeni Anggriani Putri! 🤍
        </h1>
        
        <p className="text-xs text-emerald-800 font-medium font-quicksand leading-relaxed max-w-xs mx-auto">
          Aku punya kejutan kecil di dalam ruangan ini khusus untuk ulang tahunmu yang ke-28. Mampir masuk sebentar yuk...
        </p>

        <div 
          onClick={() => {
            setCurrentPage('room');
            if (audio && !isMusicPlaying) {
              audio.play().catch(() => {});
              setIsMusicPlaying(true);
            }
          }}
          className="cursor-pointer group mx-auto inline-block pt-4"
        >
          <div className="w-36 h-48 mx-auto bg-gradient-to-b from-[#E2ECE9] to-[#C4DED7] rounded-t-full border-4 border-[#84B082] shadow-lg transform group-hover:scale-105 group-active:scale-95 transition-all relative flex flex-col justify-end pb-8">
            <div className="absolute top-[45%] left-5 w-3 h-3 bg-amber-400 rounded-full shadow-inner"></div>
            <div className="text-3xl filter drop-shadow">🚪</div>
          </div>
          <div className="w-40 h-3 mx-auto bg-[#84B082]/60 rounded-full mt-1"></div>
        </div>
        
        <p className="font-hand text-[#6B8E23] text-sm mt-4 tracking-wide">
          *Ketuk pintu untuk masuk*
        </p>
      </div>
    </div>
  );

  // 🏡 InteractiveRoom
  const InteractiveRoom = () => (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animation: `fall ${2.5 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 1.5}s`
              }}
            >
              {['🎉', '🎈', '💝', '⭐', '🌸', '🎀', '🧸'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Top Banner Message */}
      <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="bg-[#FAF9F6]/95 border border-[#B8D0C8] px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-emerald-800 tracking-wider">
            Cari Objek: {clickedObjects.filter(id => id !== 'lamp' && id !== 'window').length}/{totalObjects}
          </span>
        </div>

        <button
          onClick={() => setCurrentPage('landing')}
          className="bg-[#FAF9F6]/95 border border-[#B8D0C8] px-3 py-1.5 rounded-full shadow-lg pointer-events-auto text-[10px] font-bold text-emerald-800 active:scale-95 transition-all"
        >
          KLUAR 🚪
        </button>
      </div>

      {/* Music Toggle - Di dekat meja (radio) */}
      <button
        onClick={() => {
          if (isMusicPlaying) {
            audio?.pause();
            setIsMusicPlaying(false);
          } else {
            audio?.play().catch(err => console.log('Audio play failed:', err));
            setIsMusicPlaying(true);
          }
          playSound(isMusicPlaying ? 400 : 800, 100);
        }}
        className="fixed z-40 p-2 active:scale-95 transition-transform"
        style={{ top: '79%', right: '30%' }}
      >
        <div className="text-5xl">{isMusicPlaying ? '📻' : '📻'}</div>
      </button>

      {/* Achievement Alert */}
      {progress >= 100 && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-gradient-to-r from-emerald-100 to-amber-100 border border-emerald-300 text-emerald-950 px-4 py-2 rounded-2xl shadow-xl text-center text-xs font-bold animate-pulse">
          🏆 Semua objek ditemukan! Suami punya surprise untukmu! 🎉
        </div>
      )}

      {/* Interactive Room Area */}
      <div className="w-full h-screen relative bg-zinc-900">
        {!lampOn && (
          <div className="absolute inset-0 bg-black bg-opacity-95 z-10 transition-all duration-500 pointer-events-none"></div>
        )}
        
        <img 
          src="background.jpg"
          alt="Birthday Room"
          className="w-full h-full object-cover select-none"
          draggable="false"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Ceiling Tap (Secret hotspot trigger) */}
        <div className="absolute top-0 left-0 right-0 h-14 z-20 cursor-pointer" onClick={handleCeilingTap} title="Ketuk langit-langit 3 kali" />

        {/* Render Hotspots */}
        {hotspots.map((spot) => (
          <div
            key={spot.id}
            className="absolute cursor-pointer z-20 border-0 bg-transparent"
            style={{
              left: spot.position.left,
              top: spot.position.top,
              width: spot.position.width,
              height: spot.position.height
            }}
            onClick={() => handleHotspotClick(spot.action, spot.id)}
            title={spot.name}
          />
        ))}
      </div>

      {/* Modals Routing */}
      {activeModal === 'cake' && <CakeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'book' && <BookModal onClose={() => setActiveModal(null)} />}
      
      {activeModal === 'gift1' && (
        gift1Opened ? (
          <AlreadyOpenedModal 
            title="Jalan-jalan ke Bandung 🚗💨" 
            desc="Kado 1 sudah dibuka! Petualangan seru menikmati sejuknya kota kembang bersama suamiku tercinta." 
            onClose={() => setActiveModal(null)} 
          />
        ) : (
          <Gift1Modal onClose={() => setActiveModal(null)} />
        )
      )}

      {activeModal === 'gift2' && (
        gift2Opened ? (
          <AlreadyOpenedModal 
            title="Staycation Hotel Jakarta 🏨✨" 
            desc="Kado 2 sudah dibuka! Menikmati waktu santai, berenang, dan dimanja di hotel mewah Jakarta bersama suami." 
            onClose={() => setActiveModal(null)} 
          />
        ) : (
          <Gift2Modal onClose={() => setActiveModal(null)} />
        )
      )}

      {activeModal === 'balloon' && <BalloonModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'chair' && <ChairModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cat1' && <Cat1Modal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cat2' && <Cat2Modal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cat3' && <Cat3Modal onClose={() => setActiveModal(null)} />}
      {activeModal === 'plant' && <PlantModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'table' && <TableModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'gallery' && <GalleryModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'easteregg' && <EasterEggModal onClose={() => setActiveModal(null)} />}

      {activeModal === 'secret_gift' && (
        <SecretGiftModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );

  return (
    <>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'room' && <InteractiveRoom />}
    </>
  );
};

export default InteractiveBirthdayRoom;