"use client";

import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, KeyRound, Mail, Calendar, Pencil, Shield, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DbUser {
  client_name?: string;
  is_admin?: number;
  address?: string | null;
  created_at?: string;
  role?: number; 
}

type OtherContact = {
  id: number;
  student_uuid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

const roleMap: Record<number, string> = {
  0: "Teacher",
  1: "Admin",
  2: "Student",
  3: "Enterprise",
};

function providerLabel(user: User): string {
  const appProvider = (user.app_metadata as { provider?: unknown } | undefined)
    ?.provider;
  const userProvider = (user.user_metadata as { provider?: unknown } | undefined)
    ?.provider;
  const raw = typeof appProvider === "string" ? appProvider : typeof userProvider === "string" ? userProvider : "";
  const p = raw.trim().toLowerCase();
  if (!p || p === "email") return "Email & Password";
  return p;
}

function isEmailLogin(user: User): boolean {
  const appProvider = (user.app_metadata as { provider?: unknown } | undefined)
    ?.provider;
  const userProvider = (user.user_metadata as { provider?: unknown } | undefined)
    ?.provider;
  const raw =
    typeof appProvider === "string"
      ? appProvider
      : typeof userProvider === "string"
        ? userProvider
        : "";
  const p = raw.trim().toLowerCase();
  return !p || p === "email";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">
      {children}
    </p>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition"
    />
  );
}

type ContactModalMode = "create" | "edit" | "delete";

