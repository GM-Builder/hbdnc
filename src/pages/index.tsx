import React, { useEffect, useState } from 'react';
import confetti from "canvas-confetti";


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
  const [lampOn, setLampOn] = useState<boolean>(false);
  const [ceilingTaps, setCeilingTaps] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showSecretHotspot, setShowSecretHotspot] = useState<boolean>(false);


  const playSound = (frequency = 800, duration = 100) => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    }
  };

  const vibrate = (pattern: number | number[]): void => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };


  const [audio] = useState(() => {
  if (typeof window !== 'undefined') {
    const audioElement = new Audio('/song.mp3');
    audioElement.loop = true; // Loop terus
    audioElement.volume = 0.3; // Volume 30%
    return audioElement;
  }
  return null;
});

  // MODAL COMPONENTS - Warm Peach/Coral Theme

// 🎂 CakeModal — pembuka & ucapan utama
const CakeModal: React.FC<ModalProps> = ({ onClose }) => {

  useEffect(() => {
      const duration = 2 * 1000; // 2 detik
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }, []);

  return (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-rose-400 text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-rose-200 via-orange-100 to-peach-100 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-rose-300 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎂</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <h2 className="text-4xl font-hand font-bold text-rose-600 mb-2">Nicaa</h2>
            <h2 className="text-3xl font-hand font-bold text-rose-600 mb-2">HAPPY BIRTHDAY</h2>
            <p className="text-rose-700 text-sm font-medium">16 Oktober 2025</p>
          </div>
        </div>
        <p className="text-[12px] text-gray-800 leading-relaxed text-center mb-4">
          Di hari istimewa ini, semoga segala kebaikan datang menghampirimu.  
          Semoga hatimu ringan, harimu penuh warna, dan senyummu menular bahagia untuk dunia 🌸
        </p>
        <div className="text-[12px] bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4 text-sm text-gray-700 mb-6">
          <p className="font-semibold mb-3 text-rose-700">Doaku untukmu:</p>
          <ul className="space-y-2">
            <li>💕 Selalu diberi kesehatan & kekuatan</li>
            <li>💕 Rezeki lancar & keberkahan berlimpah</li>
            <li>💕 Dikelilingi orang-orang yang tulus</li>
            <li>💕 Diberi ketenangan dan kebahagiaan setiap hari</li>
          </ul>
        </div>
        <button onClick={onClose} className="w-full bg-white text-rose-600 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
          Lanjut Yuk
        </button>
      </div>
    </div>
  </div>
);
};

// 📖 BookModal — Cerita Nyata Kita
const BookModal: React.FC<ModalProps> = ({ onClose }) => {

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      const y = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, []);
  
  return(
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-rose-100 to-orange-100 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 to-orange-400 p-6 text-center">
          <span className="text-4xl block mb-3">📖</span>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Memory Book
          </h2>
          <p className="text-orange-100 text-sm mt-1">
            Cerita kita yang aneh tapi nyata 💫
          </p>
        </div>

        {/* Isi Buku */}
        <div className="p-6 space-y-4">
          {/* Chapter 1 */}
          <div className="bg-white/90 rounded-xl p-4 border-l-4 border-rose-400 shadow">
            <h3 className="font-bold text-rose-700 mb-2">
              Chapter 1 — Pertemuan
            </h3>
            <p className="text-[12.5px] text-gray-700 leading-relaxed">
              Semua dimulai di live streaming <strong>Dramabite</strong>.  
              Kamu pakai baju warna pink dan keliatan lagi bengong 😄.  
              Aku gak tau kenapa, tapi momen itu nyantol terus di kepala.
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="bg-white/90 rounded-xl p-4 border-l-4 border-orange-400 shadow">
            <h3 className="font-bold text-orange-700 mb-2">
              Chapter 2 — Dm Pertama
            </h3>
            <p className="text-[12.5px] text-gray-700 leading-relaxed">
              DM pertama itu waktu kamu bilang ada host sombong banget karena kamu di blokir 😄.
               
            </p>
          </div>

          {/* Chapter 3 */}
          <div className="bg-white/90 rounded-xl p-4 border-l-4 border-red-400 shadow">
            <h3 className="font-bold text-red-700 mb-2">
              Chapter 3 — Baby Duck (dutch) Pancake
            </h3>
            <p className="text-[12.5px] text-gray-700 leading-relaxed">
              Waktu itu aku pulang kampung naik motor dari Jakarta,
              padahal biasanya naik bis. Alasannya? Biar bisa mampir ketemu
              kamu dulu. Kedengarannya nekat, tapi worth it kok 😌.
            </p>
          </div>

          {/* Chapter 4 */}
          <div className="bg-white/90 rounded-xl p-4 border-l-4 border-pink-400 shadow">
            <h3 className="font-bold text-pink-700 mb-2">
              Chapter 4 — Sekarang
            </h3>
            <p className="text-[12.5px] text-gray-700 leading-relaxed">
              Sekarang mungkin jarang ketemu, tapi aku masih inget semua
              obrolan, tawa, dan caramu cerita dengan antusias. Aku cuma mau
              bilang: kamu orang baik, dan aku selalu menghargai setiap
              ceritamu, keluh kesahmu, dan canda tawamu. Karena ya, kamu cukup
              jadi dirimu sendiri aja 💕
            </p>
          </div>
        </div>

        {/* Tombol Tutup */}
        <div className="p-6 pt-0">
          <button
           onClick={(e) => {
              e.stopPropagation(); // cegah klik tembus ke backdrop
              onClose();
            }}
            className="w-full bg-gradient-to-r from-rose-400 to-orange-400 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Tutup Buku 📖
          </button>
        </div>
      </div>
    </div>
  </div>
);
};


