"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ClientsGrid } from "@/components/clients-grid"
import { ClientForm } from "@/components/client-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import type { Client } from "@/lib/types"

interface ClientsPageProps {
  initialClients: Client[]
  userId: string
}

export function ClientsPage({ initialClients, userId }: ClientsPageProps) {
  const [clients, setClients] = useState(initialClients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (data: { name: string; email: string; phone: string; artistname: string; imageUrl?: string }) => {
    try {
      if (selectedClient) {
        const res = await fetch(`/api/clients/${selectedClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to update client');
        }
        const updatedClient: Client = await res.json();
        setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create client');
        }
        const newClient: Client = await res.json();
        setClients((prev) => [...prev, newClient]);
      }
      setSelectedClient(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (clientId: string) => {
    await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">My Clients</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              </DialogHeader>
              <ClientForm editingClient={selectedClient ?? undefined} onSubmit={handleFormSubmit} onDelete={handleDelete} />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
            <p className="text-muted-foreground">Click on a client card to view their projects.</p>
          </div>
        </div>
        <ClientsGrid clients={clients} onEdit={handleEdit} />
      </div>
    </>
  )
}