"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { ME_WITH_PROMPTS_AND_FEEDBACK_QUERY, UPDATE_USER_PROFILE_MUTATION, DELETE_PROMPT_MUTATION, DELETE_ACCOUNT_MUTATION  } from "@/lib/gql/profile";
import { useMutation } from "@apollo/client";
import AvatarPicker from "@/components/profile/AvatarPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"
import {
  Plus,
  Calendar,
  Star,
  Edit3,
  Users,
  Award,
  MessageCircle,
  GitBranch,
  MoreHorizontal,
} from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteCookies } from "@/hooks/logout";
import { DeleteAccount } from "@/components/profile/Delete";
import { ShareDialog } from "@/components/profile/Share";
import { Prompt } from "@/lib/types";
import Loading from "@/components/ui/loading";
import CustomLayout from "@/components/layout/layout";

// Helper functions
const getAverageRating = (feedbacks: { rating: number }[]) =>
  feedbacks.length === 0 ? 0 : feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDate(dateString);
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user and prompts from backend
  const { data, loading, error } = useQuery(ME_WITH_PROMPTS_AND_FEEDBACK_QUERY);
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE_MUTATION);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT_MUTATION);
  const [deletePrompt] = useMutation(DELETE_PROMPT_MUTATION, {
  refetchQueries: [{ query: ME_WITH_PROMPTS_AND_FEEDBACK_QUERY }],
  awaitRefetchQueries: true,
});
  
  // Always define state, even if data is not ready yet!
  const user = data?.me;
  const userPrompts = user?.prompts ?? [];
  const totalFeedbacks = userPrompts.reduce((sum: number, prompt: any) => sum + (prompt.feedbacks?.length || 0), 0);
  const totalRemixes = userPrompts.reduce((sum: number, prompt: any) => sum + (prompt.remixCount || 0), 0);
  const avgRating =
    userPrompts.length > 0
      ? userPrompts.reduce((sum: number, prompt: any) => sum + getAverageRating(prompt.feedbacks || []), 0) /
        userPrompts.length
      : 0;

  const [profileData, setProfileData] = useState({
  name: user?.name,
  email: user?.email,
  avatarUrl: user?.avatarUrl || "",
});


 React.useEffect(() => {
  if (user) {
    setProfileData({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
    });
  }
}, [user]);

//delete prompt
const handleDeletePrompt = async (promptId: string) => {
  try {
    await deletePrompt({ variables: { id: promptId } });
    toast("Prompt deleted successfully");
  } catch (err: any) {
    toast("Failed to delete prompt", { description: err.message });
  }
};

