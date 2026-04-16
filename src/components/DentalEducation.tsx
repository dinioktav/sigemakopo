import React, { useState } from 'react';
import { 
  Play, 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Share2, 
  Bookmark,
  ChevronRight,
  Sparkles,
  Video
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const VIDEOS = [
  { 
    id: 1, 
    title: 'Edukasi Kesehatan Gigi dan Mulut', 
    duration: '04:12', 
    category: 'Edukasi Umum', 
    thumbnail: 'https://img.youtube.com/vi/l2nWrEQAjYM/maxresdefault.jpg',
    views: '15K',
    rating: 4.9,
    embedId: 'l2nWrEQAjYM'
  },
  { 
    id: 2, 
    title: 'Cara Menyikat Gigi yang Benar', 
    duration: '03:45', 
    category: 'Pencegahan', 
    thumbnail: 'https://img.youtube.com/vi/B6JnZt7NA5c/maxresdefault.jpg',
    views: '12K',
    rating: 4.8,
    embedId: 'B6JnZt7NA5c'
  },
  { 
    id: 3, 
    title: 'Tips Menjaga Kesehatan Gigi dan Mulut', 
    duration: '05:10', 
    category: 'Edukasi Umum', 
    thumbnail: 'https://img.youtube.com/vi/nZfKQYJ1938/maxresdefault.jpg',
    views: '8K',
    rating: 4.7,
    embedId: 'nZfKQYJ1938'
  },
  { 
    id: 4, 
    title: 'Pentingnya Periksa Gigi Rutin', 
    duration: '04:30', 
    category: 'Pencegahan', 
    thumbnail: 'https://img.youtube.com/vi/6mrlGKd0NEs/maxresdefault.jpg',
    views: '10K',
    rating: 4.9,
    embedId: '6mrlGKd0NEs'
  },
  { 
    id: 5, 
    title: 'Kesehatan Gigi untuk Anak', 
    duration: '06:15', 
    category: 'Pedodonti', 
    thumbnail: 'https://img.youtube.com/vi/n8O-TEdiiOw/maxresdefault.jpg',
    views: '14K',
    rating: 4.8,
    embedId: 'n8O-TEdiiOw'
  },
  { 
    id: 6, 
    title: 'Mengenal Karang Gigi', 
    duration: '03:55', 
    category: 'Tindakan Medis', 
    thumbnail: 'https://img.youtube.com/vi/3s08kea6dU0/maxresdefault.jpg',
    views: '22K',
    rating: 4.9,
    embedId: '3s08kea6dU0'
  }
];

export const DentalEducation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEOS[0] | null>(null);

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Edukasi Kesehatan Gigi</h1>
          <p className="text-navy/40 font-medium mt-1">Materi edukasi visual untuk pasien dan tenaga medis.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={20} />
            <input 
              type="text" 
              placeholder="Cari materi edukasi..." 
              className="pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium shadow-sm w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {selectedVideo ? (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-navy rounded-[3rem] overflow-hidden shadow-2xl shadow-navy/40 aspect-video relative group">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black bg-pink text-white px-3 py-1 rounded-full uppercase tracking-widest">{selectedVideo.category}</span>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {selectedVideo.duration}</span>
              </div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-pink font-black text-sm">
                  <Star size={16} fill="currentColor" /> {selectedVideo.rating}
                </div>
                <div className="text-navy/40 text-xs font-bold uppercase tracking-widest">{selectedVideo.views} Penayangan</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-navy/5 hover:border-pink hover:text-pink rounded-xl font-black transition-all shadow-sm uppercase tracking-widest text-[10px]">
                <Bookmark size={16} /> Simpan
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-navy/5 hover:border-pink hover:text-pink rounded-xl font-black transition-all shadow-sm uppercase tracking-widest text-[10px]">
                <Share2 size={16} /> Bagikan
              </button>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="px-6 py-3 bg-navy text-pink rounded-xl font-black hover:bg-navy-light transition-all uppercase tracking-widest text-[10px]"
              >
                Tutup Video
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VIDEOS.map((video) => (
            <div 
              key={video.id} 
              className="glass-card rounded-[2.5rem] overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-500"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-pink text-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-navy/80 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                  {video.duration}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] font-black bg-navy-50 text-navy/40 px-2 py-1 rounded uppercase tracking-tighter">{video.category}</span>
                </div>
                <h3 className="text-sm font-black text-navy uppercase tracking-tight leading-relaxed mb-6 group-hover:text-pink transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between pt-6 border-t border-navy/5">
                  <div className="flex items-center gap-1 text-pink font-black text-[10px]">
                    <Star size={12} fill="currentColor" /> {video.rating}
                  </div>
                  <div className="flex items-center gap-1 text-navy/20 font-black text-[10px] uppercase tracking-widest">
                    Mulai Belajar <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Section */}
      {!selectedVideo && (
        <div className="mt-16 bg-navy p-12 rounded-[3rem] text-white shadow-2xl shadow-navy/20 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink/20 rounded-full blur-[100px]"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-pink" size={32} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-pink">Rekomendasi AI</h3>
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-6 leading-tight">Materi Edukasi Khusus Untuk Pasien Anda</h2>
              <p className="text-lg font-medium opacity-60 mb-10 leading-relaxed">Sistem kami menganalisis tren diagnosis dan menyarankan materi edukasi yang paling relevan untuk meningkatkan kesadaran kesehatan gigi masyarakat.</p>
              <button className="px-10 py-5 bg-pink text-white rounded-2xl font-black hover:bg-pink-dark transition-all shadow-xl shadow-pink/20 uppercase tracking-widest text-xs">
                Generate Playlist Edukasi
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: BookOpen, label: 'E-Booklet' },
                { icon: Video, label: 'Video 4K' },
                { icon: Star, label: 'Kuis Interaktif' },
                { icon: Share2, label: 'Materi Sosmed' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                  <item.icon className="text-pink mb-4" size={28} />
                  <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
