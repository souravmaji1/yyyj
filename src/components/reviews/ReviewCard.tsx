// import React from 'react';
// import { StarRating } from './StarRating';
// import { Button } from '@/src/components/ui/button';

// export interface ReviewMedia {
//   id: string;
//   mediaType: 'image' | 'video';
//   mediaUrl: string;
// }

// export interface Review {
//   id: string;
//   user: { id: string; name: string; avatarUrl?: string };
//   rating: number;
//   text: string;
//   media: ReviewMedia[];
//   createdAt: string;
//   isEditable?: boolean;
//   isLocked?: boolean;
// }

// interface ReviewCardProps {
//   review: Review;
//   onEdit?: (review: Review) => void;
//   onDelete?: (review: Review) => void;
// }

// export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
//   return (
//     <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
//       <div className="flex items-center gap-3 mb-2">
//         {review.user.avatarUrl ? (
//           <img src={review.user.avatarUrl} alt={review.user.name} className="w-8 h-8 rounded-full object-cover" />
//         ) : (
//           <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
//             {review.user.name[0]}
//           </div>
//         )}
//         <div>
//           <div className="font-semibold text-white text-sm">{review.user.name}</div>
//           <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString()}</div>
//         </div>
//         <div className="ml-auto">
//           <StarRating value={review.rating} readOnly size={18} />
//         </div>
//       </div>
//       <div className="text-gray-200 mb-2 text-sm whitespace-pre-line">{review.text}</div>
//       {review.media && review.media.length > 0 && (
//         <div className="flex gap-2 flex-wrap mb-2">
//           {review.media.map((m) => (
//             m.mediaType === 'image' ? (
//               <img key={m.id} src={m.mediaUrl} alt="review media" className="w-20 h-20 object-cover rounded-md border border-gray-700" />
//             ) : (
//               <video key={m.id} src={m.mediaUrl} controls className="w-28 h-20 rounded-md border border-gray-700 bg-black" />
//             )
//           ))}
//         </div>
//       )}
//       <div className="flex gap-2 mt-2">
//         {review.isEditable && !review.isLocked && onEdit && (
//           <Button size="sm" variant="outline" onClick={() => onEdit(review)} className="text-blue-400 border-blue-400">Edit</Button>
//         )}
//         {review.isEditable && !review.isLocked && onDelete && (
//           <Button size="sm" variant="outline" onClick={() => onDelete(review)} className="text-rose-400 border-rose-400">Delete</Button>
//         )}
//         {review.isLocked && (
//           <span className="text-xs text-gray-500 ml-2">Review locked</span>
//         )}
//       </div>
//     </div>
//   );
// }; 