//delete Account
const handleDeleteAccount = async () => {
  try {
    await deleteAccount();

    toast.success("Account deleted", {
      description: "Your account and all associated data have been removed.",
    });
    localStorage.clear();
    deleteCookies("token");
    router.push("/login");
  } catch (error: any) {
    toast.error("Failed to delete account", {
      description: error.message || "An unexpected error occurred.",
    });
  }
};


  async function handleSave() {
  if (!profileData.name?.trim() || !profileData.email?.trim()) {
    toast.warning("Missing required fields", {
      description: "Name and email cannot be empty.",
    });
    return;
  }

  try {
    const { data } = await updateUserProfile({
      variables: {
        name: profileData.name,
        email: profileData.email,
        avatarUrl: profileData.avatarUrl,
      },
    });

    if (data?.updateUserProfile) {
      toast.success("Profile updated!", {
        description: `Your profile was updated successfully.`,
      });
    }
  } catch (err: any) {
    toast.error("Update failed", {
      description: err.message || "Something went wrong while updating the profile.",
    });
  }
}


  if (loading) {
    return <Loading/>;
  }
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error?.message || "User not found or not authenticated."}
      </div>
    );
  }

  return (
    <CustomLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <Card className="mb-8 bg-card border border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24 bg-muted">
                  <AvatarImage
                    src={user.avatarUrl || profileData.avatarUrl}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="text-2xl text-foreground bg-muted">
                   {"U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {profileData.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {profileData.email}
                      </p>
                    </div>
                    {/* Edit Profile */}
                    <Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" className="mt-4 sm:mt-0 cursor-pointer">
      <Edit3 className="h-4 w-4 mr-2" />
      Edit Profile
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-[425px] md:max-w-lg fixed top-70 lg:top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4">
      <div className="grid gap-3">
        <Label className="text-base text-foreground">Profile Avatar</Label>
      <AvatarPicker
        selected={profileData.avatarUrl}
        onSelect={(url) => setProfileData({ ...profileData, avatarUrl: url })}
        avatarUrl={user.avatarUrl}
      />
        <Label htmlFor="name-1">Name</Label>
        <Input
          id="name"
          value={profileData.name}
          onChange={(e) =>
            setProfileData({ ...profileData, name: e.target.value })
          }
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profileData.email}
          onChange={(e) =>
            setProfileData({ ...profileData, email: e.target.value })
          }
          className="mt-1"
          disabled={!!user.googleId}
        />
        {user.googleId && (
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed for Google accounts
          </p>
        )}
      </div>
    </div>

    <DialogFooter className="flex justify-center items-center gap-2 mt-4">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button onClick={handleSave}>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
                    </div>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                    {user.googleId && (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                     <path
                      fill="#4285F4"
                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                     />
                     <path
                       fill="#34A853"
                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                     />
                     <path
                       fill="#FBBC05"
                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                     />
                     <path
                       fill="#EA4335"
                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                     />
                   </svg>
                        Google Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="relative">
                      <TabsList
                        className="grid w-full grid-cols-4 bg-muted"
                        style={{ minWidth: 0 }}
                      >
                        <TabsTrigger
                          value="overview"
                          className={
                            activeTab === "overview"
                              ? "bg-primary/10 h-full rounded-lg"
                              : "cursor-pointer"
                          }
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="prompts"
                          className={
                            activeTab === "prompts"
                              ? "bg-primary/10 h-full rounded-lg"
                              : "cursor-pointer"
                          }
                        >
                          Prompts
                        </TabsTrigger>
                        <TabsTrigger
                          value="feedback"
                          className={
                            activeTab === "feedback"
                              ? "bg-primary/10 h-full rounded-lg"
                              : "cursor-pointer"
                          }
                        >
                          Feedback
                        </TabsTrigger>
                        <TabsTrigger
                          value="settings"
                          className={
                            activeTab === "settings"
                              ? "bg-primary/10 h-full rounded-lg"
                              : "cursor-pointer"
                          }
                        >
                          Settings
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground">
                              Activity Stats
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total Prompts
                                </span>
                                <span className="font-semibold text-primary">
                                  {userPrompts.length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total Feedback
                                </span>
                                <span className="font-semibold text-primary">
                                  {totalFeedbacks}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Times Remixed
                                </span>
                                <span className="font-semibold text-primary">
                                  {totalRemixes}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Avg Rating
                                </span>
                                <span className="font-semibold flex items-center text-primary">
                                  {avgRating > 0 ? (
                                    <>
                                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                                      {avgRating.toFixed(1)}
                                    </>
                                  ) : (
                                    "No ratings yet"
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground">
                              Achievements
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                  <Award className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-foreground">
                                    First Prompt
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Created your first prompt
                                  </p>
                                </div>
                              </div>
                              {userPrompts.some((p: any) => p.isPublic) && (
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-foreground">
                                      Community Member
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Shared prompts publicly
                                    </p>
                                  </div>
                                </div>
                              )}
                              {totalFeedbacks >= 5 && (
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-green-100 rounded-full">
                                    <Star className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-foreground">
                                      Popular Creator
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Received 5+ feedback
                                    </p>
                                  </div>
                                </div>
                              )}
                              {totalRemixes >= 1 && (
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-purple-100 rounded-full">
                                    <GitBranch className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-foreground">
                                      Remix Master
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Your prompts were remixed
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card className="bg-card border border-border">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {userPrompts.slice(0, 5).map((prompt: any) => (
                              <div
                                key={prompt.id}
                                className="flex items-center space-x-3 text-sm"
                              >
                                <div className="w-2 h-2 bg-blue rounded-full" />
                                <span className="text-foreground">
                                  Created{" "}
                                  <span className="font-medium">{`"${prompt.title}"`}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  {formatRelativeTime(prompt.createdAt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="prompts" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm md:text-lg font-medium text-foreground">
                          My Prompts ({userPrompts.length})
                        </h3>
                        <Button
                          size="sm"
                          className="flex gap-0 py-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          onClick={() => router.push("/create")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Prompt
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {userPrompts.map((prompt: Prompt) => {
                          const avgRating = getAverageRating(
                            prompt.feedbacks || []
                          );
                          return (
                            <Card
                              key={prompt.id}
                              className="bg-card border border-border"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                                      <h4 className="font-medium text-foreground truncate text-sm md:text-base lg:text-lg">
                                        {prompt.title}
                                      </h4>
                                      <div className="flex flex-row flex-wrap gap-1 mt-1 sm:mt-0">
                                        <Badge
                                          variant="secondary"
                                          className="px-2 py-0.5 text-xs md:text-sm"
                                        >
                                          {prompt.isPublic
                                            ? "Public"
                                            : "Private"}
                                        </Badge>
                                        {prompt.remixOf && (
                                          <Badge
                                            variant="outline"
                                            className="px-2 py-0.5 text-xs md:text-sm flex items-center"
                                          >
                                            <GitBranch className="h-3 w-3 mr-1" />
                                            Remix
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {prompt.tags
                                        .slice(0, 4)
                                        .map((tag: string) => (
                                          <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs md:text-sm font-light px-2 py-0.5"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                    </div>
                                    <div className="flex justify-between md:justify-start md:gap-2 lg:gap-4 text-xs md:text-sm lg:text-base text-muted-foreground">
                                      {avgRating > 0 && (
                                        <span className="flex items-center">
                                          <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 fill-yellow-400 text-yellow-400" />
                                          {avgRating.toFixed(1)}
                                        </span>
                                      )}
                                      <span className="flex items-center">
                                        <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                        {prompt.feedbacks.length}
                                      </span>
                                      {prompt.remixCount > 0 && (
                                        <span className="flex items-center">
                                          <GitBranch className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                          {prompt.remixCount}
                                        </span>
                                      )}
                                      <span>
                                        {formatDate(prompt.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-row mt-3 sm:mt-0">
                                    <Link
                                      href={{
                                        pathname: "/create",
                                        query: {
                                          edit: prompt.id,
                                          title: prompt.title,
                                          content: prompt.content,
                                          tags: prompt.tags.join(","),
                                          image: prompt.imageUrl || "",
                                        },
                                      }}
                                    >
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs md:text-sm cursor-pointer"
                                      >
                                        <Edit3 className="h-5 w-5" />
                                      </Button>
                                    </Link>

                                    <ShareDialog id={prompt.id}/>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs md:text-sm cursor-pointer"
                                        >
                                          <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-background"
                                      >
                                        <DropdownMenuItem className="cursor-pointer border-b border-border hover:bg-background/10">
                                          <span
                                            onClick={() =>
                                              router.push(
                                                `/prompt/${prompt.id}`
                                              )
                                            }
                                          >
                                            View
                                          </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-background/10"
                                        onClick={()=>handleDeletePrompt(prompt.id)}>
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="feedback" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-foreground">
                          Feedback Received ({totalFeedbacks})
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {userPrompts.flatMap((prompt: any) =>
                          (prompt.feedbacks || []).map((feedback: any) => (
                            <Card
                              key={feedback.id}
                              className="bg-card border border-border"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                  <Avatar className="h-10 w-10 bg-muted">
                                    <AvatarImage
                                      src={
                                        feedback.user.avatarUrl ||
                                        "/placeholder.svg"
                                      }
                                      alt={feedback.user.name || "User"}
                                    />
                                    <AvatarFallback className="text-foreground">
                                      {feedback.user.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("") || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <p className="font-medium text-sm text-foreground">
                                          {feedback.user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          on "{prompt.title}" •{" "}
                                          {formatRelativeTime(
                                            feedback.createdAt
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < feedback.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm text-foreground">
                                      {feedback.comment}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                        {totalFeedbacks === 0 && (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              No feedback yet
                            </h3>
                            <p className="text-muted-foreground">
                              Share your prompts publicly to start receiving
                              feedback
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="settings" className="space-y-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Account Information
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <Label>Name</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {profileData.name}
                                </p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {profileData.email}
                                </p>
                              </div>
                              <div>
                                <Label>Account Type</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {user.googleId
                                    ? "Google Account"
                                    : "Email Account"}
                                </p>
                              </div>
                              <div>
                                <Label>Member Since</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatDate(user.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Privacy Settings
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Public Profile</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Allow others to see your profile
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Show Activity</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Display your recent activity
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Email Notifications</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Receive email updates
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Danger Zone
                            </h3>
                            <div className="space-y-4">
                              <DeleteAccount onClick={handleDeleteAccount}/>
                              <p className="text-xs text-muted-foreground">
                                This action cannot be undone. All your prompts
                                and data will be permanently deleted.
                              </p>
                            </div>
                          </div>
                        </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue">
                        {userPrompts.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Prompts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green">
                        {totalFeedbacks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Feedback
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-perpole">
                        {totalRemixes}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Times Remixed
                      </div>
                    </div>
                    {avgRating > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                          <Star className="h-6 w-6 mr-1 fill-yellow-400 text-yellow-400" />
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Rating
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-6 bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Badge Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-2">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Creator
                      </div>
                    </div>
                    {userPrompts.some((p: any) => p.isPublic) && (
                      <div className="text-center">
                        <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Community
                        </div>
                      </div>
                    )}
                    {totalFeedbacks >= 5 && (
                      <div className="text-center">
                        <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-2">
                          <Star className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Popular
                        </div>
                      </div>
                    )}
                    {totalRemixes >= 1 && (
                      <div className="text-center">
                        <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-2">
                          <GitBranch className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Remix Master
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </CustomLayout>
  );
}