import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "LawyerUp – Decentralized Pro-Bono Legal Aid",
  description: "Pro-bono legal aid coordination for clients, lawyers, and students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