// 🎁 GiftModal — hadiah simbolis
const GiftModal: React.FC<ModalProps> = ({ onClose }) => {

   useEffect(() => {
      const duration = 2 * 1000; // 2 detik
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }, []);

  return (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-orange-400 text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-rose-300 via-orange-200 to-peach-200 rounded-3xl p-1 shadow-2xl">
        <div className="bg-white rounded-3xl p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-rose-200 to-orange-200 rounded-2xl flex items-center justify-center transform rotate-12">
              <span className="text-5xl transform -rotate-12">🎁</span>
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">
              Hadiah Spesial Untukmu
            </h2>
          </div>
          <div className="space-y-4 mb-4">
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-5 border-2 border-rose-200">
              <h3 className="text-sm font-bold text-rose-800 mb-2">💌 Hadiah Pertama: Doa Terbaik</h3>
              <p className="text-xs text-gray-700">
                Semoga langkahmu selalu diberi kemudahan, dan hatimu tenang menghadapi hari-hari yang baru.
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-peach-50 rounded-2xl p-5 border-2 border-orange-200">
              <h3 className="text-sm font-bold text-orange-800 mb-2">🌷 Hadiah Kedua: Kebahagiaan</h3>
              <p className="text-xs text-gray-700">
                Semoga setiap detik hidupmu terasa hangat, bahkan saat dunia sedang dingin.
              </p>
            </div>
            <div className="bg-gradient-to-r from-peach-50 to-rose-50 rounded-2xl p-5 border-2 border-peach-200">
              <h3 className="text-sm font-bold text-peach-800 mb-2">💻 Hadiah Ketiga: Website Ini</h3>
              <p className="text-xs text-gray-700">
                Dibuat dengan sepenuh hati, sebagai bentuk kecil dari rasa sayang dan perhatian 💖
              </p>
            </div>
          </div>
          <p className="text-[9px] text-center text-gray-400 italic mb-4">
            (Bukan hadiah mahal, tapi dibuat dari hati 😄)
          </p>
          <button onClick={onClose} className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
            Terima Kasih 🎀
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

// 🎈 BalloonModal — harapan & semangat
const BalloonModal: React.FC<ModalProps> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >

      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-orange-400 text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center gap-3 mb-4">
            <div className="w-12 h-16 bg-rose-300 rounded-full"></div>
            <div className="w-12 h-16 bg-blue-300 rounded-full"></div>
            <div className="w-12 h-16 bg-peach-300 rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">
            Terbanglah Tinggi 🎈
          </h2>
        </div>
        <p className="text-center text-gray-700 mb-6">
          Balon-balon ini melambangkan mimpi dan harapanmu.  
          Biarkan mereka terbang tinggi, tapi tetap ingat, kakimu selalu berpijak pada kebaikan.
        </p>
        <ul className="space-y-2 text-sm text-gray-700 mb-6">
          <li>🌤️ Terus semangat walau hari terasa berat</li>
          <li>💫 Jangan takut mencoba hal baru</li>
          <li>💕 Percaya, kamu bisa lebih dari yang kamu pikir</li>
        </ul>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
          Aku Dukung Kamu 💪
        </button>
      </div>
    </div>
  </div>
);

// 🪑 ChairModal — istirahat & refleksi diri
const ChairModal: React.FC<ModalProps> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >

      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-rose-400  text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 bg-orange-200 rounded-2xl flex items-center justify-center">
            <span className="text-5xl">🪑</span>
          </div>
          <h2 className="text-3xl font-bold text-orange-800">Kursi Favoritmu</h2>
          <p className="text-orange-600 text-sm mt-1">Tempat paling nyaman untuk merenung</p>
        </div>
        <p className="text-gray-800 leading-relaxed mb-6">
          Duduklah sejenak. Tarik napas pelan.  
          Dunia bisa menunggu, kamu pantas mendapat waktu istirahat.  
          Hanya untuk dirimu sendiri 💆‍♀️
        </p>
        <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400 mb-6">
          <p className="text-sm text-gray-700 italic">
            “Kamu tidak harus produktif setiap waktu.  
            Kadang yang kamu butuh cuma tenang, dan menikmati Tianlala.”
          </p>
        </div>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
          Aku Siap Lagi ☕
        </button>
      </div>
    </div>
  </div>
);

