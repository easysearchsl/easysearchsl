import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export const StarRating = ({ rating, size = 5 }: StarRatingProps) => {
  const stars = [];
  const starClass = `h-${size} w-${size}`;

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className={`${starClass} text-yellow-400 fill-yellow-400`} />);
    } else if (i - 0.5 <= rating) {
      // Half star - you can customize this further if needed
      stars.push(<Star key={i} className={`${starClass} text-yellow-400 fill-yellow-200`} />);
    } else {
      stars.push(<Star key={i} className={`${starClass} text-gray-300`} />);
    }
  }
  return <div className="flex items-center">{stars}</div>;
};
