"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { useToast } from "@/hooks/use-toast";
import {
  Music,
  Calendar,
  User,
  MessageSquare,
  Send,
  Clock,
  FileAudio,
  Building2,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Song, SongVersion } from "@/components/projects-grid";

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: "active" | "completed" | "on-hold";
  budget: number | null;
  startDate: string | null;
  endDate?: string;
  createdAt: string;
  songs: Song[];
  user: {
    id: string;
  };
}
import type { Comment } from "@/lib/share-utils";

export default function SharedProjectPage() {
  const params = useParams() as { projectId: string; token: string };
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [expandedSongs, setExpandedSongs] = useState<Record<string, boolean>>(
    {}
  );
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [newComment, setNewComment] = useState({
    author: "",
    email: "",
    content: "",
    songId: "",
    variationId: "",
  });

  useEffect(() => {
    const fetchSharedProject = async () => {
      try {
        const res = await fetch(
          `/api/share/${params.projectId}/${params.token}`
        );
        if (!res.ok) {
          setIsValid(false);
          setIsLoading(false);
          return;
        }
        const { project } = await res.json();
        setProject(project);
        setSongs(project.songs);
        setIsValid(true);

        // Initialize all songs as expanded
        const expanded: Record<string, boolean> = {};
        project.songs.forEach((song: Song) => {
          expanded[song.id] = true;
        });
        setExpandedSongs(expanded);

        // Fetch comments
        const commentsRes = await fetch(`/api/comments/${params.projectId}`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error loading shared project:", error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedProject();
  }, [params.projectId, params.token]);

  const handlePlayPause = (versionId: string) => {
    if (playingSong === versionId) {
      setPlayingSong(null);
    } else {
      setPlayingSong(versionId);
    }
  };

  const toggleSongExpand = (songId: string) => {
    setExpandedSongs((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newComment.author ||
      !newComment.email ||
      !newComment.content ||
      !newComment.songId ||
      !newComment.variationId
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a song version.",
        variant: "destructive",
      });
      return;
    }

    if (!project) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newComment,
          projectId: params.projectId,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit comment");
      const newCommentData = await res.json();
      setComments((prev) => [...prev, newCommentData]);
      setNewComment({
        author: "",
        email: "",
        content: "",
        songId: "",
        variationId: "",
      });
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortVariationsByDate = (variations: SongVersion[]) => {
    return [...variations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getVersionComments = (versionId: string) => {
    return comments.filter((comment) => comment.variationId === versionId);
  };

  const getSongAndVersionName = (songId: string, versionId: string) => {
    const song = project?.songs.find((s) => s.id === songId);
    const variation = song?.variations.find((v) => v.id === versionId);
    return song && variation ? `${song.name} - v${variation.name}` : "Unknown";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isValid || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Share Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This share link is invalid, expired, or has been deactivated.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact the project owner for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {project.clientName}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Started{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <Badge
                  variant="secondary"
                  className={
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {project.status === "on-hold"
                    ? "On Hold"
                    : project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          {project.description && (
            <p className="mt-4 text-muted-foreground">{project.description}</p>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Songs Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Songs & Versions ({songs.length})
              </h2>
              {songs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No songs available for this project yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {songs.map((song) => {
                    const sortedVariations = sortVariationsByDate(
                      song.variations
                    );
                    return (
                      <Card key={song.id}>
                        <Collapsible
                          open={expandedSongs[song.id]}
                          onOpenChange={() => toggleSongExpand(song.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <ChevronRight
                                    className={`h-4 w-4 transition-transform ${
                                      expandedSongs[song.id] ? "rotate-90" : ""
                                    }`}
                                  />
                                  <Music className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <CardTitle className="text-lg">
                                      {song.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      {song.variations.length} variation
                                      {song.variations.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                      • Latest: v{sortedVariations[0]?.name} •
                                      {new Date(
                                        song.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                {sortedVariations[0]?.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayPause(sortedVariations[0].id);
                                    }}
                                  >
                                    {playingSong === sortedVariations[0].id ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {sortedVariations.map((variation, index) => (
                                  <div
                                    key={variation.id}
                                    className={`p-4 rounded-lg border ${
                                      index === 0
                                        ? "bg-green-50 border-green-200"
                                        : "bg-background"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={
                                              index === 0
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            v{variation.name}
                                          </Badge>
                                          {index === 0 && (
                                            <Badge
                                              variant="outline"
                                              className="text-green-700 border-green-300"
                                            >
                                              Latest
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(
                                              variation.createdAt
                                            ).toLocaleDateString()}
                                          </div>
                                          {variation.url && (
                                            <div className="flex items-center gap-1">
                                              <FileAudio className="h-3 w-3" />
                                              Audio file
                                            </div>
                                          )}
                                          <div className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {
                                              getVersionComments(variation.id)
                                                .length
                                            }{" "}
                                            comments
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Audio Player */}
                                    {variation.url && (
                                      <div className="mb-3">
                                        <AudioPlayer
                                          src={variation.url}
                                          isPlaying={
                                            playingSong === variation.id
                                          }
                                          onPlayPause={() =>
                                            handlePlayPause(variation.id)
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {variation.notes && (
                                      <div className="mb-3 p-3 bg-muted/50 rounded text-sm">
                                        <strong>Notes:</strong>{" "}
                                        {variation.notes}
                                      </div>
                                    )}

                                    {/* Comments for this version */}
                                    <div className="space-y-3">
                                      {getVersionComments(variation.id).map(
                                        (comment) => (
                                          <div
                                            key={comment.id}
                                            className="bg-white p-3 rounded border"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="font-medium text-sm">
                                                {comment.author}
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {new Date(
                                                  comment.createdAt
                                                ).toLocaleString()}
                                              </div>
                                            </div>
                                            <p className="text-sm">
                                              {comment.content}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Comment Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Add Comment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="author">Name *</Label>
                      <Input
                        id="author"
                        value={newComment.author}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            author: e.target.value,
                          }))
                        }
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newComment.email}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Song Version *</Label>
                    <select
                      id="version"
                      value={`${newComment.songId}|${newComment.variationId}`}
                      onChange={(e) => {
                        const [songId, variationId] = e.target.value.split("|");
                        setNewComment((prev) => ({
                          ...prev,
                          songId,
                          variationId,
                        }));
                      }}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                      required
                    >
                      <option value="">Select a song version...</option>
                      {songs.map((song) =>
                        song.variations.map((variation) => (
                          <option
                            key={`${song.id}|${variation.id}`}
                            value={`${song.id}|${variation.id}`}
                          >
                            {song.name} - v{variation.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Comment *</Label>
                    <Textarea
                      id="content"
                      value={newComment.content}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Share your feedback..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
