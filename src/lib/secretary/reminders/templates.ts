/**
 * Professional Greek reminder templates for special education centers.
 * Placeholders: {parent_name} {child_name} {appointment_date} {appointment_time}
 * {appointment_type} {location} {amount_due} {due_date} {center_phone} {center_name}
 * Legacy {{recipient_name}} still supported via normalize-context.
 *
 * SMS / WhatsApp / Viber → bodyShort
 * Email → bodyLong
 */
import type { ReminderTemplateCode } from "./types";

export const REMINDER_PLACEHOLDER_KEYS = [
  "parent_name",
  "child_name",
  "appointment_date",
  "appointment_time",
  "appointment_type",
  "location",
  "amount_due",
  "due_date",
  "center_phone",
  "center_name",
] as const;

export type ReminderTemplateDef = {
  code: ReminderTemplateCode;
  nameEl: string;
  category: "appointment" | "payment" | "diagnosis" | "report" | "meeting";
  /** SMS, WhatsApp, Viber */
  bodyShort: string;
  /** Email */
  bodyLong: string;
  defaultChannel: "sms" | "email";
};

export const REMINDER_TEMPLATES: ReminderTemplateDef[] = [
  {
    code: "appointment_confirmation",
    nameEl: "Επιβεβαίωση ραντεβού",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, επιβεβαιώνουμε το ραντεβού του/της {child_name} ({appointment_type}) την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}. Σας ευχαριστούμε!",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Με χαρά σας επιβεβαιώνουμε το ραντεβού του/της {child_name}:

• Τύπος: {appointment_type}
• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Για οποιαδήποτε αλλαγή ή διευκρίνιση, επικοινωνήστε μαζί μας στο {center_phone} ή στο {center_email}.

Με εκτίμηση,
{center_name}`,
  },
  {
    code: "appointment_reminder_24h",
    nameEl: "Υπενθύμιση ραντεβού (24 ώρες πριν)",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, σας υπενθυμίζουμε ευγενικά το ραντεβού του/της {child_name} αύριο {appointment_date}, ώρα {appointment_time} ({appointment_type}, {location}). {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε με εκτίμηση ότι αύριο, {appointment_date}, έχετε προγραμματισμένο ραντεβού για τον/την {child_name}:

• {appointment_type}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Σε περίπτωση που χρειάζεται αλλαγή, παρακαλούμε ενημερώστε μας έγκαιρα.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "appointment_reminder_same_day",
    nameEl: "Υπενθύμιση ραντεβού (σήμερα)",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Καλημέρα κ./κυρία {parent_name}, σας υπενθυμίζουμε ότι σήμερα {appointment_date} στις {appointment_time} έχετε ραντεβού για τον/την {child_name} ({appointment_type}, {location}). {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Καλή σας μέρα. Σας υπενθυμίζουμε ότι σήμερα, {appointment_date}, στις {appointment_time}, σας περιμένουμε για τον/την {child_name}:

• {appointment_type}
• Τοποθεσία: {location}

Σας ευχόμαστε ήρεμη και όμορφη ημέρα. Για οποιαδήποτε ανάγκη, είμαστε στη διάθεσή σας.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "evaluation_reminder",
    nameEl: "Υπενθύμιση αξιολόγησης",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, υπενθυμίζουμε την αξιολόγηση του/της {child_name} την {appointment_date}, ώρα {appointment_time}, {location}. Παρουσία 10 λεπτά νωρίτερα. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε την προγραμματισμένη αξιολόγηση του/της {child_name}:

• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Παρακαλούμε να είστε παρόντες περίπου 10 λεπτά νωρίτερα, ώστε η διαδικασία να ξεκινήσει με ηρεμία. Αν χρειάζεστε διευκρινίσεις πριν τη συνάντηση, καλέστε μας.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "history_taking_reminder",
    nameEl: "Υπενθύμιση λήψης ιστορικού",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, σας περιμένουμε για λήψη ιστορικού του/της {child_name} την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε το ραντεβού λήψης ιστορικού για τον/την {child_name}:

• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Η συνάντηση μας βοηθά να γνωρίσουμε καλύτερα τις ανάγκες του παιδιού σας. Για οποιαδήποτε ερώτηση πριν την επίσκεψη, είμαστε στη διάθεσή σας.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "parent_info_reminder",
    nameEl: "Υπενθύμιση συνάντησης ενημέρωσης γονέων",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, σας περιμένουμε για συνάντηση ενημέρωσης σχετικά με τον/την {child_name} την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε τη συνάντηση ενημέρωσης γονέων για τον/την {child_name}:

• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Θα χαρούμε να συζητήσουμε μαζί σας και να απαντήσουμε στις ερωτήσεις σας με ηρεμία και σαφήνεια.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "payment_due_soon",
    nameEl: "Πληρωμή — προσεχώς η λήξη",
    category: "payment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, σας ενημερώνουμε ότι για τον/την {child_name} οφείλεται ποσό {amount_due}€ με προθεσμία {due_date}. Για διευκρινίσεις: {center_phone}. {center_name}. Ευχαριστούμε.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας ενημερώνουμε με εκτίμηση ότι για τον/την {child_name} υπάρχει οφειλόμενο ποσό {amount_due}€, με προθεσμία πληρωμής την {due_date}.

Αν έχετε ήδη εξοφλήσει ή χρειάζεστε διευκρίνιση σχετικά με το ποσό, επικοινωνήστε μαζί μας· θα χαρούμε να σας βοηθήσουμε.

Με εκτίμηση,
{center_name}
Τηλ.: {center_phone}
Email: {center_email}`,
  },
  {
    code: "payment_overdue_polite",
    nameEl: "Καθυστερημένη πληρωμή (ευγενική υπενθύμιση)",
    category: "payment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, υπενθυμίζουμε ευγενικά ότι για τον/την {child_name} εκκρεμεί υπόλοιπο {amount_due}€ (προθεσμία {due_date}). Επικοινωνήστε μαζί μας: {center_phone}. {center_name}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Ελπίζουμε να είστε καλά. Σας υπενθυμίζουμε με ευγένεια ότι για τον/την {child_name} παραμένει εκκρεμές υπόλοιπο ύψους {amount_due}€, με ημερομηνία λήξης {due_date}.

Αν αντιμετωπίζετε δυσκολία ή χρειάζεστε να συζητήσουμε εναλλακτική ρύθμιση, επικοινωνήστε μαζί μας· είμαστε στη διάθεσή σας.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "payment_overdue_second",
    nameEl: "Καθυστερημένη πληρωμή (δεύτερη υπενθύμιση)",
    category: "payment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το υπόλοιπο {amount_due}€ για τον/την {child_name} παραμένει ανεξόφλητο (λήξη {due_date}). Παρακαλούμε επικοινωνήστε μαζί μας: {center_phone}. {center_name}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας απευθύνουμε εκ νέου, με σεβασμό, σχετικά με το εκκρεμές υπόλοιπο {amount_due}€ για τον/την {child_name}, το οποίο έχει προθεσμία {due_date}.

Παρακαλούμε επικοινωνήστε μαζί μας το συντομότερο δυνατό, ώστε να βρούμε μαζί μια ήρεμη και ξεκάθαρη λύση.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "payment_management_review",
    nameEl: "Καθυστέρηση 60+ ημέρες — ενημέρωση διοίκησης",
    category: "payment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το υπόλοιπο {amount_due}€ για τον/την {child_name} (λήξη {due_date}) χρειάζεται άμεση επικοινωνία με τη διοίκηση του κέντρου. {center_phone} · {center_name}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας ενημερώνουμε με σεβασμό ότι το εκκρεμές υπόλοιπο ύψους {amount_due}€ για τον/την {child_name}, με προθεσμία {due_date}, έχει περάσει σε διαδικασία διοικητικής παρακολούθησης.

Παρακαλούμε επικοινωνήστε άμεσα με τη γραμματεία ή τη διοίκηση, ώστε να συζητήσουμε την ομαλή συνέχιση της παρακολούθησης.

Με εκτίμηση,
{center_name}
Τηλ.: {center_phone}
Email: {center_email}`,
  },
  {
    code: "diagnosis_renewal",
    nameEl: "Ανανέωση εγγράφου διάγνωσης",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το έγγραφο {document_type} του/της {child_name} λήγει {expiry_date}. Παρακαλούμε προγραμματίστε ανανέωση. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας ενημερώνουμε ότι το έγγραφο ({document_type}) του/της {child_name} έχει ημερομηνία λήξης την {expiry_date}.

Για τη συνέχιση ομαλής παρακολούθησης, προτείνουμε έγκαιρη ανανέωση. Η ομάδα μας μπορεί να σας καθοδηγήσει.

{center_name} · {center_phone}`,
  },
  {
    code: "diagnosis_expires_60",
    nameEl: "Γνωμάτευση — λήγει σε 60 ημέρες",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το {document_type} του/της {child_name} λήγει στις {expiry_date} (περίπου 60 ημέρες). Προγραμματίστε ανανέωση. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Το έγγραφο {document_type} του/της {child_name} λήγει στις {expiry_date} (περίπου 60 ημέρες).

Παρακαλούμε να προγραμματίσετε έγκαιρα ανανέωση.

{center_name}
{center_phone}`,
  },
  {
    code: "diagnosis_expires_30",
    nameEl: "Γνωμάτευση — λήγει σε 30 ημέρες",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το {document_type} του/της {child_name} λήγει στις {expiry_date}. Απαιτείται άμεσος προγραμματισμός ανανέωσης. {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Το {document_type} του/της {child_name} λήγει στις {expiry_date} (περίπου 30 ημέρες).

Παρακαλούμε επικοινωνήστε μαζί μας για ανανέωση.

{center_name} · {center_phone}`,
  },
  {
    code: "diagnosis_expires_7",
    nameEl: "Γνωμάτευση — λήγει σε 7 ημέρες",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Επείγον: το {document_type} του/της {child_name} λήγει στις {expiry_date}. Επικοινωνήστε άμεσα: {center_phone}. {center_name}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Επείγουσα ενημέρωση: το {document_type} του/της {child_name} λήγει στις {expiry_date} (εντός 7 ημερών).

Παρακαλούμε άμεση επικοινωνία.

{center_name} · {center_phone}`,
  },
  {
    code: "diagnosis_expired",
    nameEl: "Γνωμάτευση — έληξε",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, το {document_type} του/της {child_name} έχει λήξει ({expiry_date}). Απαιτείται άμεση ανανέωση. {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Το {document_type} του/της {child_name} έχει λήξει (λήξη: {expiry_date}).

Παρακαλούμε προγραμματίστε άμεσα ανανέωση για τη συνέχιση της παρακολούθησης.

{center_name} · {center_phone}`,
  },
  {
    code: "diagnosis_renewal_followup",
    nameEl: "Follow-up ανανέωσης γνωμάτευσης",
    category: "diagnosis",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, υπενθύμιση για ανανέωση {document_type} του/της {child_name}. Επικοινωνήστε μαζί μας: {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε για τη διαδικασία ανανέωσης του εγγράφου {document_type} του/της {child_name}.

Είμαστε στη διάθεσή σας.

{center_name} · {center_phone}`,
  },
  {
    code: "no_show_followup",
    nameEl: "Δεν προσήλθε — παρακολούθηση",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, δεν εντοπίσαμε τον/την {child_name} στο ραντεβού {appointment_type} ({appointment_date}). Επικοινωνήστε μαζί μας για επαναπρογραμματισμό: {center_phone}. {center_name}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Παρατηρήσαμε ότι ο/η {child_name} δεν μπόρεσε να παρευρεθεί στο προγραμματισμένο ραντεβού ({appointment_type}, {appointment_date}).

Κατανοούμε ότι μπορεί να προέκυψε ανάγκη ή απρόοπτο. Θα χαρούμε να επικοινωνήσετε μαζί μας, ώστε να προγραμματίσουμε νέα ημερομηνία που σας εξυπηρετεί.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
  {
    code: "report_due_7",
    nameEl: "Αναφορά — προθεσμία σε 7 ημέρες",
    category: "report",
    defaultChannel: "email",
    bodyShort:
      "Εσωτερική υπενθύμιση: η αναφορά ({appointment_type}) για {child_name} λήγει στις {due_date}. {center_name}.",
    bodyLong: `Υπενθύμιση για την ομάδα:

Η αναφορά ({appointment_type}) του/της {child_name} έχει προθεσμία εντός 7 ημερών ({due_date}).

Παρακαλούμε προχωρήστε στη σύνταξη/έλεγχο.

{center_name}`,
  },
  {
    code: "report_due_3",
    nameEl: "Αναφορά — προθεσμία σε 3 ημέρες",
    category: "report",
    defaultChannel: "email",
    bodyShort:
      "Επείγον: αναφορά ({appointment_type}) — {child_name}, προθεσμία {due_date}. {center_phone}.",
    bodyLong: `Επείγουσα υπενθύμιση:

Αναφορά ({appointment_type}) για {child_name} — προθεσμία {due_date}.

Άμεση ενέργεια απαιτείται.

{center_name} · {center_phone}`,
  },
  {
    code: "report_overdue",
    nameEl: "Αναφορά — εκπρόθεσμη",
    category: "report",
    defaultChannel: "email",
    bodyShort:
      "Εκπρόθεσμη αναφορά ({appointment_type}) — {child_name}. Προθεσμία ήταν {due_date}. {center_phone}.",
    bodyLong: `Εκπρόθεσμη αναφορά:

Τύπος: {appointment_type}
Παιδί: {child_name}
Προθεσμία: {due_date}

Παρακαλούμε άμεση ολοκλήρωση.

{center_name}`,
  },
  {
    code: "progress_report_ready",
    nameEl: "Αναφορά προόδου έτοιμη",
    category: "report",
    defaultChannel: "email",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, η αναφορά προόδου του/της {child_name} είναι έτοιμη. Επικοινωνήστε με το {center_name} στο {center_phone} για παραλαβή/αποστολή. Ευχαριστούμε!",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας ενημερώνουμε με χαρά ότι η αναφορά προόδου του/της {child_name} έχει ολοκληρωθεί και είναι στη διάθεσή σας.

Μπορείτε να επικοινωνήσετε με τη γραμματεία μας για τον τρόπο παραλαβής ή αποστολής, καθώς και για οποιαδήποτε διευκρίνιση σχετικά με το περιεχόμενο.

Με εκτίμηση,
{center_name}
Τηλ.: {center_phone}
Email: {center_email}`,
  },
  // Legacy / automation codes (same professional tone)
  {
    code: "meeting_supervision_reminder",
    nameEl: "Υπενθύμιση εποπτείας",
    category: "meeting",
    defaultChannel: "sms",
    bodyShort:
      "Υπενθύμιση εποπτείας: {appointment_type} την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}.",
    bodyLong: `Υπενθύμιση προγραμματισμένης εποπτείας:

• Τύπος: {appointment_type}
• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

{center_name} · {center_phone}`,
  },
  {
    code: "meeting_internal_reminder",
    nameEl: "Υπενθύμιση εσωτερικής συνάντησης",
    category: "meeting",
    defaultChannel: "sms",
    bodyShort:
      "Υπενθύμιση εσωτερικής συνάντησης ({appointment_type}) την {appointment_date}, ώρα {appointment_time}, {location}. {center_name}.",
    bodyLong: `Υπενθύμιση εσωτερικής συνάντησης:

• {appointment_type}
• {appointment_date} · {appointment_time}
• {location}

{center_name}`,
  },
  {
    code: "meeting_emergency_reminder",
    nameEl: "Υπενθύμιση έκτακτης συνάντησης",
    category: "meeting",
    defaultChannel: "sms",
    bodyShort:
      "ΕΠΕΙΓΟΝ: Έκτακτη συνάντηση {appointment_type} σήμερα {appointment_date} ώρα {appointment_time}, {location}. {center_phone}.",
    bodyLong: `ΕΠΕΙΓΟΥΣΑ υπενθύμιση έκτακτης συνάντησης:

• {appointment_type}
• {appointment_date} · {appointment_time}
• {location}

Παρακαλούμε επιβεβαιώστε συμμετοχή. {center_name} · {center_phone}`,
  },
  {
    code: "meeting_reminder_24h",
    nameEl: "Υπενθύμιση συνάντησης (24 ώρες πριν)",
    category: "meeting",
    defaultChannel: "sms",
    bodyShort:
      "Υπενθύμιση συνάντησης αύριο ({appointment_type}) {appointment_date} ώρα {appointment_time}, {location}. {center_name}.",
    bodyLong: `Υπενθύμιση συνάντησης (24 ώρες πριν):

• {appointment_type}
• {appointment_date} · {appointment_time}
• {location}

{center_name}`,
  },
  {
    code: "meeting_reminder_same_day",
    nameEl: "Υπενθύμιση συνάντησης (σήμερα)",
    category: "meeting",
    defaultChannel: "sms",
    bodyShort:
      "Σήμερα συνάντηση ({appointment_type}) ώρα {appointment_time}, {location}. {center_name} · {center_phone}.",
    bodyLong: `Υπενθύμιση συνάντησης σήμερα:

• {appointment_type}
• Ώρα: {appointment_time}
• {location}

{center_name} · {center_phone}`,
  },
  {
    code: "meeting_minutes_missing",
    nameEl: "Υπενθύμιση εκκρεμών πρακτικών",
    category: "meeting",
    defaultChannel: "email",
    bodyShort:
      "Εκκρεμούν πρακτικά για συνάντηση {appointment_type} ({appointment_date}). Παρακαλούμε ολοκληρώστε. {center_name}.",
    bodyLong: `Υπενθύμιση εκκρεμών πρακτικών συνάντησης:

• {appointment_type}
• Ημερομηνία: {appointment_date}

Παρακαλούμε καταχωρήστε τα πρακτικά το συντομότερο δυνατό.

{center_name}`,
  },
  {
    code: "meeting_decision_followup",
    nameEl: "Υπενθύμιση follow-up απόφασης",
    category: "meeting",
    defaultChannel: "email",
    bodyShort:
      "Υπενθύμιση follow-up απόφασης από συνάντηση {appointment_type}. Προθεσμία: {due_date}. {center_name}.",
    bodyLong: `Υπενθύμιση follow-up απόφασης:

• Συνάντηση: {appointment_type}
• Προθεσμία: {due_date}

Παρακαλούμε ενημερώστε για την πρόοδο.

{center_name}`,
  },
  {
    code: "therapy_session_reminder",
    nameEl: "Θεραπευτική συνεδρία",
    category: "appointment",
    defaultChannel: "sms",
    bodyShort:
      "Χαίρετε κ./κυρία {parent_name}, υπενθυμίζουμε τη θεραπευτική συνεδρία του/της {child_name} την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}.",
    bodyLong: `Αγαπητέ/ή κ./κυρία {parent_name},

Σας υπενθυμίζουμε τη θεραπευτική συνεδρία του/της {child_name}:

• Ημερομηνία: {appointment_date}
• Ώρα: {appointment_time}
• Τοποθεσία: {location}

Σας ευχόμαστε μια ήρεμη και παραγωγική συνεδρία.

Με εκτίμηση,
{center_name}
{center_phone}`,
  },
];

