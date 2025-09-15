"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/providers/sidebar";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  PanelRight,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "./ui/tooltip";
import { useNotes } from "@/app/hooks/useNotes";
import { toast } from "sonner";
import { Input } from "./ui/input";

export function LeftSidebar() {
  const pathname = usePathname();
  const { notes, isLoading, addNote } = useNotes()
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const router = useRouter();

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    try {
      const result = await addNote({ title: newNoteTitle.trim() })
      toast.success("Document created successfully");
      router.replace(`/notes/${result.id}`);
      setIsCreatingNote(false);
      setNewNoteTitle("");
    } catch (error) {
      toast.error("Failed to create document");
      console.error("Failed to create document:", error);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className="relative flex h-full flex-col border-border border-r bg-background text-foreground transition-all duration-300 ease-in-out"
      >
        <SidebarHeader className="flex w-full flex-row justify-between group-data-[collapsible=icon]:flex-col">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2",
                "group-data-[collapsible=icon]:flex-col",
              )}
              aria-label="Text0 Home"
            >
              <div className="">
                Logo
              </div>
            </Link>
          </div>
          <SidebarMenuButton
            tooltip="Toggle Sidebar"
            className="flex h-8 w-8 items-center justify-center"
            asChild
          >
            <SidebarTrigger>
              <PanelRight className="h-4 w-4" />
            </SidebarTrigger>
          </SidebarMenuButton>
        </SidebarHeader>

        <SidebarContent className="flex-1 gap-0">
          {/* Command Menu */}
          <SidebarGroup>
            <div className="relative w-full">

            </div>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup className="flex-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Home"
                  className="flex w-full items-center justify-start gap-2 px-2 py-1.5 text-sm group-data-[collapsible=icon]:justify-center"
                >
                  <Link
                    href="/"
                    data-active={pathname === "/"}
                    className="flex w-full items-center gap-2 text-muted-foreground group-data-[collapsible=icon]:justify-center"
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      Home
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Notes Section */}
              <SidebarMenuItem>
                <Collapsible defaultOpen={true} className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="My Documents"
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-muted-foreground text-sm  hover:text-foreground group-data-[collapsible=icon]:justify-center"
                    >
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate font-medium tracking-wide group-data-[collapsible=icon]:hidden">
                        My Documents
                      </span>
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-auto max-h-70">
                      <div className="space-y-1">
                        <div className="sticky top-0 ml-4 border-border border-l border-dashed px-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0">
                          {isCreatingNote ? (
                            <form
                              onSubmit={handleCreateNote}
                              className="flex items-center gap-1 group-data-[collapsible=icon]:hidden"
                            >
                              <Input
                                placeholder="Note name"
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    setIsCreatingNote(false);
                                    setNewNoteTitle("");
                                  }
                                }}
                                className="h-8 text-sm dark:bg-muted"
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <SidebarMenuButton
                                  type="submit"
                                  size="sm"
                                  tooltip="Create note"
                                  className="h-8 w-8"
                                >
                                  <Check className="h-4 w-4" />
                                </SidebarMenuButton>
                                <SidebarMenuButton
                                  type="button"
                                  size="sm"
                                  tooltip="Cancel"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setIsCreatingNote(false);
                                    setNewNoteTitle("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </SidebarMenuButton>
                              </div>
                            </form>
                          ) : (
                            <SidebarMenuButton
                              variant="outline"
                              size="sm"
                              tooltip="New Document"
                              className="flex h-8 w-full items-center justify-start gap-2 border border-border bg-background pl-2 text-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pl-0 dark:bg-muted"
                              onClick={() => setIsCreatingNote(true)}
                              data-new-doc-trigger
                            >
                              <Plus className="h-4 w-4 shrink-0" />
                              <span className="group-data-[collapsible=icon]:hidden">
                                New Document
                              </span>
                            </SidebarMenuButton>
                          )}
                        </div>
                        <ul>
                          {notes.map((note) => {
                            return (
                              <div
                                key={note.id}
                                className="ml-4 border-border border-l border-dashed px-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0"
                              >
                                <SidebarMenuItem>
                                  <SidebarMenuButton
                                    asChild
                                    tooltip={note.title}
                                    data-active={
                                      pathname.split("/").at(-1) === note.id
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground text-sm group-data-[collapsible=icon]:justify-center"
                                  >
                                    <Link
                                      href={`/notes/${note.id}`}
                                      className="flex w-full items-center gap-2"
                                    >
                                      <FileText className="h-4 w-4 shrink-0" />
                                      <span className="max-w-40 truncate group-data-[collapsible=icon]:hidden">
                                        {note.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                  <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                      <SidebarMenuAction
                                      // disabled={isDocPending}
                                      >
                                        {/* {isDocPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )} */}
                                        <MoreHorizontal className="h-4 w-4" />
                                      </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      side="right"
                                      align="start"
                                    >
                                      <DropdownMenuItem
                                        // disabled={isExporting}
                                        className="flex cursor-pointer items-center gap-2"
                                      >
                                        {/* {isDocBeingExported ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )} */}
                                        <Download className="h-4 w-4" />
                                        <span>Export Markdown</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        // onClick={() => {
                                        //   openDeleteDialog(doc.id, doc.name);
                                        // }}
                                        // disabled={isDeleting}
                                        className="flex cursor-pointer items-center gap-2"
                                      >
                                        {/* {isDocBeingDeleted ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )} */}
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Document</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuItem>
                              </div>
                            );
                          })}
                        </ul>
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
