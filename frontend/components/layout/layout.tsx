import type React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ThemeProvider } from "next-themes";



export default function CustomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Navbar />
            {children}
        <Footer />      
        </ThemeProvider> 
  );
}