/** Map legacy DB / code names to current templates. */
const CODE_ALIASES: Partial<Record<ReminderTemplateCode, ReminderTemplateCode>> = {
  payment_overdue_1_30: "payment_overdue_polite",
  payment_overdue_30_60: "payment_overdue_second",
  pending_report_reminder: "progress_report_ready",
};

export function resolveTemplateCode(code: ReminderTemplateCode): ReminderTemplateCode {
  return CODE_ALIASES[code] ?? code;
}

const TEMPLATE_OVERRIDE_KEY = "secretary-reminder-templates-override-v1";

function loadTemplateOverrides(): Partial<Record<ReminderTemplateCode, ReminderTemplateDef>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEMPLATE_OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<ReminderTemplateCode, ReminderTemplateDef>>) : {};
  } catch {
    return {};
  }
}

export function saveTemplateOverride(code: ReminderTemplateCode, patch: Partial<ReminderTemplateDef>): void {
  if (typeof window === "undefined") return;
  const overrides = loadTemplateOverrides();
  const resolved = resolveTemplateCode(code);
  const base = REMINDER_TEMPLATES.find((x) => x.code === resolved) ?? overrides[resolved];
  if (!base) return;
  overrides[code] = { ...base, ...patch, code };
  localStorage.setItem(TEMPLATE_OVERRIDE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent("secretary-reminder-templates-updated"));
}

export function listAllTemplates(): ReminderTemplateDef[] {
  const overrides = loadTemplateOverrides();
  return REMINDER_TEMPLATES.map((t) => overrides[t.code] ?? t);
}

export function getTemplate(code: ReminderTemplateCode): ReminderTemplateDef {
  const resolved = resolveTemplateCode(code);
  const overrides = loadTemplateOverrides();
  if (overrides[resolved]) return overrides[resolved]!;
  const t = REMINDER_TEMPLATES.find((x) => x.code === resolved);
  if (!t) throw new Error(`Unknown template: ${code}`);
  return t;
}
