"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

interface UserProfile {
  directorName: string;
  position: string;
  documentNumber: string;
  contact: string;
  notifyEmail: string;
}

interface ProfileSettingsFormProps {
  onClose: () => void;
}

export function ProfileSettingsForm({ onClose }: ProfileSettingsFormProps) {
  const { user, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    directorName: "",
    position: "",
    documentNumber: "",
    contact: "",
    notifyEmail: "",
  });

  useEffect(() => {
    console.log(user);
    
    if (user) {
      setFormData({
        directorName: user.director || "",
        position: user.position || "",
        documentNumber: user.documentNumber || "",
        contact: user.contact || "",
        notifyEmail: user.notifyEmail || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
        cache: "no-store",
        body: JSON.stringify({
          directorName: formData.directorName,
          position: formData.position,
          documentNumber: formData.documentNumber,
          contact: formData.contact,
          notifyEmail: formData.notifyEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const updatedUser: any = await response.json();

      // If the API returned the updated user, update the local form state
      if (updatedUser) {
        setFormData({
          directorName: updatedUser.director || "",
          position: updatedUser.position || "",
          documentNumber: updatedUser.documentNumber || "",
          contact: updatedUser.contact || "",
          notifyEmail: updatedUser.notifyEmail || "",
        });
      }

      // Ensure auth/user context is fresh
      await checkAuth();

      toast.success("บันทึกข้อมูลสำเร็จ");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="directorName">ชื่อผู้อำนวยการ</Label>
          <Input
            id="directorName"
            value={formData.directorName}
            onChange={(e) => handleInputChange("directorName", e.target.value)}
            placeholder="ชื่อผู้อำนวยการ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">ตำแหน่ง</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            placeholder="ตำแหน่ง"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber">เลขที่หนังสือ</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => handleInputChange("documentNumber", e.target.value)}
            placeholder="เลขที่หนังสือ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">หมายเลขติดต่อ</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) => handleInputChange("contact", e.target.value)}
            placeholder="หมายเลขติดต่อ"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notifyEmail">อีเมล์</Label>
          <Input
            id="notifyEmail"
            type="email"
            value={formData.notifyEmail}
            onChange={(e) => handleInputChange("notifyEmail", e.target.value)}
            placeholder="อีเมล์"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </div>
    </form>
  );
}