// 😺 CatModal — pesan manis & lucu
const CatModal: React.FC<ModalProps> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-orange-400 text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-peach-100 via-orange-100 to-rose-100 rounded-3xl p-1 shadow-2xl">
        <div className="bg-white rounded-3xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">
              Meow~ 😸
            </h2>
            <p className="text-gray-600 text-sm mt-1">Pesan dari para kucing</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="text-sm bg-orange-50 rounded-xl p-4 border-2 border-orange-200 text-black">
              🐱 <strong className='text-orange-600'>Kucing Oren:</strong> “Hidup emang nggak selalu lembut, tapi kamu tuh tangguh banget.  
                Jangan lupa makan dan istirahat, ya.. dunia masih butuh senyummu.” 🍜💛
            </div>
            <div className="text-sm bg-gradient-to-r from-rose-400 to-orange-400 rounded-xl p-4 border-2 border-gray-200 text-gray-200">
              😺 <strong className='text-white'>Kucing Putih:</strong> “Kamu itu baik, unik, dan pantas hidup dengan caramu sendiri.  
                Jangan biarkan dunia kecil bikin kamu berhenti bermimpi." 💫
            </div>
            <div className="text-sm bg-slate-50 rounded-xl p-4 border-2 border-slate- text-black">
              🐈 <strong>Kucing Hitam:</strong> “Aku tahu kamu pernah ngerasa gelap banget di dalam sana...  
                tapi bahkan malam pun punya bintang.  
                Dan kamu, tanpa sadar, udah jadi salah satu cahayanya.” ✨
            </div>
          </div>
          <button onClick={onClose} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
            Meow~ Terima Kasih 🐾
          </button>
        </div>
      </div>
    </div>
  </div>
);

// 🌿 PlantModal — makna pertumbuhan & harapan
const PlantModal: React.FC<ModalProps> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Teruslah Tumbuh 🌱</h2>
        </div>
        <p className="text-gray-800 text-center bg-white/90 rounded-xl p-6 mb-6">
          Seperti tanaman, kamu juga butuh waktu 
          untuk tumbuh, mekar, dan bersinar dengan caramu sendiri 🌸
        </p>
        <button onClick={onClose} className="w-full bg-white text-green-600 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
          Aku Akan Tumbuh 🌿
        </button>
      </div>
    </div>
  </div>
);

// ☕ TableModal — simbol kebersamaan
const TableModal: React.FC<ModalProps> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

      <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl p-8 shadow-2xl border-4 border-orange-200">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">☕</span>
          <h2 className="text-3xl font-bold text-orange-800">Meja Cerita</h2>
          <p className="text-orange-600 text-sm">Tempat tawa & kebersamaan</p>
        </div>
        <p className="text-gray-800 leading-relaxed mb-4 text-center">
          Semoga selalu ada waktu untuk duduk bersama,  
          bercerita, dan tertawa tanpa alasan ☕💬
        </p>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
          Cerita Lagi Nanti 💛
        </button>
      </div>
    </div>
  </div>
);

