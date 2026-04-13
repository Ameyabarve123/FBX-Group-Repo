// "use client";

// import { useState, useEffect } from "react";
// import {
//   Package,
//   TicketCheck,
//   ExternalLink,
//   Truck,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Copy,
//   Check,
//   Trash2,
//   GraduationCap,
//   Tent,
//   UserPlus,
//   LucideIcon,
// } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";
// import OrderModal from "@/components/dashboardComponents/orderModal";

// // ─── TYPES ────────────────────────────────────────────────────────────────────

// interface DBOrder {
//   id: string;
//   order_title: string;
//   description: string;
//   price: string;
//   tracking_number: string;
//   user_uuid: string;
// }

// interface DBUser {
//   id: string;
//   client_name: string;
//   is_admin: number;
//   user_uuid: string;
// }

// interface DBTicket {
//   id: string;
//   title: string;
//   contact_details: string;
//   ticket_details: string;
//   client_name: string;
//   user_uuid: string;
//   resolved: number;
// }

// interface DBCourse {
//   id: string;
//   course_link: string;
//   course_uuid: string;
//   course_name: string;
// }

// interface DBStudentCourse {
//   id: string;
//   course_uuid: string;
//   student_email: string;
//   client_uuid: string;
// }

// interface ModalOrder {
//   title: string;
//   description: string;
//   price: string;
//   trackingNumber: string;
// }

// // ─── ACCENT CONFIGS ───────────────────────────────────────────────────────────

// const ACCENTS = {
//   pink:   { text: "text-[#e8629a]", bg: "bg-[#e8629a]/15", border: "border-[#e8629a]/30", hex: "#e8629a" },
//   violet: { text: "text-[#9b7fe8]", bg: "bg-[#9b7fe8]/15", border: "border-[#9b7fe8]/30", hex: "#9b7fe8" },
//   slate:  { text: "text-[#8e9fc5]", bg: "bg-[#8e9fc5]/15", border: "border-[#8e9fc5]/30", hex: "#8e9fc5" },
// };

// type Status = "in_transit" | "delivered" | "processing" | "delayed";

// const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: LucideIcon }> = {
//   in_transit: { label: "In Transit", color: "violet", icon: Truck },
//   delivered:  { label: "Delivered",  color: "slate",  icon: CheckCircle2 },
//   processing: { label: "Processing", color: "pink",   icon: Clock },
//   delayed:    { label: "Delayed",    color: "pink",   icon: AlertCircle },
// };

// // ─── HELPERS ──────────────────────────────────────────────────────────────────

// function getInitials(name: string): string {
//   if (!name) return "?";
//   return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
// }

// function deriveStatus(order: DBOrder): Status {
//   if (!order.tracking_number) return "processing";
//   return "in_transit";
// }

// function toModalOrder(order: DBOrder): ModalOrder {
//   return {
//     title: order.order_title,
//     description: order.description,
//     price: order.price,
//     trackingNumber: order.tracking_number,
//   };
// }

// // ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

// function Avatar({ initials, accent = "pink" }: { initials: string; accent?: "pink" | "violet" | "slate" }) {
//   const styles = {
//     pink:   "bg-[#e8629a]/15 text-[#e8629a] ring-1 ring-[#e8629a]/30",
//     violet: "bg-[#9b7fe8]/15 text-[#9b7fe8] ring-1 ring-[#9b7fe8]/30",
//     slate:  "bg-[#8e9fc5]/15 text-[#8e9fc5] ring-1 ring-[#8e9fc5]/30",
//   };
//   return (
//     <div className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold tracking-widest flex-shrink-0 ${styles[accent]}`}>
//       {initials}
//     </div>
//   );
// }

// function SectionCard({
//   title, icon: Icon, count, accent = "violet", children,
// }: {
//   title: string; icon: LucideIcon; count?: number; accent?: "pink" | "violet" | "slate"; children: React.ReactNode;
// }) {
//   const a = ACCENTS[accent];
//   return (
//     <div className="bg-[#0d0c14] border border-white/[0.08]">
//       <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
//         <div className="flex items-center gap-3">
//           <Icon size={16} className={a.text} />
//           <h2 className="text-white/60 text-sm uppercase tracking-[0.18em] font-medium">{title}</h2>
//         </div>
//         {count !== undefined && (
//           <span className={`text-xs font-bold px-2 py-0.5 ${a.bg} ${a.text} tracking-wider`}>
//             {String(count).padStart(2, "0")}
//           </span>
//         )}
//       </div>
//       <div>{children}</div>
//     </div>
//   );
// }

// function TableHeader({ cols }: { cols: string[] }) {
//   return (
//     <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.06]"
//       style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
//       {cols.map((c) => (
//         <span key={c} className="text-xs uppercase tracking-[0.18em] text-white/35 font-medium">{c}</span>
//       ))}
//     </div>
//   );
// }

// function LoadingRow() {
//   return (
//     <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
//       <div className="w-10 h-10 rounded-md bg-white/10 flex-shrink-0" />
//       <div className="flex-1 space-y-2">
//         <div className="h-3 bg-white/10 rounded w-1/3" />
//         <div className="h-2.5 bg-white/10 rounded w-1/5" />
//       </div>
//     </div>
//   );
// }

// function EmptyRow({ message }: { message: string }) {
//   return (
//     <div className="px-5 py-8 text-center text-white/25 text-sm tracking-[0.18em] uppercase">{message}</div>
//   );
// }

// function StatusBadge({ status }: { status: Status }) {
//   const cfg = STATUS_CONFIG[status];
//   const a = ACCENTS[cfg.color as "pink" | "violet" | "slate"];
//   const StatusIcon = cfg.icon;
//   return (
//     <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${a.bg} ${a.text} border ${a.border}`}>
//       <StatusIcon size={11} />{cfg.label}
//     </span>
//   );
// }

// function TrackingNumber({ value }: { value: string }) {
//   const [copied, setCopied] = useState(false);
//   function handleCopy() {
//     navigator.clipboard.writeText(value).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   }
//   return (
//     <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="flex items-center gap-1.5 group/copy" title="Copy tracking number">
//       <span className="text-sm text-white/40 font-mono truncate max-w-[140px]">{value}</span>
//       {copied
//         ? <Check size={12} className="text-[#9b7fe8] flex-shrink-0" />
//         : <Copy size={12} className="text-white/30 flex-shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
//       }
//     </button>
//   );
// }

// function FieldLabel({ children }: { children: React.ReactNode }) {
//   return <p className="text-xs uppercase tracking-[0.18em] text-white/30 mb-1.5 font-medium">{children}</p>;
// }

// function TextInput({ value, onChange, placeholder, type = "text" }: {
//   value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
// }) {
//   return (
//     <input
//       type={type}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition"
//     />
//   );
// }

