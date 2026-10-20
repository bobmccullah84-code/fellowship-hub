import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Users, 
  Video, 
  BookOpen, 
  Mic, 
  Heart, 
  Plus, 
  Edit, 
  Trash2,
  ArrowLeft,
  Settings,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type User = {
  id: string;
  username: string;
  isAdmin: boolean;
};

type Teaching = {
  id: string;
  title: string;
  description: string;
  speaker: string;
  contentType?: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  documentUrl?: string | null;
  thumbnailUrl: string | null;
  duration?: number | null;
  views: number;
  isPublic: boolean;
};

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isPublic: boolean;
};

type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  contentType?: string | null;
  videoUrl: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  order: number;
};

type VoiceChannel = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

type PrayerRequest = {
  id: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
};

// File Upload Field Component
function FileUploadField({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter URL...",
  accept = "*/*",
  testId
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  accept?: string;
  testId?: string;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <RadioGroup 
        value={mode} 
        onValueChange={(val) => setMode(val as "url" | "upload")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="url" id={`url-${testId}`} />
          <Label htmlFor={`url-${testId}`} className="font-normal cursor-pointer">
            <LinkIcon className="inline h-4 w-4 mr-1" />
            Enter URL
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id={`upload-${testId}`} />
          <Label htmlFor={`upload-${testId}`} className="font-normal cursor-pointer">
            <Upload className="inline h-4 w-4 mr-1" />
            Upload File
          </Label>
        </div>
      </RadioGroup>
      
      {mode === "url" ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={testId}
        />
      ) : (
        <div className="space-y-2">
          <Input
            type="file"
            onChange={handleFileUpload}
            accept={accept}
            disabled={isUploading}
            data-testid={`${testId}-file`}
          />
          {isUploading && (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          )}
          {value && (
            <p className="text-sm text-muted-foreground truncate">
              Current: {value}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || !user.isAdmin) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage all website content and users</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="teachings" data-testid="tab-teachings">
              <Video className="mr-2 h-4 w-4" />
              Teachings
            </TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="channels" data-testid="tab-channels">
              <Mic className="mr-2 h-4 w-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="prayers" data-testid="tab-prayers">
              <Heart className="mr-2 h-4 w-4" />
              Prayers
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="mr-2 h-4 w-4" />
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="teachings" className="mt-6">
            <TeachingsManagement />
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <CoursesManagement />
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <ChannelsManagement />
          </TabsContent>

          <TabsContent value="prayers" className="mt-6">
            <PrayersManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SiteSettingsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

type UserFormData = {
  id?: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
};

// Users Management Component
function UsersManagement() {
  const { toast } = useToast();
  const [editUser, setEditUser] = useState<Partial<UserFormData> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; firstName: string; lastName: string; email: string; isAdmin: boolean }) => {
      return apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      setIsDialogOpen(false);
      setEditUser(null);
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create user", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; firstName?: string; lastName?: string; email?: string; isAdmin: boolean }) => {
      const { id, ...updates } = data;
      return apiRequest("PUT", `/api/admin/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setIsDialogOpen(false);
      setEditUser(null);
      setIsCreating(false);
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <Button
          onClick={() => {
            setEditUser({
              username: "",
              password: "",
              firstName: "",
              lastName: "",
              email: "",
              isAdmin: false,
            });
            setIsCreating(true);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-user"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
              data-testid={`user-item-${user.id}`}
            >
              <div>
                <p className="font-semibold" data-testid={`text-username-${user.id}`}>
                  {user.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.isAdmin ? "Admin" : "Regular User"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditUser(user);
                    setIsCreating(false);
                    setIsDialogOpen(true);
                  }}
                  data-testid={`button-edit-user-${user.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this user?")) {
                      deleteMutation.mutate(user.id);
                    }
                  }}
                  data-testid={`button-delete-user-${user.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreating ? "Create User" : "Edit User"}</DialogTitle>
            </DialogHeader>
            {editUser && (
              <div className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={editUser.username || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, username: e.target.value })
                    }
                    disabled={!isCreating}
                    data-testid="input-username"
                  />
                </div>
                {isCreating && (
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={editUser.password || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser, password: e.target.value })
                      }
                      data-testid="input-password"
                    />
                  </div>
                )}
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={editUser.firstName || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, firstName: e.target.value })
                    }
                    data-testid="input-firstname"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={editUser.lastName || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, lastName: e.target.value })
                    }
                    data-testid="input-lastname"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editUser.email || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    data-testid="input-email"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editUser.isAdmin ?? false}
                    onCheckedChange={(checked) =>
                      setEditUser({ ...editUser, isAdmin: checked })
                    }
                    data-testid="switch-admin"
                  />
                  <Label>Admin Access</Label>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (isCreating) {
                        createMutation.mutate({
                          username: editUser.username!,
                          password: editUser.password!,
                          firstName: editUser.firstName || "",
                          lastName: editUser.lastName || "",
                          email: editUser.email || "",
                          isAdmin: editUser.isAdmin ?? false,
                        });
                      } else {
                        updateMutation.mutate({
                          id: editUser.id!,
                          firstName: editUser.firstName,
                          lastName: editUser.lastName,
                          email: editUser.email,
                          isAdmin: editUser.isAdmin ?? false,
                        });
                      }
                    }}
                    data-testid="button-save-user"
                  >
                    {isCreating ? "Create User" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Teachings Management Component
function TeachingsManagement() {
  const { toast } = useToast();
  const [editTeaching, setEditTeaching] = useState<Partial<Teaching> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: teachings, isLoading } = useQuery<Teaching[]>({
    queryKey: ["/api/teachings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Teaching, "id" | "views">) => {
      return apiRequest("POST", "/api/admin/teachings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachings"] });
      toast({ title: "Teaching created successfully" });
      setIsDialogOpen(false);
      setEditTeaching(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create teaching", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Teaching> & { id: string }) => {
      const { id, ...body } = data;
      return apiRequest("PATCH", `/api/admin/teachings/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachings"] });
      toast({ title: "Teaching updated successfully" });
      setIsDialogOpen(false);
      setEditTeaching(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update teaching", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/teachings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachings"] });
      toast({ title: "Teaching deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete teaching", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editTeaching) return;

    // Build a clean payload with only the fields the schema accepts
    const payload = {
      title: editTeaching.title || "",
      description: editTeaching.description || "",
      speaker: editTeaching.speaker || "",
      contentType: editTeaching.contentType || "video",
      videoUrl: editTeaching.videoUrl || null,
      audioUrl: editTeaching.audioUrl || null,
      documentUrl: editTeaching.documentUrl || null,
      thumbnailUrl: editTeaching.thumbnailUrl || null,
      duration: editTeaching.duration ?? null,
      isPublic: editTeaching.isPublic ?? true,
    };

    if (editTeaching.id) {
      updateMutation.mutate({ ...payload, id: editTeaching.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading teachings...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Teachings Management</CardTitle>
        <Button
          onClick={() => {
            setEditTeaching({
              title: "",
              description: "",
              speaker: "",
              videoUrl: "",
              audioUrl: "",
              thumbnailUrl: "",
              isPublic: true,
              contentType: "video",
            });
            setIsDialogOpen(true);
          }}
          data-testid="button-add-teaching"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Teaching
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachings?.map((teaching) => (
            <div
              key={teaching.id}
              className="flex items-center justify-between p-4 border rounded-lg"
              data-testid={`teaching-item-${teaching.id}`}
            >
              <div className="flex-1">
                <p className="font-semibold" data-testid={`text-title-${teaching.id}`}>
                  {teaching.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {teaching.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Views: {teaching.views} | {teaching.isPublic ? "Public" : "Private"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditTeaching(teaching);
                    setIsDialogOpen(true);
                  }}
                  data-testid={`button-edit-teaching-${teaching.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this teaching?")) {
                      deleteMutation.mutate(teaching.id);
                    }
                  }}
                  data-testid={`button-delete-teaching-${teaching.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editTeaching?.id ? "Edit Teaching" : "Add Teaching"}
              </DialogTitle>
            </DialogHeader>
            {editTeaching && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editTeaching.title || ""}
                    onChange={(e) =>
                      setEditTeaching({ ...editTeaching, title: e.target.value })
                    }
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label>Speaker <span className="text-xs text-muted-foreground">(leave blank if none)</span></Label>
                  <Input
                    value={editTeaching.speaker || ""}
                    onChange={(e) =>
                      setEditTeaching({ ...editTeaching, speaker: e.target.value })
                    }
                    placeholder="e.g. Paris Reidhead"
                    data-testid="input-speaker"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editTeaching.description || ""}
                    onChange={(e) =>
                      setEditTeaching({ ...editTeaching, description: e.target.value })
                    }
                    data-testid="input-description"
                  />
                </div>
                <div>
                  <Label>Content Type</Label>
                  <Select
                    value={editTeaching.contentType || "video"}
                    onValueChange={(value) =>
                      setEditTeaching({ ...editTeaching, contentType: value })
                    }
                  >
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="youtube">YouTube Embed</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="document">Document (PDF/Word/Text)</SelectItem>
                      <SelectItem value="mixed">Video + Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(editTeaching.contentType === "video" || editTeaching.contentType === "mixed" || !editTeaching.contentType || editTeaching.contentType === "youtube") && (
                  <FileUploadField
                    label="Video/YouTube URL"
                    value={editTeaching.videoUrl || ""}
                    onChange={(value) =>
                      setEditTeaching({ ...editTeaching, videoUrl: value })
                    }
                    placeholder="https://youtube.com/watch?v=... or video file URL"
                    accept="video/*"
                    testId="input-video-url"
                  />
                )}
                {(editTeaching.contentType === "audio" || editTeaching.contentType === "mixed") && (
                  <FileUploadField
                    label="Audio File"
                    value={editTeaching.audioUrl || ""}
                    onChange={(value) =>
                      setEditTeaching({ ...editTeaching, audioUrl: value })
                    }
                    placeholder="Enter audio URL..."
                    accept="audio/*"
                    testId="input-audio-url"
                  />
                )}
                {(editTeaching.contentType === "document" || editTeaching.contentType === "mixed") && (
                  <FileUploadField
                    label="Document (PDF, Word, or Text file)"
                    value={editTeaching.documentUrl || ""}
                    onChange={(value) =>
                      setEditTeaching({ ...editTeaching, documentUrl: value })
                    }
                    placeholder="https://example.com/document.pdf"
                    accept=".pdf,.doc,.docx,.txt"
                    testId="input-document-url"
                  />
                )}
                <FileUploadField
                  label="Thumbnail Image"
                  value={editTeaching.thumbnailUrl || ""}
                  onChange={(value) =>
                    setEditTeaching({ ...editTeaching, thumbnailUrl: value })
                  }
                  placeholder="Enter thumbnail URL..."
                  accept="image/*"
                  testId="input-thumbnail-url"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editTeaching.isPublic ?? true}
                    onCheckedChange={(checked) =>
                      setEditTeaching({ ...editTeaching, isPublic: checked })
                    }
                    data-testid="switch-public"
                  />
                  <Label>Public (No registration required)</Label>
                </div>
                <DialogFooter>
                  <Button onClick={handleSave} data-testid="button-save-teaching">
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Courses Management Component
function CoursesManagement() {
  const { toast } = useToast();
  const [editCourse, setEditCourse] = useState<Partial<Course> | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<Partial<Lesson> | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${selectedCourseId}/lessons`],
    enabled: !!selectedCourseId,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: Omit<Course, "id">) => {
      return apiRequest("POST", "/api/admin/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course created successfully" });
      setIsCourseDialogOpen(false);
      setEditCourse(null);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: Partial<Course> & { id: string }) => {
      const { id, ...body } = data;
      return apiRequest("PATCH", `/api/admin/courses/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course updated successfully" });
      setIsCourseDialogOpen(false);
      setEditCourse(null);
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course deleted successfully" });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: Omit<Lesson, "id">) => {
      return apiRequest("POST", "/api/admin/lessons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/lessons`] });
      toast({ title: "Lesson created successfully" });
      setIsLessonDialogOpen(false);
      setEditLesson(null);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async (data: Partial<Lesson> & { id: string }) => {
      const { id, ...body } = data;
      return apiRequest("PATCH", `/api/admin/lessons/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/lessons`] });
      toast({ title: "Lesson updated successfully" });
      setIsLessonDialogOpen(false);
      setEditLesson(null);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/lessons`] });
      toast({ title: "Lesson deleted successfully" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Courses Management</CardTitle>
          <Button
            onClick={() => {
              setEditCourse({
                title: "",
                description: "",
                thumbnailUrl: "",
                isPublic: true,
              });
              setIsCourseDialogOpen(true);
            }}
            data-testid="button-add-course"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses?.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4"
                data-testid={`course-item-${course.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold" data-testid={`text-course-title-${course.id}`}>
                      {course.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourseId(course.id)}
                      data-testid={`button-view-lessons-${course.id}`}
                    >
                      View Lessons
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditCourse(course);
                        setIsCourseDialogOpen(true);
                      }}
                      data-testid={`button-edit-course-${course.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this course and all its lessons?")) {
                          deleteCourseMutation.mutate(course.id);
                        }
                      }}
                      data-testid={`button-delete-course-${course.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCourseId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lessons for Selected Course</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditLesson({
                    courseId: selectedCourseId,
                    title: "",
                    description: "",
                    videoUrl: "",
                    order: (lessons?.length || 0) + 1,
                  });
                  setIsLessonDialogOpen(true);
                }}
                data-testid="button-add-lesson"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedCourseId(null)}
                data-testid="button-close-lessons"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons?.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 border rounded"
                  data-testid={`lesson-item-${lesson.id}`}
                >
                  <div>
                    <p className="font-medium" data-testid={`text-lesson-title-${lesson.id}`}>
                      {lesson.order}. {lesson.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditLesson(lesson);
                        setIsLessonDialogOpen(true);
                      }}
                      data-testid={`button-edit-lesson-${lesson.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this lesson?")) {
                          deleteLessonMutation.mutate(lesson.id);
                        }
                      }}
                      data-testid={`button-delete-lesson-${lesson.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCourse?.id ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          {editCourse && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editCourse.title || ""}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, title: e.target.value })
                  }
                  data-testid="input-course-title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editCourse.description || ""}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, description: e.target.value })
                  }
                  data-testid="input-course-description"
                />
              </div>
              <FileUploadField
                label="Thumbnail Image"
                value={editCourse.thumbnailUrl || ""}
                onChange={(value) =>
                  setEditCourse({ ...editCourse, thumbnailUrl: value })
                }
                placeholder="Enter thumbnail URL..."
                accept="image/*"
                testId="input-course-thumbnail"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editCourse.isPublic ?? true}
                  onCheckedChange={(checked) =>
                    setEditCourse({ ...editCourse, isPublic: checked })
                  }
                  data-testid="switch-course-public"
                />
                <Label>Public</Label>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (editCourse.id) {
                      updateCourseMutation.mutate(editCourse as Course);
                    } else {
                      createCourseMutation.mutate(editCourse as Omit<Course, "id">);
                    }
                  }}
                  data-testid="button-save-course"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editLesson?.id ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
          </DialogHeader>
          {editLesson && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editLesson.title || ""}
                  onChange={(e) =>
                    setEditLesson({ ...editLesson, title: e.target.value })
                  }
                  data-testid="input-lesson-title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editLesson.description || ""}
                  onChange={(e) =>
                    setEditLesson({ ...editLesson, description: e.target.value })
                  }
                  data-testid="input-lesson-description"
                />
              </div>
              <div>
                <Label>Content Type</Label>
                <Select
                  value={editLesson.contentType || "video"}
                  onValueChange={(value) =>
                    setEditLesson({ ...editLesson, contentType: value })
                  }
                >
                  <SelectTrigger data-testid="select-lesson-content-type">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="youtube">YouTube Embed</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Document (PDF/Word/Text)</SelectItem>
                    <SelectItem value="mixed">Video + Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editLesson.contentType === "video" || editLesson.contentType === "mixed" || !editLesson.contentType || editLesson.contentType === "youtube") && (
                <FileUploadField
                  label="Video/YouTube URL"
                  value={editLesson.videoUrl || ""}
                  onChange={(value) =>
                    setEditLesson({ ...editLesson, videoUrl: value })
                  }
                  placeholder="https://youtube.com/watch?v=... or video file URL"
                  accept="video/*"
                  testId="input-lesson-video"
                />
              )}
              {(editLesson.contentType === "audio" || editLesson.contentType === "mixed") && (
                <FileUploadField
                  label="Audio File"
                  value={editLesson.audioUrl || ""}
                  onChange={(value) =>
                    setEditLesson({ ...editLesson, audioUrl: value })
                  }
                  placeholder="Enter audio URL..."
                  accept="audio/*"
                  testId="input-lesson-audio"
                />
              )}
              {(editLesson.contentType === "document" || editLesson.contentType === "mixed") && (
                <FileUploadField
                  label="Document (PDF, Word, or Text file)"
                  value={editLesson.documentUrl || ""}
                  onChange={(value) =>
                    setEditLesson({ ...editLesson, documentUrl: value })
                  }
                  placeholder="https://example.com/document.pdf"
                  accept=".pdf,.doc,.docx,.txt"
                  testId="input-lesson-document"
                />
              )}
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={editLesson.order || 1}
                  onChange={(e) =>
                    setEditLesson({ ...editLesson, order: parseInt(e.target.value) })
                  }
                  data-testid="input-lesson-order"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (editLesson.id) {
                      updateLessonMutation.mutate(editLesson as Lesson);
                    } else {
                      createLessonMutation.mutate(editLesson as Omit<Lesson, "id">);
                    }
                  }}
                  data-testid="button-save-lesson"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Channels Management Component
