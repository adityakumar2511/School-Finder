"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: Date | string;
};

type Props = {
  user: ProfileUser;
};

export default function ProfileForm({ user: initialUser }: Props) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name ?? "");
  const [phone, setPhone] = useState(initialUser.phone ?? "");
  const [image, setImage] = useState(initialUser.image ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createdLabel = new Date(user.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const previous = { name: user.name, phone: user.phone, image: user.image };
    setUser((u) => ({
      ...u,
      name: name.trim() || null,
      phone: phone.trim() || null,
      image: image.trim() || null,
    }));

    try {
      const res = await fetch("/api/parent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          image: image.trim(),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUser((u) => ({ ...u, ...previous }));
        setError(body.message ?? "Failed to update profile");
        return;
      }

      if (body.user) {
        setUser(body.user);
        setName(body.user.name ?? "");
        setPhone(body.user.phone ?? "");
        setImage(body.user.image ?? "");
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setUser((u) => ({ ...u, ...previous }));
      setError("Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const avatarUrl = user.image || image;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-gray-100 shadow-card rounded-2xl lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-blue-800">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.name ?? "Profile"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-blue-400" />
              )}
            </div>
            <div>
              <p className="font-heading font-semibold text-gray-800">{user.name ?? "Parent"}</p>
              <p className="font-body text-meta text-gray-500">{user.email}</p>
            </div>
          </div>
          <dl className="space-y-3 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 font-body">Role</dt>
              <dd className="font-heading font-semibold text-gray-800">Parent</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 font-body">Member since</dt>
              <dd className="font-body text-gray-800 text-right">{createdLabel}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-card rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-blue-800">Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg border border-danger-text/20 px-4 py-3">
              <p className="font-body text-sm text-danger-text">{error}</p>
            </div>
          )}
          {success && (
            <div className="alert-success mb-4">
              <p>Profile updated successfully.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" value={user.email} readOnly disabled className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Profile image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 font-heading"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