function ContactModal({
  mode,
  studentUuid,
  contact,
  onClose,
  onCreated,
  onUpdated,
  onDeleted,
}: {
  mode: ContactModalMode;
  studentUuid: string;
  contact?: OtherContact;
  onClose: () => void;
  onCreated: (c: OtherContact) => void;
  onUpdated: (c: OtherContact) => void;
  onDeleted: (id: number) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setErr(null);
    setSubmitting(true);
    try {
      if (mode === "delete") {
        if (!contact) {
          setErr("Missing contact.");
          return;
        }
        const { error } = await supabase
          .from("other_contacts")
          .delete()
          .eq("id", contact.id)
          .eq("student_uuid", studentUuid);
        if (error) {
          setErr(error.message);
          return;
        }
        onDeleted(contact.id);
        setDone(true);
        return;
      }

      const n = name.trim();
      const e = email.trim();
      const p = phone.trim();
      if (!n) return;

      if (mode === "edit") {
        if (!contact) {
          setErr("Missing contact.");
          return;
        }
        const { data, error } = await supabase
          .from("other_contacts")
          .update({
            name: n,
            email: e ? e : null,
            phone: p ? p : null,
          })
          .eq("id", contact.id)
          .eq("student_uuid", studentUuid)
          .select("*")
          .single<OtherContact>();
        if (error) {
          setErr(error.message);
          return;
        }
        if (data) onUpdated(data);
        setDone(true);
        return;
      }

      const { data, error } = await supabase
        .from("other_contacts")
        .insert({
          student_uuid: studentUuid,
          name: n,
          email: e ? e : null,
          phone: p ? p : null,
        })
        .select("*")
        .single<OtherContact>();
      if (error) {
        setErr(error.message);
        return;
      }
      if (data) onCreated(data);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const successTitle =
      mode === "delete"
        ? "Contact Deleted"
        : mode === "edit"
          ? "Contact Updated"
          : "Contact Added";
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={28} className="text-[#9b7fe8]" />
          <p className="text-white/60 text-xs uppercase tracking-[0.18em]">
            {successTitle}
          </p>
          <p className="text-white/25 text-xs">
            {mode === "delete"
              ? "The contact was removed."
              : "Your contact was saved."}
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === "delete" ? (
              <Trash2 size={14} className="text-[#e8629a]" />
            ) : mode === "edit" ? (
              <Pencil size={14} className="text-[#e8629a]" />
            ) : (
              <UserIcon size={14} className="text-[#e8629a]" />
            )}
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
              {mode === "delete"
                ? "Delete Contact"
                : mode === "edit"
                  ? "Edit Contact"
                  : "Add New Contact"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition text-lg leading-none"
          >
            ×
          </button>
        </div>
        {mode === "delete" ? (
          <div className="space-y-2">
            <p className="text-white/40 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white/70 font-medium">
                {contact?.name || "this contact"}
              </span>
              ?
            </p>
            <p className="text-white/20 text-xs">
              This can’t be undone.
            </p>
            {err && <p className="text-[#e8629a] text-xs">{err}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={name} onChange={setName} placeholder="Full name" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput value={email} onChange={setEmail} placeholder="Email" type="email" />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <TextInput value={phone} onChange={setPhone} placeholder="Phone number" />
            </div>
            {err && <p className="text-[#e8629a] text-xs">{err}</p>}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(mode !== "delete" && !name.trim()) || submitting}
            className={
              mode === "delete"
                ? "flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs uppercase tracking-[0.18em] hover:bg-red-500/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
                : "flex-1 py-2.5 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
            }
          >
            {submitting
              ? mode === "delete"
                ? "Deleting…"
                : "Saving…"
              : mode === "delete"
                ? "Yes, Delete"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAddressModal({
  userUuid,
  initialAddress,
  onClose,
  onUpdated,
}: {
  userUuid: string;
  initialAddress: string;
  onClose: () => void;
  onUpdated: (address: string) => void;
}) {
  const supabase = createClient();
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setErr(null);
    const a = address.trim();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ address: a ? a : null })
        .eq("user_uuid", userUuid);
      if (error) {
        setErr(error.message);
        return;
      }
      onUpdated(a);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={28} className="text-[#9b7fe8]" />
          <p className="text-white/60 text-xs uppercase tracking-[0.18em]">
            Address Updated
          </p>
          <p className="text-white/25 text-xs">Your address was saved.</p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pencil size={14} className="text-[#e8629a]" />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
              Edit Address
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>Address</FieldLabel>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              placeholder="Street, City, State, ZIP"
              className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition resize-none"
            />
          </div>
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setErr(null);
    if (!password || !confirm) return;
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={28} className="text-[#9b7fe8]" />
          <p className="text-white/60 text-xs uppercase tracking-[0.18em]">
            Password Updated
          </p>
          <p className="text-white/25 text-xs">
            Your password was changed successfully.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound size={14} className="text-[#e8629a]" />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
              Change Password
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>New Password</FieldLabel>
            <TextInput
              value={password}
              onChange={setPassword}
              placeholder="Enter new password"
              type="password"
            />
          </div>
          <div>
            <FieldLabel>Confirm Password</FieldLabel>
            <TextInput
              value={confirm}
              onChange={setConfirm}
              placeholder="Re-enter new password"
              type="password"
            />
          </div>
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password || !confirm || submitting}
            className="flex-1 py-2.5 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangeEmailModal({
  currentEmail,
  onClose,
}: {
  currentEmail: string | null | undefined;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setErr(null);
    const e1 = email.trim();
    const e2 = confirm.trim();
    if (!e1 || !e2) return;
    if (e1 !== e2) {
      setErr("Emails do not match.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e1)) {
      setErr("Enter a valid email address.");
      return;
    }
    if (currentEmail && e1.toLowerCase() === currentEmail.toLowerCase()) {
      setErr("That’s already your current email.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ email: e1 });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={28} className="text-[#9b7fe8]" />
          <p className="text-white/60 text-xs uppercase tracking-[0.18em]">
            Email Updated
          </p>
          <p className="text-white/25 text-xs">
            If email confirmation is enabled, check your inbox to confirm the
            change.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-[#e8629a]" />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
              Change Email
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>New Email</FieldLabel>
            <TextInput
              value={email}
              onChange={setEmail}
              placeholder="Enter new email"
              type="email"
            />
          </div>
          <div>
            <FieldLabel>Confirm Email</FieldLabel>
            <TextInput
              value={confirm}
              onChange={setConfirm}
              placeholder="Re-enter new email"
              type="email"
            />
          </div>
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email || !confirm || submitting}
            className="flex-1 py-2.5 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileView({
  user,
  dbUser,
}: {
  user: User;
  dbUser: DbUser | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [contactModal, setContactModal] = useState<{
    mode: ContactModalMode;
    contact?: OtherContact;
  } | null>(null);
  const [contacts, setContacts] = useState<OtherContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const isStudent = Number(dbUser?.role) === 2;
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [address, setAddress] = useState<string>(
    typeof dbUser?.address === "string" ? dbUser.address : "",
  );
  const canChangeAuthCredentials = isEmailLogin(user);
  const showStudentOnly = mounted && isStudent;
  const showCredentialCards = mounted && canChangeAuthCredentials;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAddress(typeof dbUser?.address === "string" ? dbUser.address : "");
  }, [dbUser?.address]);

  useEffect(() => {
    if (!showCredentialCards) {
      setChangeEmailOpen(false);
      setChangePasswordOpen(false);
    }
  }, [showCredentialCards]);

  useEffect(() => {
    if (!showStudentOnly) return;
    let cancelled = false;
    async function loadContacts() {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("other_contacts")
          .select("*")
          .eq("student_uuid", user.id)
          .order("created_at", { ascending: false })
          .returns<OtherContact[]>();
        if (cancelled) return;
        if (error) {
          setContactsError(error.message);
          setContacts([]);
        } else {
          setContacts(data ?? []);
        }
      } finally {
        if (!cancelled) setContactsLoading(false);
      }
    }
    loadContacts();
    return () => {
      cancelled = true;
    };
  }, [showStudentOnly, user.id]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    console.log("dbUser:", dbUser);
    console.log("role value:", dbUser?.role, "type:", typeof dbUser?.role);
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {showCredentialCards && changePasswordOpen && (
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      )}
      {showCredentialCards && changeEmailOpen && (
        <ChangeEmailModal
          currentEmail={user.email}
          onClose={() => setChangeEmailOpen(false)}
        />
      )}
      {contactModal && (
        <ContactModal
          mode={contactModal.mode}
          studentUuid={user.id}
          contact={contactModal.contact}
          onClose={() => setContactModal(null)}
          onCreated={(c) => setContacts((prev) => [c, ...prev])}
          onUpdated={(c) =>
            setContacts((prev) => prev.map((x) => (x.id === c.id ? c : x)))
          }
          onDeleted={(id) => setContacts((prev) => prev.filter((x) => x.id !== id))}
        />
      )}
      {editAddressOpen && (
        <EditAddressModal
          userUuid={user.id}
          initialAddress={address}
          onClose={() => setEditAddressOpen(false)}
          onUpdated={(a) => setAddress(a)}
        />
      )}

      {/* Client Name Card (if exists) */}
      {dbUser?.client_name && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Name</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbUser.client_name}</div>
            <p className="text-xs text-muted-foreground">Your name</p>
          </CardContent>
        </Card>
      )}

      {/* Email Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{user.email}</div>
          <p className="text-xs text-muted-foreground">Your account email</p>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Address</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {address ? address : "Not set"}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setEditAddressOpen(true)}
          >
            Edit Address
          </Button>
        </CardContent>
      </Card>

      {/* Contacts (Students only) */}
      {showStudentOnly && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add people we can contact on your behalf.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setContactModal({ mode: "create" })}
            >
              Add New Contact
            </Button>
            {contactsError && (
              <p className="mt-3 text-[#e8629a] text-xs">{contactsError}</p>
            )}
            {contactsLoading && (
              <p className="mt-3 text-white/20 text-xs uppercase tracking-[0.18em]">
                Loading contacts…
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {showStudentOnly &&
        !contactsLoading &&
        !contactsError &&
        contacts.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {c.name || "Contact"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Edit contact"
                  onClick={() => setContactModal({ mode: "edit", contact: c })}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  title="Delete contact"
                  onClick={() => setContactModal({ mode: "delete", contact: c })}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.email && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground truncate">{c.email}</span>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <span className="text-sm text-foreground truncate">{c.phone}</span>
                </div>
              )}
              {!c.email && !c.phone && (
                <p className="text-xs text-muted-foreground">
                  No email or phone provided.
                </p>
              )}
            </CardContent>
          </Card>
        ))}

      {/* Change Email Card (email/password only) */}
      {showCredentialCards && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Update the email associated with your account.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setChangeEmailOpen(true)}
            >
              Change Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User ID Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User ID</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate font-mono text-sm">
            {user.id}
          </div>
          <p className="text-xs text-muted-foreground">Unique identifier</p>
        </CardContent>
      </Card>

      {/* Account Created Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Created</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {formatDate(user.created_at)}
          </div>
          <p className="text-xs text-muted-foreground">Account creation date</p>
        </CardContent>
      </Card>

      {/* Change Password Card (email/password only) */}
      {showCredentialCards && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change Password</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Update your password to keep your account secure.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setChangePasswordOpen(true)}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Admin Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Type</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {roleMap[dbUser?.role ?? 0]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your account permissions level
          </p>
        </CardContent>
      </Card>

      {/* Auth Provider Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Login Method</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold capitalize">
            {providerLabel(user)}
          </div>
          <p className="text-xs text-muted-foreground">
            Your primary authentication method
          </p>
        </CardContent>
      </Card>

      {/* Full Details Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Full Profile Information</CardTitle>
          <CardDescription>
            All available information associated with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">Email:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  User ID:
                </span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  Account Created:
                </span>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  Last Sign In:
                </span>
                <span>{formatDate(user.last_sign_in_at)}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  Address:
                </span>
                <span className="text-right whitespace-pre-wrap">
                  {address ? address : "Not set"}
                </span>
              </div>
              {dbUser?.client_name && (
                <div className="flex justify-between items-start border-b pb-3">
                  <span className="font-medium text-muted-foreground">
                    Client Name:
                  </span>
                  <span>{dbUser.client_name}</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">
                  Account Type:
                </span>
                <span>
                  {roleMap[dbUser?.role ?? 0]}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