const GalleryModal: React.FC<ModalProps> = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
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
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-gradient-to-br from-rose-800 to-orange-800 rounded-3xl p-6 relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl block mb-3">📸</span>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Kamu dalam frame
          </h2>
          <p className="text-rose-200 text-sm mt-2">
             Senyummu, ceritamu, semuanya terekam di sini 💕
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl shadow-lg group"
            >
              <img
                src={src}
                alt={`gallery-${i}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white text-rose-700 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-lg"
        >
          Tutup Galeri 📷
        </button>
      </div>

     {/* Modal Zoom Foto */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <img
            src={selectedImage}
            alt="zoom"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl transition-transform scale-100"
          />
        </div>
      )}
    </div>
  );
};



const EasterEggModal: React.FC<ModalProps> = ({ onClose }) => {
  
  const handleShowClue = () => {
    setShowSecretHotspot(true); // Aktifkan hotspot tersembunyi
    onClose(); // Tutup modal
  };

  return (
     <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-gradient-to-br from-rose-800 to-orange-800 rounded-3xl p-6 relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
      {/* 🧭 Tombol Close di pojok kanan atas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/50 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl flex items-center justify-center">
            <span className="text-5xl">🎁</span>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-rose-600 mb-1">
            SELAMAT!
          </h2>
          <p className="text-sm text-gray-50 font-medium">
            Kamu Menemukan Easter Egg 🎉
          </p>
        </div>

        {/* Pesan Spesial */}
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-4 border-2 border-orange-200 text-gray-700 mb-5">
          <p className="text-sm leading-relaxed italic text-center">
            "Kamu itu istimewa, bukan hanya karena hari ulang tahunmu saja,  
            tapi karena kehadiranmu membawa kebahagiaan bagi orang-orang di sekitarmu." 💕
          </p>
        </div>

        {/* Petunjuk Hadiah */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-5 border-2 border-yellow-400 mb-5">
          <div className="text-center mb-3">
            <span className="text-4xl">🗺️</span>
          </div>
          <p className="text-sm text-center font-bold text-orange-800 mb-2">
            Ada Hadiah Tersembunyi Untukmu!
          </p>
          <p className="text-xs text-gray-700 text-center mb-3">
            Petunjuk: Cari di <strong>laci lemari</strong> bagian bawah... 
            Ada sesuatu yang spesial menunggumu di sana! 👀
          </p>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 italic">
              💡 Hint: Harus kamu cari!
            </p>
          </div>
        </div>

        {/* Tombol */}
        <button
          onClick={handleShowClue}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-base"
          style={{ minHeight: '48px' }}
        >
          Oke, Aku Cari! 🔍
        </button>
      </div>
    </div>
  );
};

const SecretGiftModal: React.FC<ModalProps> = ({ onClose }) => {
  // Array of Shopee links - akan dipilih secara random
  const shopeeLinks = [
    "https://s.shopee.co.id/11mSjCEQF",
    "https://s.shopee.co.id/2qLzevnYJS", 
    "https://s.shopee.co.id/2Vj9GHldry"
  ];
  
  // Pilih link random saat modal dibuka
  const [shopeeCartLink] = useState(() => {
    const randomIndex = Math.floor(Math.random() * shopeeLinks.length);
    return shopeeLinks[randomIndex];
  });
  
  const whatsappNumber = "6282213955753";

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Halo! Aku sudah checkout hadiah ulang tahun dari laci rahasia. Ini kode BRIVA-ku: "
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div
    onClick={onClose}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto modal-scroll"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-gradient-to-br from-rose-400 to-purple-200 rounded-3xl p-6 relative w-full max-w-sm sm:max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto modal-scroll"
    >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/40 text-gray-800 text-lg w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl flex items-center justify-center animate-pulse">
            <span className="text-6xl">🎁</span>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-pink-900 mb-2">
            WOW! Ketemu!🎉
           </h2>
          <p className="text-[11px] text-gray-700 font-medium">
          Kamu berhasil menemukan hadiah tersembunyi!
          </p>
        </div>

        {/* Pesan */}
        <div className="bg-white rounded-xl p-4 mb-2">
            <p className="text-xs text-gray-700 font-semibold mb-2 text-center">
              🎁 Hadiah Spesial
            </p>
            <p className="text-[10px] text-gray-600 text-center">
              Sudah dipilihkan khusus untukmu!
            </p>
        </div>

        {/* Instruksi */}
        <div className="mb-3 space-y-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-xs text-gray-700 font-semibold mb-2">📝 Cara Klaim:</p>
            <ol className="text-[10px] text-gray-600 space-y-1 list-decimal list-inside">
              <li>Klik tombol "Buka Shopee"</li>
              <li>Checkout barang yang sudah dipilihkan</li>
              <li>Pilih pembayaran <strong>BRIVA</strong></li>
              <li>Salin kode BRIVA yang muncul</li>
              <li>Kirim kode ke WhatsApp</li>
            </ol>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-sm">
            <p className="text-[9px] text-red-700">
              <strong>⚠️ Penting:</strong> Jangan bayar dulu! Kirim kode BRIVA ke WA, nanti akan dibayarkan. ini untuk menjaga privasi alamatmu 🔒
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.open(shopeeCartLink, "_blank")}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ minHeight: '48px' }}
          >
            <span>Buka Shopee</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ minHeight: '48px' }}
          >
            <span>Kirim Kode BRIVA</span>
          </button>
        </div>
      </div>
    </div>
  );
};


  // Hotspots configuration
  const hotspots = [
    { id: 'cake', name: '🎂 Kue Ulang Tahun', position: { left: '42%', top: '72%', width: '16%', height: '10%' }, action: 'cake' },
    { id: 'bookshelf', name: '📚 Rak Buku', position: { left: '8%', top: '28%', width: '25%', height: '20%' }, action: 'book' },
    { id: 'gift1', name: '🎁 Hadiah 1', position: { left: '8%', top: '78%', width: '12%', height: '10%' }, action: 'gift' },
    { id: 'gift2', name: '🎁 Hadiah 2', position: { left: '22%', top: '85%', width: '18%', height: '12%' }, action: 'gift' },
    { id: 'balloons', name: '🎈 Balon', position: { left: '40%', top: '30%', width: '12%', height: '20%' }, action: 'balloon' },
    { id: 'armchair', name: '🪑 Kursi Cozy', position: { left: '62%', top: '50%', width: '25%', height: '20%' }, action: 'chair' },
    { id: 'cat1', name: '😺 Kucing 1', position: { left: '16%', top: '68%', width: '10%', height: '12%' }, action: 'cat' },
    { id: 'cat2', name: '😺 Kucing 2', position: { left: '2%', top: '80%', width: '10%', height: '12%' }, action: 'cat' },
    { id: 'cat3', name: '😺 Kucing 3', position: { left: '85%', top: '80%', width: '14%', height: '6%' }, action: 'cat' },
    { id: 'plants', name: '🌿 Tanaman', position: { left: '42%', top: '55%', width: '16%', height: '15%' }, action: 'plant' },
    { id: 'lamp', name: '💡 Lampu', position: { left: '44%', top: '5%', width: '12%', height: '25%' }, action: 'lamp' },
    { id: 'sidetable', name: '☕ Meja Samping', position: { left: '85%', top: '58%', width: '14%', height: '15%' }, action: 'table' },
    { id: 'Photo', name: 'Foto', position: { left: '14%', top: '50%', width: '12%', height: '10%' }, action: 'gallery' },
    { id: 'window', name: '🪟 Jendela', position: { left: '60%', top: '20%', width: '40%', height: '35%' }, action: 'exit' },
    ...(showSecretHotspot ? [{
    id: 'secret_drawer',
    name: '🎁 Laci Rahasia',
    position: { left: '8%', top: '68%', width: '12%', height: '10%' }, // Posisi laci lemari bawah
    action: 'secret_gift'
  }] : [])

  ];

  const handleHotspotClick = (action: string, objectId: string): void => {
    playSound(action === 'cake' ? 1200 : action === 'cat' ? 600 : 800, 150);
    vibrate(action === 'cake' ? [50, 50, 50] : [50]); // <- pastikan ini array number

    if (!clickedObjects.includes(objectId)) {
      setClickedObjects((prev: string[]) => [...prev, objectId]);
    }

    if (action === 'exit') {
      setCurrentPage('landing');
      playSound(600, 200);
      return;
    }

    if (action === 'lamp') {
      setLampOn(!lampOn);
      playSound(lampOn ? 400 : 800, 100);
      return;
    }

     if (action === 'secret_gift') {
      playSound(1500, 300);
      vibrate([100, 50, 100]);
      setActiveModal('secret_gift');
      return;
    }

    setActiveModal(action);
    
    if (action === 'cake' || action === 'gift') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleCeilingTap = (): void => {
    const newTaps = ceilingTaps + 1;
    setCeilingTaps(newTaps);
    
    if (newTaps >= 3) {
      setActiveModal('easteregg');
      playSound(1500, 300);
      vibrate([50, 100, 50]);
      setCeilingTaps(0);
    }
    
    setTimeout(() => setCeilingTaps(0), 2000);
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

  const totalObjects = hotspots.length - 2;
  const progress = Math.round((clickedObjects.length / totalObjects) * 100);

  const LandingPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-pink-400 relative overflow-hidden px-4">
      <div className="text-center z-10 max-w-md w-full">
        <h1 className="text-2xl font-hand font-semibold text-gray-200 mb-12">
          Hai, Nicaa! Mampir sini yuk 
        </h1>
        
        <div 
          onClick={() => setCurrentPage('room')}
          className="cursor-pointer group mx-auto inline-block"
        >
          <div className="w-40 h-56 mx-auto bg-gradient-to-b from-pink-300 to-pink-500 rounded-t-3xl border-4 border-pink-600 shadow-2xl transform group-active:scale-95 transition-transform relative">
            <div className="absolute top-1/2 left-6 w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
            <div className="absolute top-1/2 left-6 w-2 h-6 bg-yellow-300 rounded-sm -ml-0.5 mt-3"></div>
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-5xl filter drop-shadow-lg">
              🚪
            </div>
          </div>
          <div className="w-40 h-6 mx-auto bg-pink-600 rounded-b-lg shadow-lg"></div>
        </div>
        
        <p className="mt-12 font-hand text-white text-sm">
          Ketuk pintu untuk masuk
        </p>
      </div>
    </div>
  );

  const InteractiveRoom = () => (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '🎈', '💝', '⭐', '🎂', '🌸', '💕'][Math.floor(Math.random() * 8)]}
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

      {/* Progress Tracker */}
      <div className="fixed top-4 left-4 z-50 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">
            {clickedObjects.length}/{totalObjects}
          </span>
        </div>
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
        className="fixed z-10 p-2 active:scale-95 transition-transform"
              style={{ top: '79%', right: '30%' }}
      >
        <div className="text-5xl">{isMusicPlaying ? '📻' : '📻'}</div>
      </button>

      {/* Achievement */}
      {progress === 100 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-pulse">
          🏆 Semua objek ditemukan! 🎉
        </div>
      )}

      <div className="w-full h-screen relative">
        {!lampOn && (
          <div className="absolute inset-0 bg-black bg-opacity-70 z-10 transition-all duration-500"></div>
        )}
        
        <img 
          src="background.jpg"
          alt="Birthday Room"
          className="w-full h-full object-cover select-none"
          draggable="false"
        />

        <div className="absolute top-0 left-0 right-0 h-16 z-20" onClick={handleCeilingTap} />

        {hotspots.map((spot) => (
          <div
            key={spot.id}
            className="absolute cursor-pointer z-20"
            style={{
              left: spot.position.left,
              top: spot.position.top,
              width: spot.position.width,
              height: spot.position.height
            }}
            onClick={() => handleHotspotClick(spot.action, spot.id)}
          />
        ))}
      </div>

      {activeModal === 'cake' && <CakeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'book' && <BookModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'gift' && <GiftModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'balloon' && <BalloonModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'chair' && <ChairModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cat' && <CatModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'plant' && <PlantModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'table' && <TableModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'gallery' && <GalleryModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'easteregg' && <EasterEggModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'secret_gift' && <SecretGiftModal onClose={() => setActiveModal(null)} />}
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