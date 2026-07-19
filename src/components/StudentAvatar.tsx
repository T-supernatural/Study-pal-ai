import React from "react";

export interface AvatarItem {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  skinTone: "light" | "medium" | "dark" | "olive";
  desc: string;
}

export const STUDENT_AVATARS: AvatarItem[] = [
  { id: "avatar-1", name: "Leo", gender: "male", skinTone: "light", desc: "Curly hair with cool glasses & hoodie" },
  { id: "avatar-2", name: "Maya", gender: "female", skinTone: "medium", desc: "Top-knot bun with lavender headphones" },
  { id: "avatar-3", name: "Aisha", gender: "female", skinTone: "olive", desc: "Sleek teal hijab with a friendly smile" },
  { id: "avatar-4", name: "Sam", gender: "neutral", skinTone: "light", desc: "Messy blonde hair with a green cap backwards" },
  { id: "avatar-5", name: "Zoe", gender: "female", skinTone: "dark", desc: "Beautiful afro puffs with coral background" },
  { id: "avatar-6", name: "Chen", gender: "male", skinTone: "olive", desc: "Neat black hair with a collared denim jacket" },
];

interface StudentAvatarProps {
  avatarId: string;
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({ avatarId, className = "w-12 h-12" }) => {
  // Graceful fallback if avatarId is invalid or placeholder
  const activeId = STUDENT_AVATARS.some((a) => a.id === avatarId) ? avatarId : "avatar-1";

  switch (activeId) {
    case "avatar-1":
      // Leo: Orange background, light skin, blue hoodie, circular glasses, curly hair
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#FF8A65" />
          {/* Hair back */}
          <circle cx="50" cy="35" r="22" fill="#5D4037" />
          <circle cx="38" cy="30" r="10" fill="#5D4037" />
          <circle cx="62" cy="30" r="10" fill="#5D4037" />
          {/* Ears */}
          <circle cx="28" cy="50" r="6" fill="#FDD835" />
          <circle cx="72" cy="50" r="6" fill="#FDD835" />
          {/* Face */}
          <path d="M 32,44 C 32,32 68,32 68,44 C 68,58 64,74 50,74 C 36,74 32,58 32,44 Z" fill="#FFE082" />
          {/* Hair curls front */}
          <circle cx="42" cy="28" r="8" fill="#5D4037" />
          <circle cx="50" cy="26" r="9" fill="#5D4037" />
          <circle cx="58" cy="28" r="8" fill="#5D4037" />
          {/* Eyes */}
          <circle cx="43" cy="46" r="3" fill="#212121" />
          <circle cx="57" cy="46" r="3" fill="#212121" />
          {/* Glasses */}
          <circle cx="43" cy="46" r="9" stroke="#0D47A1" strokeWidth="2.5" fill="none" />
          <circle cx="57" cy="46" r="9" stroke="#0D47A1" strokeWidth="2.5" fill="none" />
          <line x1="49" y1="46" x2="51" y2="46" stroke="#0D47A1" strokeWidth="2.5" />
          {/* Smile */}
          <path d="M 44,58 Q 50,64 56,58" stroke="#D84315" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Blue Hoodie shoulders */}
          <path d="M 18,100 C 18,80 34,74 50,74 C 66,74 82,80 82,100 Z" fill="#1E88E5" />
          {/* Inner shirt */}
          <path d="M 44,74 L 50,84 L 56,74 Z" fill="#E0E0E0" />
          {/* Drawstrings */}
          <line x1="46" y1="80" x2="46" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="54" y1="80" x2="54" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "avatar-2":
      // Maya: Purple/lavender background, medium-warm skin, headset, top bun
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#9575CD" />
          {/* Top bun */}
          <circle cx="50" cy="18" r="14" fill="#3E2723" />
          {/* Face */}
          <path d="M 32,46 C 32,34 68,34 68,46 C 68,60 64,74 50,74 C 36,74 32,60 32,46 Z" fill="#FFCC80" />
          {/* Hair bangs */}
          <path d="M 31,40 C 35,32 65,32 69,40 L 69,34 C 69,25 31,25 31,34 Z" fill="#3E2723" />
          {/* Eyes */}
          <ellipse cx="42" cy="48" rx="2.5" ry="3.5" fill="#212121" />
          <ellipse cx="58" cy="48" rx="2.5" ry="3.5" fill="#212121" />
          <path d="M 39,42 Q 42,40 45,43" stroke="#3E2723" strokeWidth="1.5" fill="none" />
          <path d="M 61,42 Q 58,40 55,43" stroke="#3E2723" strokeWidth="1.5" fill="none" />
          {/* Smile */}
          <path d="M 43,58 Q 50,65 57,58" stroke="#E64A19" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Headphones band */}
          <path d="M 30,46 A 21,21 0 0,1 70,46" stroke="#E91E63" strokeWidth="4.5" fill="none" />
          <rect x="25" y="40" width="8" height="15" rx="3" fill="#E91E63" />
          <rect x="67" y="40" width="8" height="15" rx="3" fill="#E91E63" />
          {/* Clothes pink */}
          <path d="M 18,100 C 18,80 34,76 50,76 C 66,76 82,80 82,100 Z" fill="#F06292" />
          {/* Collar */}
          <circle cx="50" cy="76" r="8" fill="#FFCC80" />
        </svg>
      );

    case "avatar-3":
      // Aisha: Teal background, olive skin, modern dark teal hijab/scarf
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#4DB6AC" />
          {/* Outer Hijab layer */}
          <path d="M 22,100 C 20,70 30,24 50,24 C 70,24 80,70 78,100 Z" fill="#004D40" />
          {/* Hijab face cutout */}
          <path d="M 33,48 C 33,35 67,35 67,48 C 67,62 61,72 50,72 C 39,72 33,62 33,48 Z" fill="#FFE082" />
          {/* Eyes */}
          <ellipse cx="43" cy="48" rx="2.5" ry="3.5" fill="#212121" />
          <ellipse cx="57" cy="48" rx="2.5" ry="3.5" fill="#212121" />
          {/* Smile with cute dimples */}
          <path d="M 44,57 Q 50,62 56,57" stroke="#BF360C" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Hijab wrap drapery */}
          <path d="M 22,94 C 30,86 44,82 50,86 C 56,82 70,86 78,94 L 70,100 L 30,100 Z" fill="#00695C" />
          {/* Hijab brooch pin */}
          <circle cx="50" cy="85" r="3.5" fill="#FFD54F" />
        </svg>
      );

    case "avatar-4":
      // Sam: Yellow background, light skin, green cap backwards, blonde messy hair
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#FFD54F" />
          {/* Blonde hair back */}
          <path d="M 26,50 C 26,30 74,30 74,50 Z" fill="#FFEE58" />
          {/* Face */}
          <path d="M 32,46 C 32,34 68,34 68,46 C 68,60 64,74 50,74 C 36,74 32,60 32,46 Z" fill="#FFF9C4" />
          {/* Messy bangs */}
          <path d="M 31,40 L 39,36 L 46,42 L 54,34 L 62,40 L 69,34 L 69,44 Z" fill="#FFEE58" />
          {/* Cap Backwards Brim */}
          <path d="M 28,34 Q 50,22 72,34" stroke="#2E7D32" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="24" rx="16" ry="10" fill="#4CAF50" />
          {/* Eyes with glasses */}
          <circle cx="43" cy="48" r="2.5" fill="#212121" />
          <circle cx="57" cy="48" r="2.5" fill="#212121" />
          {/* Rectangular modern black glasses */}
          <rect x="34" y="41" width="15" height="12" rx="2" stroke="#212121" strokeWidth="2" fill="none" />
          <rect x="51" y="41" width="15" height="12" rx="2" stroke="#212121" strokeWidth="2" fill="none" />
          <line x1="49" y1="46" x2="51" y2="46" stroke="#212121" strokeWidth="2" />
          {/* Smile */}
          <path d="M 43,60 Q 50,66 57,60" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Green T-Shirt */}
          <path d="M 18,100 C 18,82 34,76 50,76 C 66,76 82,82 82,100 Z" fill="#2E7D32" />
          {/* White stripes on shoulders */}
          <path d="M 22,96 L 28,100" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 78,96 L 72,100" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case "avatar-5":
      // Zoe: Coral pink background, dark deep skin, braids/afro puffs
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#F06292" />
          {/* Left Afro puff */}
          <circle cx="24" cy="30" r="15" fill="#1A0C00" />
          {/* Right Afro puff */}
          <circle cx="76" cy="30" r="15" fill="#1A0C00" />
          {/* Face */}
          <path d="M 32,46 C 32,34 68,34 68,46 C 68,60 64,74 50,74 C 36,74 32,60 32,46 Z" fill="#5D4037" />
          {/* Hair Front outline */}
          <path d="M 32,42 C 36,32 64,32 68,42 Z" fill="#1A0C00" />
          {/* Eyes */}
          <circle cx="43" cy="48" r="3" fill="#FFFFFF" />
          <circle cx="57" cy="48" r="3" fill="#FFFFFF" />
          <circle cx="43" cy="48" r="1.5" fill="#000000" />
          <circle cx="57" cy="48" r="1.5" fill="#000000" />
          {/* Cute blush circles */}
          <circle cx="37" cy="54" r="3" fill="#E91E63" opacity="0.4" />
          <circle cx="63" cy="54" r="3" fill="#E91E63" opacity="0.4" />
          {/* Smile with teeth */}
          <path d="M 43,59 Q 50,66 57,59 Z" fill="#FFFFFF" />
          <path d="M 43,59 Q 50,66 57,59" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Golden Hoop Earrings */}
          <path d="M 28,52 A 6,6 0 0,1 28,62" stroke="#FFD54F" strokeWidth="2" fill="none" />
          <path d="M 72,52 A 6,6 0 0,1 72,62" stroke="#FFD54F" strokeWidth="2" fill="none" />
          {/* Outfit - Bright yellow top with collar */}
          <path d="M 18,100 C 18,80 34,76 50,76 C 66,76 82,80 82,100 Z" fill="#FBC02D" />
          {/* Red Necklace */}
          <path d="M 40,78 Q 50,84 60,78" stroke="#D32F2F" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case "avatar-6":
      // Chen: Royal blue background, olive skin, sleek black haircut, denim collared jacket
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`} referrerPolicy="no-referrer">
          <circle cx="50" cy="50" r="50" fill="#3F51B5" />
          {/* Black hair back */}
          <path d="M 26,45 C 26,24 74,24 74,45 Z" fill="#212121" />
          {/* Face */}
          <path d="M 32,45 C 32,33 68,33 68,45 C 68,59 64,73 50,73 C 36,73 32,59 32,45 Z" fill="#FFE082" />
          {/* Bangs */}
          <path d="M 31,38 C 35,28 65,28 69,38 L 69,34 C 69,28 31,28 31,34 Z" fill="#212121" />
          {/* Eyes */}
          <line x1="39" y1="47" x2="46" y2="47" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="54" y1="47" x2="61" y2="47" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
          {/* Smile */}
          <path d="M 44,57 Q 50,62 56,57" stroke="#E64A19" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Denim jacket outfit */}
          <path d="M 18,100 C 18,80 34,75 50,75 C 66,75 82,80 82,100 Z" fill="#1565C0" />
          {/* Shirt collar */}
          <path d="M 40,75 L 50,85 L 60,75 Z" fill="#ECEFF1" />
          <path d="M 32,77 L 42,88 L 42,76 Z" fill="#0D47A1" />
          <path d="M 68,77 L 58,88 L 58,76 Z" fill="#0D47A1" />
        </svg>
      );

    default:
      return null;
  }
};
