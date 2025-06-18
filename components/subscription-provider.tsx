"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth-provider";
import type { UserSubscription } from "@/lib/subscription-utils";

interface SubscriptionContextType {
  subscription: UserSubscription;
  updateSubscription: (subscription: UserSubscription) => void;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: "free",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const { user: userData } = await res.json();
          setSubscription({
            tier: userData.subscriptionTier,
            status: "active",
          });
        }
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const updateSubscription = (newSubscription: UserSubscription) => {
    if (!user) return;

    // This function can be updated to post to an API endpoint if you want to allow users to change their subscription
    setSubscription(newSubscription);
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, updateSubscription, isLoading }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
