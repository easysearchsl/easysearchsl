import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [email] = useState(user?.email || "");

  const handleSave = () => {
    // TODO: wire to Supabase update when backend ready
    console.log("Save profile", { name });
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile / Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Password reset and 2FA coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
