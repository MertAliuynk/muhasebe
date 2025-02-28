import { api } from "@/trpc/server"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ChangePassword from "./_components/change-password"
import ChangeProfile from "./_components/change-profie"

export default async function ProfilePage() {
  const userProfile = await api.user.getUserProfile()

  return (
    <div className="container">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
          <TabsTrigger value="password">Şifre Değiştir</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ChangeProfile userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="password">
          <ChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  )
}
