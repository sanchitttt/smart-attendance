import { useEffect, useState } from "react";
import { getUserProfile, type UserProfile } from "@/utils/secureStore";

export default function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  return profile;
}

