import "./globals.css";

export const metadata = {
  title: "Orientación | Yaocíhuatl",
  description: "Chimalli, orientación preliminar con revisión humana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
