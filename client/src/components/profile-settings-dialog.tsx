import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus } from "lucide-react";
import type { UpdateUserProfile } from "@shared/schema";

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [ministryPreferences, setMinistryPreferences] = useState<string[]>(user?.ministryPreferences || []);
  const [wantToLearn, setWantToLearn] = useState<string[]>(user?.wantToLearn || []);
  const [wantToTeach, setWantToTeach] = useState<string[]>(user?.wantToTeach || []);
  const [privacySettings, setPrivacySettings] = useState(user?.privacySettings as any || {
    showRealName: true,
    showEmail: false,
    showInterests: true,
    showMinistryPreferences: true,
    showLearningGoals: true,
    showTeachingOfferings: true,
  });

  const [newInterest, setNewInterest] = useState("");
  const [newMinistry, setNewMinistry] = useState("");
  const [newLearn, setNewLearn] = useState("");
  const [newTeach, setNewTeach] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      return await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your fellowship profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fellowship/members"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      nickname: nickname || undefined,
      interests,
      ministryPreferences,
      wantToLearn,
      wantToTeach,
      privacySettings,
    });
  };

  const addItem = (value: string, setter: (items: string[]) => void, items: string[], inputSetter: (val: string) => void) => {
    if (value.trim() && !items.includes(value.trim())) {
      setter([...items, value.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (index: number, setter: (items: string[]) => void, items: string[]) => {
    setter(items.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="heading-profile-settings">Fellowship Profile Settings</DialogTitle>
          <DialogDescription>
            Customize your fellowship profile and privacy settings. Control what information other members can see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Display Nickname (Optional)</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter a nickname to display instead of your real name"
              data-testid="input-nickname"
            />
            <p className="text-sm text-muted-foreground">
              If you prefer not to show your real name, enter a nickname here.
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Interests & Hobbies</Label>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newInterest, setInterests, interests, setNewInterest);
                  }
                }}
                placeholder="Add an interest (e.g., Music, Sports, Reading)"
                data-testid="input-interests"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem(newInterest, setInterests, interests, setNewInterest)}
                data-testid="button-add-interest"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-interest-${index}`}>
                  {interest}
                  <button
                    onClick={() => removeItem(index, setInterests, interests)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-interest-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Ministry Preferences */}
          <div className="space-y-2">
            <Label>Ministry Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={newMinistry}
                onChange={(e) => setNewMinistry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newMinistry, setMinistryPreferences, ministryPreferences, setNewMinistry);
                  }
                }}
                placeholder="Add a ministry area (e.g., Youth, Worship, Outreach)"
                data-testid="input-ministry"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem(newMinistry, setMinistryPreferences, ministryPreferences, setNewMinistry)}
                data-testid="button-add-ministry"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ministryPreferences.map((ministry, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-ministry-${index}`}>
                  {ministry}
                  <button
                    onClick={() => removeItem(index, setMinistryPreferences, ministryPreferences)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-ministry-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Want to Learn */}
          <div className="space-y-2">
            <Label>What I Want to Learn</Label>
            <div className="flex gap-2">
              <Input
                value={newLearn}
                onChange={(e) => setNewLearn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newLearn, setWantToLearn, wantToLearn, setNewLearn);
                  }
                }}
                placeholder="Add a learning goal (e.g., Bible Study, Prayer, Leadership)"
                data-testid="input-learn"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem(newLearn, setWantToLearn, wantToLearn, setNewLearn)}
                data-testid="button-add-learn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {wantToLearn.map((learn, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-learn-${index}`}>
                  {learn}
                  <button
                    onClick={() => removeItem(index, setWantToLearn, wantToLearn)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-learn-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Want to Teach */}
          <div className="space-y-2">
            <Label>What I Can Teach/Share</Label>
            <div className="flex gap-2">
              <Input
                value={newTeach}
                onChange={(e) => setNewTeach(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newTeach, setWantToTeach, wantToTeach, setNewTeach);
                  }
                }}
                placeholder="Add a teaching offering (e.g., Music, Technology, Counseling)"
                data-testid="input-teach"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem(newTeach, setWantToTeach, wantToTeach, setNewTeach)}
                data-testid="button-add-teach"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {wantToTeach.map((teach, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-teach-${index}`}>
                  {teach}
                  <button
                    onClick={() => removeItem(index, setWantToTeach, wantToTeach)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-teach-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">
              Control what information is visible to other fellowship members.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-real-name" className="flex-1">Show Real Name</Label>
                <Switch
                  id="show-real-name"
                  checked={privacySettings.showRealName}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showRealName: checked })
                  }
                  data-testid="switch-show-real-name"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="flex-1">Show Email Address</Label>
                <Switch
                  id="show-email"
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showEmail: checked })
                  }
                  data-testid="switch-show-email"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-interests" className="flex-1">Show Interests</Label>
                <Switch
                  id="show-interests"
                  checked={privacySettings.showInterests}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showInterests: checked })
                  }
                  data-testid="switch-show-interests"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-ministry" className="flex-1">Show Ministry Preferences</Label>
                <Switch
                  id="show-ministry"
                  checked={privacySettings.showMinistryPreferences}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showMinistryPreferences: checked })
                  }
                  data-testid="switch-show-ministry"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-learning" className="flex-1">Show Learning Goals</Label>
                <Switch
                  id="show-learning"
                  checked={privacySettings.showLearningGoals}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showLearningGoals: checked })
                  }
                  data-testid="switch-show-learning"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-teaching" className="flex-1">Show Teaching Offerings</Label>
                <Switch
                  id="show-teaching"
                  checked={privacySettings.showTeachingOfferings}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showTeachingOfferings: checked })
                  }
                  data-testid="switch-show-teaching"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-profile"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
