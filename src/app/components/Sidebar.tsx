import { Home, Search, Library, Plus, Heart, Music2, Radio, ListMusic, Clock, Upload, Users } from 'lucide-react';

interface SidebarProps {
  onOpenAssetUploader: () => void;
}

export function Sidebar({ onOpenAssetUploader }: SidebarProps) {
  return (
    <div className="w-64 glass-morph-panel flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <Music2 className="w-8 h-8 text-red-500" />
          <span className="text-xl font-semibold">Music</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-button text-white font-medium transition-all">
            <Home className="w-5 h-5" />
            <span>Listen Now</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
            <Search className="w-5 h-5" />
            <span>Browse</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
            <Radio className="w-5 h-5" />
            <span>Radio</span>
          </button>

          <button
            onClick={onOpenAssetUploader}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Assets</span>
          </button>
        </div>

        {/* Library Section */}
        <div className="mt-8">
          <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
            Library
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Clock className="w-5 h-5" />
              <span>Recently Added</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Library className="w-5 h-5" />
              <span>Artists</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <ListMusic className="w-5 h-5" />
              <span>Albums</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Music2 className="w-5 h-5" />
              <span>Songs</span>
            </button>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mt-8">
          <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
            Friends
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Users className="w-5 h-5" />
              <span>Jessica</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Users className="w-5 h-5" />
              <span>Connie</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Users className="w-5 h-5" />
              <span>Maya</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Users className="w-5 h-5" />
              <span>Alex</span>
            </button>
          </div>
        </div>

        {/* Playlists Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Playlists
            </h3>
            <button className="text-white/50 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span>Liked Songs</span>
            </button>
            
            <button className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <span>Chill Vibes</span>
            </button>
            
            <button className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <span>Workout Mix</span>
            </button>
            
            <button className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <span>Road Trip</span>
            </button>
            
            <button className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:glass-button transition-all">
              <span>Focus & Study</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
