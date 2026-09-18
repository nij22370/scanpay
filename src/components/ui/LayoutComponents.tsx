"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
}

export function Layout({ children, header, sidebar }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {sidebar && <aside className="w-64 border-r p-4">{sidebar}</aside>}
      <div className="flex-1 flex flex-col overflow-hidden">
        {header && <header className="border-b p-4">{header}</header>}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}

export function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center p-8"
    >
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="font-bold text-lg">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
