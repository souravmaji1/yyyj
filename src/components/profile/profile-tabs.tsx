"use client";

import { useEffect, useState } from "react";
import { AddressesTab } from "./addresses-tab";
import { ProfileDetailsTab } from "./profile-details-tab";
import { ChangePasswordTab } from "./change-password-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Icons } from "@/src/core/icons";
import { NotificationSettingsTab } from "./notification-settings-tab";
import { LoginMobileTab } from "../auth/login-mobile-tab";
import { isKioskInterface } from "@/src/core/utils";
import { isMobile, isTablet } from "react-device-detect";



interface ProfileTabsProps {
  user: any;
  onProfileUpdate: (data: any) => Promise<void>;
}

export function ProfileTabs({ user, onProfileUpdate }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [userLoginType, setUserLoginType] = useState<string>("");

  useEffect(() => {
    if (user) {
      setUserLoginType(user.loginType);
    }
  }, [user]);

  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-8 bg-[#171432]/50 p-1 rounded-xl">
        <TabsTrigger
          value="profile"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
        >
          <Icons.user className="w-4 h-4 mr-2" />
          My Profile
        </TabsTrigger>
        <TabsTrigger
          value="addresses"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
        >
          <Icons.mapPin className="w-4 h-4 mr-2" />
          Addresses
        </TabsTrigger>
        {userLoginType === "email" && (
          <TabsTrigger
            value="password"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
          >
            <Icons.lock className="w-4 h-4 mr-2" />
            Password
          </TabsTrigger>
        )}
        {
          isKioskInterface() && !isMobile && !isTablet && (
            <TabsTrigger
              value="loginMobile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
            >
              <Icons.gamepad className="w-4 h-4 mr-2" />
              Login on Mobile
            </TabsTrigger>
          )
        }
        <TabsTrigger
          value="notifications"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
        >
          <Icons.gamepad className="w-4 h-4 mr-2" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <ProfileDetailsTab user={user} onProfileUpdate={onProfileUpdate} />
      </TabsContent>

      <TabsContent value="addresses" className="mt-0">
        <AddressesTab />
      </TabsContent>

      <TabsContent value="password" className="mt-0">
        <ChangePasswordTab user={user} />
      </TabsContent>


      {
        isKioskInterface() && !isMobile && !isTablet && (
          <TabsContent value="loginMobile" className="mt-0">
            <LoginMobileTab />
          </TabsContent>
        )
      }

      <TabsContent value="notifications" className="mt-0">
        <NotificationSettingsTab user={user} />
      </TabsContent>
    </Tabs>
  );
}