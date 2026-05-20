import "./globals.css";
import ActiveSidebar from "./ActiveSidebar";

export const metadata = {
  title: "IRA Yoga Studio",
  description: "AI-powered personalised yoga sequences for your students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <ActiveSidebar />
          <div className="content-area">
            <main className="main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
