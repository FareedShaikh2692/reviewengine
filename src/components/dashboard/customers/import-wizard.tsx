"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Step = "upload" | "map" | "preview" | "done";
type MappedRow = { firstName: string; lastName?: string; email?: string; phone?: string; serviceProduct?: string; purchaseDate?: string; valid: boolean; reason?: string };

const TARGET_FIELDS = [
  { key: "firstName", label: "First Name", required: true, guesses: ["first name", "firstname", "name"] },
  { key: "lastName", label: "Last Name", required: false, guesses: ["last name", "lastname", "surname"] },
  { key: "email", label: "Email", required: false, guesses: ["email", "e-mail"] },
  { key: "phone", label: "Phone", required: false, guesses: ["phone", "mobile", "contact"] },
  { key: "serviceProduct", label: "Service / Product", required: false, guesses: ["service", "product"] },
  { key: "purchaseDate", label: "Purchase Date", required: false, guesses: ["purchase date", "date"] },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ImportWizard() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skippedDuplicate: number } | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        setHeaders(fields);
        setRawRows(results.data.slice(0, 2000));

        const autoMap: Record<string, string> = {};
        for (const target of TARGET_FIELDS) {
          const match = fields.find((h) => target.guesses.some((g) => h.toLowerCase().includes(g)));
          if (match) autoMap[target.key] = match;
        }
        setMapping(autoMap);
        setStep("map");
      },
    });
  }

  function buildMappedRows() {
    const seenEmails = new Set<string>();
    const rows: MappedRow[] = rawRows.map((raw) => {
      const get = (key: string) => (mapping[key] ? raw[mapping[key]]?.trim() : undefined);
      const firstNameRaw = get("firstName") ?? "";
      const [firstName, ...rest] = firstNameRaw.split(" ");
      const email = get("email")?.toLowerCase();

      let valid = true;
      let reason: string | undefined;
      if (!firstName) {
        valid = false;
        reason = "Missing name";
      } else if (email && !EMAIL_RE.test(email)) {
        valid = false;
        reason = "Invalid email";
      } else if (email && seenEmails.has(email)) {
        valid = false;
        reason = "Duplicate in file";
      }
      if (email && valid) seenEmails.add(email);

      return {
        firstName: firstName || firstNameRaw,
        lastName: get("lastName") || rest.join(" ") || undefined,
        email,
        phone: get("phone"),
        serviceProduct: get("serviceProduct"),
        purchaseDate: get("purchaseDate"),
        valid,
        reason,
      };
    });
    setMappedRows(rows);
    setStep("preview");
  }

  async function doImport() {
    setImporting(true);
    const validRows = mappedRows.filter((r) => r.valid);
    const res = await fetch("/api/customers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: validRows }),
    });
    const data = await res.json();
    setImporting(false);
    if (res.ok) {
      setResult(data);
      setStep("done");
    }
  }

  const validCount = mappedRows.filter((r) => r.valid).length;

  return (
    <Card className="mt-6">
      {step === "upload" && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center transition hover:border-brand-mid"
          onClick={() => fileInput.current?.click()}
        >
          <Upload className="h-8 w-8 text-ink-400" />
          <p className="mt-3 text-sm font-medium text-ink-900">Click to upload a CSV file</p>
          <p className="mt-1 text-xs text-ink-500">Excel files: export as CSV first, then upload.</p>
          <input ref={fileInput} type="file" accept=".csv" className="hidden" onChange={onFile} />
        </div>
      )}

      {step === "map" && (
        <div>
          <p className="text-sm text-ink-500">
            Uploaded <span className="font-medium text-ink-900">{fileName}</span> — {rawRows.length} rows found. Map
            your columns below.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {TARGET_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label} {field.required && <span className="text-danger">*</span>}
                </Label>
                <Select
                  id={field.key}
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value }))}
                >
                  <option value="">— none —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep("upload")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={buildMappedRows} disabled={!mapping.firstName}>
              Validate & preview <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">{validCount} valid</Badge>
            <Badge variant="danger">{mappedRows.length - validCount} skipped</Badge>
          </div>
          <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-muted text-left text-xs uppercase text-ink-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mappedRows.slice(0, 100).map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">{r.firstName} {r.lastName}</td>
                    <td className="px-3 py-2 text-ink-500">{r.email ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-500">{r.phone ?? "—"}</td>
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Valid</Badge>
                      ) : (
                        <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> {r.reason}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep("map")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={doImport} disabled={importing || validCount === 0}>
              {importing ? "Importing…" : `Import ${validCount} customers`}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-ink-900">Import complete</h2>
          <p className="mt-2 text-sm text-ink-500">
            Imported {result.imported} customers. Skipped {result.skippedDuplicate} duplicates.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/customers")}>
            Go to customers
          </Button>
        </div>
      )}
    </Card>
  );
}
