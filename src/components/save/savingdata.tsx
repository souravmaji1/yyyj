'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Bookmark, X, Image, Video, Box, Music, Download } from 'lucide-react';
import ModelViewer from '../../components/modals/modelviewer'; // your existing viewer
import { RootState, AppDispatch } from '@/src/store';
import { useSelector } from 'react-redux';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!
);

type Item = {
  id: string;
  content_type: 'image' | 'video' | '3dmodel' | 'song';
  content_url: string;
  metadata?: any;
};

export function SaveIcon({
  url,
  type,
  meta,
}: {
  url: string;
  type: 'image' | 'video' | '3dmodel' | 'song';
  meta?: any;
}) {
  
  const [saved, setSaved] = useState(false);
const { profile } = useSelector((state: RootState) => state.user);

  const save = async () => {
    if (!profile) return alert('Sign in first');
    await supabase.from('generated_content').insert({
      user_id: profile.id,
      content_type: type,
      content_url: url,
      metadata: meta || {},
    });
    setSaved(true);
  };

  return (
    <Bookmark
      onClick={save}
      className={`w-5 h-5 cursor-pointer ${
        saved ? 'text-green-400' : 'text-gray-400 hover:text-white'
      }`}
    />
  );
}

export function SavedGallery({ onClose }: { onClose?: () => void }) {
  const { profile } = useSelector((state: RootState) => state.user);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState<number | null>(null); // null = list view

  useEffect(() => {
    if (!profile) return;
    console.log("profile data",profile)
    supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [profile]);

  const selected = idx !== null ? items[idx] : null;

  /* ----------  full-screen viewer  ---------- */
  if (selected) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        {/* close */}
        <X
          onClick={() => setIdx(null)}
          className="absolute top-4 right-4 w-8 h-8 text-white/70 hover:text-white cursor-pointer"
        />

        {/* download */}
        <a
          href={selected.content_url}
          download
          className="absolute top-4 left-4 w-8 h-8 text-white/70 hover:text-white cursor-pointer"
        >
          <Download />
        </a>

        {/* content */}
        {selected.content_type === 'image' && (
          <img
            src={selected.content_url}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        )}

        {selected.content_type === 'video' && (
          <video
            src={selected.content_url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        )}

        {selected.content_type === 'song' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <audio src={selected.content_url} controls autoPlay />
          </div>
        )}

        {selected.content_type === '3dmodel' && (
          <div className="w-full h-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800">
            <ModelViewer
              modelUrl={selected.content_url}
              showControls
              onLoading={console.log}
              onError={console.error}
            />
          </div>
        )}
      </div>
    );
  }

  /* ----------  grid list  ---------- */
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-gray-200">Saved</h3>
          <X onClick={onClose} className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <div
              key={it.id}
              onClick={() => setIdx(i)}
              className="cursor-pointer group relative block rounded-xl overflow-hidden border border-gray-800 bg-gray-950 hover:ring-2 hover:ring-gray-600 transition"
            >
              {it.content_type === 'image' && (
                <img
                  src={it.content_url}
                  alt=""
                  className="w-full h-36 object-cover"
                />
              )}
              {it.content_type === 'video' && (
                <video
                  src={it.content_url}
                  className="w-full h-36 object-cover"
                />
              )}
              {it.content_type === 'song' && (
                <div className="h-36 flex items-center justify-center text-gray-500">
                  <Music size={24} />
                </div>
              )}
              {it.content_type === '3dmodel' && (
                <div className="h-36 flex items-center justify-center text-gray-500">
                  <Box size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm capitalize">
                {it.content_type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}