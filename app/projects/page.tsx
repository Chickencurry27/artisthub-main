"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Copy, Check } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { ProjectsGrid } from "@/components/projects-grid";
import { SongForm } from "@/components/song-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardWrapper } from "@/components/dashboard-wrapper";
import { generateShareToken, createShareLink } from "@/lib/share-utils";
import { useSubscription } from "@/components/subscription-provider";
import { checkLimits, calculateStorageUsage } from "@/lib/subscription-utils";
import type { Client } from "@/lib/types";

type SortOption =
  | "last-added"
  | "alphabetical"
  | "status"
  | "client"
  | "oldest-first";

type Project = {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: "active" | "completed" | "on-hold";
  budget: number | null;
  dueDate?: string;
  createdAt: string;
};

type Song = {
  id: string;
  name: string;
  projectId: string;
  variations: {
    id: string;
    name: string;
    url?: string;
    notes?: string;
    createdAt: string;
  }[];
  createdAt: string;
};

function ProjectsPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const clientFilter = searchParams.get("client");
  const { subscription } = useSubscription();

  const [projects, setProjects] = useState<Project[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSongDialogOpen, setIsSongDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForSong, setSelectedProjectForSong] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedSongForVersion, setSelectedSongForVersion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("last-added");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed" | "on-hold"
  >("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [projectsRes, clientsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/clients"),
        ]);
        const projectsData = await projectsRes.json();
        const clientsData = await clientsRes.json();
        setProjects(projectsData);
        setClients(clientsData);

        const allSongs = [];
        for (const project of projectsData) {
          const songsRes = await fetch(`/api/songs?projectId=${project.id}`);
          const projectSongs = await songsRes.json();
          allSongs.push(...projectSongs);
        }
        setSongs(allSongs);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    if (clientFilter) {
      filtered = projects.filter(
        (project) => project.clientId === clientFilter
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.clientName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "client":
          return a.clientName.localeCompare(b.clientName);
        case "oldest-first":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "last-added":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return sorted;
  }, [projects, clientFilter, searchQuery, statusFilter, sortBy]);

  const handleAddProject = async (projectData: {
    name: string;
    description: string;
    clientId: string;
    status: "active" | "completed" | "on-hold";
    budget: number;
    dueDate?: string;
  }) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      setProjects((prev) => [...prev, newProject]);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Project added successfully!",
      });
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (updatedProjectData: {
    name: string;
    description: string;
    clientId: string;
    status: "active" | "completed" | "on-hold";
    budget: number;
    dueDate?: string;
  }) => {
    if (!editingProject) return;

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProjectData),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updatedProject = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? updatedProject : p))
      );
      setIsEditDialogOpen(false);
      setEditingProject(null);
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setIsEditDialogOpen(false);
      setEditingProject(null);
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSong = (projectId: string, projectName: string) => {
    setSelectedProjectForSong({ id: projectId, name: projectName });
    setIsSongDialogOpen(true);
  };

  const handleSongSubmit = async (songData: {
    name: string;
    version: string;
    fileUrl?: string;
    notes?: string;
  }) => {
    if (!selectedProjectForSong) return;

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: songData.name,
          projectId: selectedProjectForSong.id,
          variations: [
            {
              name: songData.version,
              url: songData.fileUrl,
              notes: songData.notes,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to create song");
      const newSong = await res.json();
      setSongs((prev) => [...prev, newSong]);
      setIsSongDialogOpen(false);
      setSelectedProjectForSong(null);
      toast({
        title: "Success",
        description: "Song added successfully!",
      });
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error",
        description: "Failed to add song. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteSong = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete song");
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      toast({
        title: "Success",
        description: "Song deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting song:", error);
      toast({
        title: "Error",
        description: "Failed to delete song. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVersion = (songId: string, songName: string) => {
    setSelectedSongForVersion({ id: songId, name: songName });
    setIsVersionDialogOpen(true);
  };

  const handleVersionSubmit = async (versionData: {
    name: string;
    version: string;
    fileUrl?: string;
    notes?: string;
  }) => {
    if (!selectedSongForVersion) return;

    try {
      const songToUpdate = songs.find(
        (s) => s.id === selectedSongForVersion.id
      );
      if (!songToUpdate) return;

      const res = await fetch(`/api/songs/${selectedSongForVersion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: songToUpdate.name,
          variations: [
            {
              name: versionData.version,
              url: versionData.fileUrl,
              notes: versionData.notes,
            },
            ...(songToUpdate.variations || []),
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to add version");
      const updatedSong = await res.json();
      setSongs((prev) =>
        prev.map((s) => (s.id === selectedSongForVersion.id ? updatedSong : s))
      );
      setIsVersionDialogOpen(false);
      setSelectedSongForVersion(null);
      toast({
        title: "Success",
        description: "Version added successfully!",
      });
    } catch (error) {
      console.error("Error adding version:", error);
      toast({
        title: "Error",
        description: "Failed to add version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVersion = async (songId: string, versionId: string) => {
    try {
      const res = await fetch(`/api/versions/${versionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete version");

      setSongs((prevSongs) =>
        prevSongs.map((song) => {
          if (song.id === songId) {
            return {
              ...song,
              variations: song.variations.filter((v) => v.id !== versionId),
            };
          }
          return song;
        })
      );

      toast({
        title: "Success",
        description: "Version deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error",
        description: "Failed to delete version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareProject = async (project: Project) => {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const { token } = await res.json();
      const link = `${window.location.origin}${createShareLink(
        project.id,
        token
      )}`;
      setShareLink(link);
      setSharingProject(project);
      setIsShareDialogOpen(true);
      toast({
        title: "Success",
        description: "Share link generated successfully!",
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getFilteredClientName = () => {
    if (!clientFilter) return null;
    const client = clients.find((c) => c.id === clientFilter);
    return client ? client.name : null;
  };

  const filteredClientName = getFilteredClientName();

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">
            {filteredClientName
              ? `${filteredClientName}'s Projects`
              : "My Projects"}
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm
                clients={clients}
                preSelectedClientId={clientFilter || undefined}
                onSubmit={handleAddProject}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Project Management
            </h2>
            <p className="text-muted-foreground">
              {filteredClientName
                ? `Manage projects for ${filteredClientName}.`
                : "Manage your projects, songs, and versions."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, description, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              >
                ×
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-added">Last Added</SelectItem>
                <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="client">Client Name</SelectItem>
                <SelectItem value="oldest-first">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {searchQuery || statusFilter !== "all" || filteredClientName
              ? `Showing ${filteredAndSortedProjects.length} of ${projects.length} projects`
              : `${projects.length} total projects`}
          </span>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearch();
                setStatusFilter("all");
              }}
              className="h-auto p-0 text-sm"
            >
              Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery || statusFilter !== "all" ? (
              <div>
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  No projects match your current filters. Try adjusting your
                  search or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearSearch();
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                  {filteredClientName
                    ? `Start by adding a project for ${filteredClientName}.`
                    : "Start by adding your first project to the system."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <ProjectsGrid
            projects={filteredAndSortedProjects}
            songs={songs}
            onEdit={handleEditProject}
            onAddSong={handleAddSong}
            onAddVersion={handleAddVersion}
            onShare={handleShareProject}
            onDeleteSong={handleDeleteSong}
            onDeleteVersion={handleDeleteVersion}
          />
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            clients={clients}
            editingProject={editingProject || undefined}
            onSubmit={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSongDialogOpen} onOpenChange={setIsSongDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Song to {selectedProjectForSong?.name}
            </DialogTitle>
          </DialogHeader>
          <SongForm onSubmit={handleSongSubmit} />
        </DialogContent>
      </Dialog>

      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Version to {selectedSongForVersion?.name}
            </DialogTitle>
          </DialogHeader>
          <SongForm
            songName={selectedSongForVersion?.name}
            isNewVersion={true}
            onSubmit={handleVersionSubmit}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project: {sharingProject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link with your client to let them view the project,
              listen to songs, and leave comments.
            </p>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This link will remain active until you generate a new one for this
              project.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardWrapper>
      <AuthGuard>
        <ProjectsPageContent />
      </AuthGuard>
    </DashboardWrapper>
  );
}
