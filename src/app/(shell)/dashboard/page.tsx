import { redirect } from "next/navigation";

/** Legacy route — platform home is now `/`. */
export default function DashboardRedirectPage() {
  redirect("/");
}
