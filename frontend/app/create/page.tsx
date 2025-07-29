"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_PROMPT_MUTATION, UPDATE_PROMPT_MUTATION } from "@/lib/gql/create";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/upload/ImageUpload";
import { toast } from "sonner";
import {
  X,
  Globe,
  GitBranch,
} from "lucide-react";
import CustomLayout from "@/components/layout/layout";

export default function CreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("editor");
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [createPrompt] = useMutation(CREATE_PROMPT_MUTATION);
  const [updatePrompt] = useMutation(UPDATE_PROMPT_MUTATION);

  const [promptData, setPromptData] = useState({
    title: "",
    content: "",
    tags: "",
    isPublic: true,
    remixOf: null as string | null,
    imageUrl: null as string | null,
  });

  useEffect(() => {
    const title = searchParams.get("title") || "";
    const content = searchParams.get("content") || "";
    const tags = searchParams.get("tags") || "";
    const image = searchParams.get("image") || null;
    const remixOf = searchParams.get("remixOf") || null;
    const editId = searchParams.get("edit");

    if (title || content || tags || image || remixOf || editId) {
      setPromptData({
        title,
        content,
        tags,
        imageUrl: image || null,
        remixOf,
        isPublic: true,
      });
    }

    if (editId) {
      setEditPromptId(editId);
    }
  }, [searchParams]);

  const parseTagsFromString = (tagsString: string): string[] => {
    return tagsString
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const handlePublish = async () => {
    if (!promptData.title.trim() || !promptData.content.trim()) {
      toast("Missing required fields", {
        description: "Please add a title and content before publishing.",
      });
      return;
    }

    try {
      if (editPromptId) {
        await updatePrompt({
          variables: {
            id: editPromptId,
            title: promptData.title,
            content: promptData.content,
            tags: parseTagsFromString(promptData.tags),
            isPublic: promptData.isPublic,
            imageUrl: promptData.imageUrl,
          },
        });
        toast("Prompt updated!", {
          description: "Your prompt has been successfully updated.",
        });
      } else {
        await createPrompt({
          variables: {
            title: promptData.title,
            content: promptData.content,
            tags: parseTagsFromString(promptData.tags),
            isPublic: promptData.isPublic,
            remixOf: promptData.remixOf,
            imageUrl: promptData.imageUrl,
          },
        });
        toast("Prompt published!", {
          description: "Your prompt is now available to the community.",
        });
      }

      // Reset state and optionally redirect
      setPromptData({
        title: "",
        content: "",
        tags: "",
        isPublic: true,
        remixOf: null,
        imageUrl: null,
      });

      router.push("/explore"); // Adjust to your desired route

    } catch (err: any) {
      toast("Failed to save prompt", {
        description: err.message || "An error occurred.",
      });
    }
  };


  return (
    <CustomLayout>
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {editPromptId ? "Edit Prompt" : promptData.remixOf ? "Remix Prompt" : "Create Prompt"}
          </h1>
          {(promptData.remixOf || editPromptId) && (
            <div className="flex items-center text-blue text-sm mt-1">
              <GitBranch className="h-4 w-4 mr-1" />
              <span>{editPromptId ? "Editing existing prompt" : "Remixing existing prompt"}</span>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 bg-muted rounded-lg">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div>
              <Label>Prompt Title</Label>
              <Input
                placeholder="Enter a descriptive title"
                value={promptData.title}
                onChange={(e) => setPromptData({ ...promptData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Prompt Content</Label>
              <Textarea
                placeholder="What do you want the AI to do?"
                rows={10}
                value={promptData.content}
                onChange={(e) => setPromptData({ ...promptData, content: e.target.value })}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                placeholder="e.g. writing, productivity"
                value={promptData.tags}
                onChange={(e) => setPromptData({ ...promptData, tags: e.target.value })}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {parseTagsFromString(promptData.tags).map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Prompt Image (Optional)</Label>
              {promptData.imageUrl ? (
                <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden">
                  <img src={promptData.imageUrl} alt="Prompt" className="w-full h-full object-cover" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setPromptData({ ...promptData, imageUrl: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <ImageUpload
                  value={promptData.imageUrl}
                  onChange={(url) => setPromptData({ ...promptData, imageUrl: url })} 
                />
              )}
            </div>

            <div className="pt-6">
              <Button onClick={handlePublish} className="bg-primary text-primary-foreground">
                <Globe className="h-4 w-4 mr-2" />
                {promptData.isPublic ? (editPromptId ? "Update Prompt" : "Publish Prompt") : "Save Private"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>{promptData.title || "Untitled Prompt"}</CardTitle>
              </CardHeader>
              <CardContent>
                {promptData.imageUrl && (
                  <img src={promptData.imageUrl} alt="Preview" className="mb-4 rounded-lg" />
                )}
                <pre className="whitespace-pre-wrap text-sm mb-4">{promptData.content}</pre>
                <div className="flex flex-wrap gap-2">
                  {parseTagsFromString(promptData.tags).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle>Prompt Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={promptData.isPublic}
                    onChange={(e) => setPromptData({ ...promptData, isPublic: e.target.checked })}
                  />
                  <Label htmlFor="isPublic">Make this prompt public</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Public prompts can be discovered, used, and remixed by others.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </CustomLayout>
  );
}
