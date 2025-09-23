'use client';
import { useRouter } from 'next/navigation';
import { CirclePlus, MoveLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateNFTItem(): JSX.Element {
  const router = useRouter();
  const [name, setName] = useState('');
  const [blockchain, setBlockchain] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<any | string>('');
  const [isCreated, setIsCreated] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    setTimeout(() => setIsCreated(true), 500);
  };
  const handleRemoveImage = () => {
    localStorage.removeItem('enhanceImage');
  };

  useEffect(() => {
    const savedImageUrl = localStorage.getItem('enhanceImage') || localStorage.getItem('URLimage');
    if (savedImageUrl) {
      setLogo(savedImageUrl);
    }
  }, []);

  return (
    <main className="bg-[var(--color-surface)] min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-[#2D3748] rounded-lg text-[#E5E7EB] transition-colors duration-200"
        >
          <MoveLeft size={24} className="text-[#E5E7EB]" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#E5E7EB] ml-2">Create NFT</h1>
      </div>

      <div className="h-[calc(100vh-200px)] flex items-center justify-center flex-col">
        <div className="w-full max-w-md mx-auto bg-[#2D3748] rounded-lg shadow-sm p-6 border border-[#374151]">
          {logo ? (
            logo.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={logo}
                className="w-28 h-28 mx-auto mb-3 rounded-lg object-cover"
                controls
                muted
                autoPlay
                loop    
              />
            ) : (
              <img
                src={logo}
                alt="collection"
                className="w-28 h-28 mx-auto mb-3 rounded-lg object-cover"
              />
            )
          ) : (
            <img
              src="/images/painting.png"
              alt="collection"
              className="w-28 h-28 mx-auto mb-3 rounded-lg object-cover"
            />
          )}
          <p className="text-[20px] sm:text-[24px] text-[#E5E7EB] text-center font-semibold mb-1">
            Your NFT has been sent to
            <br className="hidden sm:block" /> the admin for review.
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/nft-Collections">
            <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[14px] font-medium hover:bg-[#4338CA]"
             onClick={handleRemoveImage}>
              List Item
            </button>
          </Link>
          <Link href="/">
            <button 
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[14px] font-medium hover:bg-[#4338CA]"
              onClick={handleRemoveImage}
            >
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}