function ChannelsManagement() {
  const { toast } = useToast();
  const [editChannel, setEditChannel] = useState<Partial<VoiceChannel> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: channels, isLoading } = useQuery<VoiceChannel[]>({
    queryKey: ["/api/voice-channels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<VoiceChannel, "id">) => {
      return apiRequest("POST", "/api/admin/voice-channels", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({ title: "Channel created successfully" });
      setIsDialogOpen(false);
      setEditChannel(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<VoiceChannel> & { id: string }) => {
      const { id, ...body } = data;
      return apiRequest("PATCH", `/api/admin/voice-channels/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({ title: "Channel updated successfully" });
      setIsDialogOpen(false);
      setEditChannel(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/voice-channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({ title: "Channel deleted successfully" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading channels...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Voice Channels Management</CardTitle>
        <Button
          onClick={() => {
            setEditChannel({
              name: "",
              description: "",
              isActive: true,
            });
            setIsDialogOpen(true);
          }}
          data-testid="button-add-channel"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channels?.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between p-4 border rounded-lg"
              data-testid={`channel-item-${channel.id}`}
            >
              <div>
                <p className="font-semibold" data-testid={`text-channel-name-${channel.id}`}>
                  {channel.name}
                </p>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {channel.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditChannel(channel);
                    setIsDialogOpen(true);
                  }}
                  data-testid={`button-edit-channel-${channel.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this channel?")) {
                      deleteMutation.mutate(channel.id);
                    }
                  }}
                  data-testid={`button-delete-channel-${channel.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editChannel?.id ? "Edit Channel" : "Add Channel"}
              </DialogTitle>
            </DialogHeader>
            {editChannel && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editChannel.name || ""}
                    onChange={(e) =>
                      setEditChannel({ ...editChannel, name: e.target.value })
                    }
                    data-testid="input-channel-name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editChannel.description || ""}
                    onChange={(e) =>
                      setEditChannel({ ...editChannel, description: e.target.value })
                    }
                    data-testid="input-channel-description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editChannel.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setEditChannel({ ...editChannel, isActive: checked })
                    }
                    data-testid="switch-channel-active"
                  />
                  <Label>Active</Label>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (editChannel.id) {
                        updateMutation.mutate(editChannel as VoiceChannel);
                      } else {
                        createMutation.mutate(editChannel as Omit<VoiceChannel, "id">);
                      }
                    }}
                    data-testid="button-save-channel"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Prayer Requests Management Component
function PrayersManagement() {
  const { toast } = useToast();

  const { data: prayers, isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayer-requests"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/prayer-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      toast({ title: "Prayer request deleted successfully" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading prayer requests...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer Requests Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prayers?.map((prayer) => (
            <div
              key={prayer.id}
              className="flex items-start justify-between p-4 border rounded-lg"
              data-testid={`prayer-item-${prayer.id}`}
            >
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {prayer.isAnonymous ? "Anonymous" : `User ID: ${prayer.userId}`}
                </p>
                <p className="text-foreground" data-testid={`text-prayer-content-${prayer.id}`}>
                  {prayer.content}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this prayer request?")) {
                    deleteMutation.mutate(prayer.id);
                  }
                }}
                data-testid={`button-delete-prayer-${prayer.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Site Settings Management Component
function SiteSettingsManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});

  const { data: fetchedSettings, isLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("PUT", "/api/admin/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully! Changes will appear after refresh." });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  const textSizes = ["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
  const cardSizes = ["compact", "normal", "large"];
  const cardCounts = [2, 3, 4];
  const spacings = ["compact", "normal", "spacious"];
  const widths = ["5xl", "6xl", "7xl", "full"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Site Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Basic information about your website
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings.siteName || ""}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="Fellowship Hub"
              data-testid="input-site-name"
            />
          </div>
          <div>
            <Label>Site Tagline</Label>
            <Input
              value={settings.siteTagline || ""}
              onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
              placeholder="Resources for Spiritual Growth"
              data-testid="input-site-tagline"
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={settings.contactEmail || ""}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="contact@fellowshiphub.com"
              data-testid="input-contact-email"
            />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input
              value={settings.contactPhone || ""}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              placeholder="(555) 123-4567"
              data-testid="input-contact-phone"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="123 Faith Street, City, State ZIP"
              data-testid="input-address"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize the text on your homepage
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero Title</Label>
            <Input
              value={settings.heroTitle || ""}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              placeholder="Welcome to Our Christian Community"
              data-testid="input-hero-title"
            />
          </div>
          <div>
            <Label>Hero Subtitle</Label>
            <Textarea
              value={settings.heroSubtitle || ""}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              placeholder="Join us in worship, fellowship, and spiritual growth"
              data-testid="input-hero-subtitle"
            />
          </div>
          <div>
            <Label>Features Section Title</Label>
            <Input
              value={settings.featuresTitle || ""}
              onChange={(e) => setSettings({ ...settings, featuresTitle: e.target.value })}
              placeholder="Resources for Spiritual Growth"
              data-testid="input-features-title"
            />
          </div>
          <div>
            <Label>Features Section Subtitle</Label>
            <Input
              value={settings.featuresSubtitle || ""}
              onChange={(e) => setSettings({ ...settings, featuresSubtitle: e.target.value })}
              placeholder="Everything you need to grow in your faith"
              data-testid="input-features-subtitle"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design & Layout</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control text sizes, card layouts, and spacing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Text Sizes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hero Title Size</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.typography?.heroTitleSize || "3xl"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      typography: { ...settings.typography, heroTitleSize: e.target.value },
                    })
                  }
                  data-testid="select-hero-title-size"
                >
                  {textSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Hero Subtitle Size</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.typography?.heroSubtitleSize || "xl"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      typography: { ...settings.typography, heroSubtitleSize: e.target.value },
                    })
                  }
                  data-testid="select-hero-subtitle-size"
                >
                  {textSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Section Title Size</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.typography?.sectionTitleSize || "2xl"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      typography: { ...settings.typography, sectionTitleSize: e.target.value },
                    })
                  }
                  data-testid="select-section-title-size"
                >
                  {textSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Card Title Size</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.typography?.cardTitleSize || "lg"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      typography: { ...settings.typography, cardTitleSize: e.target.value },
                    })
                  }
                  data-testid="select-card-title-size"
                >
                  {textSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Layout Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Card Size</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.layout?.cardSize || "normal"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      layout: { ...settings.layout, cardSize: e.target.value },
                    })
                  }
                  data-testid="select-card-size"
                >
                  {cardSizes.map((size) => (
                    <option key={size} value={size}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Cards Per Row</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.layout?.cardsPerRow || 3}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      layout: { ...settings.layout, cardsPerRow: parseInt(e.target.value) },
                    })
                  }
                  data-testid="select-cards-per-row"
                >
                  {cardCounts.map((count) => (
                    <option key={count} value={count}>
                      {count} cards
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Section Spacing</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.layout?.sectionSpacing || "normal"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      layout: { ...settings.layout, sectionSpacing: e.target.value },
                    })
                  }
                  data-testid="select-section-spacing"
                >
                  {spacings.map((spacing) => (
                    <option key={spacing} value={spacing}>
                      {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Max Content Width</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.layout?.maxContentWidth || "7xl"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      layout: { ...settings.layout, maxContentWidth: e.target.value },
                    })
                  }
                  data-testid="select-max-width"
                >
                  {widths.map((width) => (
                    <option key={width} value={width}>
                      {width}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
          data-testid="button-save-settings"
        >
          {updateMutation.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
