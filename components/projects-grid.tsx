"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AudioPlayer } from "@/components/audio-player";
import {
  Edit,
  Calendar,
  DollarSign,
  Music,
  User,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Plus,
  ChevronRight,
  FileAudio,
  Clock,
  MessageSquare,
  Share,
} from "lucide-react";

// Define the types directly in this file to avoid import issues
export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: "active" | "completed" | "on-hold";
  budget: number | null;
  dueDate?: string;
  createdAt: string;
}

export interface Song {
  id: string;
  name: string;
  status: "in_progress" | "completed" | "on-hold";
  projectId: string;
  variations: SongVersion[];
  createdAt: string;
}

export interface SongVersion {
  id: string;
  name: string;
  url?: string;
  notes?: string;
  createdAt: string;
}

interface ProjectsGridProps {
  projects: Project[];
  songs: Song[];
  onEdit: (project: Project) => void;
  onAddSong: (projectId: string, projectName: string) => void;
  onAddVersion: (songId: string, songName: string) => void;
  onShare?: (project: Project) => void;
  onDeleteSong: (songId: string) => void;
  onDeleteVersion: (songId: string, versionId: string) => void;
  onUpdateSong: (songId: string, data: Partial<Song>) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "on-hold": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

export function ProjectsGrid({
  projects,
  songs,
  onEdit,
  onAddSong,
  onAddVersion,
  onShare,
  onDeleteSong,
  onDeleteVersion,
  onUpdateSong,
}: ProjectsGridProps) {
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({});
  const [expandedSongs, setExpandedSongs] = useState<Record<string, boolean>>(
    {}
  );
  const [playingSong, setPlayingSong] = useState<string | null>(null);

  useEffect(() => {
    // Initialize all projects as expanded
    const expanded: Record<string, boolean> = {};
    projects.forEach((project) => {
      expanded[project.id] = true;
    });
    setExpandedProjects(expanded);
  }, [projects]);

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Projects Yet</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const toggleSongExpand = (songId: string) => {
    setExpandedSongs((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleAddSongClick = (
    e: React.MouseEvent,
    projectId: string,
    projectName: string
  ) => {
    e.stopPropagation();
    onAddSong(projectId, projectName);
  };

  const handleAddVersionClick = (
    e: React.MouseEvent,
    songId: string,
    songName: string
  ) => {
    e.stopPropagation();
    onAddVersion(songId, songName);
  };

  const handleDeleteSongClick = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this song and all its versions?"
      )
    ) {
      onDeleteSong(songId);
    }
  };

  const handleDeleteVersionClick = (
    e: React.MouseEvent,
    songId: string,
    versionId: string
  ) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this version?")) {
      onDeleteVersion(songId, versionId);
    }
  };

  const handlePlayPause = (versionId: string) => {
    if (playingSong === versionId) {
      setPlayingSong(null);
    } else {
      setPlayingSong(versionId);
    }
  };

  const sortVariationsByDate = (variations: SongVersion[]) => {
    if (!Array.isArray(variations)) {
      return [];
    }
    return [...variations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getLatestVersion = (variations: SongVersion[]) => {
    return sortVariationsByDate(variations)[0];
  };

  const handleShareClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (onShare) {
      onShare(project);
    }
  };

  const handleStatusChange = (
    songId: string,
    status: "in_progress" | "completed" | "on-hold"
  ) => {
    onUpdateSong(songId, { status });
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const projectSongs = songs.filter(
          (song) => song.projectId === project.id
        );
        return (
          <Card
            key={project.id}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={statusColors[project.status]}
                  >
                    {project.status === "on-hold"
                      ? "On Hold"
                      : project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(project.id)}
                    className="h-8 w-8 p-0 ml-2"
                  >
                    {expandedProjects[project.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleShareClick(e, project)}
                    className="h-8 w-8 p-0"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEditClick(e, project)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {project.clientName}
                  </span>
                </div>
              </div>
            </CardHeader>
            {expandedProjects[project.id] && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    {project.description && (
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          Added:{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                          {project.dueDate &&
                            ` • Due: ${new Date(
                              project.dueDate
                            ).toLocaleDateString()}`}
                        </span>
                      </div>
                      {project.budget && project.budget > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) =>
                        handleAddSongClick(e, project.id, project.name)
                      }
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Add Song
                    </Button>
                  </div>
                </div>

                {/* Full-width Songs & Versions Section */}
                {projectSongs.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">
                        Songs & Versions ({projectSongs.length})
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {projectSongs.map((song) => {
                        const sortedVariations = sortVariationsByDate(
                          song.variations
                        );
                        const latestVersion = sortedVariations[0];
                        return (
                          <Card
                            key={song.id}
                            className={`bg-muted/20 ${
                              song.status === "completed"
                                ? "bg-green-100 border-green-200"
                                : ""
                            }`}
                          >
                            <Collapsible
                              open={expandedSongs[song.id]}
                              onOpenChange={() => toggleSongExpand(song.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <ChevronRight
                                        className={`h-4 w-4 transition-transform ${
                                          expandedSongs[song.id]
                                            ? "rotate-90"
                                            : ""
                                        }`}
                                      />
                                      <Music className="h-5 w-5 text-muted-foreground" />
                                      <div>
                                        <h5 className="font-medium text-base">
                                          {song.name}
                                        </h5>
                                        <div className="text-sm text-muted-foreground">
                                          {song.variations?.length || 0}{" "}
                                          variation
                                          {song.variations?.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                          • Latest: v{latestVersion?.name} •
                                          {new Date(
                                            song.createdAt
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={song.status}
                                        onChange={(e) =>
                                          handleStatusChange(
                                            song.id,
                                            e.target.value as
                                              | "in_progress"
                                              | "completed"
                                              | "on-hold"
                                          )
                                        }
                                        className="text-sm rounded-md border-gray-300"
                                      >
                                        <option value="in_progress">
                                          In Progress
                                        </option>
                                        <option value="completed">
                                          Completed
                                        </option>
                                        <option value="on-hold">On Hold</option>
                                      </select>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) =>
                                          handleAddVersionClick(
                                            e,
                                            song.id,
                                            song.name
                                          )
                                        }
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Version
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) =>
                                          handleDeleteSongClick(e, song.id)
                                        }
                                      >
                                        Delete Song
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  <div className="space-y-4">
                                    {sortedVariations.map(
                                      (variation, index) => (
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
                                                {variation.notes && (
                                                  <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    Has notes
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={(e) =>
                                                handleDeleteVersionClick(
                                                  e,
                                                  song.id,
                                                  variation.id
                                                )
                                              }
                                            >
                                              Delete
                                            </Button>
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
                                            <div className="p-3 bg-muted/50 rounded text-sm">
                                              <strong>Notes:</strong>{" "}
                                              {variation.notes}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
