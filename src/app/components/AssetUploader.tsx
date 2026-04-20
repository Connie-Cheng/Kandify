import { useState } from 'react';
import { Upload, X, Music, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AssetUploaderProps {
  onClose: () => void;
}

export function AssetUploader({ onClose }: AssetUploaderProps) {
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});
  const [audioFiles, setAudioFiles] = useState<Record<string, string>>({});
  const [beadAssets, setBeadAssets] = useState<string[]>([]);

  const handleCoverUpload = (songId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setCoverImages(prev => ({ ...prev, [songId]: url }));
    // In real app, would upload to server
    localStorage.setItem(`cover_${songId}`, url);
  };

  const handleAudioUpload = (songId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setAudioFiles(prev => ({ ...prev, [songId]: url }));
    localStorage.setItem(`audio_${songId}`, url);
  };

  const handleBeadAssetUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setBeadAssets(prev => [...prev, url]);
    const current = JSON.parse(localStorage.getItem('beadAssets') || '[]');
    localStorage.setItem('beadAssets', JSON.stringify([...current, url]));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-8">
      <div className="glass-card rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto outer-glow-soft inner-glow scrollbar-thin">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upload Assets</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Cover Images */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Album Cover Images</h3>
            </div>
            <div className="space-y-3">
              {['100', '101', '102'].map(songId => (
                <div key={songId} className="glass-card rounded-2xl p-4 inner-glow">
                  <p className="text-sm text-white/60 mb-2">
                    Song ID: {songId}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(songId, e.target.files[0])}
                    className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-500 file:text-white hover:file:bg-red-600 file:cursor-pointer"
                  />
                  {coverImages[songId] && (
                    <img src={coverImages[songId]} alt="Preview" className="mt-2 w-20 h-20 rounded object-cover" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Audio Files */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Audio Files</h3>
            </div>
            <div className="space-y-3">
              {['100', '101', '102'].map(songId => (
                <div key={songId} className="glass-card rounded-2xl p-4 inner-glow">
                  <p className="text-sm text-white/60 mb-2">
                    Song ID: {songId}
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files?.[0] && handleAudioUpload(songId, e.target.files[0])}
                    className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-500 file:text-white hover:file:bg-red-600 file:cursor-pointer"
                  />
                  {audioFiles[songId] && (
                    <p className="mt-2 text-xs text-green-500">✓ Uploaded</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bead Assets */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Custom Bead Assets (PNG)</h3>
            </div>
            <div className="bg-black rounded-lg p-4 border border-zinc-800">
              <input
                type="file"
                accept="image/png"
                multiple
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(file => handleBeadAssetUpload(file));
                }}
                className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-500 file:text-white hover:file:bg-red-600 file:cursor-pointer"
              />
              {beadAssets.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {beadAssets.map((url, i) => (
                    <img key={i} src={url} alt="Bead" className="w-12 h-12 rounded object-contain bg-white/5" />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
