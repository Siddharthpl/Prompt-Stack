"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { PROMPTS_QUERY } from "@/lib/gql/explore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import PromptSkeleton from "@/app/explore/PromptSkeleton";
import {
  Search,
  Star,
  Filter,
  MessageCircle,
  ImageIcon,
  GitBranch,
} from "lucide-react";
import { Prompt, Feedback} from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import CustomLayout from "@/components/layout/layout";

// ----------------- Utils -----------------
const getAverageRating = (feedbacks: Feedback[]): number => {
  if (!feedbacks?.length) return 0;
  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return sum / feedbacks.length;
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString();

// ----------------- Page Component -----------------
export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const offset = (currentPage - 1) * itemsPerPage;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data, loading, error } = useQuery<{ prompts: Prompt[] }>(PROMPTS_QUERY, {
    variables: {
      search: searchQuery || undefined,
      isPublic: true,
    },
    fetchPolicy: "cache-and-network",
  });

  const allPrompts = data?.prompts ?? [];

  // ----------------- Extract unique tags (limit to 30) -----------------
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const prompt of allPrompts) {
      for (const tag of prompt.tags) {
        if (tagSet.size < 30) tagSet.add(tag);
      }
    }
    return Array.from(tagSet);
  }, [allPrompts]);

  // ----------------- Toggle tag filter -----------------
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  // ----------------- Filter and Sort -----------------
  let filteredPrompts = allPrompts.filter((prompt) => {
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      prompt.title.toLowerCase().includes(search) ||
      prompt.content.toLowerCase().includes(search) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(search));

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => prompt.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  if (sortBy === "recent") {
    filteredPrompts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "rating") {
    filteredPrompts.sort(
      (a, b) => getAverageRating(b.feedbacks) - getAverageRating(a.feedbacks)
    );
  } else if (sortBy === "remixed") {
    filteredPrompts.sort((a, b) => b.remixCount - a.remixCount);
  } else {
    filteredPrompts.sort(
      (a, b) => (b.feedbacks?.length || 0) - (a.feedbacks?.length || 0)
    );
  }

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const paginatedPrompts = filteredPrompts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <CustomLayout>
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Explore Prompts
          </h1>
          <p className="text-muted-foreground">
            Discover amazing prompts created by the community
          </p>
        </div>

        {/* Search, Sort */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts, tags, or content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-card text-foreground border-border"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="remixed">Most Remixed</option>
            </select>
          </div>

          {/* Tag Toggle Filters */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center text-muted-foreground">
              <Filter className="h-4 w-4" />
            <span className="text-sm">Filter by Tags:</span>
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-sm ml-2 text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {uniqueTags.map((tag) => (
              <Badge
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer border ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground border-border"
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {loading ? (
  <>
    <div className="flex items-center space-x-4 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-20 rounded-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <PromptSkeleton key={i} />
      ))}
    </div>
  </>
) : error ? (

          <div className="text-center py-12 text-red-500">
            Error loading prompts: {error.message}
          </div>
        ) : (
          <>
            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPrompts.map((prompt) => {
                const avgRating = getAverageRating(prompt.feedbacks);
                return (
                  <Card
                    key={prompt.id}
                    onClick={() => router.push(`/prompt/${prompt.id}`)}
                    className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && router.push(`/prompt/${prompt.id}`)
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2 text-foreground">
                            {prompt.title}
                          </CardTitle>
                          <CardDescription className="mt-2 line-clamp-3 text-muted-foreground">
                            {prompt.content.substring(0, 150)}...
                          </CardDescription>
                        </div>
                        {prompt.remixOf && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs bg-background text-foreground border-border flex items-center"
                          >
                            <GitBranch className="h-3 w-3 mr-1" /> Remix
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 p-4 pt-0">
                      <div className="flex-1 flex flex-col">
                        {prompt.imageUrl ? (
                          <img
                            src={prompt.imageUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-2">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mb-4 mt-2">
                          {prompt.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-background text-foreground border-border"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-background text-foreground border-border"
                            >
                              +{prompt.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-4 text-xs md:text-sm text-muted-foreground mb-2">
                          {avgRating > 0 && (
                            <span className="flex items-center">
                              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                              {avgRating.toFixed(1)}
                            </span>
                          )}
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {prompt.feedbacks.length}
                          </span>
                          {prompt.remixCount > 0 && (
                            <span className="flex items-center">
                              <GitBranch className="h-4 w-4 mr-1" />
                              {prompt.remixCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(prompt.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {prompt.author.name}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        href="#"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
    </CustomLayout>
  );
}
