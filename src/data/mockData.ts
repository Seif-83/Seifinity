
export interface Teacher {
  id: number;
  name: string;
  subject: string;
  teacherId: number;
  rating: number;
  imageSeed: string;
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}


export const initialReviewsData: Review[] = [
  {
    id: 1,
    userName: "Ahmed Hassan",
    rating: 5,
    comment: "Seifinity is amazing! It gathered all my favorite teachers in one place.",
    date: "2026-03-20"
  },
  {
    id: 2,
    userName: "Mona Ali",
    rating: 4,
    comment: "Very helpful platform for high school students. Highly recommend El Kheta.",
    date: "2026-03-22"
  },
  {
    id: 3,
    userName: "Omar Sayed",
    rating: 5,
    comment: "The UI is very clean and fast. Excellent work!",
    date: "2026-03-24"
  }
];

export const globalStatsData = [
  { name: 'Mon', active: 14000, sessions: 24000 },
  { name: 'Tue', active: 13000, sessions: 13980 },
  { name: 'Wed', active: 22000, sessions: 39800 },
  { name: 'Thu', active: 27800, sessions: 33908 },
  { name: 'Fri', active: 18900, sessions: 24800 },
  { name: 'Sat', active: 23900, sessions: 33800 },
  { name: 'Sun', active: 34900, sessions: 44300 },
];
