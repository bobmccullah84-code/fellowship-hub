import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import type { Project } from "@shared/schema";

function photosOf(p: Project): string[] {
  return Array.from(new Set([p.imageUrl, ...((p.images as string[] | null) ?? [])].filter(Boolean) as string[]));
}

function ProjectEditor({ project }: { project: Project }) {
  const { toast } = useToast();
  const [goal, setGoal] = useState(project.goal?.toString() ?? "");
  const [period, setPeriod] = useState(project.fundingPeriod ?? "once");
  const [raised, setRaised] = useState((project.raised ?? 0).toString());
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGoal(project.goal?.toString() ?? "");
    setPeriod(project.fundingPeriod ?? "once");
    setRaised((project.raised ?? 0).toString());
  }, [project.goal, project.fundingPeriod, project.raised]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/projects"] });

  const saveFunding = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", `/api/admin/projects/${project.id}/funding`, {
        goal: goal.trim() === "" ? null : Math.round(Number(goal)),
        fundingPeriod: period === "monthly" ? "monthly" : null,
        raised: Math.max(0, Math.round(Number(raised) || 0)),
      }),
    onSuccess: () => {
      refresh();
      toast({ title: "Funding updated", description: project.title });
    },
    onError: () => toast({ title: "Could not save funding", variant: "destructive" }),
  });

  const savePhotos = useMutation({
    mutationFn: (photos: string[]) =>
      apiRequest("PUT", `/api/admin/projects/${project.id}`, {
        imageUrl: photos[0] ?? null,
        images: photos.slice(1),
      }),
    onSuccess: refresh,
    onError: () => toast({ title: "Could not save photos", variant: "destructive" }),
  });

  const photos = photosOf(project);

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        added.push((await res.json()).url);
      }
      await savePhotos.mutateAsync([...photos, ...added]);
      toast({ title: `${added.length} photo${added.length === 1 ? "" : "s"} added` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const goalNum = Number(goal) || 0;
  const raisedNum = Number(raised) || 0;

  return (
    <Card data-testid={`admin-project-${project.id}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funding */}
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <Label htmlFor={`goal-${project.id}`}>Goal ($)</Label>
            <Input id={`goal-${project.id}`} type="number" min={0} value={goal} placeholder="No goal" onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div>
            <Label>Goal type</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="monthly">Every month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`raised-${project.id}`}>{period === "monthly" ? "Raised this month ($)" : "Raised ($)"}</Label>
            <Input id={`raised-${project.id}`} type="number" min={0} value={raised} onChange={(e) => setRaised(e.target.value)} />
          </div>
          <Button onClick={() => saveFunding.mutate()} disabled={saveFunding.isPending} data-testid={`save-funding-${project.id}`}>
            {saveFunding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save funding
          </Button>
        </div>
        {goalNum > 0 && (
          <div className="space-y-1">
            <Progress value={Math.min((raisedNum / goalNum) * 100, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {period === "monthly" ? "Resets to $0 automatically at the start of each month." : "One-time goal."}
            </p>
          </div>
        )}

        {/* Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Photos ({photos.length})</Label>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
              data-testid={`photo-input-${project.id}`}
            />
            <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              Add photos
            </Button>
          </div>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {photos.map((src, i) => (
                <div key={src} className="relative group aspect-square rounded overflow-hidden bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">Cover</span>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                    {i > 0 && (
                      <button
                        type="button"
                        title="Make cover photo"
                        className="rounded bg-black/60 p-1 text-white hover:bg-black/80"
                        onClick={() => savePhotos.mutate([src, ...photos.filter((p) => p !== src)])}
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Remove photo"
                      className="rounded bg-black/60 p-1 text-white hover:bg-red-600"
                      onClick={() => savePhotos.mutate(photos.filter((p) => p !== src))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminProjects() {
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  if (isLoading) return <p className="text-muted-foreground">Loading projects…</p>;
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Set each project's funding goal and update the amount raised. Monthly goals start over at $0 on the 1st of each month.
      </p>
      {(projects ?? []).map((p) => (
        <ProjectEditor key={p.id} project={p} />
      ))}
    </div>
  );
}
