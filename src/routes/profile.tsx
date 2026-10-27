
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Mail, MapPin, GraduationCap, Camera } from "lucide-react";
import { me } from "@/lib/data";
import { card, chip, ghostBtn } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — BDE ESHRA" },
      { name: "description", content: "Votre profil étudiant BDE ESHRA." },
    ],
  }),
  component: Page,
});

function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          setMessage("Connectez-vous pour consulter votre profil.");
          return;
        }

        const user = authData.user;

        setUserId(user.id);
        setEmail(user.email ?? "");

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, study_program, study_year, bio, avatar_path")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        setFullName(
          data?.full_name ||
            user.user_metadata?.["full_name"] ||
            ""
        );
        setProgram(data?.study_program ?? "");
        setStudyYear(data?.study_year ?? "");
        setBio(data?.bio ?? "");
        setAvatarPath(data?.avatar_path ?? null);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger le profil."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const avatarUrl = avatarPath
    ? supabase.storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl
    : null;

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ES";

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Connectez-vous pour modifier votre profil.");
      return;
    }

    setSaving(true);

    try {
      let newAvatarPath = avatarPath;

      if (photoFile) {
        if (photoFile.size > 2 * 1024 * 1024) {
          throw new Error("La photo doit faire 2 Mo maximum.");
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(photoFile.type)) {
          throw new Error("Utilisez une image JPG, PNG ou WebP.");
        }

        const extension = photoFile.type === "image/jpeg"
          ? "jpg"
          : photoFile.type === "image/png"
            ? "png"
            : "webp";

        const path = `${userId}/avatar-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, photoFile, {
            upsert: false,
            contentType: photoFile.type,
          });

        if (uploadError) throw uploadError;
        newAvatarPath = path;
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            study_program: program.trim(),
            study_year: studyYear.trim(),
            bio: bio.trim(),
            avatar_path: newAvatarPath,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (saveError) throw saveError;

      setAvatarPath(newAvatarPath);
      setPhotoFile(null);
      setEditing(false);
      setMessage("Profil enregistré avec succès !");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer le profil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6 text-muted-foreground">Chargement du profil...</p>;
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="h-28 bg-brand-soft" />

        <div className="-mt-12 px-6 pb-6">
          <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-card bg-primary font-display text-3xl font-bold text-primary-foreground">
            {photoFile ? (
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Aperçu de la photo"
                className="h-full w-full object-cover"
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Photo de profil"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <h1 className="mt-3 text-3xl font-semibold">
            {fullName || "Étudiant ESHRA"}
          </h1>

          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            {program || "Programme d'études à renseigner"}
            {studyYear ? ` · ${studyYear}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="break-all">{email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {me.city}
            </span>
          </div>

          {bio && <p className="mt-4 whitespace-pre-wrap">{bio}</p>}

          <Button
            variant="ghost"
            className={`${ghostBtn} mt-5`}
            onClick={() => {
              setMessage("");
              setEditing(!editing);
            }}
          >
            {editing ? "Annuler" : "Modifier le profil"}
          </Button>

          {editing && (
            <form onSubmit={handleSave} className="mt-5 max-w-xl space-y-4">
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nom complet
                </label>
                <input
                  id="fullName"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-md border bg-muted px-3 py-2"
                />
                <p className="text-xs text-muted-foreground">
                  L'adresse e-mail provient de votre compte connecté.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="program" className="text-sm font-medium">
                  Programme d'études
                </label>
                <input
                  id="program"
                  maxLength={100}
                  value={program}
                  onChange={(event) => setProgram(event.target.value)}
                  placeholder="Ex. Hospitality Management"
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="studyYear" className="text-sm font-medium">
                  Année d'études
                </label>
                <input
                  id="studyYear"
                  maxLength={50}
                  value={studyYear}
                  onChange={(event) => setStudyYear(event.target.value)}
                  placeholder="Ex. 3e année"
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bio" className="text-sm font-medium">
                  À propos de moi
                </label>
                <textarea
                  id="bio"
                  maxLength={500}
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Présentez-vous en quelques phrases..."
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="photo" className="flex items-center gap-2 text-sm font-medium">
                  <Camera className="h-4 w-4" />
                  Photo de profil
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setPhotoFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou WebP — 2 Mo maximum.
                </p>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          )}

          {message && (
            <p role="status" aria-live="polite" className="mt-4 text-sm">
              {message}
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className="text-xl">Points BDE</h2>
          <p className="mt-2 font-display text-5xl text-brand">{me.points}</p>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div className="h-2 w-[68%] rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            160 points avant le niveau Or
          </p>
        </div>

        <div className={card}>
          <h2 className="text-xl">Mes clubs</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {me.clubs.map((club) => (
              <span key={club} className={chip}>{club}</span>
            ))}
          </div>

          <h2 className="mt-5 text-xl">Badges</h2>
          <ul className="mt-3 space-y-2">
            {me.badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-brand" />
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
