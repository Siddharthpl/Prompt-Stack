"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { ME_WITH_PROMPTS_QUERY } from "@/lib/gql/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User } from "@/lib/types";
import {
  Search, Plus, Settings, TrendingUp, Share2, BookOpen, Target, Calendar, Star, MessageCircle, GitBranch,
} from "lucide-react";
import Loading from "@/components/ui/loading";
import CustomLayout from "@/components/layout/layout";

// Helper functions
const getAverageRating = (feedbacks: { rating: number }[] = []) =>
  feedbacks.length === 0 ? 0 : feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();



export default function Dashboard() {
  const router = useRouter();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setHasToken(true);
    }
    setTokenChecked(true);
  }, [router]);

  const { data, loading, error } = useQuery<{ me: User }>(ME_WITH_PROMPTS_QUERY, {
    skip: !tokenChecked || !hasToken,
    fetchPolicy: "network-only",
  });

  if (!tokenChecked || !hasToken || loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error.message}
      </div>
    );
  }

  if (!data?.me) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        User not found or not authenticated.
      </div>
    );
  }

  const user = data.me;
  const userPrompts = user.prompts ?? [];

  // Calculate stats
  const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.feedbacks?.length || 0) * 50, 0);
  const totalLikes = userPrompts.reduce(
    (sum, prompt) => sum + (prompt.feedbacks?.reduce((acc, f) => acc + (f.rating || 0), 0) || 0),
    0,
  );
  const publicPrompts = userPrompts.filter((p) => p.isPublic).length;
  const weeklyGoal: number = 5;
  const currentProgress = userPrompts.length % weeklyGoal;
  const progressPercentage = weeklyGoal === 0 ? 0 : (currentProgress / weeklyGoal) * 100;

  const stats = [
    { title: "Total Prompts", value: userPrompts.length, icon: BookOpen },
    { title: "Total Views", value: totalViews.toLocaleString(), icon: TrendingUp },
    { title: "Total Ratings", value: totalLikes, icon: Star },
    { title: "Public Prompts", value: publicPrompts, icon: Share2 },
  ];

  // Generate recent activity from real data if available
  const recentActivity: { id: string; type: string; title: string; time: string; icon: any }[] = [];
  if (userPrompts.length > 0) {
    recentActivity.push({
      id: "created",
      type: "created",
      title: `Created "${userPrompts[0].title}"`,
      time: formatDate(userPrompts[0].createdAt),
      icon: Plus,
    });
    if (userPrompts[0].feedbacks?.length > 0) {
      recentActivity.push({
        id: "feedback",
        type: "feedback",
        title: `Received new feedback on "${userPrompts[0].title}"`,
        time: formatDate(userPrompts[0].feedbacks[0].createdAt),
        icon: MessageCircle,
      });
    }
    if (userPrompts[0].remixCount > 0) {
      recentActivity.push({
        id: "remix",
        type: "remix",
        title: `"${userPrompts[0].title}" was remixed by another user`,
        time: formatDate(userPrompts[0].updatedAt),
        icon: GitBranch,
      });
    }
  }

  return (
    <CustomLayout>
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 bg-card border border-border">
              <AvatarImage
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.name || "User"}
              />
              <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-primary">
                Ready to create some amazing prompts today?
              </p>
              <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(user.createdAt)}</span>
                {user.googleId && (
                  <>
                    <span>•</span>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-secondary">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Goal Progress */}
          <div className="lg:col-span-1">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue" />
                  Weekly Goal
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create {weeklyGoal} prompts this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Progress
                    </span>
                    <span className="text-sm text-foreground">
                      {currentProgress} of {weeklyGoal}
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-3 bg-muted"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {weeklyGoal - currentProgress} prompts to go
                    </span>
                    <span className="font-medium text-primary">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6 bg-card border border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/create")}
                  className="w-full justify-start bg-muted text-muted-foreground hover:bg-secondary cursor-pointer"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Prompt
                </Button>
                <Button
                  onClick={() => router.push("/explore")}
                  className="w-full justify-start bg-muted text-muted-foreground hover:bg-secondary cursor-pointer"
                  variant="outline"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Explore Community
                </Button>
                <Button
                  onClick={() => router.push("/profile")}
                  className="w-full justify-start bg-muted text-muted-foreground hover:bg-secondary cursor-pointer"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Prompts and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Prompts */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Your Recent Prompts</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest prompt creations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userPrompts.length === 0 && (
                    <div className="text-muted-foreground text-center py-8">
                      No prompts yet. Start creating!
                    </div>
                  )}
                  {userPrompts.slice(0, 3).map((prompt) => {
                    const avgRating = getAverageRating(prompt.feedbacks || []);
                    return (
                      <Card
                        key={prompt.id}
                        onClick={() => router.push(`/prompt/${prompt.id}`)}
                        className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-background"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {prompt.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="text-muted-foreground font-light px-1 py-0.5"
                              >
                                {prompt.isPublic ? "Public" : "Private"}
                              </Badge>
                              {prompt.remixOf && (
                                <Badge variant="outline" className="text-xs">
                                  <GitBranch className="h-3 w-3 mr-1" />
                                  Remix
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {(prompt.tags || []).slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs text-muted-foreground font-light px-1 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-foreground">
                            {avgRating > 0 && (
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {avgRating.toFixed(1)}
                              </span>
                            )}
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {prompt.feedbacks?.length || 0} feedback
                              {(prompt.feedbacks?.length || 0) !== 1 ? "s" : ""}
                            </span>
                            {prompt.remixCount > 0 && (
                              <span className="flex items-center">
                                <GitBranch className="h-3 w-3 mr-1" />
                                {prompt.remixCount} remix
                                {prompt.remixCount !== 1 ? "es" : ""}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(prompt.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => router.push("/profile")}
                    variant="outline"
                    className="w-full hover:bg-accent text-primary cursor-pointer"
                  >
                    View All Prompts
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest activity on Prompt Stack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 && (
                    <div className="text-muted-foreground text-center py-8">
                      No recent activity yet.
                    </div>
                  )}
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-accent rounded-full">
                          <activity.icon className="h-4 w-4 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
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