// // ─── TICKET DETAIL MODAL ──────────────────────────────────────────────────────

// function TicketDetailModal({
//   ticket, onClose, onResolve, onDelete,
// }: {
//   ticket: DBTicket;
//   onClose: () => void;
//   onResolve: (t: DBTicket) => Promise<void>;
//   onDelete: (t: DBTicket) => Promise<void>;
// }) {
//   const [working, setWorking] = useState<"resolve" | "delete" | null>(null);
//   const isResolved = ticket.resolved === 1;

//   async function handle(action: "resolve" | "delete") {
//     setWorking(action);
//     if (action === "resolve") await onResolve(ticket);
//     else await onDelete(ticket);
//     setWorking(null);
//     onClose();
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[#080710]/95 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative z-10 bg-[#0d0c14] border border-white/[0.1] p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <TicketCheck size={16} className={isResolved ? "text-[#8e9fc5]" : "text-[#e8629a]"} />
//             <span className="text-white/60 text-xs uppercase tracking-[0.18em] font-medium">Ticket Detail</span>
//           </div>
//           <button onClick={onClose} className="text-white/30 hover:text-white/60 transition text-xl leading-none">×</button>
//         </div>
//         <div className="space-y-4">
//           <div>
//             <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-1 font-medium">Title</p>
//             <p className="text-white/80 text-base">{ticket.title}</p>
//           </div>
//           {ticket.contact_details && (
//             <div>
//               <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-1 font-medium">Contact</p>
//               <p className="text-white/60 text-sm">{ticket.contact_details}</p>
//             </div>
//           )}
//           <div>
//             <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-1 font-medium">Details</p>
//             <p className="text-white/60 text-sm leading-relaxed">{ticket.ticket_details}</p>
//           </div>
//           <div>
//             <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-1 font-medium">Status</p>
//             {isResolved ? (
//               <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#8e9fc5]">
//                 <CheckCircle2 size={11} /> Resolved
//               </span>
//             ) : (
//               <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#e8629a]">
//                 <Clock size={11} /> Open
//               </span>
//             )}
//           </div>
//         </div>
//         <div className="flex gap-3 pt-1">
//           <button
//             onClick={() => handle("delete")}
//             disabled={!!working}
//             className="flex items-center justify-center gap-1.5 flex-1 py-2.5 border border-white/[0.08] text-white/35 text-xs uppercase tracking-[0.18em] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
//           >
//             <Trash2 size={12} />
//             {working === "delete" ? "Deleting…" : "Delete"}
//           </button>
//           {!isResolved && (
//             <button
//               onClick={() => handle("resolve")}
//               disabled={!!working}
//               className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-[#9b7fe8]/15 border border-[#9b7fe8]/30 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
//             >
//               <CheckCircle2 size={12} />
//               {working === "resolve" ? "Resolving…" : "Resolve"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── SUBMIT TICKET MODAL ──────────────────────────────────────────────────────

// function SubmitTicketModal({
//   userUuid, clientName, onClose, onSubmitted,
// }: {
//   userUuid: string;
//   clientName: string;
//   onClose: () => void;
//   onSubmitted: (ticket: DBTicket) => void;
// }) {
//   const supabase = createClient();
//   const [title, setTitle]     = useState("");
//   const [contact, setContact] = useState("");
//   const [details, setDetails] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted]   = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   async function handleSubmit() {
//     if (!title || !details) return;
//     setSubmitting(true);
//     setErr(null);
//     const { data, error } = await supabase.from("tickets").insert({
//       title,
//       contact_details: contact,
//       ticket_details: details,
//       client_name: clientName,
//       user_uuid: userUuid,
//       resolved: 0,
//     }).select().single();
//     setSubmitting(false);
//     if (error) { setErr(error.message); return; }
//     if (data) onSubmitted(data as DBTicket);
//     setSubmitted(true);
//   }

//   if (submitted) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div className="absolute inset-0 bg-[#080710]/95 backdrop-blur-sm" onClick={onClose} />
//         <div className="relative z-10 bg-[#0d0c14] border border-white/[0.1] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
//           <CheckCircle2 size={32} className="text-[#9b7fe8]" />
//           <p className="text-white/70 text-sm uppercase tracking-[0.18em] font-medium">Ticket Submitted</p>
//           <p className="text-white/40 text-sm">We&apos;ll get back to you within 24 hours.</p>
//           <button onClick={onClose} className="mt-2 px-6 py-2 border border-white/[0.1] text-white/50 text-xs uppercase tracking-[0.18em] hover:border-white/20 hover:text-white/70 transition">
//             Done
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[#080710]/95 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative z-10 bg-[#0d0c14] border border-white/[0.1] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <TicketCheck size={16} className="text-[#e8629a]" />
//             <span className="text-white/60 text-xs uppercase tracking-[0.18em] font-medium">Submit Ticket</span>
//           </div>
//           <button onClick={onClose} className="text-white/30 hover:text-white/60 transition text-xl leading-none">×</button>
//         </div>
//         <div className="space-y-3">
//           {[
//             { label: "Title",   value: title,   setter: setTitle,   placeholder: "e.g. Missing item in order" },
//             { label: "Contact", value: contact, setter: setContact, placeholder: "Email or phone" },
//           ].map(({ label, value, setter, placeholder }) => (
//             <div key={label}>
//               <FieldLabel>{label}</FieldLabel>
//               <TextInput value={value} onChange={setter} placeholder={placeholder} />
//             </div>
//           ))}
//           <div>
//             <FieldLabel>Details</FieldLabel>
//             <textarea
//               value={details}
//               onChange={(e) => setDetails(e.target.value)}
//               rows={4}
//               placeholder="Describe your issue..."
//               className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition resize-none"
//             />
//           </div>
//           {err && <p className="text-[#e8629a] text-sm">{err}</p>}
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.08] text-white/35 text-xs uppercase tracking-[0.18em] hover:border-white/15 transition">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={!title || !details || submitting}
//             className="flex-1 py-2.5 bg-[#e8629a]/15 border border-[#e8629a]/30 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
//           >
//             {submitting ? "Submitting…" : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── CAMP APPLICATION SECTION ─────────────────────────────────────────────────

// const CAMP_TYPES: { value: string; label: string }[] = [
//   { value: "0", label: "FBX Robotics" },
//   { value: "1", label: "FBX 3D-Printing" },
// ];

// function CampApplicationSection({ clientUuid }: { clientUuid: string }) {
//   const supabase = createClient();

//   const [campType, setCampType]             = useState("");
//   const [campDate, setCampDate]             = useState("");
//   const [studentNum, setStudentNum]         = useState("");
//   const [volunteerNum, setVolunteerNum]     = useState("");
//   const [addlVolunteers, setAddlVolunteers] = useState(false);
//   const [addlDetails, setAddlDetails]       = useState("");
//   const [submitting, setSubmitting]         = useState(false);
//   const [submitted, setSubmitted]           = useState(false);
//   const [err, setErr]                       = useState<string | null>(null);

//   async function handleSubmit() {
//     if (!campType || !campDate || !studentNum) return;
//     setSubmitting(true);
//     setErr(null);
//     const { error } = await supabase.from("camp_applications").insert({
//       client_uuid: clientUuid,
//       camp_type: Number(campType),
//       camp_dates: new Date(campDate).toISOString(),
//       student_num: Number(studentNum),
//       volunteer_num: volunteerNum ? Number(volunteerNum) : null,
//       additional_volunteers: addlVolunteers,
//       additional_details: addlDetails || null,
//     });
//     setSubmitting(false);
//     if (error) { setErr(error.message); return; }
//     setSubmitted(true);
//   }

//   if (submitted) {
//     return (
//       <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
//         <CheckCircle2 size={28} className="text-[#9b7fe8]" />
//         <p className="text-white/60 text-sm uppercase tracking-[0.18em] font-medium">Application Submitted</p>
//         <p className="text-white/35 text-sm">We&apos;ll review your application and follow up shortly.</p>
//         <button
//           onClick={() => { setSubmitted(false); setCampType(""); setCampDate(""); setStudentNum(""); setVolunteerNum(""); setAddlVolunteers(false); setAddlDetails(""); }}
//           className="mt-1 text-xs uppercase tracking-widest text-white/30 hover:text-white/50 transition"
//         >
//           Submit Another
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="px-5 py-5 space-y-4">
//       {/* Row 1: camp type + date */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div>
//           <FieldLabel>Camp Type</FieldLabel>
//           <select
//             value={campType}
//             onChange={(e) => setCampType(e.target.value)}
//             className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 outline-none focus:border-white/20 transition appearance-none"
//           >
//             <option value="" disabled className="bg-[#080710]">Select a type…</option>
//             {CAMP_TYPES.map((t) => (
//               <option key={t.value} value={t.value} className="bg-[#080710]">{t.label}</option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <FieldLabel>Camp Date</FieldLabel>
//           <input
//             type="date"
//             value={campDate}
//             onChange={(e) => setCampDate(e.target.value)}
//             className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 outline-none focus:border-white/20 transition [color-scheme:dark]"
//           />
//         </div>
//       </div>

//       {/* Row 2: student + volunteer counts */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div>
//           <FieldLabel>Number of Students</FieldLabel>
//           <TextInput value={studentNum} onChange={setStudentNum} placeholder="e.g. 30" type="number" />
//         </div>
//         <div>
//           <FieldLabel>Number of Volunteers</FieldLabel>
//           <TextInput value={volunteerNum} onChange={setVolunteerNum} placeholder="e.g. 5" type="number" />
//         </div>
//       </div>

//       {/* Additional volunteers checkbox */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => setAddlVolunteers((v) => !v)}
//           className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition ${
//             addlVolunteers
//               ? "bg-[#9b7fe8]/30 border-[#9b7fe8]/60"
//               : "bg-transparent border-white/20 hover:border-white/30"
//           }`}
//         >
//           {addlVolunteers && <Check size={10} className="text-[#9b7fe8]" />}
//         </button>
//         <span className="text-sm text-white/40 tracking-wide">Additional volunteers may be needed</span>
//       </div>

//       {/* Additional details */}
//       <div>
//         <FieldLabel>Additional Details <span className="text-white/20 normal-case">(optional)</span></FieldLabel>
//         <textarea
//           value={addlDetails}
//           onChange={(e) => setAddlDetails(e.target.value)}
//           rows={3}
//           placeholder="Any special requirements, accommodations, or notes…"
//           className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition resize-none"
//         />
//       </div>

//       {err && <p className="text-[#e8629a] text-sm">{err}</p>}

//       <div className="flex justify-end pt-1">
//         <button
//           onClick={handleSubmit}
//           disabled={!campType || !campDate || !studentNum || submitting}
//           className="px-6 py-2.5 bg-[#9b7fe8]/15 border border-[#9b7fe8]/30 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
//         >
//           {submitting ? "Submitting…" : "Submit Application"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── ADD STUDENT SECTION ──────────────────────────────────────────────────────

// function AddStudentSection({ clientUuid }: { clientUuid: string }) {
//   const supabase = createClient();

//   const [courses, setCourses]         = useState<DBCourse[]>([]);
//   const [enrolled, setEnrolled]       = useState<DBStudentCourse[]>([]);
//   const [loadingCourses, setLoadingCourses] = useState(true);
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [email, setEmail]             = useState("");
//   const [submitting, setSubmitting]   = useState(false);
//   const [err, setErr]                 = useState<string | null>(null);
//   const [success, setSuccess]         = useState(false);

//   useEffect(() => {
//     async function load() {
//       setLoadingCourses(true);
//       const [coursesRes, enrolledRes] = await Promise.all([
//         supabase.from("courses").select("*"),
//         supabase.from("student_courses").select("*").eq("client_uuid", clientUuid),
//       ]);
//       setCourses(coursesRes.data ?? []);
//       setEnrolled(enrolledRes.data ?? []);
//       setLoadingCourses(false);
//     }
//     load();
//   }, [clientUuid]);

//   async function handleAdd() {
//   if (!selectedCourse || !email) return;
  
//   // ─── DEBUGGING: Add this block ──────────────────────────────────
//   console.log("========== DEBUG: Adding Student ==========");
//   console.log("1. Selected course UUID:", selectedCourse);
//   console.log("2. Student email:", email);
//   console.log("3. clientUuid being sent:", clientUuid);
  
//   // Get the current authenticated user
//   const { data: { user } } = await supabase.auth.getUser();
//   console.log("4. Current auth user ID:", user?.id);
//   console.log("5. Do they match?", clientUuid === user?.id ? "✅ YES" : "❌ NO");
//   console.log("===========================================");
//   // ─── END DEBUGGING ──────────────────────────────────────────────
  
//   setSubmitting(true);
//   setErr(null);
//   setSuccess(false);
//   const { data, error } = await supabase.from("student_courses").insert({
//     course_uuid: selectedCourse,
//     student_email: email.trim().toLowerCase(),
//     client_uuid: clientUuid,
//   }).select().single();
  
//   // ─── Also log the response ──────────────────────────────────────
//   console.log("Insert response:", { data, error });
//   // ────────────────────────────────────────────────────────────────
  
//   setSubmitting(false);
//   if (error) { setErr(error.message); return; }
//   if (data) setEnrolled((prev) => [...prev, data as DBStudentCourse]);
//   setEmail("");
//   setSuccess(true);
//   setTimeout(() => setSuccess(false), 3000);
// }

//   async function handleRemove(id: string) {
//     const { error } = await supabase.from("student_courses").delete().eq("id", id);
//     if (error) { console.error(error.message); return; }
//     setEnrolled((prev) => prev.filter((s) => s.id !== id));
//   }

//   // Updated to use course_name
//   const getCourseName = (uuid: string) => {
//     const c = courses.find((c) => c.course_uuid === uuid);
//     return c?.course_name || c?.course_link || `Course ${c?.id}` || uuid;
//   };

//   return (
//     <div className="divide-y divide-white/[0.06]">
//       {/* Add form */}
//       <div className="px-5 py-5 space-y-4">
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <FieldLabel>Course</FieldLabel>
//             {loadingCourses ? (
//               <div className="h-11 bg-white/10 animate-pulse" />
//             ) : (
//               <select
//                 value={selectedCourse}
//                 onChange={(e) => setSelectedCourse(e.target.value)}
//                 className="w-full bg-[#080710] border border-white/[0.08] px-4 py-3 text-sm text-white/70 outline-none focus:border-white/20 transition appearance-none"
//               >
//                 <option value="" disabled className="bg-[#080710]">Select a course…</option>
//                 {courses.map((c) => (
//                   <option key={c.course_uuid} value={c.course_uuid} className="bg-[#080710]">
//                     {c.course_name || c.course_link || `Course ${c.id}`}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//           <div>
//             <FieldLabel>Student Email</FieldLabel>
//             <TextInput value={email} onChange={setEmail} placeholder="student@university.edu" type="email" />
//           </div>
//         </div>

//         {err && <p className="text-[#e8629a] text-sm">{err}</p>}

//         <div className="flex items-center justify-between">
//           {success && (
//             <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9b7fe8] font-medium">
//               <CheckCircle2 size={12} /> Student added
//             </span>
//           )}
//           {!success && <span />}
//           <button
//             onClick={handleAdd}
//             disabled={!selectedCourse || !email || submitting}
//             className="flex items-center gap-2 px-5 py-2.5 bg-[#9b7fe8]/15 border border-[#9b7fe8]/30 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
//           >
//             <UserPlus size={13} />
//             {submitting ? "Adding…" : "Add Student"}
//           </button>
//         </div>
//       </div>

//       {/* Enrolled students list */}
//       {(loadingCourses || enrolled.length > 0) && (
//         <>
//           <TableHeader cols={["Email", "Course", ""]} />
//           {loadingCourses
//             ? [1, 2].map((i) => <LoadingRow key={i} />)
//             : enrolled.map((s) => (
//                 <div key={s.id} className="px-5 py-3.5 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0">
//                   <div className="flex items-center gap-3">
//                     <Avatar initials={s.student_email.slice(0, 2).toUpperCase()} accent="violet" />
//                     <span className="text-white/60 text-sm truncate">{s.student_email}</span>
//                   </div>
//                   <span className="hidden sm:block text-white/40 text-sm truncate">{getCourseName(s.course_uuid)}</span>
//                   <div className="flex justify-end sm:justify-start">
//                     <button
//                       onClick={() => handleRemove(s.id)}
//                       className="text-white/25 hover:text-red-400 transition"
//                       title="Remove student"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </div>
//               ))
//           }
//         </>
//       )}

//       {!loadingCourses && enrolled.length === 0 && (
//         <EmptyRow message="No students enrolled yet" />
//       )}
//     </div>
//   );
// }

// // ─── PAGE COMPONENT ───────────────────────────────────────────────────────────

// export default function ClientDashboard() {
//   const supabase = createClient();

//   const [dbUser, setDbUser]                   = useState<DBUser | null>(null);
//   const [dbOrders, setDbOrders]               = useState<DBOrder[]>([]);
//   const [openTickets, setOpenTickets]         = useState<DBTicket[]>([]);
//   const [resolvedTickets, setResolvedTickets] = useState<DBTicket[]>([]);
//   const [loading, setLoading]                 = useState(true);
//   const [error, setError]                     = useState<string | null>(null);

//   const [submitOpen, setSubmitOpen]         = useState(false);
//   const [selectedOrder, setSelectedOrder]   = useState<ModalOrder | null>(null);
//   const [selectedTicket, setSelectedTicket] = useState<DBTicket | null>(null);

//   useEffect(() => {
//     async function fetchAll() {
//       setLoading(true);
//       setError(null);

//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) { setError("Not authenticated"); setLoading(false); return; }

//       try {
//         const [userRes, ordersRes, openRes, resolvedRes] = await Promise.all([
//           supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
//           supabase.from("orders").select("*").eq("user_uuid", user.id),
//           supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 0),
//           supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 1),
//         ]);
//         if (userRes.error)     throw new Error(`User: ${userRes.error.message}`);
//         if (ordersRes.error)   throw new Error(`Orders: ${ordersRes.error.message}`);
//         if (openRes.error)     throw new Error(`Tickets: ${openRes.error.message}`);
//         if (resolvedRes.error) throw new Error(`Resolved: ${resolvedRes.error.message}`);

//         setDbUser(userRes.data ?? null);
//         setDbOrders(ordersRes.data ?? []);
//         setOpenTickets(openRes.data ?? []);
//         setResolvedTickets(resolvedRes.data ?? []);
//       } catch (err: unknown) {
//         setError(err instanceof Error ? err.message : "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchAll();
//   }, []);

//   async function handleResolve(ticket: DBTicket) {
//     const { error } = await supabase.from("tickets").update({ resolved: 1 }).eq("id", ticket.id);
//     if (error) { console.error(error.message); return; }
//     setOpenTickets((prev) => prev.filter((t) => t.id !== ticket.id));
//     setResolvedTickets((prev) => [{ ...ticket, resolved: 1 }, ...prev]);
//   }

//   async function handleDelete(ticket: DBTicket) {
//     const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
//     if (error) { console.error(error.message); return; }
//     setOpenTickets((prev) => prev.filter((t) => t.id !== ticket.id));
//     setResolvedTickets((prev) => prev.filter((t) => t.id !== ticket.id));
//   }

//   function handleTicketSubmitted(ticket: DBTicket) {
//     setOpenTickets((prev) => [ticket, ...prev]);
//   }

//   if (error) {
//     return (
//       <div className="flex-1 flex items-center justify-center p-8 bg-[#080710]">
//         <div className="text-center space-y-2">
//           <p className="text-[#e8629a] text-sm uppercase tracking-[0.18em] font-medium">Error</p>
//           <p className="text-white/50 text-base">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 px-5 sm:px-8 py-8 space-y-6 overflow-auto">

//       {/* Modals */}
//       {submitOpen && (
//         <SubmitTicketModal
//           userUuid={dbUser?.user_uuid ?? ""}
//           clientName={dbUser?.client_name ?? ""}
//           onClose={() => setSubmitOpen(false)}
//           onSubmitted={handleTicketSubmitted}
//         />
//       )}
//       {selectedTicket && (
//         <TicketDetailModal
//           ticket={selectedTicket}
//           onClose={() => setSelectedTicket(null)}
//           onResolve={handleResolve}
//           onDelete={handleDelete}
//         />
//       )}
//       {selectedOrder && (
//         <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
//       )}

//       {/* Page header */}
//       <div className="pb-5 border-b border-white/[0.08]">
//         <p className="text-sm uppercase tracking-[0.22em] text-white/30 mb-1 font-medium">FBX Technologies</p>
//         <h1 className="text-white/85 text-3xl font-light tracking-wide">
//           {loading ? "Dashboard" : `Welcome, ${dbUser?.client_name ?? "Client"}`}
//         </h1>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
//         <div className="relative bg-[#0d0c14] border border-white/[0.08] p-5 overflow-hidden hover:border-white/15 transition-colors duration-300">
//           <div className="absolute inset-x-0 top-0 h-px bg-[#9b7fe8]/15" />
//           <p className="text-sm uppercase tracking-[0.18em] text-white/40 font-medium mb-3">Active Orders</p>
//           {loading
//             ? <div className="h-12 bg-white/10 rounded w-16 animate-pulse" />
//             : <p className="text-5xl font-light text-[#9b7fe8] tabular-nums">{String(dbOrders.length).padStart(2, "0")}</p>
//           }
//         </div>
//         <div className="relative bg-[#0d0c14] border border-white/[0.08] p-5 overflow-hidden hover:border-white/15 transition-colors duration-300">
//           <div className="absolute inset-x-0 top-0 h-px bg-[#e8629a]/15" />
//           <p className="text-sm uppercase tracking-[0.18em] text-white/40 font-medium mb-3">Open Tickets</p>
//           {loading
//             ? <div className="h-12 bg-white/10 rounded w-16 animate-pulse" />
//             : <p className="text-5xl font-light text-[#e8629a] tabular-nums">{String(openTickets.length).padStart(2, "0")}</p>
//           }
//         </div>
//       </div>

//       {/* ── Camp Application ── */}
//       <SectionCard title="Apply for a Camp" icon={Tent} accent="violet">
//         {loading
//           ? <LoadingRow />
//           : !dbUser
//           ? <EmptyRow message="Please log in to apply" />
//           : <CampApplicationSection clientUuid={dbUser.user_uuid} />
//         }
//       </SectionCard>

//       {/* ── Student Enrollment ── */}
//       <SectionCard title="Enroll Students" icon={GraduationCap} accent="violet">
//         {loading
//           ? <LoadingRow />
//           : !dbUser
//           ? <EmptyRow message="Please log in to enroll students" />
//           : <AddStudentSection clientUuid={dbUser.user_uuid} />
//         }
//       </SectionCard>

//       {/* ── Orders & Tracking ── */}
//       <SectionCard title="Orders & Tracking" icon={Package} count={dbOrders.length} accent="slate">
//         <TableHeader cols={["Order", "Tracking", "Status"]} />
//         {loading
//           ? [1, 2].map((i) => <LoadingRow key={i} />)
//           : dbOrders.length === 0
//           ? <EmptyRow message="No active orders" />
//           : dbOrders.map((o) => {
//               const status = deriveStatus(o);
//               return (
//                 <div
//                   key={o.id}
//                   onClick={() => setSelectedOrder(toModalOrder(o))}
//                   className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar initials={getInitials(o.order_title)} accent="slate" />
//                     <div className="min-w-0">
//                       <p className="text-white/70 text-base truncate">{o.order_title}</p>
//                       <p className="text-white/35 text-sm">{o.price}</p>
//                     </div>
//                   </div>
//                   <div className="hidden sm:flex items-center">
//                     {o.tracking_number
//                       ? <TrackingNumber value={o.tracking_number} />
//                       : <span className="text-white/25 text-sm">—</span>
//                     }
//                   </div>
//                   <div className="flex items-center gap-2 justify-end sm:justify-start">
//                     <StatusBadge status={status} />
//                     <ExternalLink size={12} className="text-[#8e9fc5] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </div>
//               );
//             })
//         }
//       </SectionCard>

//       {/* ── Support ── */}
//       <SectionCard title="Support" icon={TicketCheck} accent="pink">
//         <div className="px-5 py-5 flex items-center justify-between">
//           <div>
//             <p className="text-white/50 text-base">Need help with something?</p>
//             <p className="text-white/30 text-sm mt-0.5">We typically respond within 24 hours.</p>
//           </div>
//           <button
//             onClick={() => setSubmitOpen(true)}
//             className="flex items-center gap-2 px-5 py-2.5 bg-[#e8629a]/15 border border-[#e8629a]/30 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/25 transition flex-shrink-0"
//           >
//             <TicketCheck size={13} />
//             Open Ticket
//           </button>
//         </div>
//       </SectionCard>

//       {/* ── Open Tickets ── */}
//       <SectionCard title="My Tickets" icon={TicketCheck} count={openTickets.length} accent="pink">
//         <TableHeader cols={["Title", "Details", "Status"]} />
//         {loading
//           ? [1, 2].map((i) => <LoadingRow key={i} />)
//           : openTickets.length === 0
//           ? <EmptyRow message="No open tickets" />
//           : openTickets.map((t) => (
//               <div
//                 key={t.id}
//                 onClick={() => setSelectedTicket(t)}
//                 className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
//               >
//                 <div className="flex items-center gap-3">
//                   <Avatar initials={getInitials(t.title)} accent="pink" />
//                   <p className="text-white/70 text-base truncate">{t.title}</p>
//                 </div>
//                 <p className="hidden sm:block text-white/40 text-sm truncate">{t.ticket_details}</p>
//                 <div className="flex items-center gap-1.5 justify-end sm:justify-start">
//                   <Clock size={11} className="text-[#e8629a]" />
//                   <span className="text-[11px] uppercase tracking-widest text-[#e8629a]/70 font-medium">Open</span>
//                   <ExternalLink size={12} className="text-[#e8629a] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
//                 </div>
//               </div>
//             ))
//         }
//       </SectionCard>

//       {/* ── Resolved Tickets ── */}
//       {(loading || resolvedTickets.length > 0) && (
//         <SectionCard title="Resolved Tickets" icon={CheckCircle2} count={resolvedTickets.length} accent="slate">
//           <TableHeader cols={["Title", "Details", "Status"]} />
//           {loading
//             ? [1].map((i) => <LoadingRow key={i} />)
//             : resolvedTickets.map((t) => (
//                 <div
//                   key={t.id}
//                   onClick={() => setSelectedTicket(t)}
//                   className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group opacity-70"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar initials={getInitials(t.title)} accent="slate" />
//                     <p className="text-white/50 text-base truncate line-through">{t.title}</p>
//                   </div>
//                   <p className="hidden sm:block text-white/25 text-sm truncate">{t.ticket_details}</p>
//                   <div className="flex items-center gap-1.5 justify-end sm:justify-start">
//                     <CheckCircle2 size={11} className="text-[#8e9fc5]" />
//                     <span className="text-[11px] uppercase tracking-widest text-[#8e9fc5] font-medium">Resolved</span>
//                     <ExternalLink size={12} className="text-[#8e9fc5] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
//                   </div>
//                 </div>
//               ))
//           }
//         </SectionCard>
//       )}

//     </div>
//   );
// }"use client";
"use client";
import { useState, useEffect } from "react";
import {
  Package,
  TicketCheck,
  ExternalLink,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  UserPlus,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import OrderModal from "@/components/dashboardComponents/orderModal";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface DBUser {
  id: string;
  client_name: string;
  is_admin: number;
  user_uuid: string;
  role: number;
}

interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
}

interface DBTicket {
  id: string;
  title: string;
  contact_details: string;
  ticket_details: string;
  client_name: string;
  user_uuid: string;
  resolved: number;
}

interface DBPlan {
  id: string;
  user_uuid: string;
  robots_shipped: number;
  price: number;
  robots_allocated: number;
  description: string;
  created_at: string;
}

interface ModalOrder {
  title: string;
  description: string;
  price: string;
  trackingNumber: string;
}

// ─── ACCENTS ─────────────────────────────────────────────────────────────────

const ACCENTS = {
  pink:   { text: "text-[#e8629a]", bg: "bg-[#e8629a]/10", border: "border-[#e8629a]/20" },
  violet: { text: "text-[#9b7fe8]", bg: "bg-[#9b7fe8]/10", border: "border-[#9b7fe8]/20" },
  slate:  { text: "text-[#7e8fb5]", bg: "bg-[#7e8fb5]/10", border: "border-[#7e8fb5]/20" },
  teal:   { text: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/20" },
};

type AccentKey = keyof typeof ACCENTS;
type Status = "in_transit" | "delivered" | "processing" | "delayed";

const STATUS_CONFIG: Record<Status, { label: string; accent: AccentKey; icon: LucideIcon }> = {
  in_transit: { label: "In Transit", accent: "violet", icon: Truck },
  delivered:  { label: "Delivered",  accent: "slate",  icon: CheckCircle2 },
  processing: { label: "Processing", accent: "pink",   icon: Clock },
  delayed:    { label: "Delayed",    accent: "pink",   icon: AlertCircle },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function deriveStatus(order: DBOrder): Status {
  return order.tracking_number ? "in_transit" : "processing";
}

function toModalOrder(o: DBOrder): ModalOrder {
  return { title: o.order_title, description: o.description, price: o.price, trackingNumber: o.tracking_number };
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

function Avatar({ initials, accent = "violet" }: { initials: string; accent?: AccentKey }) {
  const s: Record<AccentKey, string> = {
    pink:   "bg-[#e8629a]/10 text-[#e8629a] ring-1 ring-[#e8629a]/25",
    violet: "bg-[#9b7fe8]/10 text-[#9b7fe8] ring-1 ring-[#9b7fe8]/25",
    slate:  "bg-[#7e8fb5]/10 text-[#7e8fb5] ring-1 ring-[#7e8fb5]/25",
    teal:   "bg-[#4ecdc4]/10 text-[#4ecdc4] ring-1 ring-[#4ecdc4]/25",
  };
  return (
    <div className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${s[accent]}`}>
      {initials}
    </div>
  );
}

function SectionCard({ title, icon: Icon, count, accent = "violet", children }: {
  title: string; icon: LucideIcon; count?: number; accent?: AccentKey; children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="bg-[#0d0c14] border border-white/[0.06]">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Icon size={15} className={a.text} />
          <h2 className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">{title}</h2>
        </div>
        {count !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 ${a.bg} ${a.text} tracking-wider`}>
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.04]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
      {cols.map((c) => (
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/20 font-medium">{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.04]">
      <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-5 py-8 text-center text-white/15 text-xs tracking-[0.18em] uppercase">{message}</div>;
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const a = ACCENTS[cfg.accent];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${a.bg} ${a.text} border ${a.border}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

function TrackingCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      className="flex items-center gap-1.5 group/copy" title="Copy tracking number">
      <span className="text-xs text-white/25 font-mono truncate max-w-[140px]">{value}</span>
      {copied ? <Check size={11} className="text-[#9b7fe8] flex-shrink-0" /> : <Copy size={11} className="text-white/20 flex-shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity" />}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition" />
  );
}

// ─── CONTRACT SECTION ─────────────────────────────────────────────────────────

function ContractSection({ plan, loading }: { plan: DBPlan | null; loading: boolean }) {
  if (loading) return <LoadingRow />;
  if (!plan) return <EmptyRow message="No contract on file — contact your FBX representative" />;

  const shipped   = plan.robots_shipped   ?? 0;
  const allocated = plan.robots_allocated ?? 0;
  const pct       = allocated > 0 ? Math.min(100, Math.round((shipped / allocated) * 100)) : 0;
  const since     = new Date(plan.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="divide-y divide-white/[0.04]">
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
        {[
          { label: "Contract Value", value: `$${plan.price?.toLocaleString() ?? "—"}`, accent: "teal" as AccentKey },
          { label: "Robots Shipped", value: `${shipped}`, accent: "violet" as AccentKey },
          { label: "Robots Allocated", value: `${allocated}`, accent: "slate" as AccentKey },
        ].map(({ label, value, accent }) => {
          const a = ACCENTS[accent];
          return (
            <div key={label} className="relative bg-[#0d0c14] p-5">
              <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-2">{label}</p>
              <p className={`text-3xl font-light tabular-nums ${a.text}`}>{value}</p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/20">Fulfillment Progress</span>
          <span className="text-[10px] text-[#4ecdc4] tabular-nums">{pct}%</span>
        </div>
        <div className="h-1 bg-white/[0.06] overflow-hidden">
          <div className="h-full bg-[#4ecdc4] transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-white/15">{shipped} of {allocated} units shipped</p>
      </div>

      {/* Description & date */}
      {plan.description && (
        <div className="px-5 py-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">Contract Notes</p>
          <p className="text-white/35 text-sm leading-relaxed">{plan.description}</p>
        </div>
      )}
      <div className="px-5 py-3">
        <p className="text-[10px] text-white/15">Contract established {since}</p>
      </div>
    </div>
  );
}

// ─── TICKET DETAIL MODAL ──────────────────────────────────────────────────────

function TicketDetailModal({ ticket, onClose, onResolve }: {
  ticket: DBTicket; onClose: () => void;
  onResolve: (t: DBTicket) => Promise<void>;
}) {
  const [working, setWorking] = useState<"resolve" | null>(null);
  const isResolved = ticket.resolved === 1;

  async function handle(action: "resolve" ) {
    setWorking(action);
    if (action === "resolve") await onResolve(ticket);
    setWorking(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TicketCheck size={14} className={isResolved ? "text-[#7e8fb5]" : "text-[#e8629a]"} />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Ticket Detail</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-4">
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1">Title</p><p className="text-white/70 text-sm">{ticket.title}</p></div>
          {ticket.contact_details && <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1">Contact</p><p className="text-white/40 text-sm">{ticket.contact_details}</p></div>}
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1">Details</p><p className="text-white/40 text-sm leading-relaxed">{ticket.ticket_details}</p></div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1">Status</p>
            {isResolved
              ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7e8fb5]"><CheckCircle2 size={10} /> Resolved</span>
              : <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e8629a]"><Clock size={10} /> Open</span>
            }
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          {/* <button onClick={() => handle("delete")} disabled={!!working}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition disabled:opacity-30 disabled:cursor-not-allowed">
            <Trash2 size={11} />{working === "delete" ? "Deleting…" : "Delete"}
          </button> */}
          {!isResolved && (
            <button onClick={() => handle("resolve")} disabled={!!working}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <CheckCircle2 size={11} />{working === "resolve" ? "Resolving…" : "Resolve"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUBMIT TICKET MODAL ──────────────────────────────────────────────────────

function SubmitTicketModal({ userUuid, clientName, onClose, onSubmitted }: {
  userUuid: string; clientName: string; onClose: () => void; onSubmitted: (t: DBTicket) => void;
}) {
  const supabase = createClient();
  const [title, setTitle]     = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title || !details) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("tickets").insert({
      title, contact_details: contact, ticket_details: details,
      client_name: clientName, user_uuid: userUuid, resolved: 0,
    }).select().single();
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    if (data) onSubmitted(data as DBTicket);
    setSubmitted(true);
  }

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
        <CheckCircle2 size={28} className="text-[#9b7fe8]" />
        <p className="text-white/60 text-xs uppercase tracking-[0.18em]">Ticket Submitted</p>
        <p className="text-white/25 text-xs">We&apos;ll get back to you within 24 hours.</p>
        <button onClick={onClose} className="mt-2 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><TicketCheck size={14} className="text-[#e8629a]" /><span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Submit Ticket</span></div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div><FieldLabel>Title</FieldLabel><TextInput value={title} onChange={setTitle} placeholder="e.g. Shipment issue" /></div>
          <div><FieldLabel>Contact</FieldLabel><TextInput value={contact} onChange={setContact} placeholder="Email or phone" /></div>
          <div>
            <FieldLabel>Details</FieldLabel>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe your issue…"
              className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition resize-none" />
          </div>
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!title || !details || submitting}
            className="flex-1 py-2.5 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-xs uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition disabled:opacity-30 disabled:cursor-not-allowed">
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE TEACHER MODAL ─────────────────────────────────────────────────────

function CreateTeacherModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [done, setDone]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  async function handleCreate() {
    if (!name || !email || !password) return;
    setCreating(true);
    setErr(null);

    // Sign up via Supabase Auth — requires server-side or admin key in production;
    // here we use the public signUp so the teacher gets a magic-link / confirms email.
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr || !authData.user) { setErr(authErr?.message ?? "Sign-up failed"); setCreating(false); return; }

    // Insert user row with role=1 (teacher) and link to enterprise via client_uuid stored as user_uuid of enterprise
    const { error: insertErr } = await supabase.from("users").insert({
      client_name: name,
      user_uuid:   authData.user.id,
      is_admin:    0,
      role:        0, // teacher role
    });
    setCreating(false);
    if (insertErr) { setErr(insertErr.message); return; }
    setDone(true);
  }

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
        <CheckCircle2 size={28} className="text-[#4ecdc4]" />
        <p className="text-white/60 text-xs uppercase tracking-[0.18em]">Teacher Account Created</p>
        <div className="w-full bg-[#080710] border border-white/[0.06] p-4 text-left space-y-2">
          <div><p className="text-[10px] text-white/20 uppercase tracking-widest mb-0.5">Name</p><p className="text-white/60 text-sm">{name}</p></div>
          <div><p className="text-[10px] text-white/20 uppercase tracking-widest mb-0.5">Email</p><p className="text-white/60 text-sm font-mono">{email}</p></div>
          <div><p className="text-[10px] text-white/20 uppercase tracking-widest mb-0.5">Password</p><p className="text-white/60 text-sm font-mono">{password}</p></div>
        </div>
        <p className="text-white/15 text-xs">Save these credentials — they won&apos;t be shown again.</p>
        <button onClick={onClose} className="mt-1 px-6 py-2 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] hover:border-white/15 hover:text-white/60 transition">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><UserPlus size={14} className="text-[#4ecdc4]" /><span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Create Teacher Account</span></div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div><FieldLabel>Full Name</FieldLabel><TextInput value={name} onChange={setName} placeholder="e.g. Jane Smith" /></div>
          <div><FieldLabel>Email</FieldLabel><TextInput value={email} onChange={setEmail} placeholder="teacher@school.edu" type="email" /></div>
          <div><FieldLabel>Password</FieldLabel><TextInput value={password} onChange={setPassword} placeholder="Min. 8 characters" type="password" /></div>
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
          <p className="text-white/15 text-xs">The teacher will receive a confirmation email and can log in to the Teacher Portal.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition">Cancel</button>
          <button onClick={handleCreate} disabled={!name || !email || !password || creating}
            className="flex-1 py-2.5 bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-xs uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition disabled:opacity-30 disabled:cursor-not-allowed">
            {creating ? "Creating…" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EnterprisePortal() {
  const supabase = createClient();

  const [dbUser, setDbUser]               = useState<DBUser | null>(null);
  const [dbPlan, setDbPlan]               = useState<DBPlan | null>(null);
  const [dbOrders, setDbOrders]           = useState<DBOrder[]>([]);
  const [openTickets, setOpenTickets]     = useState<DBTicket[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<DBTicket[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const [submitOpen, setSubmitOpen]           = useState(false);
  const [selectedOrder, setSelectedOrder]     = useState<ModalOrder | null>(null);
  const [selectedTicket, setSelectedTicket]   = useState<DBTicket | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      try {
        const [userRes, planRes, ordersRes, openRes, resolvedRes] = await Promise.all([
          supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
          supabase.from("plans").select("*").eq("user_uuid", user.id).maybeSingle(),
          supabase.from("orders").select("*").eq("user_uuid", user.id),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 0),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 1),
        ]);
        if (userRes.error)     throw new Error(`User: ${userRes.error.message}`);
        if (ordersRes.error)   throw new Error(`Orders: ${ordersRes.error.message}`);
        if (openRes.error)     throw new Error(`Tickets: ${openRes.error.message}`);
        if (resolvedRes.error) throw new Error(`Resolved: ${resolvedRes.error.message}`);

        setDbUser(userRes.data ?? null);
        setDbPlan(planRes.data ?? null);
        setDbOrders(ordersRes.data ?? []);
        setOpenTickets(openRes.data ?? []);
        setResolvedTickets(resolvedRes.data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").update({ resolved: 1 }).eq("id", ticket.id);
    if (error) { console.error(error.message); return; }
    setOpenTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setResolvedTickets((prev) => [{ ...ticket, resolved: 1 }, ...prev]);
  }

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#080710]">
      <div className="text-center space-y-1">
        <p className="text-[#e8629a] text-xs uppercase tracking-[0.18em]">Error</p>
        <p className="text-white/30 text-base">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto bg-[#080710] min-h-screen">

      {/* Modals */}
      {submitOpen && (
        <SubmitTicketModal
          userUuid={dbUser?.user_uuid ?? ""}
          clientName={dbUser?.client_name ?? ""}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={(t) => setOpenTickets((prev) => [t, ...prev])}
        />
      )}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)}
          onResolve={handleResolve}/>
      )}
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {teacherModalOpen && dbUser && (
        <CreateTeacherModal onClose={() => setTeacherModalOpen(false)} />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/20 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-light tracking-wide">
          {loading ? "Portal" : `${dbUser?.client_name ?? "Enterprise"} Portal`}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
        {[
          { label: "Robots Shipped",    value: String(dbPlan?.robots_shipped   ?? 0), accent: "teal"   as AccentKey },
          { label: "Active Orders",     value: String(dbOrders.length).padStart(2, "0"), accent: "slate" as AccentKey },
          { label: "Open Tickets",      value: String(openTickets.length).padStart(2, "0"), accent: "pink" as AccentKey },
        ].map(({ label, value, accent }) => {
          const a = ACCENTS[accent];
          return (
            <div key={label} className="relative bg-[#0d0c14] border border-white/[0.06] p-5 overflow-hidden hover:border-white/10 transition-colors duration-300">
              <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
              <p className="text-xs uppercase tracking-[0.18em] text-white/25 font-medium mb-3">{label}</p>
              {loading
                ? <div className="h-10 bg-white/5 rounded w-12 animate-pulse" />
                : <p className={`text-4xl font-light ${a.text} tabular-nums`}>{value}</p>
              }
            </div>
          );
        })}
      </div>

      {/* Contract */}
      <SectionCard title="Contract Details" icon={FileText} accent="teal">
        <ContractSection plan={dbPlan} loading={loading} />
      </SectionCard>

      {/* Orders & Tracking */}
      <SectionCard title="Orders & Tracking" icon={Package} count={dbOrders.length} accent="slate">
        <TableHeader cols={["Order", "Tracking", "Status"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : dbOrders.length === 0
          ? <EmptyRow message="No active orders" />
          : dbOrders.map((o) => {
              const status = deriveStatus(o);
              return (
                <div key={o.id} onClick={() => setSelectedOrder(toModalOrder(o))}
                  className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(o.order_title)} accent="slate" />
                    <div className="min-w-0">
                      <p className="text-white/60 text-sm truncate">{o.order_title}</p>
                      <p className="text-white/20 text-xs">{o.price}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center">
                    {o.tracking_number ? <TrackingCopy value={o.tracking_number} /> : <span className="text-white/15 text-xs">—</span>}
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    <StatusBadge status={status} />
                    <ExternalLink size={11} className="text-[#7e8fb5] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
        }
      </SectionCard>

      {/* Teacher signup */}
      <SectionCard title="Teacher Accounts" icon={UserPlus} accent="teal">
        <div className="px-5 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-sm">Add a teacher to the curriculum portal.</p>
            <p className="text-white/20 text-xs mt-0.5">Teachers can enroll students into courses.</p>
          </div>
          <button onClick={() => setTeacherModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-[10px] uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition flex-shrink-0">
            <UserPlus size={12} />
            New Teacher
          </button>
        </div>
      </SectionCard>

      {/* Support */}
      <SectionCard title="Support" icon={TicketCheck} accent="pink">
        <div className="px-5 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-sm">Need help with something?</p>
            <p className="text-white/20 text-xs mt-0.5">We typically respond within 24 hours.</p>
          </div>
          <button onClick={() => setSubmitOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8629a]/10 border border-[#e8629a]/20 text-[#e8629a] text-[10px] uppercase tracking-[0.18em] hover:bg-[#e8629a]/15 transition flex-shrink-0">
            <TicketCheck size={12} />Open Ticket
          </button>
        </div>
      </SectionCard>

      {/* Open tickets */}
      <SectionCard title="My Tickets" icon={TicketCheck} count={openTickets.length} accent="pink">
        <TableHeader cols={["Title", "Details", "Status"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : openTickets.length === 0
          ? <EmptyRow message="No open tickets" />
          : openTickets.map((t) => (
              <div key={t.id} onClick={() => setSelectedTicket(t)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Avatar initials={getInitials(t.title)} accent="pink" />
                  <p className="text-white/60 text-sm truncate">{t.title}</p>
                </div>
                <p className="hidden sm:block text-white/25 text-xs truncate">{t.ticket_details}</p>
                <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                  <Clock size={10} className="text-[#e8629a]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#e8629a]/60">Open</span>
                  <ExternalLink size={11} className="text-[#e8629a] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                </div>
              </div>
            ))
        }
      </SectionCard>

      {/* Resolved tickets */}
      {(loading || resolvedTickets.length > 0) && (
        <SectionCard title="Resolved Tickets" icon={CheckCircle2} count={resolvedTickets.length} accent="slate">
          <TableHeader cols={["Title", "Details", "Status"]} />
          {loading
            ? [1].map((i) => <LoadingRow key={i} />)
            : resolvedTickets.map((t) => (
                <div key={t.id} onClick={() => setSelectedTicket(t)}
                  className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group opacity-55">
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(t.title)} accent="slate" />
                    <p className="text-white/35 text-sm truncate line-through">{t.title}</p>
                  </div>
                  <p className="hidden sm:block text-white/15 text-xs truncate">{t.ticket_details}</p>
                  <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                    <CheckCircle2 size={10} className="text-[#7e8fb5]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#7e8fb5]">Resolved</span>
                    <ExternalLink size={11} className="text-[#7e8fb5] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </div>
                </div>
              ))
          }
        </SectionCard>
      )}

    </div>
  );
}