// import React from 'react';
// import { Star } from 'lucide-react';

// interface StarRatingProps {
//   value: number;
//   onChange?: (value: number) => void;
//   readOnly?: boolean;
//   size?: number;
//   className?: string;
// }

// export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, size = 24, className = '' }) => {
//   return (
//     <div className={`flex items-center gap-1 ${className}`}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <button
//           key={star}
//           type="button"
//           disabled={readOnly}
//           aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
//           onClick={() => !readOnly && onChange?.(star)}
//           className={`transition-colors ${readOnly ? 'cursor-default' : 'hover:scale-110'} bg-transparent p-0 border-none`}
//           tabIndex={readOnly ? -1 : 0}
//         >
//           <Star
//             size={size}
//             className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
//             fill={star <= value ? 'currentColor' : 'none'}
//             strokeWidth={1.5}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }; 